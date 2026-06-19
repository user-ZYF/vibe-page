<!-- ? 画布图片元素 -->
<template>
    <img :id="data.id" :class="data.classes" :src="data.src" :alt="data.title" :style="convertStyleConfig(data.styleConfig)" @click.stop="canvasStore.selectElement(data.id)">
</template>

<script lang="ts" setup>
import { CanvasImageElement } from '../../types';
import { convertStyleConfig } from '@/utils/styleConfig';
import { useCanvasStore } from '@/store/canvas';

const canvasStore = useCanvasStore();

const data = defineModel<CanvasImageElement>("data", {
    required: true
});
</script>