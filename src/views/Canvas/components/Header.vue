<!-- ? 编辑器顶栏工具栏 -->
<template>
  <div class="editor-header-wrapper" :class="{ 'is-preview': isPreview }">
    <a-layout-header class="editor-header">
      <a-space>
        <a-tooltip title="效果预览" overlay-class-name="editor-tooltip-white">
          <a-button type="text" size="small" @click="emit('toggle-preview')">
            <template #icon><EyeOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-divider type="vertical" />
        <a-tooltip title="撤销" overlay-class-name="editor-tooltip-white">
          <a-button type="text" size="small" :disabled="!canUndo" @click="emit('undo')">
            <template #icon><UndoOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="重做" overlay-class-name="editor-tooltip-white">
          <a-button type="text" size="small" :disabled="!canRedo" @click="emit('redo')">
            <template #icon><RedoOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-divider type="vertical" />
        <a-tooltip title="预览源码" overlay-class-name="editor-tooltip-white">
          <a-button type="text" size="small" @click="emit('code')">
            <template #icon><CodeOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="清空画布" overlay-class-name="editor-tooltip-white">
          <a-button type="text" size="small" @click="emit('clear')">
            <template #icon><DeleteOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="清理未使用的 class" overlay-class-name="editor-tooltip-white">
          <a-button type="text" size="small" @click="emit('cleanup-classes')">
            <template #icon><ClearOutlined /></template>
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
  DeleteOutlined,
  ClearOutlined,
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
  /** 是否可撤销 */
  canUndo: {
    type: Boolean,
    default: false,
  },
  /** 是否可重做 */
  canRedo: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  (e: 'toggle-preview'): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'code'): void
  (e: 'clear'): void
  (e: 'cleanup-classes'): void
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
  background: var(--editor-bg-header);
  color: var(--editor-text);
  overflow: hidden;
  border-bottom: 1px solid var(--editor-border);
  transition: opacity 0.3s ease;

  .editor-header-wrapper.is-preview & {
    opacity: 0;
  }

  :deep(.ant-btn-text) {
    color: var(--editor-text-secondary);

    &:hover {
      color: var(--editor-text);
      background: var(--editor-bg-item-hover);
    }

    &.is-disabled,
    &:disabled {
      color: var(--editor-text-disabled);
      cursor: not-allowed;

      &:hover {
        color: var(--editor-text-disabled);
        background: transparent;
      }
    }
  }

  :deep(.ant-divider-vertical) {
    border-color: var(--editor-border-strong);
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

.editor-header-preview-exit {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  box-shadow: var(--editor-shadow);
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