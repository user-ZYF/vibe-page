<!-- ? 页头元素 -->
<template>
  <header ref="headerEl" :class="data.classes" :id="data.id" :data-canvas-id="data.id" :style="style" @click.stop="handleSelect">
    <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
  </header>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CanvasHeaderElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { CanvasElementComponentMap } from '../../constants';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasHeaderElement>("data", {
  required: true
});

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 页头 DOM 引用 */
const headerEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

const { handleSelect } = useCanvasInteraction(data.value.id);
useDragConnector(headerEl, data.value.id, { isCanvas: true });
</script>
