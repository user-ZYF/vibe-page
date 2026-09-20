<!-- ? 尺寸配置面板 -->
<template>
  <div>
    <!-- Width & Height -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Width</div>
        <div class="style-config-input-group">
          <me-input v-model="model.width" class="style-config-input" placeholder="auto" @blur="handleUnitBlur('width', 'widthUnit')" />
          <me-select v-model="model.widthUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
        </div>
      </div>
      <div class="style-config-col">
        <div class="style-config-label">Height</div>
        <div class="style-config-input-group">
          <me-input v-model="model.height" class="style-config-input" placeholder="auto" @blur="handleUnitBlur('height', 'heightUnit')" />
          <me-select v-model="model.heightUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
        </div>
      </div>
    </div>

    <!-- Max width & Min width -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Max width</div>
        <div class="style-config-input-group">
          <me-input v-model="model.maxWidth" class="style-config-input" placeholder="none" @blur="handleUnitBlur('maxWidth', 'maxWidthUnit')" />
          <me-select v-model="model.maxWidthUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
        </div>
      </div>
      <div class="style-config-col">
        <div class="style-config-label">Min width</div>
        <div class="style-config-input-group">
          <me-input v-model="model.minWidth" class="style-config-input" placeholder="0" @blur="handleUnitBlur('minWidth', 'minWidthUnit')" />
          <me-select v-model="model.minWidthUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
        </div>
      </div>
    </div>

    <!-- Max height & Min height -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Max height</div>
        <div class="style-config-input-group">
          <me-input v-model="model.maxHeight" class="style-config-input" placeholder="none" @blur="handleUnitBlur('maxHeight', 'maxHeightUnit')" />
          <me-select v-model="model.maxHeightUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
        </div>
      </div>
      <div class="style-config-col">
        <div class="style-config-label">Min height</div>
        <div class="style-config-input-group">
          <me-input v-model="model.minHeight" class="style-config-input" placeholder="0" @blur="handleUnitBlur('minHeight', 'minHeightUnit')" />
          <me-select v-model="model.minHeightUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
        </div>
      </div>
    </div>

    <!-- Padding -->
    <div class="style-config-label style-config-label--padding">Padding</div>
    <div class="style-config-box">
      <!-- Padding Top & Right -->
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">Top</div>
          <div class="style-config-input-group">
            <a-input-number v-model:value="model.paddingTop" class="style-config-input-number" placeholder="0" @blur="handleUnitBlur('paddingTop', 'paddingTopUnit')" />
            <me-select v-model="model.paddingTopUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
          </div>
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Right</div>
          <div class="style-config-input-group">
            <a-input-number v-model:value="model.paddingRight" class="style-config-input-number" placeholder="0" @blur="handleUnitBlur('paddingRight', 'paddingRightUnit')" />
            <me-select v-model="model.paddingRightUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
          </div>
        </div>
      </div>
      <!-- Padding Bottom & Left -->
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">Bottom</div>
          <div class="style-config-input-group">
            <a-input-number v-model:value="model.paddingBottom" class="style-config-input-number" placeholder="0" @blur="handleUnitBlur('paddingBottom', 'paddingBottomUnit')" />
            <me-select v-model="model.paddingBottomUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
          </div>
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Left</div>
          <div class="style-config-input-group">
            <a-input-number v-model:value="model.paddingLeft" class="style-config-input-number" placeholder="0" @blur="handleUnitBlur('paddingLeft', 'paddingLeftUnit')" />
            <me-select v-model="model.paddingLeftUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
          </div>
        </div>
      </div>
    </div>

    <!-- Margin -->
    <div class="style-config-label style-config-label--margin">Margin</div>
    <div class="style-config-box">
      <!-- Margin Top & Right -->
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">Top</div>
          <div class="style-config-input-group">
            <me-input v-model="model.marginTop" class="style-config-input" placeholder="auto" @blur="handleMarginBlur('marginTop', 'marginTopUnit')" />
              <me-select v-model="model.marginTopUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
          </div>
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Right</div>
          <div class="style-config-input-group">
            <me-input v-model="model.marginRight" class="style-config-input" placeholder="auto" @blur="handleMarginBlur('marginRight', 'marginRightUnit')" />
              <me-select v-model="model.marginRightUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
          </div>
        </div>
      </div>
      <!-- Margin Bottom & Left -->
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">Bottom</div>
          <div class="style-config-input-group">
            <me-input v-model="model.marginBottom" class="style-config-input" placeholder="auto" @blur="handleMarginBlur('marginBottom', 'marginBottomUnit')" />
              <me-select v-model="model.marginBottomUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
          </div>
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Left</div>
          <div class="style-config-input-group">
            <me-input v-model="model.marginLeft" class="style-config-input" placeholder="auto" @blur="handleMarginBlur('marginLeft', 'marginLeftUnit')" />
              <me-select v-model="model.marginLeftUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { MeInput, MeSelect } from '@zyf_dsb/me-ui';
import { SIZE_UNIT_OPTIONS } from '@/constants/style';
import { useUnitAutoFill, useAutoUnitBlur } from '@/composables/useUnitAutoFill';
import type { SizeConfig } from '@/views/Canvas/types';

defineOptions({
  name: 'SizeConfig',
});

/** 尺寸配置数据 */
const model = defineModel<SizeConfig>({ required: true });

/** 各尺寸值失焦时自动填充单位 */
const handleUnitBlur = useUnitAutoFill(model);

/** margin 值失焦时校验：非数值非 auto 则转为 auto，auto 时清除单位 */
const handleMarginBlur = useAutoUnitBlur(model);
</script>

<style scoped lang="less">
@import './style-config.less';
</style>
