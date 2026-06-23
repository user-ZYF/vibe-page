<!-- ? 选中元素指示器（含盒模型悬停显示） -->
<template>
  <div v-if="visible && !isDragging" class="sei-root" :style="rootStyle">
    <!-- margin 层（橙色） -->
    <div class="sei-margin sei-margin-top" :style="{ height: box.marginTop + 'px' }">
      <span v-if="box.marginTop > 0" class="sei-box-label">{{ box.marginTop }}</span>
    </div>
    <div class="sei-margin sei-margin-bottom" :style="{ height: box.marginBottom + 'px' }">
      <span v-if="box.marginBottom > 0" class="sei-box-label">{{ box.marginBottom }}</span>
    </div>
    <div class="sei-margin sei-margin-left" :style="{ width: box.marginLeft + 'px' }">
      <span v-if="box.marginLeft > 0" class="sei-box-label">{{ box.marginLeft }}</span>
    </div>
    <div class="sei-margin sei-margin-right" :style="{ width: box.marginRight + 'px' }">
      <span v-if="box.marginRight > 0" class="sei-box-label">{{ box.marginRight }}</span>
    </div>

    <!-- border 层（黄色） -->
    <div class="sei-border-wrapper">
      <!-- padding 层（绿色） -->
      <div class="sei-padding-wrapper">
        <div class="sei-padding sei-padding-top" :style="{ height: box.paddingTop + 'px' }">
          <span v-if="box.paddingTop > 0" class="sei-box-label">{{ box.paddingTop }}</span>
        </div>
        <div class="sei-padding sei-padding-bottom" :style="{ height: box.paddingBottom + 'px' }">
          <span v-if="box.paddingBottom > 0" class="sei-box-label">{{ box.paddingBottom }}</span>
        </div>
        <div class="sei-padding sei-padding-left" :style="{ width: box.paddingLeft + 'px' }">
          <span v-if="box.paddingLeft > 0" class="sei-box-label">{{ box.paddingLeft }}</span>
        </div>
        <div class="sei-padding sei-padding-right" :style="{ width: box.paddingRight + 'px' }">
          <span v-if="box.paddingRight > 0" class="sei-box-label">{{ box.paddingRight }}</span>
        </div>
        <!-- 内容区（蓝色） -->
        <div class="sei-content">
          <span class="sei-box-label">{{ Math.round(box.contentWidth) }} × {{ Math.round(box.contentHeight) }}</span>
        </div>
      </div>
    </div>

    <!-- 蓝色边框（悬停时始终显示） + 元素类别名称标签 -->
    <div class="sei-selected-wrapper">
      <span class="sei-selected-label" :class="{ 'is-selected': isSelected, 'is-inside': labelInside }">{{ elementLabel }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useCanvasStore } from '@/store/canvas';
import { storeToRefs } from 'pinia';
import { CanvasElementLabelMap } from '@/constants/home';
import { useCanvasBoxRect } from '@/composables/useCanvasBoxRect';

defineOptions({
  name: 'SelectedElementIndicator',
});

const canvasStore = useCanvasStore();
const { selectedElementId, isDragging } = storeToRefs(canvasStore);

const { box, rootStyle, updateBox, resetBox, getCanvasEl } = useCanvasBoxRect();

/** 是否显示覆盖层 */
const visible = ref(false);

/** 名称标签是否显示在元素内顶部（底部无空间时） */
const labelInside = ref(false);

/** 当前悬停的画布 DOM 元素 */
const currentTarget = ref<Element | null>(null);

/** 当前悬停元素是否为选中元素 */
const isSelected = computed(() =>
  !!currentTarget.value && currentTarget.value.getAttribute('data-canvas-id') === selectedElementId.value
);

/** 当前悬停元素的类别名称 */
const elementLabel = computed(() => {
  const id = currentTarget.value?.getAttribute('data-canvas-id');
  if (!id) return '';
  const el = canvasStore.getElementById(id);
  return el ? CanvasElementLabelMap[el.type] ?? '' : '';
});

/** 标签高度估算 */
const LABEL_HEIGHT = 22;

/** 更新名称标签内外位置 */
function updateLabelPos() {
  const canvasEl = getCanvasEl();
  if (!canvasEl || !currentTarget.value) return;
  const elRect = currentTarget.value.getBoundingClientRect();
  const canvasRect = canvasEl.getBoundingClientRect();
  const elBottom = elRect.bottom - canvasRect.top;
  labelInside.value = elBottom + LABEL_HEIGHT > canvasRect.height;
}

/** mouseover 事件处理：找到最近的带 data-canvas-id 属性的祖先 */
function handleMouseOver(event: MouseEvent) {
  const target = event.target as Element | null;
  if (!target) return;

  /** 向上找带有 data-canvas-id 属性的元素 */
  const el = target.closest('[data-canvas-id]');
  if (!el) {
    visible.value = false;
    currentTarget.value = null;
    return;
  }

  if (el === currentTarget.value) return;
  currentTarget.value = el;
  updateBox(el);
  updateLabelPos();
  visible.value = true;
}

