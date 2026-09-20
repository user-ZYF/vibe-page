<!-- ? 画布单选框元素 -->
<template>
    <input ref="radioEl" :id="data.id" :data-canvas-id="data.id" :class="classes" type="radio" :name="data.name" :value="data.value" :checked="data.checked" :required="data.required" :disabled="!isPreview" @click.stop="handleSelect" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { CanvasRadioElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasRadioElement>("data", {
    required: true
});

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 单选框 DOM 引用 */
const radioEl = ref<HTMLElement>();

useElementVisibility(data.value.id);

const { handleSelect, isPreview } = useCanvasInteraction(data.value.id);
useDragConnector(radioEl, data.value.id);
</script>
