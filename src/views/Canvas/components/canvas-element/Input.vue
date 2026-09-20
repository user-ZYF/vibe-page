<!-- ? 画布单行文本框元素 -->
<template>
    <input ref="inputEl" :id="data.id" :data-canvas-id="data.id" :class="classes" type="text" :placeholder="data.placeholder" :value="data.value" :required="data.required" :readonly="!isPreview" @click.stop="handleSelect" @keydown.enter="handleEnterKey" />
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

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 单行文本框 DOM 引用 */
const inputEl = ref<HTMLElement>();

useElementVisibility(data.value.id);

const { handleSelect, isPreview } = useCanvasInteraction(data.value.id);
useDragConnector(inputEl, data.value.id);

/** Enter 键处理：编辑模式下阻止默认行为（如表单提交），预览模式下允许默认交互 */
function handleEnterKey(e: KeyboardEvent) {
  if (!isPreview.value) {
    e.preventDefault();
  }
}
</script>
