<!-- ? 层级面板单项（递归组件） -->
<template>
  <div class="comp-layer-item">
    <!-- 插入位置指示条（上方） -->
    <div
      v-if="showDropIndicator === 'before'"
      class="comp-layer-item-indicator"
      :style="indicatorStyle"
    />
    <div
      class="comp-layer-item-header"
      :class="{
        'is-selected': isSelected,
        'is-hidden': isHidden,
        'is-drop-inside': isDropInside,
      }"
      :style="{ paddingLeft: 10 + depth * 16 + 'px' }"
      draggable="true"
      @click.stop="selectElement(element.id)"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <!-- 展开/折叠按钮 -->
      <span
        v-if="isContainer"
        class="comp-layer-item-toggle"
        :class="{ 'is-expanded': isExpanded }"
        @click.stop="toggleExpand(element.id)"
      >
        <svg viewBox="0 0 24 24">
          <path d="M8 5l8 7-8 7z" />
        </svg>
      </span>
      <span v-else class="comp-layer-item-toggle-placeholder" />

      <!-- 可见性切换 -->
      <span
        class="comp-layer-item-visibility"
        @click.stop="toggleVisibility"
      >
        <svg v-if="!isHidden" viewBox="0 0 24 24">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
        </svg>
        <svg v-else viewBox="0 0 24 24">
          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
        </svg>
      </span>

      <!-- 元素类型图标 -->
      <span class="comp-layer-item-icon">
        <svg v-if="element.type === CanvasElementTypeEnum.CONTAINER" viewBox="0 0 24 24">
          <path d="M2 20V4h20v16H2zm2-2h16V6H4v12z" />
        </svg>
        <svg v-else-if="element.type === CanvasElementTypeEnum.BUTTON" viewBox="0 0 24 24">
          <path d="M22 9v6c0 1.1-.9 2-2 2h-1v-2h1V9H4v6h6v2H4c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2zm-8 3v4h-4v-4h4zm0-2h-4v-2h4v2z" />
        </svg>
        <svg v-else-if="element.type === CanvasElementTypeEnum.PARAGRAPH" viewBox="0 0 24 24">
          <path d="M3 4h18v2H3V4zm0 7h12v2H3v-2zm0 7h18v2H3v-2z" />
        </svg>
        <svg v-else-if="element.type === CanvasElementTypeEnum.IMAGE" viewBox="0 0 24 24">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
        </svg>
        <svg v-else-if="element.type === CanvasElementTypeEnum.LINK" viewBox="0 0 24 24">
          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
        </svg>
      </span>

      <!-- 元素名称 -->
      <span class="comp-layer-item-label">{{ elementLabel }}</span>

      <!-- 元素类型标签 -->
      <span class="comp-layer-item-type">{{ typeLabel }}</span>

      <!-- 删除按钮 -->
      <span
        class="comp-layer-item-delete"
        @click.stop="deleteElement(element.id)"
      >
        <svg viewBox="0 0 24 24">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
        </svg>
      </span>
    </div>
    <!-- 插入位置指示条（下方） -->
    <div
      v-if="showDropIndicator === 'after'"
      class="comp-layer-item-indicator"
      :style="indicatorStyle"
    />

    <!-- 子元素列表 -->
    <div
      v-if="isContainer && isExpanded && children.length > 0"
      class="comp-layer-item-children"
    >
      <LayerItem
        v-for="(child, childIndex) in children"
        :key="child.id"
        :element="child"
        :depth="depth + 1"
        :index="childIndex"
        :parent-id="element.id"
        :siblings="children"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { storeToRefs } from 'pinia';
import { useCanvasStore } from '@/store/canvas';
import { CanvasElementTypeEnum, CanvasElementLabelMap } from '@/constants/home';
import type { CanvasElement, CanvasContainerElement } from '@/views/Home/types';
import {
  EXPANDED_STATE_KEY,
  TOGGLE_EXPAND_KEY,
  DRAGGING_ID_KEY,
  DROP_TARGET_KEY,
  SET_DRAGGING_ID_KEY,
  SET_DROP_TARGET_KEY,
  COMMIT_MOVE_KEY,
} from './LayersPanel.vue';

defineOptions({
  name: 'LayerItem',
});

