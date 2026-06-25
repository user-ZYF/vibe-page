<!-- ? 编辑器顶栏工具栏 -->
<template>
  <div class="editor-header-wrapper" :class="{ 'is-preview': isPreview }">
    <a-layout-header class="editor-header">
      <a-space>
        <a-tooltip title="电脑端预览" overlay-class-name="editor-tooltip-white">
          <a-button type="text" size="small" @click="emit('computer')">
            <template #icon><DesktopOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="手机端预览" overlay-class-name="editor-tooltip-white">
          <a-button type="text" size="small" @click="emit('phone')">
            <template #icon><MobileOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-divider type="vertical" />
        <a-tooltip title="撤销" overlay-class-name="editor-tooltip-white">
          <a-button type="text" size="small" @click="emit('undo')">
            <template #icon><UndoOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="重做" overlay-class-name="editor-tooltip-white">
          <a-button type="text" size="small" @click="emit('redo')">
            <template #icon><RedoOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="预览源码" overlay-class-name="editor-tooltip-white">
          <a-button type="text" size="small" @click="emit('code')">
            <template #icon><CodeOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="源码编辑" overlay-class-name="editor-tooltip-white">
          <a-button type="text" size="small" @click="emit('download')">
            <template #icon><DownloadOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="组件区分" overlay-class-name="editor-tooltip-white">
          <a-button type="text" size="small" @click="emit('block')">
            <template #icon><BorderOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-divider type="vertical" />
        <a-tooltip title="效果预览" overlay-class-name="editor-tooltip-white">
          <a-button type="text" size="small" @click="emit('toggle-preview')">
            <template #icon><EyeOutlined /></template>
          </a-button>
        </a-tooltip>
      </a-space>
    </a-layout-header>
    <Transition name="preview-btn">
      <a-float-button 
        v-if="isPreview"
        shape="square"
        class="editor-header-preview-exit"
        type="default"
        size="small"
        tooltip="退出效果预览"
        @click="emit('toggle-preview')">
        <template #icon><EyeInvisibleOutlined /></template>
      </a-float-button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  UndoOutlined,
  RedoOutlined,
  CodeOutlined,
  FullscreenOutlined,
  DownloadOutlined,
  BorderOutlined,
  DesktopOutlined,
  MobileOutlined,
} from '@ant-design/icons-vue'

defineOptions({
  name: 'EditorHeader',
})

defineProps({
  /** 是否处于预览模式 */
  isPreview: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  (e: 'toggle-preview'): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'code'): void
  (e: 'download'): void
  (e: 'block'): void
  (e: 'computer'): void
  (e: 'phone'): void
}>()
</script>

<style scoped lang="less">
.editor-header-wrapper {
  position: relative;
  max-height: 48px;
  transition: max-height 0.3s ease;

  &.is-preview {
    max-height: 0;
  }
}

.editor-header {
  height: 48px;
  line-height: 48px;
  padding: 0 16px;
  background: #3a3a3a;
  color: #fff;
  overflow: hidden;
  transition: opacity 0.3s ease;

  .editor-header-wrapper.is-preview & {
    opacity: 0;
  }

  :deep(.ant-btn-text) {
    color: #fff;

    &:hover {
      color: rgba(255, 255, 255, 0.75);
    }
  }

  :deep(.ant-divider-vertical) {
    border-color: rgba(255, 255, 255, 0.25);
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

.editor-header-preview-exit {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.preview-btn-enter-active,
.preview-btn-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.preview-btn-enter-from,
.preview-btn-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>