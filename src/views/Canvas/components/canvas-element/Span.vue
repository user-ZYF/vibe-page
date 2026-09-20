<!-- ? 画布行内容器元素 -->
<template>
  <span ref="spanEl" :class="classes" :id="data.id" :data-canvas-id="data.id" @click.stop="handleSelect">
    <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
  </span>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { CanvasSpanElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { CanvasElementComponentMap } from '../../constants';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasSpanElement>("data", {
  required: true
});

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 行内容器 DOM 引用 */
const spanEl = ref<HTMLElement>();

useElementVisibility(data.value.id);

const { handleSelect } = useCanvasInteraction(data.value.id);
useDragConnector(spanEl, data.value.id, { isCanvas: true });
</script>
