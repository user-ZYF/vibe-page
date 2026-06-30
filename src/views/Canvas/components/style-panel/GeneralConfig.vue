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
        <a-select v-model:value="model.display" size="small" class="style-config-select" :options="displayOptions" placeholder="block" allow-clear />
      </div>
      <div class="style-config-col">
        <div class="style-config-label">Position</div>
        <a-select v-model:value="model.position" size="small" class="style-config-select" :options="POSITION_OPTIONS" placeholder="static" allow-clear />
      </div>
    </div>

    <!-- Overflow -->
    <div class="style-config-section">
      <div class="style-config-label">Overflow</div>
      <a-select v-model:value="model.overflow" size="small" class="style-config-select" :options="OVERFLOW_OPTIONS" placeholder="visible" allow-clear />
    </div>

    <!-- Top & Right -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Top</div>
        <div class="style-config-input-group">
          <a-input v-model:value="model.top" size="small" class="style-config-input" placeholder="auto" @blur="handleUnitBlur('top', 'topUnit')" />
          <span class="style-config-separator">-</span>
          <a-select v-model:value="model.topUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" allow-clear />
        </div>
      </div>
      <div class="style-config-col">
        <div class="style-config-label">Right</div>
        <div class="style-config-input-group">
          <a-input v-model:value="model.right" size="small" class="style-config-input" placeholder="auto" @blur="handleUnitBlur('right', 'rightUnit')" />
          <span class="style-config-separator">-</span>
          <a-select v-model:value="model.rightUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" allow-clear />
        </div>
      </div>
    </div>

    <!-- Left & Bottom -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Left</div>
        <div class="style-config-input-group">
          <a-input v-model:value="model.left" size="small" class="style-config-input" placeholder="auto" @blur="handleUnitBlur('left', 'leftUnit')" />
          <span class="style-config-separator">-</span>
          <a-select v-model:value="model.leftUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" allow-clear />
        </div>
      </div>
      <div class="style-config-col">
        <div class="style-config-label">Bottom</div>
        <div class="style-config-input-group">
          <a-input v-model:value="model.bottom" size="small" class="style-config-input" placeholder="auto" @blur="handleUnitBlur('bottom', 'bottomUnit')" />
          <span class="style-config-separator">-</span>
          <a-select v-model:value="model.bottomUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" allow-clear />
        </div>
      </div>
    </div>

    <!-- Z-Index -->
    <div class="style-config-section">
      <div class="style-config-label">Z-Index</div>
      <a-input-number v-model:value="model.zIndex" size="small" class="style-config-input-number" placeholder="auto" :precision="0" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { CloseOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue';
import { DISPLAY_OPTIONS, DISPLAY_OPTIONS_MAP, FloatStyleEnum, OVERFLOW_OPTIONS, POSITION_OPTIONS, SIZE_UNIT_OPTIONS } from '@/constants/style';
import { CanvasElementTypeEnum } from '@/constants/home';
import { useUnitAutoFill } from '@/composables/useUnitAutoFill';
import type { GeneralConfig } from '@/views/Canvas/types';

defineOptions({
  name: 'GeneralConfig',
});

/** 元素类型 */
const props = defineProps<{
  /** 当前编辑的元素类型 */
  elementType?: CanvasElementTypeEnum;
}>();

/** 常规配置数据 */
const model = defineModel<GeneralConfig>({ required: true });

/** 当前元素对应的 display 选项 */
const displayOptions = computed(() => {
  if (props.elementType && DISPLAY_OPTIONS_MAP[props.elementType]) {
    return DISPLAY_OPTIONS_MAP[props.elementType]!;
  }
  return DISPLAY_OPTIONS;
});

/** 各偏移值失焦时自动填充单位 */
const handleUnitBlur = useUnitAutoFill(model);
</script>

<style scoped lang="less">
@import './style-config.less';
</style>
