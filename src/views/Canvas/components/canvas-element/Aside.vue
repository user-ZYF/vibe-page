<!-- ? 侧边栏元素 -->
<template>
  <aside ref="asideEl" :class="classes" :id="data.id" :data-canvas-id="data.id" @click.stop="handleSelect">
    <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
  </aside>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { CanvasAsideElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { CanvasElementComponentMap } from '../../constants';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasAsideElement>("data", {
  required: true
});

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 侧边栏 DOM 引用 */
const asideEl = ref<HTMLElement>();

useElementVisibility(data.value.id);

const { handleSelect } = useCanvasInteraction(data.value.id);
useDragConnector(asideEl, data.value.id, { isCanvas: true });
</script>
