<!-- ? 画布超链接元素 -->
<template>
    <a ref="linkEl" :id="data.id" :data-canvas-id="data.id" :class="data.classes" :href="data.href" :style="style" @click="canvasStore.selectElement(data.id)">{{ data.text }}</a>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { CanvasLinkElement } from '../../types';
import { convertStyleConfig } from '@/utils/styleConfig';
import { useCanvasStore } from '@/store/canvas';
import { useDragConnector } from '../../drag/useDragConnector';
import { useInteractionBinder } from '@/composables/useInteractionBinder';
import { useElementVisibility } from '@/composables/useElementVisibility';

const canvasStore = useCanvasStore();

const data = defineModel<CanvasLinkElement>("data", {
    required: true
});

/** 样式对象 */
const style = computed(()=>{
    return convertStyleConfig(data.value.styleConfig);
});

/** 超链接 DOM 引用 */
const linkEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

useDragConnector(linkEl, data.value.id);
useInteractionBinder(linkEl, computed(() => data.value.interactions));
</script>