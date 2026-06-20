<!-- ? 容器组件 -->
<template>
  <div ref="containerEl" :class="data.classes" :id="data.id" :data-canvas-id="data.id" :style="convertStyleConfig(data.styleConfig)">
    <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CanvasContainerElement } from '../../types';
import { convertStyleConfig } from '@/utils/styleConfig';
import { CanvasElementComponentMap } from '../../contants';
import { useDragConnector } from '../../drag/useDragConnector';

const data = defineModel<CanvasContainerElement>("data", {
  required: true
});

/** 容器 DOM 引用 */
const containerEl = ref<HTMLElement>();

useDragConnector(containerEl, data.value.id, { isCanvas: true });
</script>
