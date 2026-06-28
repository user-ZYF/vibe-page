<!-- ? 常规配置面板 -->
<template>
  <div>
    <!-- 浮动配置 -->
    <div class="style-config-section">
      <div class="style-config-label">Float</div>
      <a-radio-group v-model:value="model.float" button-style="solid" size="small" class="style-config-radio-group">
        <a-radio-button :value="FloatStyleEnum.NONE"><CloseOutlined /></a-radio-button>
        <a-radio-button :value="FloatStyleEnum.LEFT"><MenuFoldOutlined /></a-radio-button>
        <a-radio-button :value="FloatStyleEnum.RIGHT"><MenuUnfoldOutlined /></a-radio-button>
      </a-radio-group>
    </div>

    <!-- Display & Position -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Display</div>
        <a-select v-model:value="model.display" size="small" class="style-config-select" :options="DISPLAY_OPTIONS" placeholder="block" />
      </div>
      <div class="style-config-col">
        <div class="style-config-label">Position</div>
        <a-select v-model:value="model.position" size="small" class="style-config-select" :options="POSITION_OPTIONS" placeholder="static" />
      </div>
    </div>

    <!-- Overflow -->
    <div class="style-config-section">
      <div class="style-config-label">Overflow</div>
      <a-select v-model:value="model.overflow" size="small" class="style-config-select" :options="OVERFLOW_OPTIONS" placeholder="visible" />
    </div>

    <!-- Top & Right -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Top</div>
        <div class="style-config-input-group">
          <a-input v-model:value="model.top" size="small" class="style-config-input" placeholder="auto" />
          <span class="style-config-separator">-</span>
          <a-select v-model:value="model.topUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" />
        </div>
      </div>
      <div class="style-config-col">
        <div class="style-config-label">Right</div>
        <div class="style-config-input-group">
          <a-input v-model:value="model.right" size="small" class="style-config-input" placeholder="auto" />
          <span class="style-config-separator">-</span>
          <a-select v-model:value="model.rightUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" />
        </div>
      </div>
    </div>

    <!-- Left & Bottom -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Left</div>
        <div class="style-config-input-group">
          <a-input v-model:value="model.left" size="small" class="style-config-input" placeholder="auto" />
          <span class="style-config-separator">-</span>
          <a-select v-model:value="model.leftUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" />
        </div>
      </div>
      <div class="style-config-col">
        <div class="style-config-label">Bottom</div>
        <div class="style-config-input-group">
          <a-input v-model:value="model.bottom" size="small" class="style-config-input" placeholder="auto" />
          <span class="style-config-separator">-</span>
          <a-select v-model:value="model.bottomUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { CloseOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue';
import { DISPLAY_OPTIONS, FloatStyleEnum, OVERFLOW_OPTIONS, POSITION_OPTIONS, SIZE_UNIT_OPTIONS } from '@/constants/style';
import type { GeneralConfig } from '@/views/Canvas/types';

defineOptions({
  name: 'GeneralConfig',
});

/** 常规配置数据 */
const model = defineModel<GeneralConfig>({ required: true });
</script>

<style scoped lang="less">
@import './style-config.less';
</style>
