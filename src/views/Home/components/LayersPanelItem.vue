<!-- ? 层级面板单项（递归组件） -->
<template>
  <div 
    :class="[
      'comp-layer-item',
      {
        'is-hidden': isHidden,
      }
    ]">
    <!-- 插入位置指示条（上方） -->
    <div
      v-if="showDropIndicator === DropPositionEnum.BEFORE"
      class="comp-layer-item-indicator"
      :style="indicatorStyle"
    ></div>
    <div
      class="comp-layer-item-header"
      :class="{
        'is-selected': isSelected,
        'is-drop-inside': isDropInside,
      }"
      :style="{ paddingLeft: 10 + depth * 16 + 'px' }"
      :draggable="!isRoot"
      @click.stop="selectElement(element.id)"
      @dragstart.stop="handleDragStart"
      @dragend.stop="handleDragEnd"
      @dragover.stop.prevent="handleDragOver"
      @dragleave.stop="handleDragLeave"
      @drop.stop.prevent
    >
      <!-- 展开/折叠按钮 -->
      <span
        v-if="isContainer"
        class="comp-layer-item-toggle"
        :class="{ 'is-expanded': isExpanded }"
        @click.stop="toggleExpand(element.id)"
      >
        <CaretRightOutlined />
      </span>
      <span v-else class="comp-layer-item-toggle-placeholder"></span>

      <!-- 可见性切换 -->
      <span
        class="comp-layer-item-visibility"
        @click.stop="toggleShow(element.id)"
      >
        <EyeOutlined v-if="!isHidden"/>
        <EyeInvisibleOutlined v-else/>
      </span>

      <!-- 元素名称 -->
      <!-- <span class="comp-layer-item-label">{{ element.alias }}</span> -->
      <span class="comp-layer-item-label">{{ element.id }}</span>

      <!-- 删除按钮 -->
      <DeleteOutlined 
        class="comp-layer-item-delete"
        @click.stop="deleteElement(element.id)"
      />
    </div>
    <!-- 插入位置指示条（下方） -->
    <div
      v-if="showDropIndicator === DropPositionEnum.AFTER"
      class="comp-layer-item-indicator"
      :style="indicatorStyle"
    ></div>

    <!-- 子元素列表 -->
    <div
      v-if="isContainer && isExpanded && children.length > 0"
    >
      <LayerItem
        v-for="(child, childIndex) in children"
        :key="child.id"
        :element="child"
        :depth="depth + 1"
        :index="childIndex"
        :parent-id="element.id"
        :ancestor-ids="[...ancestorIds, element.id]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, PropType, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCanvasStore } from '@/store/canvas';
import { CanvasElementTypeEnum, DropPositionEnum } from '@/constants/home';
import type { CanvasInnerElement, CanvasContainerElement, CanvasElement, CanvasRootElement } from '@/views/Home/types';
import {
  TOGGLE_EXPAND_KEY,
  EXPAND_CONTAINER_KEY,
  DRAGGING_ID_KEY,
  DROP_TARGET_KEY,
  SET_DRAGGING_ID_KEY,
  SET_DROP_TARGET_KEY,
  EXECUTE_MOVE_KEY,
  EXPANDED_KEYS,
  EDGE_THRESHOLD,
  HIDDEN_KEYS,
  TOGGLE_SHOW_KEY,
} from '../contants.ts';
import {
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CaretRightOutlined
} from '@ant-design/icons-vue';
import LayerItem from './LayersPanelItem.vue';

defineOptions({
  name: 'LayerItem',
});

const props = defineProps({
  /** 当前元素 */
  element: {
    type: Object as PropType<CanvasElement>,
    required: true,
  },
  /** 当前深度 */
  depth: {
    type: Number,
    required: true,
  },
  /** 在兄弟节点中的索引 */
  index: {
    type: Number,
    required: true,
  },
  /** 祖先元素 id 列表（用于拖拽时判断是否为自身后代） */
  ancestorIds: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  /** 是否为根 */
  isRoot: {
    type: Boolean,
    default: false
  }
});

