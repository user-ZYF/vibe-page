<!-- ? 画布拖拽区域 -->
<template>
    <!-- 画布内元素使用浏览器默认样式 -->
    <div class="canvas-container">
        <!-- Shadow DOM 宿主元素，隔绝画布内外样式 -->
        <div ref="shadowHostRef" class="canvas-shadow-host"></div>
        <!-- 转移到shadow dom中 -->
        <Teleport :to="teleportTarget" :disabled="!shadowRoot">
          <Root v-model:data="root" />
        </Teleport>
        <MarginPaddingIndicator v-if="!isPreview" />
        <SelectedElementToolbar v-if="!isPreview" />
    </div>
    <DropIndicatorOverlay v-if="!isPreview" />
</template>

<script lang="ts" setup>
import { watch, onMounted, inject, ref, computed } from "vue";
import { useCanvasStore } from "@/store/canvas";
import { storeToRefs } from "pinia";
import { useDebounceFn } from "@vueuse/core";
import { useCanvasHistory } from "@/composables/useCanvasHistory";
import MarginPaddingIndicator from "./MarginPaddingIndicator.vue";
import SelectedElementToolbar from "./SelectedElementToolbar.vue";
import DropIndicatorOverlay from "./DropIndicatorOverlay.vue";
import Root from './canvas-element/Root.vue';
import { IS_PREVIEW_KEY } from '../contants';

const canvasStore = useCanvasStore();
const { root } = storeToRefs(canvasStore);

/** 是否处于预览模式 */
const isPreview = inject(IS_PREVIEW_KEY, ref(false));

/** 撤销/重做功能 */
const { recordHistory } = useCanvasHistory(root);

/** 防抖记录历史，避免频繁操作（如拖拽滑块、输入文本）产生过多快照 */
const debouncedRecord = useDebounceFn(() => {
  recordHistory();
}, 300);

/** Shadow DOM 宿主元素引用 */
const shadowHostRef = ref<HTMLElement>();

/** Shadow Root 引用 */
const shadowRoot = ref<ShadowRoot | null>(null);

/** Teleport 目标（Shadow Root，类型断言以兼容 Teleport 的 to prop 类型） */
const teleportTarget = computed(() => shadowRoot.value as unknown as HTMLElement);

/** 监听画布元素变化，自动记录历史快照 */
watch(
  () => canvasStore.root,
  () => {
    debouncedRecord();
  },
  { deep: true },
);

onMounted(() => {
  if (shadowHostRef.value) {
    const shadow = shadowHostRef.value.attachShadow({ mode: 'open' });

    /** shadow dom内的scoped样式无法生效 */
    const style = document.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
      }

      .canvas-root {
        width: 100%;
        height: 100%;
        overflow: auto;
      }

      .canvas-root:not(.is-preview), .canvas-root:not(.is-preview) * {
        outline: 1px dashed #ccc;
        outline-offset: -1px;
      }
    `;
    shadow.appendChild(style);

    shadowRoot.value = shadow;
  }

  recordHistory();
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
