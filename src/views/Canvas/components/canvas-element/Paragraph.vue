<!-- ? 画布段落元素 -->
<template>
    <p
        ref="paragraphEl"
        :id="data.id"
        :data-canvas-id="data.id"
        :class="data.classes"
        :style="style"
        v-editable="{ id: data.id, isPreview, getText: () => data.text, onSave: (v: string) => data.text = v }"
        @click.stop="handleSelect"
    >{{ data.text }}</p>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CanvasParagraphElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasParagraphElement>("data", {
    required: true
});

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 段落 DOM 引用 */
const paragraphEl = ref<HTMLElement>();

const { handleSelect, isPreview } = useCanvasInteraction(data.value.id);

useDragConnector(paragraphEl, data.value.id);

useElementVisibility(data.value.id, data);
</script>