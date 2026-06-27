<!-- ? 画布拖拽区域 -->
<template>
    <!-- 画布内元素使用浏览器默认样式 -->
    <div
      class="canvas-container" 
      :class="{
        'show-component-area': true
      }" 
    >
        <Root v-model:data="root" />
        <MarginPaddingIndicator v-if="!isPreview" />
        <SelectedElementToolbar v-if="!isPreview" />
    </div>
    <DropIndicatorOverlay v-if="!isPreview" />
</template>

<script lang="ts" setup>
import { watch, onMounted, inject, ref } from "vue";
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

/** 监听画布元素变化，自动记录历史快照 */
watch(
  () => canvasStore.root,
  () => {
    debouncedRecord();
  },
  { deep: true },
);

onMounted(()=>{
  recordHistory();
});
</script>

<style lang="less" scoped>
@import "@/styles/canvas.less";

.canvas-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }
</style>