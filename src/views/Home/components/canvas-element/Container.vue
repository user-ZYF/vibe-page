<!-- ? 容器组件 -->
<template>
  <div ref="containerEl" :class="data.classes" :id="data.id" :data-canvas-id="data.id" :style="style" @click.stop="canvasStore.selectElement(data.id)">
    <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { CanvasContainerElement } from '../../types';
import { convertStyleConfig } from '@/utils/styleConfig';
import { CanvasElementComponentMap } from '../../contants';
import { useDragConnector } from '../../drag/useDragConnector';
import { useInteractionBinder } from '@/composables/useInteractionBinder';
import { useCanvasStore } from '@/store/canvas';

const data = defineModel<CanvasContainerElement>("data", {
  required: true
});

const canvasStore = useCanvasStore();

/** 样式对象 */
const style = computed(()=>{
    return convertStyleConfig(data.value.styleConfig);
});

/** 容器 DOM 引用 */
const containerEl = ref<HTMLElement>();

useDragConnector(containerEl, data.value.id, { isCanvas: true });
useInteractionBinder(containerEl, computed(() => data.value.interactions));
</script>
