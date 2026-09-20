<!-- ? 画布音频元素 -->
<template>
    <audio ref="audioEl" :id="data.id" :data-canvas-id="data.id" :class="classes" :src="data.src" :controls="data.controls" @click.stop="handleSelect"></audio>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { CanvasAudioElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasAudioElement>("data", {
    required: true
});

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 音频 DOM 引用 */
const audioEl = ref<HTMLElement>();

useElementVisibility(data.value.id);

const { handleSelect } = useCanvasInteraction(data.value.id);
useDragConnector(audioEl, data.value.id);
</script>
