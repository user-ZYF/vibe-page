<!-- ? 根组件 -->
<template>
  <div ref="rootEl" class="canvas-root" :class="data.classes" :id="data.id" :data-canvas-id="data.id" :style="style" @click.stop="handleClick">
    <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, inject, watch } from 'vue';
import { CanvasRootElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { CanvasElementComponentMap } from '../../contants';
import { useCanvasStore } from '@/store/canvas';
import { dragEngine } from '../../drag/DragEngine';
import { nodeRegistry } from '../../drag/NodeRegistry';
import { useElementVisibility } from '@/composables/useElementVisibility';
import { IS_PREVIEW_KEY } from '../../contants';

const data = defineModel<CanvasRootElement>("data", {
  required: true
});

const canvasStore = useCanvasStore();

/** 是否处于预览模式 */
const isPreview = inject(IS_PREVIEW_KEY, ref(false));

/** 根 DOM 引用 */
const rootEl = ref<HTMLElement>();

useElementVisibility(data.value.id, data);

/** 解绑函数 */
let unbindDrop: (()=>void) | null = null;

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 点击选中元素（预览模式下禁用） */
function handleClick() {
  if (isPreview.value) return;
  canvasStore.selectElement(data.value.id);
}

/** 绑定可放置事件 */
function bindDrop() {
  if (!rootEl.value || unbindDrop) return;
  unbindDrop = dragEngine.connectDroppable(rootEl.value, data.value.id);
}

/** 解绑可放置事件 */
function unbindDropFn() {
  unbindDrop?.();
  unbindDrop = null;
}

onMounted(() => {
  /** 注册根画布到注册表 */
  nodeRegistry.register(data.value.id, rootEl.value!, true);
  /** 非预览模式下绑定可放置事件 */
  if (!isPreview.value) {
    bindDrop();
  }
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

<style scoped lang="less">
.canvas-root {
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
