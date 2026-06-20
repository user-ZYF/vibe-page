<!-- ? 画布段落元素 -->
<template>
    <p ref="paragraphEl" :id="data.id" :data-canvas-id="data.id" :class="data.classes" :style="convertStyleConfig(data.styleConfig)">{{ data.text }}</p>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CanvasParagraphElement } from '../../types';
import { convertStyleConfig } from '@/utils/styleConfig';
import { useCanvasStore } from '@/store/canvas';
import { useDragConnector } from '../../drag/useDragConnector';

const canvasStore = useCanvasStore();

const data = defineModel<CanvasParagraphElement>("data", {
    required: true
});

/** 段落 DOM 引用 */
const paragraphEl = ref<HTMLElement>();

useDragConnector(paragraphEl, data.value.id);
</script>