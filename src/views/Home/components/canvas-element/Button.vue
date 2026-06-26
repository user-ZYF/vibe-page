<!-- ? 画布按钮元素 -->
<template>
    <button ref="buttonEl" :class="data.classes" :id="data.id" :data-canvas-id="data.id" :type="data.buttonType" :style="style" @click.stop="canvasStore.selectElement(data.id)">{{ data.text }}</button>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { CanvasButtonElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { useCanvasStore } from '@/store/canvas';
import { useDragConnector } from '../../drag/useDragConnector';
import { useInteractionBinder } from '@/composables/useInteractionBinder';
import { useElementVisibility } from '@/composables/useElementVisibility';

const canvasStore = useCanvasStore();

const data = defineModel<CanvasButtonElement>("data", {
    required: true
});

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 按鈕 DOM 引用 */
const buttonEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

useDragConnector(buttonEl, data.value.id);
useInteractionBinder(buttonEl, computed(() => data.value.interactions));
</script>