<!-- ? 画布段落元素 -->
<template>
    <p :id="data.id" :class="data.classes" :style="convertStyleConfig(data.styleConfig)" @click.stop="canvasStore.selectElement(data.id)">{{ data.text }}</p>
</template>

<script lang="ts" setup>
import { CanvasParagraphElement } from '../../types';
import { convertStyleConfig } from '@/utils/styleConfig';
import { useCanvasStore } from '@/store/canvas';

const canvasStore = useCanvasStore();

const data = defineModel<CanvasParagraphElement>("data", {
    required: true
});
</script>