<!-- ? 画布超链接元素 -->
<template>
    <a ref="linkEl" :id="data.id" :data-canvas-id="data.id" :class="classes" :href="isPreview ? safeHref : undefined" :target="isPreview && data.target === LinkTargetEnum.BLANK ? '_blank' : undefined" :rel="isPreview && data.target === LinkTargetEnum.BLANK ? 'noopener' : undefined" @click.stop.prevent="handleSelect">
        <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
    </a>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import type { CanvasLinkElement } from '../../types';
import { CanvasElementComponentMap } from '../../constants';
import { useElementClasses } from '@/composables/useElementClasses';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';
import { sanitizeNavigationUrl } from '@/utils/sanitize';
import { LinkTargetEnum } from '@/constants/home';

const data = defineModel<CanvasLinkElement>("data", {
    required: true
});

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 安全的 href 值，不安全协议或 data: 返回 undefined 避免渲染到 DOM */
const safeHref = computed(() => sanitizeNavigationUrl(data.value.href) || undefined);

/** 超链接 DOM 引用 */
const linkEl = ref<HTMLElement>();

useElementVisibility(data.value.id);

const { handleSelect, isPreview } = useCanvasInteraction(data.value.id);
useDragConnector(linkEl, data.value.id, { isContainer: true });
</script>