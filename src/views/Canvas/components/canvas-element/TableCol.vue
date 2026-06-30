<!-- ? 表格列元素 -->
<template>
  <col ref="colEl" :id="data.id" :data-canvas-id="data.id" :class="data.classes" :span="data.span" :style="style" @click.stop="handleSelect" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CanvasTableColElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasTableColElement>("data", {
  required: true
});

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 表格列 DOM 引用 */
const colEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

const { handleSelect } = useCanvasInteraction(data.value.id);
useDragConnector(colEl, data.value.id);
</script>