const canvasStore = useCanvasStore();
const { selectedElementId } = storeToRefs(canvasStore);

/** 注入共享状态 */
const expandedKeys = inject(EXPANDED_KEYS)!;
const toggleExpand = inject(TOGGLE_EXPAND_KEY)!;
const expandContainer = inject(EXPAND_CONTAINER_KEY)!;
const draggingId = inject(DRAGGING_ID_KEY)!;
const dropTarget = inject(DROP_TARGET_KEY)!;
const setDraggingId = inject(SET_DRAGGING_ID_KEY)!;
const setDropTarget = inject(SET_DROP_TARGET_KEY)!;
const executeMove = inject(EXECUTE_MOVE_KEY)!;
const hiddenKeys = inject(HIDDEN_KEYS)!;
const toggleShow = inject(TOGGLE_SHOW_KEY)!;

/** 当前元素是否被选中 */
const isSelected = computed(() => selectedElementId.value === props.element.id);

/** 是否为容器元素 */
const isContainer = computed(() => {
  return props.element.type === CanvasElementTypeEnum.CONTAINER || props.element.type === CanvasElementTypeEnum.ROOT;
});

/** 是否隐藏 */
const isHidden = computed(() => hiddenKeys.value.includes(props.element.id));

/** 是否展开 */
const isExpanded = computed(() => expandedKeys.value.includes(props.element.id));

/** 父元素id */
const parentId = computed(() => props.ancestorIds[props.ancestorIds.length - 1]!);

/** 子元素列表 */
const children = computed<CanvasInnerElement[]>(() => {
  if (isContainer.value) {
    return (props.element as CanvasContainerElement | CanvasRootElement).children;
  }
  return [];
});

/** 当前是否为拖拽落点目标（容器内部插入） */
const isDropInside = computed(() => {
  const target = dropTarget.value;
  if (!target || !draggingId.value) return false;
  return target.position === DropPositionEnum.INSIDE && target.parentId === props.element.id;
});

/** 插入位置指示条显示模式 */
const showDropIndicator = computed<DropPositionEnum | null>(() => {
  const target = dropTarget.value;
  if (!target || !draggingId.value || props.isRoot) return null;
  if (target.position === DropPositionEnum.INSIDE) return null;
  if (target.parentId === parentId.value && target.index === props.index) {
    return target.position;
  }
  return null;
});

/** 指示条样式（左偏移对齐内容区） */
const indicatorStyle = computed(() => ({
  left: `${10 + props.depth * 16}px`,
}));

/** 选中元素 */
function selectElement(id: string) {
  canvasStore.selectElement(id);
}

/** 删除元素 */
function deleteElement(id: string) {
  canvasStore.removeElement(id);
  if (selectedElementId.value === id) {
    canvasStore.selectElement(null);
  }
}

/** 容器展开延迟定时器 */
let expandTimer: ReturnType<typeof setTimeout> | null = null;

/** 清除展开延迟定时器 */
function clearExpandTimer() {
  if (expandTimer !== null) {
    clearTimeout(expandTimer);
    expandTimer = null;
  }
}

onUnmounted(() => {
  clearExpandTimer();
});

/** 拖拽开始 */
function handleDragStart(e: DragEvent) {
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
  }
  setDraggingId(props.element.id);
}

/** 拖拽结束 */
function handleDragEnd(e: DragEvent) {
  clearExpandTimer();
  executeMove();
}

/** 拖拽离开 */
function handleDragLeave() {
  clearExpandTimer();
}

