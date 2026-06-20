<!-- ? 画布按钮元素 -->
<template>
    <button ref="buttonEl" :class="data.classes" :id="data.id" :data-canvas-id="data.id" :type="data.buttonType" :style="convertStyleConfig(data.styleConfig)">{{ data.text }}</button>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CanvasButtonElement } from '../../types';
import { convertStyleConfig } from '@/utils/styleConfig';
import { useCanvasStore } from '@/store/canvas';
import { useDragConnector } from '../../drag/useDragConnector';

const canvasStore = useCanvasStore();

const data = defineModel<CanvasButtonElement>("data", {
    required: true
});

/** 按鈕 DOM 引用 */
const buttonEl = ref<HTMLElement>();

useDragConnector(buttonEl, data.value.id);
</script>