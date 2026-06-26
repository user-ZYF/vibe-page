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
        <SelectedElementIndicator />
        <ElementToolbar />
    </div>
    <DropIndicatorOverlay />
</template>

<script lang="ts" setup>
import { watch, onMounted } from "vue";
import { useCanvasStore } from "@/store/canvas";
import { storeToRefs } from "pinia";
import { useDebounceFn } from "@vueuse/core";
import { useCanvasHistory } from "@/composables/useCanvasHistory";
import SelectedElementIndicator from "./SelectedElementIndicator.vue";
import ElementToolbar from "./ElementToolbar.vue";
import DropIndicatorOverlay from "./DropIndicatorOverlay.vue";
import Root from './canvas-element/Root.vue';

const canvasStore = useCanvasStore();
const { root } = storeToRefs(canvasStore);

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
    overflow-x: hidden;
    overflow-y: auto;
}
</style>