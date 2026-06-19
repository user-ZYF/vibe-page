<!-- ? 画布按钮元素 -->
<template>
    <button :class="data.classes" :id="data.id" :type="data.buttonType" :style="convertStyleConfig(data.styleConfig)" @click.stop="canvasStore.selectElement(data.id)">{{ data.text }}</button>
</template>

<script lang="ts" setup>
import { CanvasButtonElement } from '../../types';
import { convertStyleConfig } from '@/utils/styleConfig';
import { useCanvasStore } from '@/store/canvas';

const canvasStore = useCanvasStore();

const data = defineModel<CanvasButtonElement>("data", {
    required: true
});
</script>