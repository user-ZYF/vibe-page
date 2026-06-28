<!-- ? 尺寸配置面板 -->
<template>
  <div>
    <!-- Width & Height -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Width</div>
        <div class="style-config-input-group">
          <a-input v-model:value="model.width" size="small" class="style-config-input" placeholder="auto" />
          <span class="style-config-separator">-</span>
          <a-select v-model:value="model.widthUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
        </div>
      </div>
      <div class="style-config-col">
        <div class="style-config-label">Height</div>
        <div class="style-config-input-group">
          <a-input v-model:value="model.height" size="small" class="style-config-input" placeholder="auto" />
          <span class="style-config-separator">-</span>
          <a-select v-model:value="model.heightUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
        </div>
      </div>
    </div>

    <!-- Max width & Min height -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Max width</div>
        <div class="style-config-input-group">
          <a-input v-model:value="model.maxWidth" size="small" class="style-config-input" placeholder="none" />
          <span class="style-config-separator">-</span>
          <a-select v-model:value="model.maxWidthUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
        </div>
      </div>
      <div class="style-config-col">
        <div class="style-config-label">Min height</div>
        <div class="style-config-input-group">
          <a-input v-model:value="model.minHeight" size="small" class="style-config-input" placeholder="0" />
          <span class="style-config-separator">-</span>
          <a-select v-model:value="model.minHeightUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
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
            <a-input-number v-model:value="model.paddingTop" size="small" class="style-config-input-number" placeholder="0" />
            <a-select v-model:value="model.paddingTopUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
          </div>
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Right</div>
          <div class="style-config-input-group">
            <a-input-number v-model:value="model.paddingRight" size="small" class="style-config-input-number" placeholder="0" />
            <a-select v-model:value="model.paddingRightUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
          </div>
        </div>
      </div>
      <!-- Padding Bottom & Left -->
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">Bottom</div>
          <div class="style-config-input-group">
            <a-input-number v-model:value="model.paddingBottom" size="small" class="style-config-input-number" placeholder="0" />
            <a-select v-model:value="model.paddingBottomUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
          </div>
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Left</div>
          <div class="style-config-input-group">
            <a-input-number v-model:value="model.paddingLeft" size="small" class="style-config-input-number" placeholder="0" />
            <a-select v-model:value="model.paddingLeftUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
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
            <a-input-number v-model:value="model.marginTop" size="small" class="style-config-input-number" placeholder="0" />
            <a-select v-model:value="model.marginTopUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
          </div>
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Right</div>
          <div class="style-config-input-group">
            <a-input-number v-model:value="model.marginRight" size="small" class="style-config-input-number" placeholder="0" />
            <a-select v-model:value="model.marginRightUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
          </div>
        </div>
      </div>
      <!-- Margin Bottom & Left -->
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">Bottom</div>
          <div class="style-config-input-group">
            <a-input-number v-model:value="model.marginBottom" size="small" class="style-config-input-number" placeholder="0" />
            <a-select v-model:value="model.marginBottomUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
          </div>
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Left</div>
          <div class="style-config-input-group">
            <a-input-number v-model:value="model.marginLeft" size="small" class="style-config-input-number" placeholder="0" />
            <a-select v-model:value="model.marginLeftUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { SIZE_UNIT_OPTIONS } from '@/constants/style';
import type { SizeConfig } from '@/views/Canvas/types';

defineOptions({
  name: 'SizeConfig',
});

/** 尺寸配置数据 */
const model = defineModel<SizeConfig>({ required: true });
</script>

<style scoped lang="less">
@import './style-config.less';
</style>
