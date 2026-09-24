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
      <span ref="labelRef" class="sei-selected-label">{{ elName }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, shallowRef, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useCanvasStore } from '@/store/canvas';
import { storeToRefs } from 'pinia';
import { CanvasElementLabelMap } from '@/constants/home';
import { useCanvasBoxRect } from '@/composables/useCanvasBoxRect';
import { useDragStore } from '@/store/drag';
import { nodeRegistry } from '../drag/NodeRegistry';

defineOptions({
  name: 'MarginPaddingIndicator',
});

defineProps({
  /** 是否显示边距尺寸标签 */
  showBoxLabels: {
    type: Boolean,
    default: false,
  },
});

const canvasStore = useCanvasStore();
const { isResizing } = storeToRefs(canvasStore);

const dragStore = useDragStore();
const { isDragging } = storeToRefs(dragStore);

const { elRect, elMarginBox, updateBox, resetElRect, getCanvasEl } = useCanvasBoxRect();

/** 当前悬停的画布 DOM 元素 */
const currentTarget = shallowRef<Element | null>(null);

/** 当前悬停目标对应的画布元素 id（由悬停命中节点解析，与测量目标可能不是同一节点，如媒体元素注册的是内层 audio/video） */
const currentTargetId = shallowRef<string | null>(null);

/** 名称标签 DOM 引用 */
const labelRef = ref<HTMLElement | null>(null);

/** 名称标签宽度 */
const labelWidth = ref(0);

/** 悬停元素是否处于渲染状态（display 不为 none，直接读取 DOM 计算样式，反映真实渲染结果） */
const isTargetDisplayed = ref(true);

/** 是否显示覆盖层 */
const visible = computed(() => !!currentTarget.value && !isDragging.value && !isResizing.value && isTargetDisplayed.value);

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

/** 元素名称标签的 left 偏移（粘性定位，防止被画布左右两侧遮挡） */
const labelLeft = computed(() => {
  /** 边框区域距离画布左侧的距离 */
  const borderLeft = elRect.value.x + elRect.value.marginLeft;
  /** 防止左侧溢出：标签左边缘不超出画布视口左侧 */
  const minLeft = Math.max(0, -borderLeft);
  /** 防止右侧溢出：标签右边缘不超出画布视口右侧 */
  const maxLeft = elRect.value.canvasWidth - borderLeft - labelWidth.value;
  return Math.min(maxLeft, minLeft);
});

/** 元素名称 */
const elName = computed(() => {
  const id = currentTargetId.value;
  if (!id) return '';
  const el = canvasStore.getElementById(id);
  if(!el) return '';
  return el.alias || CanvasElementLabelMap[el.type];
});

/** 鼠标移入 */
function handleMouseOver(event: MouseEvent) {
  const target = event.target as Element | null;
  const host = target instanceof HTMLElement ? target.closest<HTMLElement>('[data-canvas-id]') : null;
  // 这里需要从 registry 中拿目标元素，因为 id 并不一定都绑定在目标元素上
  const reg = host?.dataset.canvasId ? nodeRegistry.get(host.dataset.canvasId) : undefined;
  currentTargetId.value = reg?.id ?? host?.dataset.canvasId ?? null;
  currentTarget.value = reg ? reg.el : target;
}

/** 鼠标移出画布 */
function handleMouseLeave() {
  currentTarget.value = null;
  currentTargetId.value = null;
}

/**
 * 重新测量悬停元素的可见性与盒模型
 * display:none 时元素无渲染框（几何数据全为 0），隐藏指示层并跳过测量
 */
function refreshTargetBox(el: Element) {
  isTargetDisplayed.value = getComputedStyle(el).display !== 'none';
  if (!isTargetDisplayed.value) return;
  updateBox(el);
  nextTick(() => {
    labelWidth.value = labelRef.value?.offsetWidth ?? 0;
  });
}

/** 窗口尺寸变化时同步更新元素尺寸 */
function handleRecompute() {
  if (currentTarget.value) {
    updateBox(currentTarget.value);
  }
}

watch(currentTarget, (el) => {
  if (el) {
    refreshTargetBox(el);
    startLayoutWatch();
  } else {
    isTargetDisplayed.value = true;
    resetElRect();
    stopLayoutWatch();
  }
});

/** 拖拽/调整尺寸结束时，刷新元素尺寸数据，避免显示旧尺寸 */
watch([isDragging, isResizing], () => {
  if (!isDragging.value && !isResizing.value && currentTarget.value) {
    refreshTargetBox(currentTarget.value);
  }
});

/** 画布数据深度监听的停止函数（仅悬停期间订阅，避免无目标时的全树深度遍历开销） */
let layoutWatchStop: (() => void) | null = null;

/** 订阅画布元素数据与样式规则变化：悬停元素的盒模型、可见性可能改变，元素也可能已被删除 */
function startLayoutWatch() {
  if (layoutWatchStop) return;
  layoutWatchStop = watch(
    [() => canvasStore.root, () => canvasStore.styleRules],
    () => {
      const el = currentTarget.value;
      /** 拖拽/调整尺寸期间指示器不可见，跳过测量（结束时由对应 watch 统一刷新） */
      if (!el || isDragging.value || isResizing.value) return;
      /** 待 DOM 更新完成后重新校验并测量 */
      nextTick(() => {
        /** 期间鼠标可能已移出，以最新悬停目标为准 */
        if (currentTarget.value !== el) return;
        /** 悬停元素的 DOM 节点已被卸载重建（删除/合并/代码重写）时，隐藏指示器 */
        if (!el.isConnected) {
          currentTarget.value = null;
          return;
        }
        const id = currentTargetId.value;
        /** 画布元素已从元素树移除时隐藏指示器；无 data-canvas-id 的内部节点仅重新测量 */
        if (id && !canvasStore.getElementById(id)) {
          currentTarget.value = null;
          return;
        }
        refreshTargetBox(el);
      });
    },
    { deep: true },
  );
}

/** 停止画布数据深度监听 */
function stopLayoutWatch() {
  layoutWatchStop?.();
  layoutWatchStop = null;
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
  stopLayoutWatch();
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
  z-index: 100;
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  outline: 1px solid var(--editor-accent);
  outline-offset: -1px;
  z-index: 1;
}

/* 元素类别名称标签（悬停时显示） */
.sei-selected-label {
  position: absolute;
  z-index: 1;
  left: v-bind('labelLeft + "px"');
  background: var(--editor-accent);
  color: #fff;
  font-size: 12px;
  font-family: monospace;
  padding: 0 4px;
  white-space: nowrap;
  line-height: 1.5;
  top: v-bind('labelTop + "px"');
}
</style>