/** mouseleave 事件处理：离开画布容器时隐藏 */
function handleMouseLeave() {
  visible.value = false;
  currentTarget.value = null;
  resetBox();
}

/** 滚动或窗口尺寸变化时同步更新位置 */
function handleRecompute() {
  if (currentTarget.value) {
    updateBox(currentTarget.value);
    updateLabelPos();
  }
}

onMounted(() => {
  const canvasEl = getCanvasEl();
  if (canvasEl) {
    canvasEl.addEventListener('mouseover', handleMouseOver as EventListener);
    canvasEl.addEventListener('mouseleave', handleMouseLeave);
    canvasEl.addEventListener('scroll', handleRecompute, true);
    window.addEventListener('resize', handleRecompute);
  }
});

onBeforeUnmount(() => {
  const canvasEl = getCanvasEl();
  if (canvasEl) {
    canvasEl.removeEventListener('mouseover', handleMouseOver as EventListener);
    canvasEl.removeEventListener('mouseleave', handleMouseLeave);
    canvasEl.removeEventListener('scroll', handleRecompute, true);
    window.removeEventListener('resize', handleRecompute);
  }
});
</script>

<style scoped lang="less">
.sei-root {
  position: absolute;
  pointer-events: none;
  z-index: 9999;
}

/* margin 层 */
.sei-margin {
  position: absolute;
  background-color: rgba(246, 178, 107, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;

  &.sei-margin-top {
    top: 0;
    left: 0;
    right: 0;
  }

  &.sei-margin-bottom {
    bottom: 0;
    left: 0;
    right: 0;
  }

  &.sei-margin-left {
    top: v-bind('box.marginTop + "px"');
    bottom: v-bind('box.marginBottom + "px"');
    left: 0;
    align-items: center;
  }

  &.sei-margin-right {
    top: v-bind('box.marginTop + "px"');
    bottom: v-bind('box.marginBottom + "px"');
    right: 0;
    align-items: center;
  }
}

/* border + padding + content 的包裹层 */
.sei-border-wrapper {
  position: absolute;
  top: v-bind('box.marginTop + "px"');
  left: v-bind('box.marginLeft + "px"');
  right: v-bind('box.marginRight + "px"');
  bottom: v-bind('box.marginBottom + "px"');
  background-color: rgba(255, 229, 153, 0.55);
  display: flex;
}

/* padding + content 的包裹层 */
.sei-padding-wrapper {
  position: absolute;
  top: v-bind('box.borderTop + "px"');
  left: v-bind('box.borderLeft + "px"');
  right: v-bind('box.borderRight + "px"');
  bottom: v-bind('box.borderBottom + "px"');
  background-color: rgba(147, 196, 125, 0.55);
}

/* padding 层 */
.sei-padding {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;

  &.sei-padding-top {
    top: 0;
    left: 0;
    right: 0;
  }

  &.sei-padding-bottom {
    bottom: 0;
    left: 0;
    right: 0;
  }

  &.sei-padding-left {
    top: 0;
    bottom: 0;
    left: 0;
    align-items: center;
  }

  &.sei-padding-right {
    top: 0;
    bottom: 0;
    right: 0;
    align-items: center;
  }
}

/* 内容区 */
.sei-content {
  position: absolute;
  top: v-bind('box.paddingTop + "px"');
  left: v-bind('box.paddingLeft + "px"');
  right: v-bind('box.paddingRight + "px"');
  bottom: v-bind('box.paddingBottom + "px"');
  background-color: rgba(111, 168, 220, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 盒模型数值标签 */
.sei-box-label {
  font-family: monospace;
  font-size: 11px;
  color: #1a1a1a;
  background: rgba(255, 255, 255, 0.7);
  padding: 0 3px;
  border-radius: 2px;
  line-height: 1.4;
  white-space: nowrap;
}

/* 选中态：蓝色边框覆盖层 */
.sei-selected-wrapper {
  position: absolute;
  top: v-bind('box.marginTop + "px"');
  left: v-bind('box.marginLeft + "px"');
  right: v-bind('box.marginRight + "px"');
  bottom: v-bind('box.marginBottom + "px"');
  outline: 2px solid #4096ff;
  outline-offset: -1px;
  z-index: 1;
}

/* 元素类别名称标签（悬停时显示） */
.sei-selected-label {
  position: absolute;
  left: -1px;
  background: #4096ff;
  color: #fff;
  font-size: 12px;
  font-family: monospace;
  padding: 2px 6px;
  white-space: nowrap;
  line-height: 1.5;

  /** 底部有空间：显示在元素外侧底部 */
  &:not(.is-inside) {
    bottom: -22px;
    border-radius: 0 0 3px 3px;
  }

  /** 底部没空间：贴靠内侧顶部 */
  &.is-inside {
    top: 2px;
    border-radius: 0 0 3px 3px;
  }
}
</style>
