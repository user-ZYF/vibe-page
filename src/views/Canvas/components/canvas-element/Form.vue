<!-- ? 画布表单元素 -->
<template>
  <form ref="formEl" :class="classes" :id="data.id" :data-canvas-id="data.id" @click.stop="handleSelect" @submit="handleSubmit">
    <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
  </form>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { CanvasFormElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { CanvasElementComponentMap } from '../../constants';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasFormElement>("data", {
    required: true
});

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 表单 DOM 引用 */
const formEl = ref<HTMLFormElement>();

useElementVisibility(data.value.id);

const { handleSelect, isPreview } = useCanvasInteraction(data.value.id);
useDragConnector(formEl, data.value.id, { isCanvas: true });

/** 表单提交处理：编辑模式下阻止提交，预览模式下允许提交 */
function handleSubmit(e: SubmitEvent) {
  if (!isPreview.value) {
    e.preventDefault();
  }
}
</script>
