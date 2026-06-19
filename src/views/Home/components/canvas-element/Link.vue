<!-- ? 画布超链接元素 -->
<template>
    <a :id="data.id" :class="data.classes" :href="data.href" :style="convertStyleConfig(data.styleConfig)" @click.stop.prevent="canvasStore.selectElement(data.id)">{{ data.text }}</a>
</template>

<script lang="ts" setup>
import { CanvasLinkElement } from '../../types';
import { convertStyleConfig } from '@/utils/styleConfig';
import { useCanvasStore } from '@/store/canvas';

const canvasStore = useCanvasStore();

const data = defineModel<CanvasLinkElement>("data", {
    required: true
});
</script>