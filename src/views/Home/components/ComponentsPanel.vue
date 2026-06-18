<!-- ? 组件库面板 -->
<template>
  <div class="components-panel">
    <a-collapse v-model:activeKey="activeKeys" ghost>
      <a-collapse-panel key="basic" header="Basic">
        <div class="components-grid">
          <!-- 布局组件 -->
          <div class="component-item" v-for="item in basicComponents" :key="item.label">
            <div class="component-icon">
              <component :is="item.icon" v-if="item.icon" :class="item.iconClass" />
              <div v-else-if="item.layout" :class="['layout-icon', item.layout]">
                <div v-if="item.layout === 'three-columns'" class="col-mid"></div>
              </div>
            </div>
            <div class="component-label">{{ item.label }}</div>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  FontColorsOutlined,
  LinkOutlined,
  FileImageOutlined,
  PlaySquareOutlined,
  EnvironmentOutlined,
  BlockOutlined,
  MessageOutlined,
  MenuOutlined,
} from '@ant-design/icons-vue'

defineOptions({
  name: 'ComponentsPanel',
})

/** 当前展开的折叠面板 */
const activeKeys = ref<string[]>(['basic'])

interface ComponentItem {
  /** 组件标签名 */
  label: string;
  /** 布局类名 */
  layout?: string;
  /** 图标组件 */
  icon?: object;
  /** 图标额外 class */
  iconClass?: string;
}

/** Basic 分类组件列表 */
const basicComponents: ComponentItem[] = [
  { label: '1 Column', layout: 'single-column' },
  { label: '2 Columns', layout: 'two-columns' },
  { label: '3 Columns', layout: 'three-columns' },
  { label: '2 Columns 3/7', layout: 'two-columns-37' },
  { label: 'Text', icon: FontColorsOutlined, iconClass: 'icon-text' },
  { label: 'Link', icon: LinkOutlined },
  { label: 'Image', icon: FileImageOutlined },
  { label: 'Video', icon: PlaySquareOutlined },
  { label: 'Map', icon: EnvironmentOutlined },
  { label: 'Link Block', icon: BlockOutlined },
  { label: 'Quote', icon: MessageOutlined },
  { label: 'Text section', icon: MenuOutlined },
]
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

  &:hover {
    background-color: #3d383d;
  }
}

.component-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #b0a8b0;

  .icon-text {
    color: #e91e8c;
    font-size: 32px;
  }
}

.component-label {
  font-size: 11px;
  text-align: center;
  color: #b0a8b0;
  line-height: 1.3;
}

// 布局图标
.layout-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  gap: 4px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border: 2px solid #b0a8b0;
    border-radius: 3px;
  }
}

.single-column {
  &::after {
    display: none;
  }
}

.two-columns {
  &::before,
  &::after {
    flex: 1;
  }
}

.three-columns {
  gap: 3px;
  position: relative;

  &::before,
  &::after {
    flex: 1;
  }

  .col-mid {
    flex: 1;
    border: 2px solid #b0a8b0;
    border-radius: 3px;
  }
}

.two-columns-37 {
  &::before {
    flex: 3;
  }

  &::after {
    flex: 7;
  }
}
</style>