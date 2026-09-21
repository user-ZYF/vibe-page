<!-- ? 画布多行文本框元素 -->
<template>
    <textarea ref="textareaEl" :id="data.id" :value="data.value" :data-canvas-id="data.id" :class="classes" :placeholder="data.placeholder" :rows="data.rows" :required="data.required" :readonly="!isPreview" :disabled="data.disabled" @click.stop="handleSelect"></textarea>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { CanvasTextareaElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasTextareaElement>("data", {
    required: true
});

const { handleSelect, isPreview } = useCanvasInteraction(data.value.id);

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 多行文本框 DOM 引用 */
const textareaEl = ref<HTMLElement>();

useElementVisibility(data.value.id);

useDragConnector(textareaEl, data.value.id);
</script>
