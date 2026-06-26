<!-- ? 画布段落元素 -->
<template>
    <p ref="paragraphEl" :id="data.id" :data-canvas-id="data.id" :class="data.classes" :style="style" @click="canvasStore.selectElement(data.id)">{{ data.text }}</p>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { CanvasParagraphElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { useCanvasStore } from '@/store/canvas';
import { useDragConnector } from '../../drag/useDragConnector';
import { useInteractionBinder } from '@/composables/useInteractionBinder';
import { useElementVisibility } from '@/composables/useElementVisibility';

const canvasStore = useCanvasStore();

const data = defineModel<CanvasParagraphElement>("data", {
    required: true
});

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 段落 DOM 引用 */
const paragraphEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

useDragConnector(paragraphEl, data.value.id);
useInteractionBinder(paragraphEl, computed(() => data.value.interactions));
</script>