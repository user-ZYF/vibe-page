<!-- ? 画布拖拽区域 -->
<template>
    <!-- 画布内元素使用浏览器默认样式 -->
    <div ref="canvasEl" class="canvas-container">
        <component v-for="(element, index) in elements" :key="element.id" :is="CanvasElementComponentMap[element.type]" v-model:data="elements[index]" />
        <!-- <SelectedElementIndicator />
        <ElementToolbar /> -->
    </div>
    <DropIndicatorOverlay />
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useCanvasStore } from "@/store/canvas";
import { CanvasElementComponentMap } from "../contants";
import { storeToRefs } from "pinia";
// import SelectedElementIndicator from "./SelectedElementIndicator.vue";
// import ElementToolbar from "./ElementToolbar.vue";
import DropIndicatorOverlay from "./DropIndicatorOverlay.vue";
import { nodeRegistry } from "../drag/NodeRegistry";
import { dragEngine } from "../drag/DragEngine";

const canvasStore = useCanvasStore();
const { elements } = storeToRefs(canvasStore);

/** 根画布 DOM 引用 */
const canvasEl = ref<HTMLElement>();

let unbindDrop: (() => void) | null = null;

onMounted(() => {
  if (!canvasEl.value) return;
  /** 注册根画布到 registry，使用特殊 id __root__ */
  nodeRegistry.register("__root__", canvasEl.value, true);
  /** 根画布绑定可放置事件，id = null 代表根层级 */
  unbindDrop = dragEngine.connectDroppable(canvasEl.value, null);
});

onUnmounted(() => {
  unbindDrop?.();
  nodeRegistry.unregister("__root__");
});
</script>

<style lang="less" scoped>
.canvas-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;

    :deep(*:not(.sei-root, .sei-root *, .etb-root, .etb-root *)) {
        // all: revert;
        box-sizing: border-box;
        outline: 1px dashed #ccc;
        outline-offset: -1px;
        cursor: default;
    }
}
</style>