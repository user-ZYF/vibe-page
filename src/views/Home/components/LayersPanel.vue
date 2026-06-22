<!-- ? 组件层级面板 -->
<template>
  <div class="comp-layers-panel">
    <div class="comp-layers-panel-header">层级管理</div>
    <div class="comp-layers-panel-body">
      <div v-if="!elements.length" class="comp-layers-panel-empty">
        暂无元素，请从组件库添加
      </div>
      <template v-else>
        <LayersPanelItem
          v-for="(el, index) in elements"
          :key="el.id"
          :element="el"
          :depth="0"
          :index="index"
          :parent-id="null"
          :siblings="elements"
          :ancestor-ids="[]"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue';
import { storeToRefs } from 'pinia';
import { useCanvasStore } from '@/store/canvas';
import LayersPanelItem from './LayersPanelItem.vue';
import { DropPositionEnum } from '@/constants/home.ts';
import { EXPANDED_KEYS, TOGGLE_EXPAND_KEY, EXPAND_CONTAINER_KEY, DRAGGING_ID_KEY, DROP_TARGET_KEY, SET_DRAGGING_ID_KEY, SET_DROP_TARGET_KEY, EXECUTE_MOVE_KEY, HIDDEN_KEYS, TOGGLE_SHOW_KEY } from '../contants.ts';
import { LayersDropTarget } from '../types.ts';

defineOptions({
  name: 'LayersPanelItem',
});

const canvasStore = useCanvasStore();
const { elements } = storeToRefs(canvasStore);

/** 展开元素id列表 */
const expandedKeys = ref<string[]>([]);

/** 隐藏元素id列表 */
const hiddenKeys = ref<string[]>([]);

/** 当前拖拽元素id */
const draggingId = ref<string | null>(null);

/** 拖拽落点目标 */
const dropTarget = ref<LayersDropTarget | null>(null);

/** 切换展开/折叠 */
function toggleExpand(id: string) {
  const found = expandedKeys.value.includes(id);
  if(found){
    collapseContainer(id);
  }else {
    expandContainer(id);
  }
}

/** 折叠容器 */
function collapseContainer(id: string) {
  expandedKeys.value = expandedKeys.value.filter((item)=>item !== id);
}

/** 展开容器 */
function expandContainer(id: string) {
  if(!expandedKeys.value.includes(id)){
    expandedKeys.value.push(id);
  }
}

/** 切换显示/隐藏 */
function toggleShow(id: string){
  const found = hiddenKeys.value.includes(id);
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

/** 设置拖拽元素 id */
function setDraggingId(id: string | null) {
  draggingId.value = id;
}

/** 设置落点目标 */
function setDropTarget(target: LayersDropTarget | null) {
  dropTarget.value = target;
}

/** 执行移动 */
function executeMove() {
  const id = draggingId.value;
  const target = dropTarget.value;
  if (id && target) {
    if (target.position === DropPositionEnum.INSIDE && target.parentId !== null) {
      /** 插入到目标容器内部 */
      canvasStore.moveElement(id, target.parentId, target.index);
    } else {
      /** 插入到目标元素前/后（同级） */
      const insertIndex = target.position === DropPositionEnum.AFTER ? target.index + 1 : target.index;
      canvasStore.moveElement(id, target.parentId, insertIndex);
    }
  }
  draggingId.value = null;
  dropTarget.value = null;
}

provide(EXPANDED_KEYS, expandedKeys);
provide(TOGGLE_EXPAND_KEY, toggleExpand);
provide(EXPAND_CONTAINER_KEY, expandContainer);
provide(DRAGGING_ID_KEY, draggingId);
provide(DROP_TARGET_KEY, dropTarget);
provide(SET_DRAGGING_ID_KEY, setDraggingId);
provide(SET_DROP_TARGET_KEY, setDropTarget);
provide(EXECUTE_MOVE_KEY, executeMove);
provide(HIDDEN_KEYS, hiddenKeys);
provide(TOGGLE_SHOW_KEY, toggleShow);
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