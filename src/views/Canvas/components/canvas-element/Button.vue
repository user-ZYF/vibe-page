<!-- ? 画布按钮元素 -->
<template>
    <button ref="buttonEl" :class="classes" :id="data.id" :data-canvas-id="data.id" :type="data.buttonType" @click.stop="handleClick">{{ data.text }}</button>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { CanvasButtonElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasButtonElement>("data", {
    required: true
});

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 按鈕 DOM 引用 */
const buttonEl = ref<HTMLElement>();

useElementVisibility(data.value.id);

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