<!-- ? 画布图片元素 -->
<template>
    <img ref="imageEl" :id="data.id" :data-canvas-id="data.id" :class="data.classes" :src="data.src" :alt="data.title" :style="style" @click.stop="handleClick">
</template>

<script lang="ts" setup>
import { ref, computed, inject } from 'vue';
import { CanvasImageElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { useCanvasStore } from '@/store/canvas';
import { useDragConnector } from '../../drag/useDragConnector';
import { useInteractionBinder } from '@/composables/useInteractionBinder';
import { useElementVisibility } from '@/composables/useElementVisibility';
import { IS_PREVIEW_KEY } from '../../contants';

const canvasStore = useCanvasStore();

const data = defineModel<CanvasImageElement>("data", {
    required: true
});

/** 是否处于预览模式 */
const isPreview = inject(IS_PREVIEW_KEY, ref(false));

/** 点击选中元素（预览模式下禁用） */
function handleClick() {
    if (isPreview.value) return;
    canvasStore.selectElement(data.value.id);
}

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 图片 DOM 引用 */
const imageEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

useDragConnector(imageEl, data.value.id);
useInteractionBinder(imageEl, computed(() => data.value.interactions));
</script>