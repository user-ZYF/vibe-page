<!-- ? 画布纯文本元素 -->
<template>
  <span
    ref="textEl"
    class="canvas-text"
    :id="data.id"
    :data-canvas-id="data.id"
    v-editable="{ id: data.id, isPreview, getText: () => data.text, onSave: (v: string) => data.text = v, onEmpty: () => canvasStore.removeElement(data.id) }"
    @click.stop="handleSelect"
  >{{ data.text }}</span>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CanvasTextElement } from '../../types';
import { useCanvasStore } from '@/store/canvas';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const canvasStore = useCanvasStore();

const data = defineModel<CanvasTextElement>("data", {
  required: true
});

/** 纯文本 DOM 引用 */
const textEl = ref<HTMLElement>();

const { handleSelect, isPreview } = useCanvasInteraction(data.value.id);

useDragConnector(textEl, data.value.id);

useElementVisibility(data.value.id, data);
</script>
