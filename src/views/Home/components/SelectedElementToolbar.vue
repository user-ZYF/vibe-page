<!-- ? 选中元素操作工具栏 -->
<template>
  <div v-if="visible" class="etb-root" :style="elMarginBox">
    <!-- 蓝色边框区域 -->
    <div class="etb-border-area">
      <!-- 操作工具栏 -->
      <div v-if="showToolbar" class="etb-bar">
        <a-tooltip title="选中父元素" placement="top">
          <button class="etb-btn" @click.stop="canvasStore.selectParentElement(selectedElementId!)">
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
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch, onMounted, onBeforeUnmount, nextTick, type Ref } from 'vue';
import { ArrowUpOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { useCanvasStore } from '@/store/canvas';
import { storeToRefs } from 'pinia';
import { nodeRegistry } from '@/views/Home/drag/NodeRegistry';
import { useCanvasBoxRect } from '@/composables/useCanvasBoxRect';
import { useElementStyle } from '@/composables/useElementStyle';
import type { CanvasElementBase } from '@/views/Home/types';

defineOptions({
  name: 'SelectedElementToolbar',
});

const canvasStore = useCanvasStore();
const { selectedElementId, isDragging } = storeToRefs(canvasStore);

const { elRect, elMarginBox, updateBox, resetElRect, getCanvasEl } = useCanvasBoxRect();

/** 选中元素数据 */
const selectedElementData = computed(() => {
  if (!selectedElementId.value) return null;
  return canvasStore.getElementById(selectedElementId.value);
});

/** 选中元素最终样式 */
const selectedElementStyle = useElementStyle(selectedElementData as Ref<CanvasElementBase>);

/** 选中元素是否可见（display 不为 none，基于画布数据判断） */
const isElementDisplayed = computed(() => {
  if (!selectedElementData.value) return true;
  return selectedElementStyle.value.display !== 'none';
});

/** 是否显示（含蓝色边框） */
const visible = computed(() => !!selectedElementId.value && !isDragging.value && isElementDisplayed.value);

/** 是否显示操作工具栏按钮（根画布元素不显示） */
const showToolbar = computed(() => visible.value && selectedElementId.value !== canvasStore.root.id);

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

/** 删除并清空选中 */
function handleDelete() {
  canvasStore.removeElement(selectedElementId.value!);
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
  }
}

/** 监听选中元素变化 */
watch(selectedElementId, (id) => {
  if (id) {
    nextTick(updatePos);
  } else {
    resetElRect();
  }
});

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
    nextTick(updatePos);
  }
});

onBeforeUnmount(() => {
  const canvasEl = getCanvasEl();
  if (canvasEl) {
    canvasEl.removeEventListener('scroll', handleRecompute, true);
    window.removeEventListener('resize', handleRecompute);
  }
});
</script>

<style scoped lang="less">
.etb-root {
  position: absolute;
  pointer-events: none;
  z-index: 9999;
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
  right: 0px;
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
</style>
