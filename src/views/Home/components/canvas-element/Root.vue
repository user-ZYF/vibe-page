<!-- ? 根组件 -->
<template>
  <div ref="rootEl" class="canvas-root" :class="data.classes" :id="data.id" :data-canvas-id="data.id" :style="style" @click.stop="canvasStore.selectElement(data.id)">
    <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { CanvasRootElement } from '../../types';
import { convertStyleConfig } from '@/utils/styleConfig';
import { CanvasElementComponentMap } from '../../contants';
import { useCanvasStore } from '@/store/canvas';
import { dragEngine } from '../../drag/DragEngine';
import { nodeRegistry } from '../../drag/NodeRegistry';
import { useElementVisibility } from '@/composables/useElementVisibility';

const data = defineModel<CanvasRootElement>("data", {
  required: true
});

const canvasStore = useCanvasStore();

/** 根 DOM 引用 */
const rootEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

/** 解绑函数 */
let unbindDrop: (()=>void) | null = null;

/** 样式对象 */
const style = computed(()=>{
  return convertStyleConfig(data.value.styleConfig);
});

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

<style scoped lang="less">
.canvas-root {
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
