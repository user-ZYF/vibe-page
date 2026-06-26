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
        @download="handleDownload"
        @block="handleBlock"
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
import { ref, onMounted, onUnmounted, provide } from 'vue'
import EditorHeader from './components/Header.vue'
import EditorSider from './components/Sider.vue'
import Canvas from './components/Canvas.vue'
import CodePreviewModal from './components/CodePreviewModal.vue'
import { canvasHistoryApi } from '@/composables/useCanvasHistory'
import { HIDDEN_KEYS, TOGGLE_SHOW_KEY } from './contants.ts'
import { useCanvasStore } from '@/store/canvas.ts'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'EditorHome',
})

/** 是否处于预览模式 */
const isPreview = ref(false)

/** 代码预览弹窗是否开启 */
const codeModalVisible = ref(false);

/** 隐藏元素id列表 */
const hiddenKeys = ref<string[]>([]);

const canvasStore = useCanvasStore();
const { selectedElementId } = storeToRefs(canvasStore);

/** 切换显示/隐藏 */
function toggleShow(id: string){
  const found = hiddenKeys.value.includes(id);
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
}

/** 撤销 */
function handleUndo() {
  canvasHistoryApi.undo();
}

/** 重做 */
function handleRedo() {
  canvasHistoryApi.redo();
}

/** 键盘快捷键处理 */
function handleKeydown(e: KeyboardEvent) {
  if(e.key === 'Delete' && selectedElementId.value){
    // delete / backspace: 删除
    canvasStore.removeElement(selectedElementId.value);
    return;
  }
  const isMod = e.ctrlKey || e.metaKey;
  if (isMod && e.key === 'z') {
    // ctrl + z: 重做
    e.preventDefault();
    handleUndo();
  } else if (isMod && e.key === 'y') {
    // ctrl + y: 撤销
    e.preventDefault();
    handleRedo();
  }
}

/** 查看代码 */
function handleCode() {
  // TODO: 实现查看代码逻辑
  codeModalVisible.value = true;
}

/** 源码下载 */
function handleDownload(){
  // TODO: 实现源码下载逻辑
}

/** 组件区分 */
function handleBlock() {
  // TODO: 实现组件区分逻辑
}

provide(HIDDEN_KEYS, hiddenKeys);
provide(TOGGLE_SHOW_KEY, toggleShow);

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
  position: relative;
  transition: background 0.3s ease;
}

</style>