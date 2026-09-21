<!-- ? 画布多选框元素 -->
<template>
    <input ref="checkboxEl" :id="data.id" :data-canvas-id="data.id" :class="classes" type="checkbox" :name="data.name" :value="data.value" :checked="data.checked" :required="data.required" :disabled="data.disabled" @click.stop="handleClick" />
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

const { handleSelect, isPreview } = useCanvasInteraction(data.value.id);

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 多选框 DOM 引用 */
const checkboxEl = ref<HTMLElement>();

useElementVisibility(data.value.id);

useDragConnector(checkboxEl, data.value.id);

/** 点击处理：编辑模式下阻止默认行为（选中状态切换）并选中元素，预览模式下允许默认交互 */
function handleClick(e: MouseEvent) {
  if (!isPreview.value) {
    e.preventDefault();
    handleSelect();
  }
}
</script>
