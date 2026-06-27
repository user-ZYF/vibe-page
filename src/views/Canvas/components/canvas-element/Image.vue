<!-- ? 画布图片元素 -->
<template>
    <img ref="imageEl" :id="data.id" :data-canvas-id="data.id" :class="data.classes" :src="data.src" :alt="data.title" :style="style" @click.stop="handleSelect">
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { CanvasImageElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useInteractionBinder } from '@/composables/useInteractionBinder';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasImageElement>("data", {
    required: true
});

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 图片 DOM 引用 */
const imageEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

const { handleSelect } = useCanvasInteraction(data.value.id);
useDragConnector(imageEl, data.value.id);
useInteractionBinder(imageEl, computed(() => data.value.interactions));
</script>