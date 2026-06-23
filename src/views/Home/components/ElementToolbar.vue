<!-- ? 选中元素操作工具栏 -->
<template>
  <div v-if="selectedElementId && !isDragging" class="etb-root" :style="rootStyle">
    <a-tooltip title="选中父元素" placement="top">
      <button class="etb-btn" @click.stop="canvasStore.selectParentElement(selectedElementId)">
        <ArrowUpOutlined />
      </button>
    </a-tooltip>
    <a-tooltip title="复制" placement="top">
      <button class="etb-btn" @click.stop="canvasStore.duplicateElement(selectedElementId)">
        <CopyOutlined />
      </button>
    </a-tooltip>
    <a-tooltip title="删除" placement="top">
      <button class="etb-btn etb-btn--danger" @click.stop="handleDelete">
        <DeleteOutlined />
      </button>
    </a-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { ArrowUpOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { useCanvasStore } from '@/store/canvas';
import { storeToRefs } from 'pinia';

defineOptions({
  name: 'ElementToolbar',
});

const canvasStore = useCanvasStore();
const { selectedElementId, isDragging } = storeToRefs(canvasStore);

/** 工具栏位置 */
const pos = ref({ top: 0, left: 0 });

/** 工具栏实际尺寸（宽度根据按鈕数量估算） */
const TOOLBAR_HEIGHT = 30;
const TOOLBAR_WIDTH = 116;

/** 画布容器 DOM */
function getCanvasEl(): Element | null {
  return document.querySelector('.canvas-container');
}

/** 工具栏根节点定位样式 */
const rootStyle = computed(() => ({
  top: pos.value.top + 'px',
  left: pos.value.left + 'px',
}));

/** 更新工具栏位置 */
function updatePos() {
  const canvasEl = getCanvasEl();
  if (!canvasEl || !selectedElementId.value) return;
  const el = canvasEl.querySelector(`[data-canvas-id="${selectedElementId.value}"]`);
  if (!el) return;
  const elRect = el.getBoundingClientRect();
  const canvasRect = canvasEl.getBoundingClientRect();

  /** 元素相对于画布的坐标 */
  const elTop = elRect.top - canvasRect.top;
  const elRight = elRect.right - canvasRect.left;
  const canvasHeight = canvasRect.height;
  const canvasWidth = canvasRect.width;

  /** 垂直方向：优先显示在元素上方，没有空间则贴靠元素顶部内侧 */
  let top: number;
  if (elTop >= TOOLBAR_HEIGHT + 2) {
    top = elTop - TOOLBAR_HEIGHT - 2;
  } else {
    top = Math.max(0, elTop + 2);
  }
  /** 垂直方向防止超出画布底部 */
  top = Math.min(top, canvasHeight - TOOLBAR_HEIGHT);

  /** 水平方向：右对齐元素右边界，防止超出画布左右边 */
  let left = elRight - TOOLBAR_WIDTH;
  left = Math.max(0, Math.min(left, canvasWidth - TOOLBAR_WIDTH));

  pos.value = { top, left };
}

/** 删除并清空选中 */
function handleDelete() {
  const id = selectedElementId.value!;
  canvasStore.selectElement(null);
  canvasStore.removeElement(id);
}

/** 监听选中元素变化 */
watch(selectedElementId, (id) => {
  if (!id) return;
  requestAnimationFrame(updatePos);
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
  display: flex;
  align-items: center;
  gap: 2px;
  background: #1f1f1f;
  border-radius: 4px;
  padding: 3px 4px;
  z-index: 10001;
  pointer-events: all;
}

.etb-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  &.etb-btn--danger:hover {
    background: rgba(255, 77, 79, 0.3);
    color: #ff4d4f;
  }
}
</style>
