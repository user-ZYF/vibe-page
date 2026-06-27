<!-- ? 边距指示器（鼠标移入画布元素时显示 margin 和 padding） -->
<template>
  <div v-if="visible" class="sei-root" :style="elMarginBox">
    <!-- margin 层（橙色） -->
    <div v-if="visible" class="sei-margin sei-margin-top">
      <span v-if="showBoxLabels && elRect.marginTop > 0" class="sei-box-label">{{ elRect.marginTop }}</span>
    </div>
    <div v-if="visible" class="sei-margin sei-margin-bottom">
      <span v-if="showBoxLabels && elRect.marginBottom > 0" class="sei-box-label">{{ elRect.marginBottom }}</span>
    </div>
    <div v-if="visible" class="sei-margin sei-margin-left">
      <span v-if="showBoxLabels && elRect.marginLeft > 0" class="sei-box-label">{{ elRect.marginLeft }}</span>
    </div>
    <div v-if="visible" class="sei-margin sei-margin-right">
      <span v-if="showBoxLabels && elRect.marginRight > 0" class="sei-box-label">{{ elRect.marginRight }}</span>
    </div>

    <!-- border 层（黄色） -->
    <div v-if="visible" class="sei-border-wrapper">
      <!-- padding 层（绿色） -->
      <div class="sei-padding-wrapper">
        <div class="sei-padding sei-padding-top">
          <span v-if="showBoxLabels && elRect.paddingTop > 0" class="sei-box-label">{{ elRect.paddingTop }}</span>
        </div>
        <div class="sei-padding sei-padding-bottom">
          <span v-if="showBoxLabels && elRect.paddingBottom > 0" class="sei-box-label">{{ elRect.paddingBottom }}</span>
        </div>
        <div class="sei-padding sei-padding-left">
          <span v-if="showBoxLabels && elRect.paddingLeft > 0" class="sei-box-label">{{ elRect.paddingLeft }}</span>
        </div>
        <div class="sei-padding sei-padding-right">
          <span v-if="showBoxLabels && elRect.paddingRight > 0" class="sei-box-label">{{ elRect.paddingRight }}</span>
        </div>
      </div>
    </div>

    <!-- 蓝色边框 + 元素类别名称标签 -->
    <div class="sei-selected-wrapper">
      <span class="sei-selected-label">{{ elName }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useCanvasStore } from '@/store/canvas';
import { storeToRefs } from 'pinia';
import { CanvasElementLabelMap } from '@/constants/home';
import { useCanvasBoxRect } from '@/composables/useCanvasBoxRect';

defineOptions({
  name: 'MarginPaddingIndicator',
});

const props = defineProps({
  /** 是否显示边距尺寸标签 */
  showBoxLabels: {
    type: Boolean,
    default: false,
  },
});

const canvasStore = useCanvasStore();
const { isDragging } = storeToRefs(canvasStore);

const { elRect, elMarginBox, updateBox, resetElRect, getCanvasEl } = useCanvasBoxRect();

/** 当前悬停的画布 DOM 元素 */
const currentTarget = ref<Element | null>(null);

/** 是否显示覆盖层 */
const visible = computed(() => !!currentTarget.value && !isDragging.value);

/** 名称元素自然的top位置 */
const NATURAL_TOP = -18;

/** 元素名称标签的 top 偏移（粘性定位，防止被画布顶部遮挡） */
const labelTop = computed(() => {
  /** 指示器边框区域具体相画布顶部的距离 */
  const borderTop = elRect.value.y + elRect.value.marginTop;
  /** 粘性位置：贴靠画布视口顶部（相对于边框区域） */
  const stickyTop = -borderTop;
  return Math.max(NATURAL_TOP, stickyTop);
});

/** 元素名称 */
const elName = computed(() => {
  const id = currentTarget.value?.getAttribute('data-canvas-id');
  if (!id) return '';
  const el = canvasStore.getElementById(id);
  if(!el) return '';
  return el.alias || CanvasElementLabelMap[el.type];
});

/** 鼠标移入 */
function handleMouseOver(event: MouseEvent) {
  currentTarget.value = event.target as Element | null;
}

/** 鼠标移出画布 */
function handleMouseLeave() {
  currentTarget.value = null;
}

/** 窗口尺寸变化时同步更新元素尺寸 */
function handleRecompute() {
  if (currentTarget.value) {
    updateBox(currentTarget.value);
  }
}

watch(currentTarget, (el) => {
  if (el) {
    updateBox(el);
  } else {
    resetElRect();
  }
});

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

  &-top {
    top: 0;
    left: 0;
    right: 0;
    height: v-bind('elRect.marginTop + "px"');
  }

  &-bottom {
    bottom: 0;
    left: 0;
    right: 0;
    height: v-bind('elRect.marginBottom + "px"');
  }

  &-left {
    top: v-bind('elRect.marginTop + "px"');
    bottom: v-bind('elRect.marginBottom + "px"');
    left: 0;
    width: v-bind('elRect.marginLeft + "px"');
    align-items: center;
  }

  &-right {
    top: v-bind('elRect.marginTop + "px"');
    bottom: v-bind('elRect.marginBottom + "px"');
    right: 0;
    width: v-bind('elRect.marginRight + "px"');
    align-items: center;
  }
}

/* border + padding + content 的包裹层 */
.sei-border-wrapper {
  position: absolute;
  top: v-bind('elRect.marginTop + "px"');
  left: v-bind('elRect.marginLeft + "px"');
  right: v-bind('elRect.marginRight + "px"');
  bottom: v-bind('elRect.marginBottom + "px"');
  border-style: solid;
  border-top-width: v-bind('elRect.borderTop + "px"');
  border-bottom-width: v-bind('elRect.borderBottom + "px"');
  border-left-width: v-bind('elRect.borderLeft + "px"');
  border-right-width: v-bind('elRect.borderRight + "px"');
  border-color: rgba(255, 229, 153, 0.55);
}

/* padding + content 的包裹层 */
.sei-padding-wrapper {
  position: absolute;
  top: v-bind('elRect.borderTop + "px"');
  left: v-bind('elRect.borderLeft + "px"');
  right: v-bind('elRect.borderRight + "px"');
  bottom: v-bind('elRect.borderBottom + "px"');
}

/* padding 层 */
.sei-padding {
  position: absolute;
  background-color: rgba(147, 196, 125, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;

  &-top {
    top: 0;
    left: 0;
    right: 0;
    height: v-bind('elRect.paddingTop + "px"');
  }

  &-bottom {
    bottom: 0;
    left: 0;
    right: 0;
    height: v-bind('elRect.paddingBottom + "px"');
  }

  &-left {
    top: v-bind('elRect.paddingTop + "px"');
    bottom: v-bind('elRect.paddingBottom + "px"');
    left: 0;
    width: v-bind('elRect.paddingLeft + "px"');
    align-items: center;
  }

  &-right {
    top: v-bind('elRect.paddingTop + "px"');
    bottom: v-bind('elRect.paddingBottom + "px"');
    right: 0;
    width: v-bind('elRect.paddingRight + "px"');
    align-items: center;
  }
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
  top: v-bind('elRect.marginTop + "px"');
  left: v-bind('elRect.marginLeft + "px"');
  right: v-bind('elRect.marginRight + "px"');
  bottom: v-bind('elRect.marginBottom + "px"');
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
  padding: 0 4px;
  white-space: nowrap;
  line-height: 1.5;
  top: v-bind('labelTop + "px"');
}
</style>
