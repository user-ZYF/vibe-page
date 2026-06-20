<!-- ? 画布超链接元素 -->
<template>
    <a ref="linkEl" :id="data.id" :data-canvas-id="data.id" :class="data.classes" :href="data.href" :style="convertStyleConfig(data.styleConfig)">{{ data.text }}</a>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CanvasLinkElement } from '../../types';
import { convertStyleConfig } from '@/utils/styleConfig';
import { useCanvasStore } from '@/store/canvas';
import { useDragConnector } from '../../drag/useDragConnector';

const canvasStore = useCanvasStore();

const data = defineModel<CanvasLinkElement>("data", {
    required: true
});

/** 超链接 DOM 引用 */
const linkEl = ref<HTMLElement>();

useDragConnector(linkEl, data.value.id);
</script>