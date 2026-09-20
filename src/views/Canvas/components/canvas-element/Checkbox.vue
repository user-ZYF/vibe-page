<!-- ? 画布多选框元素 -->
<template>
    <input ref="checkboxEl" :id="data.id" :data-canvas-id="data.id" :class="classes" type="checkbox" :name="data.name" :value="data.value" :checked="data.checked" :required="data.required" :disabled="!isPreview" @click.stop="handleSelect" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { CanvasCheckboxElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasCheckboxElement>("data", {
    required: true
});

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 多选框 DOM 引用 */
const checkboxEl = ref<HTMLElement>();

useElementVisibility(data.value.id);

const { handleSelect, isPreview } = useCanvasInteraction(data.value.id);
useDragConnector(checkboxEl, data.value.id);
</script>
