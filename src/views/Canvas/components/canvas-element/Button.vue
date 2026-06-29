<!-- ? 画布按钮元素 -->
<template>
    <button ref="buttonEl" :class="data.classes" :id="data.id" :data-canvas-id="data.id" :type="data.buttonType" :style="style" @click.stop="handleClick">{{ data.text }}</button>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CanvasButtonElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasButtonElement>("data", {
    required: true
});

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 按鈕 DOM 引用 */
const buttonEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

const { handleSelect, isPreview } = useCanvasInteraction(data.value.id);
useDragConnector(buttonEl, data.value.id);

/** 点击处理：编辑模式下阻止默认行为（如表单提交）并选中元素，预览模式下允许默认交互 */
function handleClick(e: MouseEvent) {
  if (!isPreview.value) {
    e.preventDefault();
    handleSelect();
  }
}
</script>