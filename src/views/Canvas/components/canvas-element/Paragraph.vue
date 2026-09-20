<!-- ? 画布段落元素 -->
<template>
    <p
        ref="paragraphEl"
        :id="data.id"
        :data-canvas-id="data.id"
        :class="classes"
        v-editable="{ id: data.id, isPreview, getText: () => data.text, onSave: (v: string) => data.text = v }"
        @click.stop="handleSelect"
    >{{ data.text }}</p>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { CanvasParagraphElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasParagraphElement>("data", {
    required: true
});

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 段落 DOM 引用 */
const paragraphEl = ref<HTMLElement>();

const { handleSelect, isPreview } = useCanvasInteraction(data.value.id);

useDragConnector(paragraphEl, data.value.id);

useElementVisibility(data.value.id);
</script>