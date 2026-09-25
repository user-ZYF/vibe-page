<!-- ? 编辑器右侧边栏 -->
<template>
  <a-layout-sider
    class="editor-sider-right"
    width="330px"
    :collapsed-width="0"
    :collapsed="isPreview"
    collapsible
    trigger=""
  >
    <div class="editor-sider-toolbar">
      <me-tooltip content="编辑样式" effect="light">
        <me-button
          :class="{ 'is-active': activePanel === SiderPanelEnum.EDIT }"
          @click="handlePanelSwitch(SiderPanelEnum.EDIT)"
        >
          <EditOutlined />
        </me-button>
      </me-tooltip>
      <me-tooltip content="层级管理" effect="light">
        <me-button
          :class="{ 'is-active': activePanel === SiderPanelEnum.LAYER }"
          @click="handlePanelSwitch(SiderPanelEnum.LAYER)"
        >
          <BlockOutlined />
        </me-button>
      </me-tooltip>
      <me-tooltip content="组件库" effect="light">
        <me-button
          :class="{ 'is-active': activePanel === SiderPanelEnum.COMPONENTS }"
          @click="handlePanelSwitch(SiderPanelEnum.COMPONENTS)"
        >
          <AppstoreOutlined />
        </me-button>
      </me-tooltip>
      <me-tooltip content="Class 管理" effect="light">
        <me-button
          :class="{ 'is-active': activePanel === SiderPanelEnum.CLASS_MANAGER }"
          @click="handlePanelSwitch(SiderPanelEnum.CLASS_MANAGER)"
        >
          <BgColorsOutlined />
        </me-button>
      </me-tooltip>
    </div>
    <div class="editor-sider-panel">
      <StylePanel v-show="activePanel === SiderPanelEnum.EDIT" class="panel-content"/>
      <LayersPanel v-show="activePanel === SiderPanelEnum.LAYER" class="panel-content"/>
      <ClassManagerPanel v-show="activePanel === SiderPanelEnum.CLASS_MANAGER" class="panel-content"/>
      <ComponentsPanel v-show="activePanel === SiderPanelEnum.COMPONENTS" class="panel-content"/>
    </div>
  </a-layout-sider>
</template>

<script setup lang="ts">
import {
  EditOutlined,
  AppstoreOutlined,
  BlockOutlined,
  BgColorsOutlined,
} from '@ant-design/icons-vue';
import { MeButton, MeTooltip } from '@zyf_dsb/me-ui';
import { SiderPanelEnum } from '@/constants/home';
import ComponentsPanel from './ComponentsPanel.vue';
import LayersPanel from './LayersPanel.vue';
import StylePanel from './StylePanel.vue';
import ClassManagerPanel from './ClassManagerPanel.vue';
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

  :deep(.me-button) {
    color: var(--editor-text-secondary);
    background: transparent;
    border-color: transparent;

    &:hover {
      color: var(--editor-text);
      background: var(--editor-bg-item-hover);
      border-color: transparent;
    }
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