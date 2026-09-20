<!-- ? 编辑器顶栏工具栏 -->
<template>
  <div class="editor-header-wrapper">
    <a-layout-header class="editor-header" :class="{ 'is-preview': isPreview }">
      <a-space>
        <me-tooltip content="效果预览" effect="light">
          <me-button @click="emit('toggle-preview')">
            <EyeOutlined />
          </me-button>
        </me-tooltip>
        <a-divider type="vertical" />
        <me-tooltip content="撤销" effect="light">
          <me-button :disabled="!canUndo" @click="emit('undo')">
            <UndoOutlined />
          </me-button>
        </me-tooltip>
        <me-tooltip content="重做" effect="light">
          <me-button :disabled="!canRedo" @click="emit('redo')">
            <RedoOutlined />
          </me-button>
        </me-tooltip>
        <a-divider type="vertical" />
        <me-tooltip content="编辑源码" effect="light">
          <me-button @click="emit('code')">
            <CodeOutlined />
          </me-button>
        </me-tooltip>
        <me-tooltip content="清空画布" effect="light">
          <me-button @click="emit('clear')">
            <DeleteOutlined />
          </me-button>
        </me-tooltip>
      </a-space>
      <div class="editor-header-theme">
        <me-tooltip :content="themeStore.isDark ? '切换到亮色主题' : '切换到暗色主题'" effect="light">
          <a-switch
            :checked="!themeStore.isDark"
            @change="themeStore.toggleTheme"
          >
            <template #checkedChildren><BulbFilled /></template>
            <template #unCheckedChildren><BulbOutlined /></template>
          </a-switch>
        </me-tooltip>
      </div>
    </a-layout-header>
    <Transition name="preview-btn">
      <a-float-button 
        v-if="isPreview"
        shape="square"
        class="editor-header-preview-exit"
        type="default"
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
  BulbFilled,
  BulbOutlined,
} from '@ant-design/icons-vue'
import { MeButton, MeTooltip } from '@zyf_dsb/me-ui'
import { useThemeStore } from '@/store/theme';

defineOptions({
  name: 'EditorHeader',
})

const themeStore = useThemeStore();

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
}>()
</script>

<style scoped lang="less">
.editor-header-wrapper {
  position: relative;
}

.editor-header {
  height: 48px;
  line-height: 48px;
  padding: 0 16px;
  background: var(--editor-bg-header);
  color: var(--editor-text);
  overflow: hidden;
  transition: opacity 0.3s ease, height 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &.is-preview {
    opacity: 0;
    height: 0;
  }

  :deep(.me-button) {
    color: var(--editor-text-secondary);
    background: transparent;
    border-color: transparent;

    &:hover {
      color: var(--editor-text);
      background: var(--editor-bg-item-hover);
      border-color: transparent;
    }

    &.is-disabled,
    &:disabled {
      color: var(--editor-text-disabled);
      cursor: not-allowed;

      &:hover {
        color: var(--editor-text-disabled);
        background: transparent;
        border-color: transparent;
      }
    }
  }

  :deep(.ant-divider-vertical) {
    border-color: var(--editor-border-strong);
  }
}

.editor-header-theme {
  display: flex;
  align-items: center;
  margin-left: 16px;
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