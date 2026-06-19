<!-- ? 容器组件 -->
<template>
  <div :class="data.classes" :id="data.id" :style="convertStyleConfig(data.styleConfig)" @click.stop="canvasStore.selectElement(data.id)" @dragover.prevent.stop="handleDragOver" @drop.prevent.stop="handleDrop">
    <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
  </div>
</template>

<script lang="ts" setup>
import { CanvasContainerElement } from '../../types';
import { convertStyleConfig } from '@/utils/styleConfig';
import { CanvasElementComponentMap } from '../../contants';
import { useCanvasStore } from '@/store/canvas';
import { CanvasElementTypeEnum } from '@/constants/home';

const data = defineModel<CanvasContainerElement>("data", {
  required: true
});

const canvasStore = useCanvasStore();

/** 拖拽悬停：允许放置 */
function handleDragOver(event: DragEvent) {
  event.dataTransfer!.dropEffect = 'copy';
}

/** 放置：从 dataTransfer 读取元素类型并添加到画布 */
function handleDrop(event: DragEvent) {
  const raw = event.dataTransfer!.getData('canvas/element-type');
  if (!raw) return;
  const type = Number(raw) as CanvasElementTypeEnum;
  canvasStore.addElementToContainer(type, data.value.id);
}
</script>
