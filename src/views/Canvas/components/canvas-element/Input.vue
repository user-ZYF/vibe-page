<!-- ? 画布单行文本框元素 -->
<template>
    <input ref="inputEl" :id="data.id" :data-canvas-id="data.id" :class="data.classes" type="text" :placeholder="data.placeholder" :value="data.value" :style="style" @click.stop="handleSelect" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CanvasInputElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasInputElement>("data", {
    required: true
});

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 单行文本框 DOM 引用 */
const inputEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

const { handleSelect } = useCanvasInteraction(data.value.id);
useDragConnector(inputEl, data.value.id);
</script>