/** 拖拽经过（边缘检测：上边缘=插入前，下边缘=插入后，中间=插入容器内部） */
function handleDragOver(e: DragEvent) {
  /** 落点为自身或后代时，不做任何操作 */
  if (draggingId.value === props.element.id || props.ancestorIds.includes(draggingId.value!)) {
    setDropTarget(null);
    return;
  }

  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move';
  }

  const rect = (e.target as HTMLElement).getBoundingClientRect();
  // 鼠标相对于事件目标元素顶部的距离
  const top = e.clientY - rect.top;
  const height = rect.height;

  /** 上边缘 → 插入到当前元素之前 */
  if (top < EDGE_THRESHOLD && !props.isRoot) {
    clearExpandTimer();
    setDropTarget({
      position: DropPositionEnum.BEFORE,
      parentId: parentId.value,
      index: props.index,
    });
    return;
  }

  /** 下边缘 → 插入到当前元素之后 */
  if (top > height - EDGE_THRESHOLD && !props.isRoot) {
    clearExpandTimer();
    setDropTarget({
      position: DropPositionEnum.AFTER,
      parentId: parentId.value,
      index: props.index,
    });
    return;
  }

  /** 中间区域 */
  if (isContainer.value) {
    /** 容器元素 → 延迟 0.5s 后展开并设置插入目标 */
    if (!isExpanded.value) {
      if(!expandTimer){
        expandTimer = setTimeout(() => {
          expandContainer(props.element.id);
          setDropTarget({
            position: DropPositionEnum.INSIDE,
            parentId: props.element.id,
            index: children.value.length,
          });
        }, 500);
      }
    } else {
      clearExpandTimer();
      setDropTarget({
        position: DropPositionEnum.INSIDE,
        parentId: props.element.id,
        index: children.value.length,
      });
    }
  } else if(!props.isRoot){
    /** 非容器元素 → 插入到当前元素之后 */
    clearExpandTimer();
    setDropTarget({
      position: DropPositionEnum.AFTER,
      parentId: parentId.value,
      index: props.index,
    });
  }
}
</script>

<style scoped lang="less">
.comp-layer-item {
  user-select: none;
  position: relative;
  
  &.is-hidden {
    opacity: 0.5;
  }
}

.comp-layer-item-indicator {
  position: absolute;
  right: 0;
  height: 2px;
  background: #52c41a;
  z-index: 10;
  pointer-events: none;
}

.comp-layer-item-header {
  display: flex;
  align-items: center;
  padding: 4px 10px;
  cursor: pointer;
  transition: background 0.15s;
  border-left: 2px solid transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  &.is-selected {
    background: #ccc;
    color: #fff;

    .comp-layer-item-delete {
      opacity: 1;
      color: rgba(255, 255, 255, 0.75);

      &:hover {
        color: #fff;
      }
    }
  }

  &.is-drop-inside {
    background: rgba(22, 119, 255, 0.15);
    outline: 1px solid #1677ff;
    outline-offset: -1px;
  }
}

.comp-layer-item-toggle {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &.is-expanded {
    transform: rotate(90deg);
  }

  svg {
    width: 10px;
    height: 10px;
    fill: rgba(255, 255, 255, 0.55);
  }

  .is-selected & svg {
    fill: rgba(255, 255, 255, 0.85);
  }
}

.comp-layer-item-toggle-placeholder {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-right: 4px;
}

.comp-layer-item-visibility {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 6px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }

  svg {
    width: 14px;
    height: 14px;
    fill: rgba(255, 255, 255, 0.55);
  }

  .is-selected & svg {
    fill: rgba(255, 255, 255, 0.85);
  }
}

.comp-layer-item-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 6px;

  svg {
    width: 14px;
    height: 14px;
    fill: rgba(255, 255, 255, 0.45);
  }

  .is-selected & svg {
    fill: rgba(255, 255, 255, 0.75);
  }
}

.comp-layer-item-label {
  flex: 1;
  font-size: 13px;
  line-height: 28px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.comp-layer-item-type {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  margin-left: 6px;
  flex-shrink: 0;
}

.comp-layer-item-delete {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 4px;
  cursor: pointer;
  opacity: 0;
  border-radius: 3px;
  transition: opacity 0.15s, background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  svg {
    width: 12px;
    height: 12px;
    fill: rgba(255, 255, 255, 0.45);
  }

  .comp-layer-item-header:hover & {
    opacity: 1;
  }
}
</style>
