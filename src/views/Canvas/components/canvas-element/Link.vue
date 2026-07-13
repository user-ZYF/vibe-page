<!-- ? 画布超链接元素 -->
<template>
    <a ref="linkEl" :id="data.id" :data-canvas-id="data.id" :class="data.classes" :href="isPreview ? safeHref : undefined" :style="style" @click.stop.prevent="handleSelect">
        <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
    </a>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { CanvasLinkElement } from '../../types';
import { CanvasElementComponentMap } from '../../constants';
import { useElementStyle } from '@/composables/useElementStyle';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';
import { isSafeUrl } from '@/utils/sanitize';

const data = defineModel<CanvasLinkElement>("data", {
    required: true
});

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 安全的 href 值，不安全协议返回 undefined 避免渲染到 DOM */
const safeHref = computed(() => {
  const href = data.value.href;
  if (!href) return undefined;
  return isSafeUrl(href) ? href : undefined;
});

/** 超链接 DOM 引用 */
const linkEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

const { handleSelect, isPreview } = useCanvasInteraction(data.value.id);
useDragConnector(linkEl, data.value.id, { isCanvas: true });
</script>