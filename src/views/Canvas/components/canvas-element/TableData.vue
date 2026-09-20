<!-- ? 表格单元格元素 -->
<template>
  <td ref="tdEl" :class="classes" :id="data.id" :data-canvas-id="data.id" :colspan="data.colspan !== undefined && data.colspan > 1 ? data.colspan : undefined" :rowspan="data.rowspan !== undefined && data.rowspan > 1 ? data.rowspan : undefined" @click.stop="handleSelect">
    <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
  </td>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { CanvasTableDataElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { CanvasElementComponentMap } from '../../constants';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasTableDataElement>("data", {
  required: true
});

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 表格单元格 DOM 引用 */
const tdEl = ref<HTMLElement>();

useElementVisibility(data.value.id);

const { handleSelect } = useCanvasInteraction(data.value.id);
useDragConnector(tdEl, data.value.id, { isCanvas: true });
</script>
