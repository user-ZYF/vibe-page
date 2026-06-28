<!-- ? 弹性盒配置面板 -->
<template>
  <div>
    <!-- Direction -->
    <div class="style-config-section">
      <div class="style-config-label">Direction</div>
      <a-radio-group v-model:value="model.flexDirection" button-style="solid" size="small" class="style-config-radio-group">
        <a-radio-button :value="FlexDirectionEnum.ROW" title="row"><LayoutOutlined /></a-radio-button>
        <a-radio-button :value="FlexDirectionEnum.ROW_REVERSE" title="row-reverse"><LayoutOutlined class="icon-flip-x" /></a-radio-button>
        <a-radio-button :value="FlexDirectionEnum.COLUMN" title="column"><ColumnHeightOutlined /></a-radio-button>
        <a-radio-button :value="FlexDirectionEnum.COLUMN_REVERSE" title="column-reverse"><ColumnHeightOutlined class="icon-flip-y" /></a-radio-button>
      </a-radio-group>
    </div>

    <!-- Justify -->
    <div class="style-config-section">
      <div class="style-config-label">Justify</div>
      <a-radio-group v-model:value="model.justifyContent" button-style="solid" size="small" class="style-config-radio-group">
        <a-radio-button :value="JustifyContentEnum.FLEX_START" title="flex-start"><VerticalLeftOutlined /></a-radio-button>
        <a-radio-button :value="JustifyContentEnum.CENTER" title="center"><ColumnWidthOutlined /></a-radio-button>
        <a-radio-button :value="JustifyContentEnum.FLEX_END" title="flex-end"><VerticalRightOutlined /></a-radio-button>
        <a-radio-button :value="JustifyContentEnum.SPACE_BETWEEN" title="space-between"><SplitCellsOutlined /></a-radio-button>
        <a-radio-button :value="JustifyContentEnum.SPACE_AROUND" title="space-around"><ExpandOutlined /></a-radio-button>
      </a-radio-group>
    </div>

    <!-- Align -->
    <div class="style-config-section">
      <div class="style-config-label">Align</div>
      <a-radio-group v-model:value="model.alignItems" button-style="solid" size="small" class="style-config-radio-group">
        <a-radio-button :value="AlignItemsEnum.FLEX_START" title="flex-start"><VerticalAlignTopOutlined /></a-radio-button>
        <a-radio-button :value="AlignItemsEnum.CENTER" title="center"><VerticalAlignMiddleOutlined /></a-radio-button>
        <a-radio-button :value="AlignItemsEnum.FLEX_END" title="flex-end"><VerticalAlignBottomOutlined /></a-radio-button>
        <a-radio-button :value="AlignItemsEnum.STRETCH" title="stretch"><ExpandAltOutlined /></a-radio-button>
      </a-radio-group>
    </div>

    <!-- Order -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Order</div>
        <a-input-number v-model:value="model.order" size="small" class="style-config-input-number" placeholder="0" />
      </div>
    </div>

    <!-- Flex (Grow / Shrink / Basis) -->
    <div class="style-config-label style-config-label--margin">Flex</div>
    <div class="style-config-box">
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">Grow</div>
          <a-input-number v-model:value="model.flexGrow" size="small" class="style-config-input-number" :min="0" placeholder="0" />
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Shrink</div>
          <a-input-number v-model:value="model.flexShrink" size="small" class="style-config-input-number" :min="0" placeholder="1" />
        </div>
      </div>
      <div class="style-config-section">
        <div class="style-config-label">Basis</div>
        <div class="style-config-input-group style-config-input-group--basis">
          <a-input v-model:value="model.flexBasis" size="small" class="style-config-input" placeholder="auto" @blur="handleBasisBlur('flexBasis', 'flexBasisUnit')" />
          <span class="style-config-separator">-</span>
          <a-select v-model:value="model.flexBasisUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" allow-clear />
        </div>
      </div>
    </div>

    <!-- Align self -->
    <div class="style-config-section style-config-section--mt">
      <div class="style-config-label">Align Self</div>
      <a-radio-group v-model:value="model.alignSelf" button-style="solid" size="small" class="style-config-radio-group">
        <a-radio-button :value="AlignSelfEnum.AUTO">Auto</a-radio-button>
        <a-radio-button :value="AlignSelfEnum.FLEX_START" title="flex-start"><VerticalAlignTopOutlined /></a-radio-button>
        <a-radio-button :value="AlignSelfEnum.CENTER" title="center"><VerticalAlignMiddleOutlined /></a-radio-button>
        <a-radio-button :value="AlignSelfEnum.FLEX_END" title="flex-end"><VerticalAlignBottomOutlined /></a-radio-button>
        <a-radio-button :value="AlignSelfEnum.STRETCH" title="stretch"><ExpandAltOutlined /></a-radio-button>
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
import { SIZE_UNIT_OPTIONS, FlexDirectionEnum, JustifyContentEnum, AlignItemsEnum, AlignSelfEnum } from '@/constants/style';
import { useAutoUnitBlur } from '@/composables/useUnitAutoFill';
import type { FlexConfig } from '@/views/Canvas/types';

defineOptions({
  name: 'FlexConfig',
});

/** 布局配置数据 */
const model = defineModel<FlexConfig>({ required: true });

/** flex-basis 值失焦时校验：非数值非 auto 则转为 auto，auto 时清除单位 */
const handleBasisBlur = useAutoUnitBlur(model);
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
