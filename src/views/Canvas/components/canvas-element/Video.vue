<!-- ? 画布视频元素 -->
<template>
    <video ref="videoEl" :id="data.id" :data-canvas-id="data.id" :class="data.classes" :src="data.src" :controls="data.controls" :style="style" @click.stop="handleSelect"></video>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CanvasVideoElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasVideoElement>("data", {
    required: true
});

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 视频 DOM 引用 */
const videoEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

const { handleSelect } = useCanvasInteraction(data.value.id);
useDragConnector(videoEl, data.value.id);
</script>
