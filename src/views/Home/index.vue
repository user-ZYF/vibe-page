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
        @full="handleFull"
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
import { ref, onMounted, onUnmounted } from 'vue'
import EditorHeader from './components/Header.vue'
import EditorSider from './components/Sider.vue'
import Canvas from './components/Canvas.vue'
import CodePreviewModal from './components/CodePreviewModal.vue'
import { canvasHistoryApi } from '@/composables/useCanvasHistory'

defineOptions({
  name: 'EditorHome',
})

/** 是否处于预览模式 */
const isPreview = ref(false)

/** 代码预览弹窗是否开启 */
const codeModalVisible = ref(false);

/** 切换预览模式 */
function togglePreview() {
  isPreview.value = !isPreview.value
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
  const isMod = e.ctrlKey || e.metaKey;
  if (isMod && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    handleUndo();
  } else if (isMod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    e.preventDefault();
    handleRedo();
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

/** 查看代码 */
function handleCode() {
  // TODO: 实现查看代码逻辑
  codeModalVisible.value = true;
}

/** 全屏 */
function handleFull() {
  // TODO: 实现全屏逻辑
}

/** 下载 */
function handleDownload() {
  // TODO: 实现下载逻辑
}

/** 块级元素 */
function handleBlock() {
  // TODO: 实现块级元素逻辑
}
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