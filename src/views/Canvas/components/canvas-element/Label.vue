<!-- ? 画布标签元素 -->
<template>
    <label
        ref="labelEl"
        :id="data.id"
        :data-canvas-id="data.id"
        :class="data.classes"
        :style="style"
        :for="isPreview && data.for ? data.for : undefined"
        v-editable="{ id: data.id, isPreview, getText: () => data.text, onSave: (v: string) => data.text = v }"
        @click.stop="handleSelect"
    >{{ data.text }}</label>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CanvasLabelElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasLabelElement>("data", {
    required: true
});

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 标签 DOM 引用 */
const labelEl = ref<HTMLElement>();

const { handleSelect, isPreview } = useCanvasInteraction(data.value.id);

useDragConnector(labelEl, data.value.id);

useElementVisibility(data.value.id, data);
</script>
