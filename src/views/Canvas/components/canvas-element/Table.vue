<!-- ? 表格元素 -->
<template>
  <table ref="tableEl" :class="classes" :id="data.id" :data-canvas-id="data.id" @click.stop="handleSelect">
    <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
  </table>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { CanvasTableElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { CanvasElementComponentMap } from '../../constants';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasTableElement>("data", {
  required: true
});

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 表格 DOM 引用 */
const tableEl = ref<HTMLElement>();

useElementVisibility(data.value.id);

const { handleSelect } = useCanvasInteraction(data.value.id);
useDragConnector(tableEl, data.value.id, { isCanvas: true });
</script>
