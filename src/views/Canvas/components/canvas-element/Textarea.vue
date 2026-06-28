<!-- ? 画布多行文本框元素 -->
<template>
    <textarea ref="textareaEl" :id="data.id" :data-canvas-id="data.id" :class="data.classes" :placeholder="data.placeholder" :rows="data.rows" :style="style" @click.stop="handleSelect"></textarea>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CanvasTextareaElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasTextareaElement>("data", {
    required: true
});

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 多行文本框 DOM 引用 */
const textareaEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

const { handleSelect } = useCanvasInteraction(data.value.id);
useDragConnector(textareaEl, data.value.id);
</script>