const props = defineProps({
  /** 当前元素 */
  element: {
    type: Object as () => CanvasElement,
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
  /** 父容器 id（null 表示根层级） */
  parentId: {
    type: String as () => string | null,
    default: null,
  },
  /** 兄弟节点列表 */
  siblings: {
    type: Array as () => CanvasElement[],
    required: true,
  },
});

const canvasStore = useCanvasStore();
const { selectedElementId } = storeToRefs(canvasStore);

/** 注入共享状态 */
const expandedState = inject(EXPANDED_STATE_KEY)!;
const toggleExpandFn = inject(TOGGLE_EXPAND_KEY)!;
const draggingId = inject(DRAGGING_ID_KEY)!;
const dropTarget = inject(DROP_TARGET_KEY)!;
const setDraggingId = inject(SET_DRAGGING_ID_KEY)!;
const setDropTarget = inject(SET_DROP_TARGET_KEY)!;
const commitMove = inject(COMMIT_MOVE_KEY)!;

/** 当前元素是否被选中 */
const isSelected = computed(() => selectedElementId.value === props.element.id);

/** 是否为容器元素 */
const isContainer = computed(() => props.element.type === CanvasElementTypeEnum.CONTAINER);

/** 是否隐藏 */
const isHidden = computed(() => props.element.classes.includes('hidden'));

/** 是否展开 */
const isExpanded = computed(() => expandedState.value[props.element.id] ?? false);

/** 子元素列表 */
const children = computed<CanvasElement[]>(() => {
  if (isContainer.value) {
    return (props.element as CanvasContainerElement).children;
  }
  return [];
});

/** 元素显示名称 */
const elementLabel = computed(() => {
  const el = props.element;
  if (el.type === CanvasElementTypeEnum.BUTTON) {
    return (el as { text: string }).text || CanvasElementLabelMap[el.type];
  }
  if (el.type === CanvasElementTypeEnum.PARAGRAPH) {
    return (el as { text: string }).text || CanvasElementLabelMap[el.type];
  }
  if (el.type === CanvasElementTypeEnum.LINK) {
    return (el as { text: string }).text || CanvasElementLabelMap[el.type];
  }
  if (el.type === CanvasElementTypeEnum.IMAGE) {
    return (el as { title: string }).title || CanvasElementLabelMap[el.type];
  }
  return CanvasElementLabelMap[el.type];
});

/** 元素类型标签 */
const typeLabel = computed(() => CanvasElementLabelMap[props.element.type]);

/** 边缘检测阈值（px） */
const EDGE_THRESHOLD = 8;

/** 当前是否为拖拽落点目标（同级插入） */
const isDropTarget = computed(() => {
  const target = dropTarget.value;
  if (!target || !draggingId.value) return false;
  if (target.mode === 'inside') return false;
  return target.parentId === props.parentId && target.index === props.index;
});

/** 当前是否为拖拽落点目标（容器内部插入） */
const isDropInside = computed(() => {
  const target = dropTarget.value;
  if (!target || !draggingId.value) return false;
  return target.mode === 'inside' && target.parentId === props.element.id;
});

/** 插入位置指示条显示模式 */
const showDropIndicator = computed<'before' | 'after' | null>(() => {
  const target = dropTarget.value;
  if (!target || !draggingId.value) return null;
  if (target.mode === 'inside') return null;
  if (target.parentId === props.parentId && target.index === props.index) {
    return target.mode;
  }
  return null;
});

/** 指示条样式（左偏移对齐内容区） */
const indicatorStyle = computed(() => ({
  left: `${10 + props.depth * 16}px`,
}));

/**
 * 选中元素
 */
function selectElement(id: string) {
  canvasStore.selectElement(id);
}

/**
 * 切换展开/折叠
 */
function toggleExpand(id: string) {
  toggleExpandFn(id);
}

/**
 * 切换可见性
 */
function toggleVisibility() {
  const el = props.element;
  if (el.classes.includes('hidden')) {
    el.classes = el.classes.filter((c) => c !== 'hidden');
  } else {
    el.classes = [...el.classes, 'hidden'];
  }
}

/**
 * 删除元素
 */
function deleteElement(id: string) {
  canvasStore.removeElement(id);
  if (selectedElementId.value === id) {
    canvasStore.selectElement('');
  }
}

/**
 * 拖拽开始
 */
function handleDragStart(e: DragEvent) {
  e.stopPropagation();
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', props.element.id);
  }
  setDraggingId(props.element.id);
}

/**
 * 拖拽结束
 */
function handleDragEnd(e: DragEvent) {
  e.stopPropagation();
  commitMove();
}

/**
 * 拖拽经过（边缘检测：上边缘=插入前，下边缘=插入后，中间=插入容器内部）
 */
function handleDragOver(e: DragEvent) {
  e.stopPropagation();
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move';
  }

  const headerEl = (e.currentTarget as HTMLElement);
  const rect = headerEl.getBoundingClientRect();
  const y = e.clientY;
  const relativeY = y - rect.top;
  const height = rect.height;

  /** 上边缘 → 插入到当前元素之前 */
  if (relativeY < EDGE_THRESHOLD) {
    setDropTarget({
      mode: 'before',
      parentId: props.parentId,
      index: props.index,
    });
    return;
  }

  /** 下边缘 → 插入到当前元素之后 */
  if (relativeY > height - EDGE_THRESHOLD) {
    setDropTarget({
      mode: 'after',
      parentId: props.parentId,
      index: props.index,
    });
    return;
  }

  /** 中间区域 */
  if (isContainer.value) {
    /** 容器元素 → 插入到容器内部作为最后一个子元素 */
    setDropTarget({
      mode: 'inside',
      parentId: props.element.id,
      index: children.value.length,
    });
  } else {
    /** 非容器元素 → 插入到当前元素之后 */
    setDropTarget({
      mode: 'after',
      parentId: props.parentId,
      index: props.index,
    });
  }
}

/**
 * 拖拽离开
 */
function handleDragLeave(e: DragEvent) {
  e.stopPropagation();
}

/**
 * 放置
 */
function handleDrop(e: DragEvent) {
  e.stopPropagation();
  e.preventDefault();
}
</script>

<style scoped lang="less">
.comp-layer-item {
  user-select: none;
  position: relative;
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

    .comp-layer-item-type {
      color: rgba(255, 255, 255, 0.75);
    }

    .comp-layer-item-delete {
      opacity: 1;
      color: rgba(255, 255, 255, 0.75);

      &:hover {
        color: #fff;
      }
    }
  }

  &.is-hidden {
    opacity: 0.4;
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

.comp-layer-item-children {
  overflow: hidden;
}
</style>
