<!-- ? 弹性盒配置面板 -->
<template>
  <div>
    <!-- Direction -->
    <div class="style-config-section">
      <div class="style-config-label">Direction</div>
      <me-radio-group v-model="model.flexDirection" class="style-config-radio-group">
        <me-radio-button :value="FlexDirectionEnum.ROW" title="row"><LayoutOutlined /></me-radio-button>
        <me-radio-button :value="FlexDirectionEnum.ROW_REVERSE" title="row-reverse"><LayoutOutlined class="icon-flip-x" /></me-radio-button>
        <me-radio-button :value="FlexDirectionEnum.COLUMN" title="column"><ColumnHeightOutlined /></me-radio-button>
        <me-radio-button :value="FlexDirectionEnum.COLUMN_REVERSE" title="column-reverse"><ColumnHeightOutlined class="icon-flip-y" /></me-radio-button>
      </me-radio-group>
    </div>

    <!-- Justify -->
    <div class="style-config-section">
      <div class="style-config-label">Justify</div>
      <me-radio-group v-model="model.justifyContent" class="style-config-radio-group">
        <me-radio-button :value="JustifyContentEnum.FLEX_START" title="flex-start"><VerticalLeftOutlined /></me-radio-button>
        <me-radio-button :value="JustifyContentEnum.CENTER" title="center"><ColumnWidthOutlined /></me-radio-button>
        <me-radio-button :value="JustifyContentEnum.FLEX_END" title="flex-end"><VerticalRightOutlined /></me-radio-button>
        <me-radio-button :value="JustifyContentEnum.SPACE_BETWEEN" title="space-between"><SplitCellsOutlined /></me-radio-button>
        <me-radio-button :value="JustifyContentEnum.SPACE_AROUND" title="space-around"><ExpandOutlined /></me-radio-button>
      </me-radio-group>
    </div>

    <!-- Align -->
    <div class="style-config-section">
      <div class="style-config-label">Align</div>
      <me-radio-group v-model="model.alignItems" class="style-config-radio-group">
        <me-radio-button :value="AlignItemsEnum.FLEX_START" title="flex-start"><VerticalAlignTopOutlined /></me-radio-button>
        <me-radio-button :value="AlignItemsEnum.CENTER" title="center"><VerticalAlignMiddleOutlined /></me-radio-button>
        <me-radio-button :value="AlignItemsEnum.FLEX_END" title="flex-end"><VerticalAlignBottomOutlined /></me-radio-button>
        <me-radio-button :value="AlignItemsEnum.STRETCH" title="stretch"><ExpandAltOutlined /></me-radio-button>
      </me-radio-group>
    </div>

    <!-- Order -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Order</div>
        <a-input-number v-model:value="model.order" class="style-config-input-number" placeholder="0" />
      </div>
    </div>

    <!-- Flex (Grow / Shrink / Basis) -->
    <div class="style-config-label style-config-label--margin">Flex</div>
    <div class="style-config-box">
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">Grow</div>
          <a-input-number v-model:value="model.flexGrow" class="style-config-input-number" :min="0" placeholder="0" />
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Shrink</div>
          <a-input-number v-model:value="model.flexShrink" class="style-config-input-number" :min="0" placeholder="1" />
        </div>
      </div>
      <div class="style-config-section">
        <div class="style-config-label">Basis</div>
        <div class="style-config-input-group style-config-input-group--basis">
          <me-input v-model="model.flexBasis" class="style-config-input" placeholder="auto" @blur="handleBasisBlur('flexBasis', 'flexBasisUnit')" />
          <me-select v-model="model.flexBasisUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
        </div>
      </div>
    </div>

    <!-- Align self -->
    <div class="style-config-section style-config-section--mt">
      <div class="style-config-label">Align Self</div>
      <me-radio-group v-model="model.alignSelf" class="style-config-radio-group">
        <me-radio-button :value="AlignSelfEnum.AUTO">Auto</me-radio-button>
        <me-radio-button :value="AlignSelfEnum.FLEX_START" title="flex-start"><VerticalAlignTopOutlined /></me-radio-button>
        <me-radio-button :value="AlignSelfEnum.CENTER" title="center"><VerticalAlignMiddleOutlined /></me-radio-button>
        <me-radio-button :value="AlignSelfEnum.FLEX_END" title="flex-end"><VerticalAlignBottomOutlined /></me-radio-button>
        <me-radio-button :value="AlignSelfEnum.STRETCH" title="stretch"><ExpandAltOutlined /></me-radio-button>
      </me-radio-group>
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
import { MeInput, MeRadioButton, MeRadioGroup, MeSelect } from '@zyf_dsb/me-ui';
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
