<!-- ? 表格列元素 -->
<template>
  <col ref="colEl" :id="data.id" :data-canvas-id="data.id" :class="classes" :span="data.span" @click.stop="handleSelect" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { CanvasTableColElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasTableColElement>("data", {
  required: true
});

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 表格列 DOM 引用 */
const colEl = ref<HTMLElement>();

useElementVisibility(data.value.id);

const { handleSelect } = useCanvasInteraction(data.value.id);
useDragConnector(colEl, data.value.id);
</script>
