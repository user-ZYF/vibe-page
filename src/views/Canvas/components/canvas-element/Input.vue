<!-- ? 画布单行文本框元素 -->
<template>
    <input ref="inputEl" :id="data.id" :data-canvas-id="data.id" :class="classes" type="text" :placeholder="data.placeholder" :value="data.value" :required="data.required" :readonly="!isPreview" :disabled="data.disabled" @click.stop="handleSelect" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { CanvasInputElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasInputElement>("data", {
    required: true
});

const { handleSelect, isPreview } = useCanvasInteraction(data.value.id);

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 单行文本框 DOM 引用 */
const inputEl = ref<HTMLElement>();

useElementVisibility(data.value.id);

useDragConnector(inputEl, data.value.id);
</script>
