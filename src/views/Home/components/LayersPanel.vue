<!-- ? 组件层级面板 -->
<template>
  <div class="comp-layers-panel">
    <div class="comp-layers-panel-header">层级管理</div>
    <div class="comp-layers-panel-body">
      <div v-if="!elements.length" class="comp-layers-panel-empty">
        暂无元素，请从组件库添加
      </div>
      <template v-else>
        <LayerItem
          v-for="(el, index) in elements"
          :key="el.id"
          :element="el"
          :depth="0"
          :index="index"
          :parent-id="null"
          :siblings="elements"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue';
import { storeToRefs } from 'pinia';
import { useCanvasStore } from '@/store/canvas';
import LayerItem from './LayersPanelItem.vue';

defineOptions({
  name: 'LayersPanel',
});

const canvasStore = useCanvasStore();
const { elements } = storeToRefs(canvasStore);

/** 展开状态 */
const expandedState = ref<Record<string, boolean>>({});

/** 当前拖拽元素 id */
const draggingId = ref<string | null>(null);

/** 拖拽落点目标 */
const dropTarget = ref<DropTarget | null>(null);

/** 切换展开/折叠 */
function toggleExpand(id: string) {
  expandedState.value = {
    ...expandedState.value,
    [id]: !expandedState.value[id],
  };
}

/** 设置拖拽元素 id */
function setDraggingId(id: string | null) {
  draggingId.value = id;
}

/** 设置落点目标 */
function setDropTarget(target: DropTarget | null) {
  dropTarget.value = target;
}

/** 执行移动 */
function commitMove() {
  const id = draggingId.value;
  const target = dropTarget.value;
  if (id && target) {
    if (target.mode === 'inside' && target.parentId !== null) {
      /** 插入到目标容器内部 */
      canvasStore.moveElement(id, target.parentId, target.index);
      /** 自动展开目标容器 */
      expandedState.value = {
        ...expandedState.value,
        [target.parentId]: true,
      };
    } else {
      /** 插入到目标元素前/后（同级） */
      const insertIndex = target.mode === 'after' ? target.index + 1 : target.index;
      canvasStore.moveElement(id, target.parentId, insertIndex);
    }
  }
  draggingId.value = null;
  dropTarget.value = null;
}

provide(EXPANDED_STATE_KEY, expandedState);
provide(TOGGLE_EXPAND_KEY, toggleExpand);
provide(DRAGGING_ID_KEY, draggingId);
provide(DROP_TARGET_KEY, dropTarget);
provide(SET_DRAGGING_ID_KEY, setDraggingId);
provide(SET_DROP_TARGET_KEY, setDropTarget);
provide(COMMIT_MOVE_KEY, commitMove);
</script>

<script lang="ts">
import type { InjectionKey, Ref } from 'vue';

/** 拖拽落点目标 */
export interface DropTarget {
  /** 插入模式：before=目标前, after=目标后, inside=容器内部 */
  mode: 'before' | 'after' | 'inside';
  /** 目标父容器 id（null 表示根层级） */
  parentId: string | null;
  /** 插入索引 */
  index: number;
}

export const EXPANDED_STATE_KEY: InjectionKey<Ref<Record<string, boolean>>> = Symbol('expandedState');
export const TOGGLE_EXPAND_KEY: InjectionKey<(id: string) => void> = Symbol('toggleExpand');
export const DRAGGING_ID_KEY: InjectionKey<Ref<string | null>> = Symbol('draggingId');
export const DROP_TARGET_KEY: InjectionKey<Ref<DropTarget | null>> = Symbol('dropTarget');
export const SET_DRAGGING_ID_KEY: InjectionKey<(id: string | null) => void> = Symbol('setDraggingId');
export const SET_DROP_TARGET_KEY: InjectionKey<(target: DropTarget | null) => void> = Symbol('setDropTarget');
export const COMMIT_MOVE_KEY: InjectionKey<() => void> = Symbol('commitMove');
</script>

<style scoped lang="less">
.comp-layers-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.comp-layers-panel-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  flex-shrink: 0;
}

.comp-layers-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.comp-layers-panel-empty {
  padding: 24px 16px;
  color: rgba(255, 255, 255, 0.45);
  text-align: center;
  font-size: 13px;
}
</style>