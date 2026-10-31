<!-- ? 编辑器主页布局 -->
<template>
  <a-layout class="editor-layout" has-sider>
    <a-layout class="editor-left">
      <EditorHeader
        :title="pageTitle"
        :is-saving="isSaving"
        :is-preview="isPreview"
        :can-undo="canvasHistoryApi.canUndo.value"
        :can-redo="canvasHistoryApi.canRedo.value"
        @back="handleBack"
        @save="handleSave"
        @toggle-preview="togglePreview"
        @undo="handleUndo"
        @redo="handleRedo"
        @code="handleCode"
        @clear="handleClear"
      />
      <CodeEditModal v-model:open="codeModalVisible" />
      <a-layout-content class="editor-canvas">
        <Canvas v-if="isPageReady" ref="canvasRef" />
      </a-layout-content>
    </a-layout>
    <EditorSider :is-preview="isPreview" /> 
  </a-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { snapdom } from '@zumer/snapdom';
import { getPageApi, updatePageApi } from '@/api/page';
import type { CanvasStorageData } from './types';
import { MeModal } from '@zyf_dsb/me-ui';
import EditorHeader from './components/Header.vue';
import EditorSider from './components/Sider.vue';
import Canvas from './components/Canvas.vue';
import CodeEditModal from './components/CodeEditModal.vue';
import { canvasHistoryApi } from '@/composables/useCanvasHistory';
import { HIDDEN_KEYS, TOGGLE_SHOW_KEY, IS_PREVIEW_KEY } from './constants.ts';
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
const route = useRoute();
const router = useRouter();

/** 当前画布 ID */
const pageId = Number(route.params.id);
/** 画布标题 */
const pageTitle = ref('');
/** 页面数据是否已就绪（就绪后再渲染 Canvas，避免画布先加载本地草稿） */
const isPageReady = ref(false);
/** 是否保存中 */
const isSaving = ref(false);
/** Canvas 组件引用（取 shadowHost 用于截图） */
const canvasRef = ref<{ shadowHost?: HTMLElement }>();

/** 截取画布缩略图，失败时返回 undefined 不阻塞保存 */
async function captureThumbnail(): Promise<string | undefined> {
  const host = canvasRef.value?.shadowHost;
  if (!host) return undefined;
  try {
    const snap = await snapdom(host, { scale: 0.2 });
    const img = await snap.toPng();
    return img.src;
  } catch (error) {
    console.error('[VibePage] 生成画布缩略图失败:', error);
    return undefined;
  }
}

/** 从服务端加载画布数据 */
async function loadPage() {
  try {
    const page = await getPageApi({ id: pageId });
    pageTitle.value = page.title;
    if (page.content) {
      canvasStore.loadCanvasData(JSON.parse(page.content) as CanvasStorageData);
    } else {
      canvasStore.clearAllElements();
    }
  } catch {
    router.push('/');
    return;
  }
  isPageReady.value = true;
}

/** 保存画布到服务端 */
async function handleSave() {
  isSaving.value = true;
  try {
    const thumbnail = await captureThumbnail();
    await updatePageApi({
      id: pageId,
      content: JSON.stringify(canvasStore.getCanvasData()),
      thumbnail,
    });
    message.success('已保存');
  } finally {
    isSaving.value = false;
  }
}

/** 返回画布列表 */
function handleBack() {
  router.push('/');
}

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
  MeModal.confirm({
    title: '确认清空画布？',
    content: '将删除画布中除根元素外的所有元素，此操作可通过撤销恢复。',
    confirmText: '确认',
    cancelText: '取消',
    onConfirm() {
      canvasStore.clearAllElements();
    },
  });
}

provide(HIDDEN_KEYS, hiddenKeys);
provide(TOGGLE_SHOW_KEY, toggleShow);
provide(IS_PREVIEW_KEY, isPreview);

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  loadPage();
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped lang="less">
.editor-layout {
  height: 100%;
  width: 100%;
  background: var(--editor-bg);
}

.editor-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--editor-bg-canvas);
}

.editor-canvas {
  background: var(--editor-bg-canvas);
  transition: background 0.3s ease;
}
</style>