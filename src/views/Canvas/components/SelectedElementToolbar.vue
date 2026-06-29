<!-- ? 选中元素操作工具栏 -->
<template>
  <div v-if="visible" class="etb-root" :style="elMarginBox">
    <!-- 蓝色边框区域 -->
    <div class="etb-border-area">
      <!-- 操作工具栏 -->
      <div v-if="showToolbar" ref="toolbarRef" class="etb-bar">
        <a-tooltip title="选中父元素" placement="top">
          <button class="etb-btn" @click.stop="canvasStore.selectParentElement">
            <ArrowUpOutlined />
          </button>
        </a-tooltip>
        <a-tooltip title="复制" placement="top">
          <button class="etb-btn" @click.stop="canvasStore.duplicateElement(selectedElementId!)">
            <CopyOutlined />
          </button>
        </a-tooltip>
        <a-tooltip title="删除" placement="top">
          <button class="etb-btn etb-btn--danger" @click.stop="handleDelete">
            <DeleteOutlined />
          </button>
        </a-tooltip>
      </div>
      <!-- 调整尺寸手柄 -->
      <template v-if="showResizer">
        <div
          v-for="dir in RESIZE_DIRS"
          :key="dir"
          class="etb-resize-handle"
          :class="`etb-resize-handle--${RESIZE_DIR_CLASS_MAP[dir]}`"
          @pointerdown.stop.prevent="handleResizeStart($event, dir)"
        ></div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, type Ref } from 'vue';
import { ArrowUpOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { useCanvasStore } from '@/store/canvas';
import { storeToRefs } from 'pinia';
import { nodeRegistry } from '@/views/Canvas/drag/NodeRegistry';
import { useCanvasBoxRect } from '@/composables/useCanvasBoxRect';
import { useElementStyle } from '@/composables/useElementStyle';
import { type CanvasInnerElement, isParentElement, type CanvasElementBase, type ResizeStartState } from '@/views/Canvas/types';
import { SizeUnitEnum } from '@/constants/style';
import { ResizeDirEnum } from '@/constants/style';
import { RESIZE_DIR_CLASS_MAP, RESIZE_DIRS } from '../constants';
import { CanvasElementTypeEnum } from '@/constants/home';

defineOptions({
  name: 'SelectedElementToolbar',
});

const canvasStore = useCanvasStore();
const { selectedElementId, isDragging, isResizing } = storeToRefs(canvasStore);

const { elRect, elMarginBox, updateBox, resetElRect, getCanvasEl } = useCanvasBoxRect();

/** 工具栏 DOM 引用 */
const toolbarRef = ref<HTMLElement | null>(null);

/** 工具栏宽度 */
const toolbarWidth = ref(0);

/** 判断方向是否包含北（上） */
function isNorthDir(dir: ResizeDirEnum): boolean {
  return dir === ResizeDirEnum.N || dir === ResizeDirEnum.NE || dir === ResizeDirEnum.NW;
}

/** 判断方向是否包含东（右） */
function isEastDir(dir: ResizeDirEnum): boolean {
  return dir === ResizeDirEnum.E || dir === ResizeDirEnum.NE || dir === ResizeDirEnum.SE;
}

/** 判断方向是否包含南（下） */
function isSouthDir(dir: ResizeDirEnum): boolean {
  return dir === ResizeDirEnum.S || dir === ResizeDirEnum.SE || dir === ResizeDirEnum.SW;
}

/** 判断方向是否包含西（左） */
function isWestDir(dir: ResizeDirEnum): boolean {
  return dir === ResizeDirEnum.W || dir === ResizeDirEnum.NW || dir === ResizeDirEnum.SW;
}

/** 选中元素数据 */
const selectedElement = computed(() => {
  if (!selectedElementId.value) return null;
  return canvasStore.getElementById(selectedElementId.value);
});

/** 选中元素最终样式 */
const selectedElementStyle = useElementStyle(selectedElement as Ref<CanvasElementBase>);

/** 选中元素是否可见（display 不为 none，基于画布数据判断） */
const isElementDisplayed = computed(() => {
  if (!selectedElement.value) return true;
  return selectedElementStyle.value.display !== 'none';
});

/** 是否显示（含蓝色边框） */
const visible = computed(() => !!selectedElementId.value && !isDragging.value && isElementDisplayed.value);

/** 是否显示操作工具栏按钮（根画布元素不显示） */
const showToolbar = computed(() => visible.value && selectedElementId.value !== canvasStore.root.id);

/** 是否显示resizer（只有选中非根容器元素或链接元素才会出现） */
const showResizer = computed(() => showToolbar && !!selectedElement.value && selectedElement.value.type !== CanvasElementTypeEnum.ROOT && isParentElement(selectedElement.value as CanvasInnerElement));

/** 工具栏自然 top 偏移（位于边框区域上方） */
const NATURAL_TOP = -28;

/** 工具栏 top 偏移（粘性定位，防止被画布顶部遮挡） */
const toolbarTop = computed(() => {
  /** 边框区域距离画布顶部的距离 */
  const borderTop = elRect.value.y + elRect.value.marginTop;
  /** 粘性位置：贴靠画布视口顶部（相对于边框区域） */
  const stickyTop = -borderTop;
  return Math.max(NATURAL_TOP, stickyTop);
});

/** 工具栏 right 偏移（粘性定位，防止被画布左右两侧遮挡） */
const toolbarRight = computed(() => {
  /** 边框区域距离画布左侧的距离 */
  const borderLeft = elRect.value.x + elRect.value.marginLeft;
  /** 边框区域宽度 */
  const borderWidth =
    elRect.value.contentWidth +
    elRect.value.paddingLeft +
    elRect.value.paddingRight +
    elRect.value.borderLeft +
    elRect.value.borderRight;
  /** 边框区域右边缘距离画布左侧的距离 */
  const borderRight = borderLeft + borderWidth;
  /** 防止右侧溢出：工具栏右边缘不超出画布视口右侧 */
  const minRight = Math.max(0, borderRight - elRect.value.canvasWidth);
  /** 防止左侧溢出：工具栏左边缘不超出画布视口左侧 */
  const maxRight = borderRight - toolbarWidth.value;
  return Math.min(maxRight, minRight);
});

/** 删除并清空选中 */
function handleDelete() {
  canvasStore.removeElement(selectedElementId.value!);
}

/** 调整尺寸状态 */
let resizeState: ResizeStartState | null = null;

/** 获取元素 border-box 尺寸 */
function getBorderBoxSize(): { width: number; height: number } {
  const r = elRect.value;
  return {
    width: r.contentWidth + r.paddingLeft + r.paddingRight + r.borderLeft + r.borderRight,
    height: r.contentHeight + r.paddingTop + r.paddingBottom + r.borderTop + r.borderBottom,
  };
}

/** 开始调整尺寸 */
function handleResizeStart(e: PointerEvent, dir: ResizeDirEnum) {
  if (!selectedElement.value) return;

  const { width, height } = getBorderBoxSize();

  resizeState = {
    dir,
    startX: e.clientX,
    startY: e.clientY,
    startWidth: width,
    startHeight: height,
  };

  isResizing.value = true;
  window.addEventListener('pointermove', handleResizeMove);
  window.addEventListener('pointerup', handleResizeEnd);
}

/** 调整尺寸移动中 */
function handleResizeMove(e: PointerEvent) {
  if (!resizeState || !selectedElement.value) return;

  const dx = e.clientX - resizeState.startX;
  const dy = e.clientY - resizeState.startY;
  const { dir, startWidth, startHeight } = resizeState;

  let newWidth = startWidth;
  let newHeight = startHeight;

  if (isEastDir(dir)) newWidth = startWidth + dx;
  if (isWestDir(dir)) newWidth = startWidth - dx;
  if (isSouthDir(dir)) newHeight = startHeight + dy;
  if (isNorthDir(dir)) newHeight = startHeight - dy;

  newWidth = Math.max(20, Math.round(newWidth));
  newHeight = Math.max(20, Math.round(newHeight));

  const sizeConfig = selectedElement.value.styleConfig.size;
  sizeConfig.width = String(newWidth);
  sizeConfig.widthUnit = SizeUnitEnum.PX;
  sizeConfig.height = String(newHeight);
  sizeConfig.heightUnit = SizeUnitEnum.PX;

  nextTick(updatePos);
}

/** 结束调整尺寸 */
function handleResizeEnd() {
  resizeState = null;
  isResizing.value = false;
  window.removeEventListener('pointermove', handleResizeMove);
  window.removeEventListener('pointerup', handleResizeEnd);

  updatePos();
}

/** 获取选中元素的 DOM */
function getSelectedEl(): Element | null {
  if (!selectedElementId.value) return null;
  return nodeRegistry.get(selectedElementId.value)?.el ?? null;
}

/** 更新工具栏位置 */
function updatePos() {
  const el = getSelectedEl();
  if (el && isElementDisplayed.value) {
    updateBox(el);
    nextTick(() => {
      toolbarWidth.value = toolbarRef.value?.offsetWidth ?? 0;
    });
  }
}

/** 监听选中元素变化 */
watch(selectedElementId, (id) => {
  if (id) {
    updatePos();
  } else {
    resetElRect();
  }
});

/** 监听选中元素数据变化（如内容、class变化），更新工具栏位置 */
watch(
  () => selectedElement.value,
  () => {
    if (selectedElementId.value && !isResizing.value) {
      nextTick(updatePos);
    }
  },
  { deep: true },
);

/** 滚动或窗口尺寸变化时同步更新位置 */
function handleRecompute() {
  if (selectedElementId.value) {
    updatePos();
  }
}

onMounted(() => {
  const canvasEl = getCanvasEl();
  if (canvasEl) {
    canvasEl.addEventListener('scroll', handleRecompute, true);
    window.addEventListener('resize', handleRecompute);
  }
  /** 初始化时如果已有选中元素，立即更新位置 */
  if (selectedElementId.value) {
    updatePos();
  }
});

onBeforeUnmount(() => {
  const canvasEl = getCanvasEl();
  if (canvasEl) {
    canvasEl.removeEventListener('scroll', handleRecompute, true);
    window.removeEventListener('resize', handleRecompute);
  }

  window.removeEventListener('pointermove', handleResizeMove);
  window.removeEventListener('pointerup', handleResizeEnd);
});
</script>

<style scoped lang="less">
.etb-root {
  position: absolute;
  pointer-events: none;
  z-index: 100;
}

/* 蓝色边框区域 */
.etb-border-area {
  position: absolute;
  top: v-bind('elRect.marginTop + "px"');
  left: v-bind('elRect.marginLeft + "px"');
  right: v-bind('elRect.marginRight + "px"');
  bottom: v-bind('elRect.marginBottom + "px"');
  outline: 2px solid #4096ff;
  outline-offset: -2px;
}

/* 操作工具栏 */
.etb-bar {
  position: absolute;
  right: v-bind('toolbarRight + "px"');
  top: v-bind('toolbarTop + "px"');
  display: flex;
  align-items: center;
  gap: 2px;
  height: 28px;
  padding: 0 4px;
  background: #4096ff;
  pointer-events: auto;
  white-space: nowrap;
}

/* 工具栏按钮 */
.etb-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 2px;
  background: transparent;
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  &--danger {
    &:hover {
      background: rgba(255, 77, 79, 0.8);
    }
  }
}

