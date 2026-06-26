<!-- ? 容器组件 -->
<template>
  <div ref="containerEl" :class="data.classes" :id="data.id" :data-canvas-id="data.id" :style="style" @click.stop="canvasStore.selectElement(data.id)">
    <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { CanvasContainerElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { CanvasElementComponentMap } from '../../contants';
import { useDragConnector } from '../../drag/useDragConnector';
import { useInteractionBinder } from '@/composables/useInteractionBinder';
import { useCanvasStore } from '@/store/canvas';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasContainerElement>("data", {
  required: true
});

const canvasStore = useCanvasStore();

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 容器 DOM 引用 */
const containerEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

useDragConnector(containerEl, data.value.id, { isCanvas: true });
useInteractionBinder(containerEl, computed(() => data.value.interactions));
</script>
