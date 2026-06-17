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
          :class="{ 'is-active': activePanel === SiderPanelEnum.BLOCKS }"
          @click="handlePanelSwitch(SiderPanelEnum.BLOCKS)"
        >
          <template #icon><BlockOutlined /></template>
        </a-button>
      </a-tooltip>
      <a-tooltip title="组件库" overlay-class-name="editor-tooltip-white">
        <a-button
          type="text"
          size="small"
          :class="{ 'is-active': activePanel === SiderPanelEnum.LAYER }"
          @click="handlePanelSwitch(SiderPanelEnum.LAYER)"
        >
          <template #icon><AppstoreOutlined /></template>
        </a-button>
      </a-tooltip>
    </div>
    <div class="editor-sider-panel">
      <StyleConfig v-if="activePanel === SiderPanelEnum.EDIT" class="panel-content"/>
      <Layers v-else-if="activePanel === SiderPanelEnum.BLOCKS" class="panel-content"/>
      <Components v-else-if="activePanel === SiderPanelEnum.LAYER" class="panel-content"/>
    </div>
  </a-layout-sider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  EditOutlined,
  AppstoreOutlined,
  BlockOutlined,
} from '@ant-design/icons-vue'
import { SiderPanelEnum } from '@/constants/home'
import Components from './Components.vue';
import Layers from './Layers.vue';
import StyleConfig from './StyleConfig.vue';

defineOptions({
  name: 'EditorSider',
})

defineProps({
  /** 是否处于预览模式 */
  isPreview: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'setting'): void
  (e: 'layer'): void
  (e: 'blocks'): void
}>()

/** 当前激活的面板 */
const activePanel = ref<SiderPanelEnum>(SiderPanelEnum.EDIT)

/**
 * 切换面板
 * @param panel - 要切换到的面板类型
 */
function handlePanelSwitch(panel: SiderPanelEnum) {
  activePanel.value = panel
  switch (panel) {
    case SiderPanelEnum.EDIT:
      emit('edit')
      break
    case SiderPanelEnum.BLOCKS:
      emit('blocks')
      break
    case SiderPanelEnum.LAYER:
      emit('layer')
      break
  }
}
</script>

<style scoped lang="less">
.editor-sider-right {
  background: #3a3a3a !important;
  color: #fff;

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
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  :deep(.ant-btn-text) {
    color: #fff;

    &:hover {
      color: rgba(255, 255, 255, 0.75);
    }
  }
}

:deep(.editor-tooltip-white) {
  .ant-tooltip-inner {
    color: #333;
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
}

.panel-body {
  flex: 1;
  padding: 16px;
  color: rgba(255, 255, 255, 0.85);
}

.is-active {
  background: rgba(255, 255, 255, 0.15) !important;
}
</style>