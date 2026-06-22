<!-- ? 画布拖拽区域 -->
<template>
    <!-- 画布内元素使用浏览器默认样式 -->
    <div ref="canvasEl" class="canvas-container show-component-area" @click.self="canvasStore.selectElement(null)">
        <component v-for="(element, index) in elements" :key="element.id" :is="CanvasElementComponentMap[element.type]" v-model:data="elements[index]" />
        <SelectedElementIndicator />
        <ElementToolbar />
    </div>
    <DropIndicatorOverlay />
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useCanvasStore } from "@/store/canvas";
import { CanvasElementComponentMap } from "../contants";
import { storeToRefs } from "pinia";
import { useDebounceFn } from "@vueuse/core";
import { useCanvasHistory } from "@/composables/useCanvasHistory";
import SelectedElementIndicator from "./SelectedElementIndicator.vue";
import ElementToolbar from "./ElementToolbar.vue";
import DropIndicatorOverlay from "./DropIndicatorOverlay.vue";
import { nodeRegistry } from "../drag/NodeRegistry";
import { dragEngine } from "../drag/DragEngine";

const canvasStore = useCanvasStore();
const { elements } = storeToRefs(canvasStore);

/** 撤销/重做功能 */
const { recordHistory } = useCanvasHistory(elements);

/** 根画布 DOM 引用 */
const canvasEl = ref<HTMLElement>();

let unbindDrop: (() => void) | null = null;

/** 防抖记录历史，避免频繁操作（如拖拽滑块、输入文本）产生过多快照 */
const debouncedRecord = useDebounceFn(() => {
  recordHistory();
}, 300);

/** 监听画布元素变化，自动记录历史快照 */
watch(
  () => canvasStore.elements,
  () => {
    debouncedRecord();
  },
  { deep: true },
);

onMounted(() => {
  if (!canvasEl.value) return;
  /** 注册根画布到 registry，使用特殊 id __root__ */
  nodeRegistry.register("__root__", canvasEl.value, true);
  /** 根画布绑定可放置事件，id = null 代表根层级 */
  unbindDrop = dragEngine.connectDroppable(canvasEl.value, null);
  /** 记录初始状态 */
  recordHistory();
});

onUnmounted(() => {
  unbindDrop?.();
  nodeRegistry.unregister("__root__");
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