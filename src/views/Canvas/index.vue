<!-- ? 编辑器主页布局 -->
<template>
  <a-layout class="editor-layout" has-sider>
    <a-layout class="editor-left">
      <EditorHeader
        :is-preview="isPreview"
        @toggle-preview="togglePreview"
        @undo="handleUndo"
        @redo="handleRedo"
        @code="handleCode"
        @import="handleImport"
        @clear="handleClear"
        @cleanup-classes="handleCleanupClasses"
      />
      <CodePreviewModal v-model:open="codeModalVisible" />
      <a-layout-content class="editor-canvas">
        <Canvas />
      </a-layout-content>
    </a-layout>
    <EditorSider :is-preview="isPreview" /> 
  </a-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, provide } from 'vue';
import { Modal, message } from 'ant-design-vue';
import EditorHeader from './components/Header.vue';
import EditorSider from './components/Sider.vue';
import Canvas from './components/Canvas.vue';
import CodePreviewModal from './components/CodePreviewModal.vue';
import { canvasHistoryApi } from '@/composables/useCanvasHistory';
import { HIDDEN_KEYS, TOGGLE_SHOW_KEY, IS_PREVIEW_KEY } from './contants.ts';
import { useCanvasStore } from '@/store/canvas.ts';
import { storeToRefs } from 'pinia';

defineOptions({
  name: 'EditorHome',
})

/** 是否处于预览模式 */
const isPreview = ref(false);

/** 代码预览弹窗是否开启 */
const codeModalVisible = ref(false);

/** 隐藏元素id列表 */
const hiddenKeys = ref<string[]>([]);

const canvasStore = useCanvasStore();
const { selectedElementId } = storeToRefs(canvasStore);

/** 切换显示/隐藏 */
function toggleShow(id: string){
  const found = hiddenKeys.value.includes(id);
  // 切换显示隐藏可能导致所选中元素的尺寸/位置受到影响，进而影响toolbar显示，这里暂时做取消选中处理
  canvasStore.selectElement(null);
  if(found){
    showElement(id);
  }else {
    hideElement(id);
  }
}

/** 显示元素 */
function showElement(id: string) {
  hiddenKeys.value = hiddenKeys.value.filter((item)=>item !== id);
}

/** 隐藏元素 */
function hideElement(id: string) {
  if(!hiddenKeys.value.includes(id)){
    hiddenKeys.value.push(id);
  }
}

/** 切换预览模式 */
function togglePreview() {
  isPreview.value = !isPreview.value;
  if (isPreview.value) {
    canvasStore.selectElement(null);
  }
}

/** 撤销 */
function handleUndo() {
  canvasHistoryApi.undo();
}

/** 重做 */
function handleRedo() {
  canvasHistoryApi.redo();
}

/** 获取事件的真实目标元素（穿透 Shadow DOM 的事件重定向） */
function getRealEventTarget(e: Event): HTMLElement | null {
  const path = e.composedPath();
  for (const node of path) {
    if (node instanceof HTMLElement) {
      return node;
    }
  }
  return e.target as HTMLElement | null;
}

/** 判断事件目标是否在可编辑元素内 */
function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
}

/** 键盘快捷键处理 */
function handleKeydown(e: KeyboardEvent) {
  const realTarget = getRealEventTarget(e);
  /** 在可编辑元素中不处理画布快捷键 */
  if (isEditableTarget(realTarget)) return;
  /** 预览模式下禁用一切画布操作 */
  if (isPreview.value) return;

  if(e.key === 'Delete' && selectedElementId.value) {
    // delete: 删除
    canvasStore.removeElement(selectedElementId.value);
    return;
  }
  const isMod = e.ctrlKey || e.metaKey;
  if (isMod && e.key === 'z') {
    // ctrl + z: 撤销
    e.preventDefault();
    handleUndo();
  } else if (isMod && e.key === 'y') {
    // ctrl + y: 重做
    e.preventDefault();
    handleRedo();
  }
}

/** 查看代码 */
function handleCode() {
  codeModalVisible.value = true;
}

/** 清空画布 */
function handleClear(){
  Modal.confirm({
    title: '确认清空画布？',
    content: '将删除画布中除根元素外的所有元素，此操作可通过撤销恢复。',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      canvasStore.clearAllElements();
    },
  });
}

/** 清理未使用的 class */
function handleCleanupClasses() {
  Modal.confirm({
    title: '确认清理未使用的 class？',
    content: '将删除所有未被元素引用且样式内容为空的 class 样式，此操作可通过撤销恢复。',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      canvasStore.cleanupUnusedClassStyles();
    },
  });
}

/** 源码导入 */
function handleImport(){
  message.info('源码导入功能正在开发中，敬请期待');
}

provide(HIDDEN_KEYS, hiddenKeys);
provide(TOGGLE_SHOW_KEY, toggleShow);
provide(IS_PREVIEW_KEY, isPreview);

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped lang="less">
.editor-layout {
  height: 100%;
  width: 100%;
}

.editor-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-canvas {
  transition: background 0.3s ease;
}

</style>