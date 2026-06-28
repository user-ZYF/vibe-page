<!-- ? 根组件 -->
<template>
  <div ref="rootEl" class="canvas-root" :class="[data.classes, { 'is-preview': isPreview }]" :id="data.id" :data-canvas-id="data.id" :style="style" @click.stop="handleSelect">
    <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
  </div>
</template> 

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { CanvasRootElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { CanvasElementComponentMap } from '../../contants';
import { dragEngine } from '../../drag/DragEngine';
import { nodeRegistry } from '../../drag/NodeRegistry';
import { useElementVisibility } from '@/composables/useElementVisibility';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';

const data = defineModel<CanvasRootElement>("data", {
  required: true
});

/** 根 DOM 引用 */
const rootEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

const { handleSelect, guard, isPreview } = useCanvasInteraction(data.value.id);

/** 解绑函数 */
let unbindDrop: (()=>void) | null = null;

/** 绑定可放置事件（已内置预览守卫） */
const bindDrop = guard(() => {
  if (!rootEl.value || unbindDrop) return;
  unbindDrop = dragEngine.connectDroppable(rootEl.value, data.value.id);
});

/** 解绑可放置事件 */
function unbindDropFn() {
  unbindDrop?.();
  unbindDrop = null;
}

onMounted(() => {
  /** 注册根画布到注册表 */
  nodeRegistry.register(data.value.id, rootEl.value!, true);
  /** 绑定可放置事件（预览模式下自动拦截） */
  bindDrop();
});

/** 预览模式切换时动态绑定/解绑 */
watch(isPreview, (preview) => {
  if (preview) {
    unbindDropFn();
  } else {
    bindDrop();
  }
});

onBeforeUnmount(() => {
  unbindDropFn();
});
</script>
