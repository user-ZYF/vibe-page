<!-- ? 画布音频元素 -->
<template>
    <audio ref="audioEl" :id="data.id" :data-canvas-id="data.id" :class="data.classes" :src="data.src" :controls="data.controls" :style="style" @click.stop="handleSelect"></audio>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CanvasAudioElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasAudioElement>("data", {
    required: true
});

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 音频 DOM 引用 */
const audioEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

const { handleSelect } = useCanvasInteraction(data.value.id);
useDragConnector(audioEl, data.value.id);
</script>
