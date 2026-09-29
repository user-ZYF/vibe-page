<!-- ? 画布图片元素 -->
<template>
    <img ref="imageEl" :id="data.id" :data-canvas-id="data.id" :class="classes" :src="safeSrc" :alt="data.title" @click.stop="handleSelect">
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import type { CanvasImageElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';
import { sanitizeUrl } from '@/utils/sanitize';

const data = defineModel<CanvasImageElement>("data", {
    required: true
});

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 安全的 src 值，不安全协议返回 undefined 避免渲染到 DOM */
const safeSrc = computed(() => sanitizeUrl(data.value.src) || undefined);

/** 图片 DOM 引用 */
const imageEl = ref<HTMLElement>();

useElementVisibility(data.value.id);

const { handleSelect } = useCanvasInteraction(data.value.id);
useDragConnector(imageEl, data.value.id);
</script>