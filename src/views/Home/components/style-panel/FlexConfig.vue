<!-- ? 布局（Flex）配置面板 -->
<template>
  <div>
    <!-- Flex Container & Flex Parent -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Flex Container</div>
        <a-select v-model:value="model.flexContainer" size="small" class="style-config-select">
          <a-select-option v-for="opt in FLEX_CONTAINER_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </a-select-option>
        </a-select>
      </div>
      <div class="style-config-col">
        <div class="style-config-label">Flex Parent</div>
        <a-input-number v-model:value="model.flexParent" size="small" class="style-config-input-number" />
      </div>
    </div>

    <!-- Direction -->
    <div class="style-config-section">
      <div class="style-config-label">Direction</div>
      <a-radio-group v-model:value="model.flexDirection" button-style="solid" size="small" class="style-config-radio-group">
        <a-tooltip title="row">
          <a-radio-button value="row"><LayoutOutlined /></a-radio-button>
        </a-tooltip>
        <a-tooltip title="row-reverse">
          <a-radio-button value="row-reverse"><LayoutOutlined class="icon-flip-x" /></a-radio-button>
        </a-tooltip>
        <a-tooltip title="column">
          <a-radio-button value="column"><ColumnHeightOutlined /></a-radio-button>
        </a-tooltip>
        <a-tooltip title="column-reverse">
          <a-radio-button value="column-reverse"><ColumnHeightOutlined class="icon-flip-y" /></a-radio-button>
        </a-tooltip>
      </a-radio-group>
    </div>

    <!-- Justify -->
    <div class="style-config-section">
      <div class="style-config-label">Justify</div>
      <a-radio-group v-model:value="model.justifyContent" button-style="solid" size="small" class="style-config-radio-group">
        <a-tooltip title="flex-start">
          <a-radio-button value="flex-start"><VerticalLeftOutlined /></a-radio-button>
        </a-tooltip>
        <a-tooltip title="center">
          <a-radio-button value="center"><ColumnWidthOutlined /></a-radio-button>
        </a-tooltip>
        <a-tooltip title="flex-end">
          <a-radio-button value="flex-end"><VerticalRightOutlined /></a-radio-button>
        </a-tooltip>
        <a-tooltip title="space-between">
          <a-radio-button value="space-between"><SplitCellsOutlined /></a-radio-button>
        </a-tooltip>
        <a-tooltip title="space-around">
          <a-radio-button value="space-around"><ExpandOutlined /></a-radio-button>
        </a-tooltip>
      </a-radio-group>
    </div>

    <!-- Align -->
    <div class="style-config-section">
      <div class="style-config-label">Align</div>
      <a-radio-group v-model:value="model.alignItems" button-style="solid" size="small" class="style-config-radio-group">
        <a-tooltip title="flex-start">
          <a-radio-button value="flex-start"><VerticalAlignTopOutlined /></a-radio-button>
        </a-tooltip>
        <a-tooltip title="center">
          <a-radio-button value="center"><VerticalAlignMiddleOutlined /></a-radio-button>
        </a-tooltip>
        <a-tooltip title="flex-end">
          <a-radio-button value="flex-end"><VerticalAlignBottomOutlined /></a-radio-button>
        </a-tooltip>
        <a-tooltip title="stretch">
          <a-radio-button value="stretch"><ExpandAltOutlined /></a-radio-button>
        </a-tooltip>
      </a-radio-group>
    </div>

    <!-- Flex Children & Order -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Flex Children</div>
        <a-input-number v-model:value="model.flexChildren" size="small" class="style-config-input-number" />
      </div>
      <div class="style-config-col">
        <div class="style-config-label">Order</div>
        <a-input-number v-model:value="model.order" size="small" class="style-config-input-number" />
      </div>
    </div>

    <!-- Flex (Grow / Shrink / Basis) -->
    <div class="style-config-label style-config-label--margin">Flex</div>
    <div class="style-config-box">
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">Grow</div>
          <a-input-number v-model:value="model.flexGrow" size="small" class="style-config-input-number" :min="0" />
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Shrink</div>
          <a-input-number v-model:value="model.flexShrink" size="small" class="style-config-input-number" :min="0" />
        </div>
      </div>
      <div class="style-config-section">
        <div class="style-config-label">Basis</div>
        <div class="style-config-input-group style-config-input-group--basis">
          <a-input v-model:value="model.flexBasis" size="small" class="style-config-input" />
          <span class="style-config-separator">-</span>
          <a-select v-model:value="model.flexBasisUnit" size="small" class="style-config-unit">
            <a-select-option v-for="opt in SIZE_UNIT_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.value }}</a-select-option>
          </a-select>
        </div>
      </div>
    </div>

    <!-- Align self -->
    <div class="style-config-section style-config-section--mt">
      <div class="style-config-label">Align</div>
      <a-radio-group v-model:value="model.alignSelf" button-style="solid" size="small" class="style-config-radio-group">
        <a-radio-button value="auto">Auto</a-radio-button>
        <a-tooltip title="flex-start">
          <a-radio-button value="flex-start"><VerticalAlignTopOutlined /></a-radio-button>
        </a-tooltip>
        <a-tooltip title="center">
          <a-radio-button value="center"><VerticalAlignMiddleOutlined /></a-radio-button>
        </a-tooltip>
        <a-tooltip title="flex-end">
          <a-radio-button value="flex-end"><VerticalAlignBottomOutlined /></a-radio-button>
        </a-tooltip>
        <a-tooltip title="stretch">
          <a-radio-button value="stretch"><ExpandAltOutlined /></a-radio-button>
        </a-tooltip>
      </a-radio-group>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  LayoutOutlined,
  ColumnHeightOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined,
  ColumnWidthOutlined,
  SplitCellsOutlined,
  ExpandOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignBottomOutlined,
  ExpandAltOutlined,
} from '@ant-design/icons-vue';
import { SIZE_UNIT_OPTIONS, FLEX_CONTAINER_OPTIONS } from '@/constants/home';
import type { FlexConfig } from '@/views/Home/types';

defineOptions({
  name: 'FlexConfig',
});

/** 布局配置数据 */
const model = defineModel<FlexConfig>({ required: true });
</script>

<style scoped lang="less">
@import './style-config.less';

.icon-flip-x {
  transform: scaleX(-1);
}

.icon-flip-y {
  transform: scaleY(-1);
}

.style-config-input-group--basis {
  width: 60%;
}

.style-config-section--mt {
  margin-top: 12px;
}
</style>
