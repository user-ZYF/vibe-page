<!-- ? 画布图片元素 -->
<template>
    <img ref="imageEl" :id="data.id" :data-canvas-id="data.id" :class="classes" :src="data.src" :alt="data.title" @click.stop="handleSelect">
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { CanvasImageElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasImageElement>("data", {
    required: true
});

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 图片 DOM 引用 */
const imageEl = ref<HTMLElement>();

useElementVisibility(data.value.id);

const { handleSelect } = useCanvasInteraction(data.value.id);
useDragConnector(imageEl, data.value.id);
</script>