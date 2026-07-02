<!-- ? 编辑器右侧边栏 -->
<template>
  <a-layout-sider
    class="editor-sider-right"
    width="20%"
    :collapsed-width="0"
    :collapsed="isPreview"
    collapsible
    trigger=""
  >
    <div class="editor-sider-toolbar">
      <a-tooltip title="编辑样式" overlay-class-name="editor-tooltip-white">
        <a-button
          type="text"
          size="small"
          :class="{ 'is-active': activePanel === SiderPanelEnum.EDIT }"
          @click="handlePanelSwitch(SiderPanelEnum.EDIT)"
        >
          <template #icon><EditOutlined /></template>
        </a-button>
      </a-tooltip>
      <a-tooltip title="层级管理" overlay-class-name="editor-tooltip-white">
        <a-button
          type="text"
          size="small"
          :class="{ 'is-active': activePanel === SiderPanelEnum.LAYER }"
          @click="handlePanelSwitch(SiderPanelEnum.LAYER)"
        >
          <template #icon><BlockOutlined /></template>
        </a-button>
      </a-tooltip>
      <a-tooltip title="组件库" overlay-class-name="editor-tooltip-white">
        <a-button
          type="text"
          size="small"
          :class="{ 'is-active': activePanel === SiderPanelEnum.COMPONENTS }"
          @click="handlePanelSwitch(SiderPanelEnum.COMPONENTS)"
        >
          <template #icon><AppstoreOutlined /></template>
        </a-button>
      </a-tooltip>
    </div>
    <div class="editor-sider-panel">
      <StylePanel v-show="activePanel === SiderPanelEnum.EDIT" class="panel-content"/>
      <LayersPanel v-show="activePanel === SiderPanelEnum.LAYER" class="panel-content"/>
      <ComponentsPanel v-show="activePanel === SiderPanelEnum.COMPONENTS" class="panel-content"/>
    </div>
  </a-layout-sider>
</template>

<script setup lang="ts">
import {
  EditOutlined,
  AppstoreOutlined,
  BlockOutlined,
} from '@ant-design/icons-vue';
import { SiderPanelEnum } from '@/constants/home';
import ComponentsPanel from './ComponentsPanel.vue';
import LayersPanel from './LayersPanel.vue';
import StylePanel from './StylePanel.vue';
import { useCanvasStore } from '@/store/canvas';
import { storeToRefs } from 'pinia';

defineOptions({
  name: 'EditorSider',
});

defineProps({
  /** 是否处于预览模式 */
  isPreview: {
    type: Boolean,
    default: false,
  },
});

const canvasStore = useCanvasStore();
const { activePanel } = storeToRefs(canvasStore);

/**
 * 切换面板
 * @param panel - 要切换到的面板类型
 */
function handlePanelSwitch(panel: SiderPanelEnum) {
  canvasStore.switchPanel(panel);
}
</script>

<style scoped lang="less">
.editor-sider-right {
  background: var(--editor-bg-sider) !important;
  color: var(--editor-text);
  border-left: 1px solid var(--editor-border);

  :deep(.ant-layout-sider-children) {
    overflow: hidden;
    white-space: nowrap;
    opacity: 1;
    transition: opacity 0.3s ease;
  }

  &:deep(.ant-layout-sider-collapsed .ant-layout-sider-children) {
    opacity: 0;
  }
}

.editor-sider-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid var(--editor-border);

  :deep(.ant-btn-text) {
    color: var(--editor-text-secondary);

    &:hover {
      color: var(--editor-text);
      background: var(--editor-bg-item-hover);
    }
  }
}

:deep(.editor-tooltip-white) {
  .ant-tooltip-inner {
    color: var(--app-color-text);
  }

  .ant-tooltip-arrow-content {
    --antd-arrow-background-color: #ffffff;
  }
}

.editor-sider-panel {
  height: calc(100% - 41px);
  overflow-y: auto;
}

.panel-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 1px solid var(--editor-border);
  color: var(--editor-text);
}

.panel-body {
  flex: 1;
  padding: 16px;
  color: var(--editor-text);
}

.is-active {
  background: var(--editor-accent-bg) !important;
  color: var(--editor-accent) !important;
}
</style>