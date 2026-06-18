<!-- ? 画布拖拽区域 -->
<template>
    <!-- 画布内元素使用浏览器默认样式 -->
    <div class="container" @dragover.prevent="handleDragOver" @drop.prevent="handleDrop">
        <component :is="CanvasElementComponentMap[element.type]" v-for="(element, index) in elements" :key="element.id" v-model:data="elements[index]"/>
    </div>
</template>

<script lang="ts" setup>
import { useCanvasCreatorStore } from "@/store/canvas";
import { CanvasElementComponentMap } from "../contants"; 
import { storeToRefs } from "pinia";
import { CanvasElementTypeEnum } from "@/constants/home";

const canvasStore = useCanvasCreatorStore();
const { elements } = storeToRefs(canvasStore);

/** 拖拽悬停：允许放置 */
function handleDragOver(event: DragEvent) {
  event.dataTransfer!.dropEffect = 'copy';
}

/** 放置：从 dataTransfer 读取元素类型并添加到画布 */
function handleDrop(event: DragEvent) {
  const raw = event.dataTransfer!.getData('canvas/element-type');
  if (!raw) return;
  const type = Number(raw) as CanvasElementTypeEnum;
  if (type === CanvasElementTypeEnum.UNDEFINED) return;
  canvasStore.addElement(type);
}
</script>

<style lang="less" scoped>
.container {
    width: 100%;
    height: 100%;

    :deep(*) {
        all: revert;
        box-sizing: border-box;
    }
}
</style>