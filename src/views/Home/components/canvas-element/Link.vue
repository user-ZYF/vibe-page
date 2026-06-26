<!-- ? 画布超链接元素 -->
<template>
    <a ref="linkEl" :id="data.id" :data-canvas-id="data.id" :class="data.classes" :href="data.href" :style="style" @click="canvasStore.selectElement(data.id)">{{ data.text }}</a>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { CanvasLinkElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { useCanvasStore } from '@/store/canvas';
import { useDragConnector } from '../../drag/useDragConnector';
import { useInteractionBinder } from '@/composables/useInteractionBinder';
import { useElementVisibility } from '@/composables/useElementVisibility';

const canvasStore = useCanvasStore();

const data = defineModel<CanvasLinkElement>("data", {
    required: true
});

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 超链接 DOM 引用 */
const linkEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

useDragConnector(linkEl, data.value.id);
useInteractionBinder(linkEl, computed(() => data.value.interactions));
</script>