/* 调整尺寸手柄 */
.etb-resize-handle {
  position: absolute;
  background: #fff;
  border: 1px solid #4096ff;
  pointer-events: auto;
  touch-action: none;
  z-index: 101;

  &--n,
  &--s {
    width: 20px;
    height: 6px;
  }

  &--e,
  &--w {
    width: 6px;
    height: 20px;
  }

  &--ne,
  &--nw,
  &--se,
  &--sw {
    width: 8px;
    height: 8px;
  }

  &--n {
    top: -3px;
    left: 50%;
    transform: translateX(-50%);
    cursor: ns-resize;
  }

  &--s {
    bottom: -3px;
    left: 50%;
    transform: translateX(-50%);
    cursor: ns-resize;
  }

  &--e {
    right: -3px;
    top: 50%;
    transform: translateY(-50%);
    cursor: ew-resize;
  }

  &--w {
    left: -3px;
    top: 50%;
    transform: translateY(-50%);
    cursor: ew-resize;
  }

  &--ne {
    top: -4px;
    right: -4px;
    cursor: nesw-resize;
  }

  &--nw {
    top: -4px;
    left: -4px;
    cursor: nwse-resize;
  }

  &--se {
    bottom: -4px;
    right: -4px;
    cursor: nwse-resize;
  }

  &--sw {
    bottom: -4px;
    left: -4px;
    cursor: nesw-resize;
  }
}
</style>
