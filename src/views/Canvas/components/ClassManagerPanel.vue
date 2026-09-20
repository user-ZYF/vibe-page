<!-- ? 全局 class 管理面板 -->
<template>
  <div class="class-manager-panel">
    <div class="class-manager-panel-header">
      <span class="class-manager-panel-title">Class 管理</span>
      <span class="class-manager-panel-count">共 {{ classList.length }} 个</span>
    </div>
    <div class="class-manager-panel-empty" v-if="classList.length === 0">
      暂无已定义的 class
    </div>
    <div class="class-manager-panel-list" v-else>
      <div
        v-for="item in classList"
        :key="item.name"
        class="class-manager-item"
        :class="{ 'is-active': activeClassName === item.name }"
      >
        <div class="class-manager-item-header" @click="handleClassClick(item)">
          <span class="class-manager-item-name">.{{ item.name }}</span>
          <me-tooltip content="删除该 class" effect="light">
            <DeleteOutlined
              class="class-manager-item-delete"
              @click.stop="handleClassDelete(item.name)"
            />
          </me-tooltip>
        </div>
        <div class="class-manager-item-refs">
          <me-tag
            v-for="ref in item.refs"
            :key="ref.id"
            class="class-manager-item-ref"
            :class="{ 'is-disabled': !ref.enabled, 'is-selected': ref.id === selectedElementId }"
            @click="handleRefClick(ref.id, item.name)"
          >{{ ref.id }}</me-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { DeleteOutlined } from '@ant-design/icons-vue';
import { SiderPanelEnum } from '@/constants/home';
import { useCanvasStore } from '@/store/canvas';
import { storeToRefs } from 'pinia';
import { MeModal, MeTag, MeTooltip } from '@zyf_dsb/me-ui';
import type { ClassListItem } from '../types';

defineOptions({
  name: 'ClassManagerPanel',
});

const canvasStore = useCanvasStore();
const { classList, activeClassName, selectedElementId } = storeToRefs(canvasStore);

/** 点击 class 名称：选中引用该 class 的第一个元素并进入样式编辑 */
function handleClassClick(item: ClassListItem) {
  const firstRef = item.refs[0];
  if (firstRef) {
    canvasStore.selectElement(firstRef.id);
  }
  canvasStore.activeClassName = item.name;
  canvasStore.switchPanel(SiderPanelEnum.EDIT);
}

/** 点击引用元素 id：选中该元素并进入该 class 的样式编辑 */
function handleRefClick(elementId: string, className: string) {
  canvasStore.selectElement(elementId);
  canvasStore.activeClassName = className;
  canvasStore.switchPanel(SiderPanelEnum.EDIT);
}

/** 删除 class：从所有元素中移除并删除其样式定义 */
function handleClassDelete(className: string) {
  MeModal.confirm({
    title: '确认删除该 class？',
    content: `将从所有元素中移除 .${className}，并删除其样式定义，此操作可通过撤销恢复。`,
    confirmText: '确认',
    cancelText: '取消',
    onConfirm() {
      canvasStore.removeClassFromAllElements(className);
    },
  });
}
</script>

<style scoped lang="less">
.class-manager-panel {
  width: 100%;
  height: 100%;
  overflow-y: auto;

  &-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--editor-border);
  }

  &-title {
    color: var(--editor-text);
    font-size: 14px;
    font-weight: 500;
  }

  &-count {
    color: var(--editor-text-tertiary);
    font-size: 12px;
  }

  &-empty {
    color: var(--editor-text-tertiary);
    text-align: center;
    padding: 40px 16px;
    font-size: 13px;
  }

  &-list {
    padding: 8px 12px;
  }
}

.class-manager-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  border-radius: var(--editor-radius-sm);
  cursor: default;
  transition: background 0.2s;

  &:hover {
    background: var(--editor-bg-item-hover);

    .class-manager-item-delete {
      opacity: 1;
    }
  }

  &.is-active {
    background: var(--editor-accent-bg);
  }

  &-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
  }

  &-name {
    color: var(--editor-text);
    font-size: 13px;
    font-weight: 500;
  }

  &-refs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  &-ref {
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s, opacity 0.2s;

    &:hover {
      background: var(--editor-bg-item-hover) !important;
      color: var(--editor-text) !important;
    }

    &.is-selected {
      background: var(--editor-accent-bg) !important;
      color: var(--editor-accent, #1677ff) !important;
      border-color: var(--editor-border-active) !important;
    }

    &.is-disabled {
      opacity: 0.5;
      text-decoration: line-through;
    }
  }

  &-delete {
    color: var(--editor-text-tertiary);
    font-size: 12px;
    flex-shrink: 0;
    opacity: 0;
    cursor: pointer;
    transition: color 0.2s, opacity 0.2s;

    &:hover {
      color: var(--app-color-error);
    }
  }
}
</style>
