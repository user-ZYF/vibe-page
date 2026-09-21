<!-- ? 组件层级面板 -->
<template>
  <div class="comp-layers-panel">
    <div class="comp-layers-panel-body">
      <me-tree
        :data="treeData"
        node-key="id"
        :props="treePropsConfig"
        :indent="16"
        draggable
        :allow-drag="allowDrag"
        :allow-drop="allowDrop"
        v-model:expanded-keys="expandedKeys"
        v-model:current-node-key="currentNodeKey"
        @node-drop="handleNodeDrop"
      >
        <template #default="{ data }">
          <span
            class="comp-layer-node"
            :class="{ 'is-hidden': isHidden(data.id) }"
          >
            <span
              class="comp-layer-node-visibility"
              @click.stop="toggleShow(data.id)"
            >
              <EyeOutlined v-if="!isHidden(data.id)" />
              <EyeInvisibleOutlined v-else />
            </span>
            <span class="comp-layer-node-label">{{ getNodeLabel(data) }}</span>
            <DeleteOutlined
              v-if="data.id !== rootId"
              class="comp-layer-node-delete"
              @click.stop="deleteElement(data.id)"
            />
          </span>
        </template>
      </me-tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { storeToRefs } from 'pinia';
import { useCanvasStore } from '@/store/canvas';
import { CanvasElementTypeEnum, getElementDisplayName } from '@/constants/home';
import { isParentElement, isSubtreeAllowed } from '@/views/Canvas/types';
import type { CanvasElement, CanvasInnerElement, CanvasParentElement, CanvasRootElement, LayerTreeNodeData } from '@/views/Canvas/types';
import { HIDDEN_KEYS, TOGGLE_SHOW_KEY } from '../constants.ts';
import { DeleteOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons-vue';
import { MeTree } from '@zyf_dsb/me-ui';
import type { AllowDragFunction, AllowDropFunction, AllowDropType, NodeDropType, TreeNodeData, TreeNodeModel } from '@zyf_dsb/me-ui/tree';

defineOptions({
  name: 'LayersPanel',
});

const canvasStore = useCanvasStore();
const { root, selectedElementId } = storeToRefs(canvasStore);

/** 根元素id（代码编辑可能改写根元素 id，使用 computed 保持同步） */
const rootId = computed(() => root.value.id);

/** 隐藏元素id列表 */
const hiddenKeys = inject(HIDDEN_KEYS)!;
/** 切换元素显示/隐藏 */
const toggleShow = inject(TOGGLE_SHOW_KEY)!;

/** 将画布元素映射为层级树节点数据 */
function toLayerTreeNode(el: CanvasElement): LayerTreeNodeData {
  const isContainer = el.type === CanvasElementTypeEnum.ROOT || isParentElement(el as CanvasInnerElement);
  const children = isContainer
    ? (el as CanvasRootElement | CanvasParentElement).children.map(toLayerTreeNode)
    : [];
  return {
    id: el.id,
    element: el,
    children,
  };
}

/** 树数据（以根元素为顶层节点） */
const treeData = computed<LayerTreeNodeData[]>(() => [toLayerTreeNode(root.value)]);

/** 树节点显示名称（标题元素按级别显示 h1~h6，通用元素显示原始标签名） */
function getNodeLabel(data: TreeNodeData): string {
  return getElementDisplayName((data as LayerTreeNodeData).element);
}

/** 树属性映射配置 */
const treePropsConfig = {
  children: 'children',
  label: getNodeLabel,
};

/** 展开元素id列表（默认展开根元素） */
const expandedKeys = ref<string[]>([rootId.value]);

/** 当前选中节点 key（双向绑定 canvasStore.selectedElementId） */
const currentNodeKey = computed<string | undefined>({
  get: () => selectedElementId.value ?? undefined,
  set: (val) => canvasStore.selectElement(val ?? null),
});

/** 判断元素是否隐藏 */
function isHidden(id: string): boolean {
  return hiddenKeys.value.includes(id);
}

/** 删除元素 */
function deleteElement(id: string) {
  canvasStore.removeElement(id);
}

/** 允许拖拽判断（根元素不可拖拽） */
const allowDrag: AllowDragFunction = (node: TreeNodeModel) => {
  return node.data.id !== rootId.value;
};

/** 允许放置判断（基于元素嵌套规则 isSubtreeAllowed） */
const allowDrop: AllowDropFunction = (
  draggingNode: TreeNodeModel,
  dropNode: TreeNodeModel,
  type: AllowDropType,
) => {
  const draggedId = draggingNode.data.id as string;
  const dropId = dropNode.data.id as string;
  const draggedEl = canvasStore.getElementById(draggedId);
  if (!draggedEl || draggedEl.type === CanvasElementTypeEnum.ROOT) return false;
  const dragElement = draggedEl as CanvasInnerElement;

  if (type === 'inner') {
    /** 放入容器内部：检查目标容器是否允许接收该子树 */
    const dropEl = canvasStore.getElementById(dropId);
    if (!dropEl) return false;
    if (dropEl.type !== CanvasElementTypeEnum.ROOT && !isParentElement(dropEl as CanvasInnerElement)) return false;
    return isSubtreeAllowed(dropEl, dragElement);
  }

  /** before / after：检查目标元素的父容器是否允许接收该子树 */
  const parentId = canvasStore.getParentElementId(dropId);
  if (!parentId) return false;
  const parentEl = canvasStore.getElementById(parentId);
  if (!parentEl) return false;
  return isSubtreeAllowed(parentEl, dragElement);
};

/** 获取元素在父容器 children 中的索引 */
function getElementIndex(id: string, parent: CanvasRootElement | CanvasParentElement): number {
  return parent.children.findIndex((c) => c.id === id);
}

/** 拖拽放置成功，同步移动到 canvasStore */
function handleNodeDrop(
  draggingNode: TreeNodeModel,
  dropNode: TreeNodeModel,
  dropType: Exclude<NodeDropType, 'none'>,
) {
  const id = draggingNode.data.id as string;
  let targetParentId: string;
  let index: number;

  if (dropType === 'inner') {
    /** 放入容器内部：追加到末尾 */
    targetParentId = dropNode.data.id as string;
    const target = canvasStore.getElementById(targetParentId);
    if (!target) return;
    if (target.type !== CanvasElementTypeEnum.ROOT && !isParentElement(target as CanvasInnerElement)) return;
    index = (target as CanvasRootElement | CanvasParentElement).children.length;
  } else {
    /** before / after：插入到目标元素前/后 */
    const dropId = dropNode.data.id as string;
    targetParentId = canvasStore.getParentElementId(dropId) ?? rootId.value;
    const parent = canvasStore.getElementById(targetParentId);
    if (!parent) return;
    const dropIndex = getElementIndex(dropId, parent as CanvasRootElement | CanvasParentElement);
    if (dropIndex < 0) return;
    index = dropType === 'after' ? dropIndex + 1 : dropIndex;
  }

  canvasStore.moveElement(id, targetParentId, index);
  /** 拖入容器内部时自动展开目标节点，让用户看到落点反馈 */
  if (dropType === 'inner' && !expandedKeys.value.includes(targetParentId)) {
    expandedKeys.value.push(targetParentId);
  }
}
</script>

<style scoped lang="less">
.comp-layers-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.comp-layers-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.comp-layer-node {
  display: flex;
  align-items: center;
  flex: 1;
  align-self: stretch;
  padding: 6px 8px 6px 0;

  &.is-hidden {
    opacity: 0.5;
  }

  &-visibility {
    display: flex;
    align-items: center;
    margin-right: 4px;
    color: var(--editor-text-tertiary);
    cursor: pointer;

    &:hover {
      color: var(--editor-text-secondary);
    }
  }

  &-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &-delete {
    margin-left: 4px;
    color: var(--editor-text-tertiary);
    cursor: pointer;

    &:hover {
      color: var(--editor-text-secondary);
    }
  }
}
</style>
