<!-- ? 组件库面板 -->
<template>
  <div class="components-panel">
    <a-collapse v-model:activeKey="activeKeys" ghost>
      <a-collapse-panel key="basic" header="Basic">
        <div class="components-grid">
          <div
            class="component-item"
            v-for="comp in basicComponents"
            :key="comp"
            draggable="true"
            @dragstart="handleDragStart($event, comp)"
          >{{ CanvasElementLabelMap[comp] }}</div>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CanvasElementLabelMap, CanvasElementTypeEnum } from '@/constants/home';

defineOptions({
  name: 'ComponentsPanel',
})

/** 当前展开的折叠面板 */
const activeKeys = ref<string[]>(['basic'])

/** 基础组件元素列表 */
const basicComponents = ref<CanvasElementTypeEnum[]>([CanvasElementTypeEnum.BUTTON, CanvasElementTypeEnum.CONTAINER, CanvasElementTypeEnum.IMAGE, CanvasElementTypeEnum.LINK, CanvasElementTypeEnum.PARAGRAPH]);

/** 拖拽开始：将元素类型写入 dataTransfer */
function handleDragStart(event: DragEvent, type: CanvasElementTypeEnum) {
  event.dataTransfer!.setData('canvas/element-type', String(type));
  event.dataTransfer!.effectAllowed = 'copy';
}
</script>

<style scoped lang="less">
.components-panel {
  width: 100%;
  height: 100%;
  overflow-y: auto;

  :deep(.ant-collapse) {
    color: #ccc;
  }

  :deep(.ant-collapse-header) {
    color: #ccc !important;
    font-size: 13px;
    padding: 10px 12px !important;
  }

  :deep(.ant-collapse-content-box) {
    padding: 0 12px 12px !important;
  }

  :deep(.ant-collapse-expand-icon) {
    color: #ccc;
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
  background-color: #2e2b2e;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 11px;
  text-align: center;
  color: #fff;
  line-height: 1.3;
  user-select: none;

  &:hover {
    background-color: #3d383d;
  }
}
</style>