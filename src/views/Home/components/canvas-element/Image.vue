<!-- ? 画布图片元素 -->
<template>
    <img ref="imageEl" :id="data.id" :data-canvas-id="data.id" :class="data.classes" :src="data.src" :alt="data.title" :style="convertStyleConfig(data.styleConfig)">
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CanvasImageElement } from '../../types';
import { convertStyleConfig } from '@/utils/styleConfig';
import { useCanvasStore } from '@/store/canvas';
import { useDragConnector } from '../../drag/useDragConnector';

const canvasStore = useCanvasStore();

const data = defineModel<CanvasImageElement>("data", {
    required: true
});

/** 图片 DOM 引用 */
const imageEl = ref<HTMLElement>();

useDragConnector(imageEl, data.value.id);
</script>