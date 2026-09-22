<!-- ? 画布拖拽区域 -->
<template>
    <!-- 画布内元素使用浏览器默认样式 -->
    <div class="canvas-container">
        <!-- Shadow DOM 宿主元素，隔绝画布内外样式 -->
        <div ref="shadowHostRef" class="canvas-shadow-host"></div>
        <!-- 转移到shadow dom中 -->
        <Teleport :to="teleportTarget" :disabled="!shadowRoot">
          <!-- 以根元素 id 作为 key：代码编辑改写根元素 id 后强制重建，保证拖拽注册表/交互守卫等按 id 注册的逻辑同步刷新 -->
          <Root v-model:data="root" :key="root.id" />
        </Teleport>
        <MarginPaddingIndicator v-if="!isPreview" />
        <SelectedElementToolbar v-if="!isPreview" />
    </div>
    <DropIndicatorOverlay v-if="!isPreview" />
</template>

<script lang="ts" setup>
import { watch, onMounted, inject, ref, computed, nextTick } from "vue";
import { useCanvasStore } from "@/store/canvas";
import { storeToRefs } from "pinia";
import { useCanvasHistory } from "@/composables/useCanvasHistory";
import { canvasScroll, type CanvasScrollPosition } from "@/composables/canvas-scroll";
import { useDebounceFn } from "@vueuse/core";
import { generateCss } from "@/utils/code-generator";
import MarginPaddingIndicator from "./MarginPaddingIndicator.vue";
import SelectedElementToolbar from "./SelectedElementToolbar.vue";
import DropIndicatorOverlay from "./DropIndicatorOverlay.vue";
import Root from './canvas-element/Root.vue';
import { IS_PREVIEW_KEY } from '../constants.ts';

const canvasStore = useCanvasStore();
const { root, styleRules, selectedElementId } = storeToRefs(canvasStore);

/** 是否处于预览模式 */
const isPreview = inject(IS_PREVIEW_KEY, ref(false));

/** 撤销/重做功能 */
const { debouncedRecord } = useCanvasHistory({
  snapshot: () => ({
    root: canvasStore.root,
    styleRules: canvasStore.styleRules,
    selectedElementId: selectedElementId.value,
    scrollPosition: { left: canvasScroll.left.value, top: canvasScroll.top.value }
  }),
  restore: (state) => {
    root.value = state.root;
    styleRules.value = state.styleRules;
    selectedElementId.value = state.selectedElementId;
    restoreCanvasScrollPosition(state.scrollPosition);
  },
  debounceMs: 100
});

/** Shadow DOM 宿主元素引用 */
const shadowHostRef = ref<HTMLElement>();

/** Shadow Root 引用 */
const shadowRoot = ref<ShadowRoot | null>(null);

/** 画布动态样式元素引用（注入完整 CSS，随样式变化响应式更新） */
const dynamicStyleEl = ref<HTMLStyleElement | null>(null);

/** 画布完整 CSS（class 规则 + raw 透传 + 元素 #id），与导出代码走同一条路径 */
const canvasCss = computed(() => {
  return generateCss(styleRules.value);
});

/** 监听画布 CSS 变化，响应式更新 Shadow DOM 内的动态样式元素 */
watch(canvasCss, (css) => {
  if (dynamicStyleEl.value) dynamicStyleEl.value.textContent = css;
});

/** Teleport 目标（Shadow Root，类型断言以兼容 Teleport 的 to prop 类型） */
const teleportTarget = computed(() => shadowRoot.value as unknown as HTMLElement);

/** 恢复画布滚动位置（等待 DOM 更新后应用，避免内容高度变化导致位置被钳制） */
function restoreCanvasScrollPosition(position: CanvasScrollPosition) {
  nextTick(() => {
    canvasScroll.left.value = position.left;
    canvasScroll.top.value = position.top;
  });
}
  
/** 是否已完成初始加载（避免加载后立即触发冗余保存） */
const isInitialized = ref(false);

/** 防抖保存画布数据到 LocalStorage（500ms） */
const debouncedSaveToStorage = useDebounceFn(() => {
  if (!isInitialized.value) return;
  canvasStore.saveCanvasToStorage();
}, 500);

/** 监听画布数据变化，自动记录历史快照并保存到 LocalStorage */
watch(
  [() => canvasStore.root, () => canvasStore.styleRules],
  () => {
    debouncedRecord();
    debouncedSaveToStorage();
  },
  { deep: true },
);

onMounted(() => {
  /** 优先从 LocalStorage 恢复画布数据，无数据时加载默认内容 */
  const loaded = canvasStore.loadCanvasFromStorage();
  if (!loaded) {
    canvasStore.loadDefaultContent();
  }

  /** 延迟标记初始化完成，避免加载/默认内容引起的数据变化触发冗余保存 */
  nextTick(() => {
    isInitialized.value = true;
  });

  if (shadowHostRef.value) {
    const shadow = shadowHostRef.value.attachShadow({ mode: 'open' });

    /** 基础样式（静态）：画布框架样式，shadow dom 内 scoped 样式无法生效，需手动注入 */
    const baseStyle = document.createElement('style');
    baseStyle.textContent = `
      .canvas-root {
        width: 100%;
        height: 100%;
        overflow: auto;
        position: relative;
        background: #fff;
        z-index: 0;
      }

      .canvas-root:not(.is-preview), .canvas-root:not(.is-preview) [data-canvas-id] {
        outline: 1px dashed #ccc;
        outline-offset: -1px;
      }

      .canvas-text {
        display: inline;
      }
    `;
    shadow.appendChild(baseStyle);

    /** 动态样式：class 规则 + raw 透传 + 元素 #id，随样式变化响应式更新，与导出代码走同一条路径 */
    const dynamicStyle = document.createElement('style');
    dynamicStyle.textContent = canvasCss.value;
    shadow.appendChild(dynamicStyle);
    dynamicStyleEl.value = dynamicStyle;

    shadowRoot.value = shadow;
  }
});
</script>

<style scoped lang="less">
.canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.canvas-shadow-host {
  all: initial;
  display: block;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}
</style>
