<!-- ? 表格列组元素 -->
<template>
  <colgroup ref="colgroupEl" :class="classes" :id="data.id" :data-canvas-id="data.id" :span="data.span !== undefined && data.span > 1 ? data.span : undefined" @click.stop="handleSelect">
    <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
  </colgroup>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { CanvasTableColGroupElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { CanvasElementComponentMap } from '../../constants';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasTableColGroupElement>("data", {
  required: true
});

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 表格列组 DOM 引用 */
const colgroupEl = ref<HTMLElement>();

useElementVisibility(data.value.id);

const { handleSelect } = useCanvasInteraction(data.value.id);
useDragConnector(colgroupEl, data.value.id, { isCanvas: true });
</script>
