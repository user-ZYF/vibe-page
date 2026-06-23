<!-- ? 根组件 -->
<template>
  <body ref="rootEl" :class="data.classes" :id="data.id" :data-canvas-id="data.id" :style="convertStyleConfig(data.styleConfig)" @click.stop="canvasStore.selectElement(data.id)">
    <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
  </body>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { CanvasRootElement } from '../../types';
import { convertStyleConfig } from '@/utils/styleConfig';
import { CanvasElementComponentMap } from '../../contants';
import { useCanvasStore } from '@/store/canvas';
import { dragEngine } from '../../drag/DragEngine';
import { nodeRegistry } from '../../drag/NodeRegistry';

const data = defineModel<CanvasRootElement>("data", {
  required: true
});

const canvasStore = useCanvasStore();

/** 根 DOM 引用 */
const rootEl = ref<HTMLElement>();

/** 解绑函数 */
let unbindDrop: (()=>void) | null = null;

onMounted(() => {
  /** 注册根画布到注册表 */
  nodeRegistry.register(data.value.id, rootEl.value!, true);
  /** 根画布绑定可放置事件 */
  unbindDrop = dragEngine.connectDroppable(rootEl.value!, data.value.id);
});

onBeforeUnmount(() => {
  unbindDrop?.();
});
</script>
