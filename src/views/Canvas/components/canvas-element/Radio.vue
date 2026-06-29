<!-- ? 画布单选框元素 -->
<template>
    <input ref="radioEl" :id="data.id" :data-canvas-id="data.id" :class="data.classes" type="radio" :name="data.name" :value="data.value" :checked="data.checked" :required="data.required" :disabled="!isPreview" :style="style" @click.stop="handleSelect" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CanvasRadioElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasRadioElement>("data", {
    required: true
});

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 单选框 DOM 引用 */
const radioEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

const { handleSelect, isPreview } = useCanvasInteraction(data.value.id);
useDragConnector(radioEl, data.value.id);
</script>
