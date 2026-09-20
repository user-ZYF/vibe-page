<!-- ? 画布标签元素 -->
<template>
    <label
        ref="labelEl"
        :id="data.id"
        :data-canvas-id="data.id"
        :class="classes"
        :for="isPreview && data.for ? data.for : undefined"
        v-editable="{ id: data.id, isPreview, getText: () => data.text, onSave: (v: string) => data.text = v }"
        @click.stop="handleSelect"
    >{{ data.text }}</label>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { CanvasLabelElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasLabelElement>("data", {
    required: true
});

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 标签 DOM 引用 */
const labelEl = ref<HTMLElement>();

const { handleSelect, isPreview } = useCanvasInteraction(data.value.id);

useDragConnector(labelEl, data.value.id);

useElementVisibility(data.value.id);
</script>
