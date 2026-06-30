<!-- ? 画布行内容器元素 -->
<template>
  <span ref="spanEl" :class="data.classes" :id="data.id" :data-canvas-id="data.id" :style="style" @click.stop="handleSelect">
    <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
  </span>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CanvasSpanElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { CanvasElementComponentMap } from '../../constants';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasSpanElement>("data", {
  required: true
});

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 行内容器 DOM 引用 */
const spanEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

const { handleSelect } = useCanvasInteraction(data.value.id);
useDragConnector(spanEl, data.value.id, { isCanvas: true });
</script>
