<!-- ? 表头单元格元素 -->
<template>
  <th ref="thEl" :class="data.classes" :id="data.id" :data-canvas-id="data.id" :colspan="data.colspan > 1 ? data.colspan : undefined" :rowspan="data.rowspan > 1 ? data.rowspan : undefined" :scope="scopeAttr || undefined" :style="style" @click.stop="handleSelect">
    <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
  </th>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CanvasTableHeaderCellElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { CanvasElementComponentMap } from '../../constants';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';
import { TABLE_SCOPE_ATTR_MAP } from '@/constants/home';
import { computed } from 'vue';

const data = defineModel<CanvasTableHeaderCellElement>("data", {
  required: true
});

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 表头单元格 DOM 引用 */
const thEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

/** scope 属性值 */
const scopeAttr = computed(() => data.value.scope ? TABLE_SCOPE_ATTR_MAP[data.value.scope] : '');

const { handleSelect } = useCanvasInteraction(data.value.id);
useDragConnector(thEl, data.value.id, { isCanvas: true });
</script>
