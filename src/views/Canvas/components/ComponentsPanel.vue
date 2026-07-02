<!-- ? 组件库面板 -->
<template>
  <div class="components-panel">
    <a-collapse v-model:activeKey="activeKeys" ghost accordion>
      <a-collapse-panel
        v-for="group in componentGroups"
        :key="group.key"
        :header="group.header"
      >
        <div class="components-grid">
          <div
            class="component-item"
            v-for="comp in group.components"
            :key="comp"
            :ref="(el) => bindCreateConnector(el as HTMLElement, comp)"
            :data-element-type="comp"
          >
            <component :is="CanvasElementIconMap[comp]" class="component-item-icon" />
            <span>{{ CanvasElementLabelMap[comp] }}</span>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, type Component } from 'vue'
import { CanvasElementLabelMap, CanvasElementTypeEnum } from '@/constants/home';
import { dragEngine } from '../drag/DragEngine';
import { CanvasInnerElementTypeEnum, ComponentGroup } from '../types';
import {
  AlignLeftOutlined,
  AppstoreOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  BorderBottomOutlined,
  BorderHorizontalOutlined,
  BorderOuterOutlined,
  BorderOutlined,
  BorderRightOutlined,
  BorderTopOutlined,
  BorderVerticleOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  ColumnHeightOutlined,
  ColumnWidthOutlined,
  EditOutlined,
  FileTextOutlined,
  FontSizeOutlined,
  FormOutlined,
  HighlightOutlined,
  LayoutOutlined,
  LinkOutlined,
  OrderedListOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  ProfileOutlined,
  ReadOutlined,
  RightOutlined,
  SoundOutlined,
  TableOutlined,
  TagOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons-vue';

defineOptions({
  name: 'ComponentsPanel',
});

/** 画布元素图标映射 */
const CanvasElementIconMap: Record<CanvasElementTypeEnum, Component> = {
  [CanvasElementTypeEnum.CONTAINER]: BorderOuterOutlined,
  [CanvasElementTypeEnum.SPAN]: FontSizeOutlined,
  [CanvasElementTypeEnum.TEXT]: FileTextOutlined,
  [CanvasElementTypeEnum.PARAGRAPH]: AlignLeftOutlined,
  [CanvasElementTypeEnum.LINK]: LinkOutlined,
  [CanvasElementTypeEnum.BUTTON]: AppstoreOutlined,
  [CanvasElementTypeEnum.LABEL]: TagOutlined,
  [CanvasElementTypeEnum.FORM]: FormOutlined,
  [CanvasElementTypeEnum.INPUT]: EditOutlined,
  [CanvasElementTypeEnum.TEXTAREA]: ProfileOutlined,
  [CanvasElementTypeEnum.RADIO]: CheckCircleOutlined,
  [CanvasElementTypeEnum.CHECKBOX]: CheckSquareOutlined,
  [CanvasElementTypeEnum.IMAGE]: PictureOutlined,
  [CanvasElementTypeEnum.VIDEO]: PlayCircleOutlined,
  [CanvasElementTypeEnum.AUDIO]: SoundOutlined,
  [CanvasElementTypeEnum.UNORDERED_LIST]: UnorderedListOutlined,
  [CanvasElementTypeEnum.ORDERED_LIST]: OrderedListOutlined,
  [CanvasElementTypeEnum.LIST_ITEM]: RightOutlined,
  [CanvasElementTypeEnum.TABLE]: TableOutlined,
  [CanvasElementTypeEnum.TABLE_HEAD]: ArrowUpOutlined,
  [CanvasElementTypeEnum.TABLE_BODY]: BorderHorizontalOutlined,
  [CanvasElementTypeEnum.TABLE_FOOT]: ArrowDownOutlined,
  [CanvasElementTypeEnum.TABLE_ROW]: ColumnHeightOutlined,
  [CanvasElementTypeEnum.TABLE_DATA]: BorderOutlined,
  [CanvasElementTypeEnum.TABLE_HEADER_CELL]: HighlightOutlined,
  [CanvasElementTypeEnum.TABLE_CAPTION]: TagOutlined,
  [CanvasElementTypeEnum.TABLE_COL_GROUP]: ColumnWidthOutlined,
  [CanvasElementTypeEnum.TABLE_COL]: BorderVerticleOutlined,
  [CanvasElementTypeEnum.HEADER]: BorderTopOutlined,
  [CanvasElementTypeEnum.FOOTER]: BorderBottomOutlined,
  [CanvasElementTypeEnum.ARTICLE]: ReadOutlined,
  [CanvasElementTypeEnum.SECTION]: LayoutOutlined,
  [CanvasElementTypeEnum.ASIDE]: BorderRightOutlined,
  [CanvasElementTypeEnum.HEADING_1]: FontSizeOutlined,
  [CanvasElementTypeEnum.HEADING_2]: FontSizeOutlined,
  [CanvasElementTypeEnum.HEADING_3]: FontSizeOutlined,
  [CanvasElementTypeEnum.HEADING_4]: FontSizeOutlined,
  [CanvasElementTypeEnum.HEADING_5]: FontSizeOutlined,
  [CanvasElementTypeEnum.HEADING_6]: FontSizeOutlined,
  [CanvasElementTypeEnum.ROOT]: BorderOuterOutlined,
};

/** 当前展开的折叠面板 */
const activeKeys = ref<string>('basic');

/** 组件分组列表 */
const componentGroups: ComponentGroup[] = [
  {
    key: 'basic',
    header: 'Basic',
    components: [
      CanvasElementTypeEnum.CONTAINER,
      CanvasElementTypeEnum.SPAN,
      CanvasElementTypeEnum.TEXT,
      CanvasElementTypeEnum.PARAGRAPH,
      CanvasElementTypeEnum.LINK,
      CanvasElementTypeEnum.BUTTON,
      CanvasElementTypeEnum.LABEL,
    ],
  },
  {
    key: 'form',
    header: 'Form',
    components: [
      CanvasElementTypeEnum.FORM,
      CanvasElementTypeEnum.INPUT,
      CanvasElementTypeEnum.TEXTAREA,
      CanvasElementTypeEnum.RADIO,
      CanvasElementTypeEnum.CHECKBOX,
    ],
  },
  {
    key: 'media',
    header: 'Media',
    components: [
      CanvasElementTypeEnum.IMAGE,
      CanvasElementTypeEnum.VIDEO,
      CanvasElementTypeEnum.AUDIO,
    ],
  },
  {
    key: 'list',
    header: 'List',
    components: [
      CanvasElementTypeEnum.UNORDERED_LIST,
      CanvasElementTypeEnum.ORDERED_LIST,
      CanvasElementTypeEnum.LIST_ITEM,
    ],
  },
  {
    key: 'table',
    header: 'Table',
    components: [
      CanvasElementTypeEnum.TABLE,
      CanvasElementTypeEnum.TABLE_HEAD,
      CanvasElementTypeEnum.TABLE_BODY,
      CanvasElementTypeEnum.TABLE_FOOT,
      CanvasElementTypeEnum.TABLE_ROW,
      CanvasElementTypeEnum.TABLE_DATA,
      CanvasElementTypeEnum.TABLE_HEADER_CELL,
      CanvasElementTypeEnum.TABLE_CAPTION,
      CanvasElementTypeEnum.TABLE_COL_GROUP,
      CanvasElementTypeEnum.TABLE_COL,
    ],
  },
  {
    key: 'semantic',
    header: 'Semantic',
    components: [
      CanvasElementTypeEnum.HEADER,
      CanvasElementTypeEnum.FOOTER,
      CanvasElementTypeEnum.ARTICLE,
      CanvasElementTypeEnum.SECTION,
      CanvasElementTypeEnum.ASIDE,
      CanvasElementTypeEnum.HEADING_1,
      CanvasElementTypeEnum.HEADING_2,
      CanvasElementTypeEnum.HEADING_3,
      CanvasElementTypeEnum.HEADING_4,
      CanvasElementTypeEnum.HEADING_5,
      CanvasElementTypeEnum.HEADING_6,
    ],
  },
];

/** 每个组件项的解绑函数映射 */
const unbindMap = new Map<CanvasElementTypeEnum, () => void>();

/** v-ref 回调：绑定 connectCreate */
function bindCreateConnector(el: HTMLElement | null, type: CanvasInnerElementTypeEnum) {
  if (!el) {
    /** 元素卸载时清理 */
    unbindMap.get(type)?.();
    unbindMap.delete(type);
    return;
  }

  /** 已绑定则跳过（避免重复绑定） */
  if (unbindMap.has(type)) return;

  const unbind = dragEngine.connectCreate(el, type);
  unbindMap.set(type, unbind);
}

onUnmounted(() => {
  unbindMap.forEach((unbind) => unbind());
  unbindMap.clear();
});
</script>

<style scoped lang="less">
.components-panel {
  width: 100%;
  height: 100%;
  overflow-y: auto;

  :deep(.ant-collapse) {
    color: var(--editor-text-secondary);
  }

  :deep(.ant-collapse-header) {
    color: var(--editor-text) !important;
    font-size: 13px;
    padding: 10px 12px !important;
  }

  :deep(.ant-collapse-content-box) {
    padding: 0 12px 12px !important;
  }

  :deep(.ant-collapse-expand-icon) {
    color: var(--editor-text-secondary);
  }
}

.components-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 8px;
  background-color: var(--editor-bg-item);
  border-radius: var(--editor-radius);
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
  font-size: 11px;
  text-align: center;
  color: var(--editor-text);
  line-height: 1.3;
  user-select: none;
  border: 1px solid var(--editor-border);

  &:hover {
    background-color: var(--editor-bg-item-hover);
    border-color: var(--editor-border-strong);
  }
}

.component-item-icon {
  font-size: 20px;
  color: var(--editor-text-secondary);
}
</style>