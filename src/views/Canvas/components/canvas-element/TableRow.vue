<!-- ? 表格行元素 -->
<template>
  <tr ref="trEl" :class="classes" :id="data.id" :data-canvas-id="data.id" @click.stop="handleSelect">
    <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
  </tr>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { CanvasTableRowElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { CanvasElementComponentMap } from '../../constants';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasTableRowElement>("data", {
  required: true
});

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 表格行 DOM 引用 */
const trEl = ref<HTMLElement>();

useElementVisibility(data.value.id);

const { handleSelect } = useCanvasInteraction(data.value.id);
useDragConnector(trEl, data.value.id, { isCanvas: true });
</script>
