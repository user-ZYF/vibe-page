<!-- ? 画布视频元素 -->
<template>
    <video ref="videoEl" :id="data.id" :data-canvas-id="data.id" :class="classes" :src="data.src" :controls="data.controls" @click.stop="handleSelect"></video>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { CanvasVideoElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasVideoElement>("data", {
    required: true
});

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 视频 DOM 引用 */
const videoEl = ref<HTMLElement>();

useElementVisibility(data.value.id);

const { handleSelect } = useCanvasInteraction(data.value.id);
useDragConnector(videoEl, data.value.id);
</script>
