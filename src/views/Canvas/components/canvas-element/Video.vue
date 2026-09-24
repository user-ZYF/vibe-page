<!-- ? 画布视频元素 -->
<template>
    <!-- 编辑态通过 pointer-events 禁用媒体交互，点击落在外层容器上完成选中 -->
    <div ref="videoWrapEl" :data-canvas-id="data.id" class="canvas-media" @click.stop="handleSelect">
        <!-- 编辑态剥离 controls/autoplay，阻止播放等原生行为，预览模式下放行；autoplay 需配合 muted 才能在浏览器中生效 -->
        <video ref="videoEl" :id="data.id" :class="classes" :src="data.src" :controls="isPreview && data.controls" :autoplay="isPreview && data.autoplay" :muted="isPreview && data.autoplay" :loop="data.loop"></video>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { CanvasVideoElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasVideoElement>("data", {
    required: true
});

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 视频外层容器 DOM 引用 */
const videoWrapEl = ref<HTMLElement>();

/** 视频 DOM 引用（注册到 registry，使选中框/落点以媒体实际盒模型为准） */
const videoEl = ref<HTMLElement>();

useElementVisibility(data.value.id);

const { handleSelect, isPreview } = useCanvasInteraction(data.value.id);
useDragConnector(videoWrapEl, data.value.id, { registerEl: videoEl });
</script>
