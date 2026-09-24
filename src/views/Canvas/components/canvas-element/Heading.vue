<!-- ? 标题元素 -->
<template>
    <component
        :is="headingTag"
        ref="headingEl"
        :id="data.id"
        :data-canvas-id="data.id"
        :class="classes"
        v-editable="{ id: data.id, isPreview, getText: () => data.text, onSave: (v: string) => data.text = v }"
        @click.stop="handleSelect"
    >{{ data.text }}</component>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { CanvasHeadingElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';
import { resolveHeadingTag } from '@/utils/html-parser';

const data = defineModel<CanvasHeadingElement>("data", {
    required: true
});

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 标题级别对应的标签名（level 为枚举范围外脏数据时回退 h1） */
const headingTag = computed(() => resolveHeadingTag(data.value.level));

/** 标题 DOM 引用 */
const headingEl = ref<HTMLElement>();

const { handleSelect, isPreview } = useCanvasInteraction(data.value.id);

useDragConnector(headingEl, data.value.id);

useElementVisibility(data.value.id);
</script>
