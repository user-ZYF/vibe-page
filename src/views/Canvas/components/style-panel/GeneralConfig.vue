<!-- ? 常规配置面板 -->
<template>
  <div>
    <!-- 浮动配置 -->
    <div class="style-config-section">
      <div class="style-config-label">Float</div>
      <me-radio-group v-model="model.float" class="style-config-radio-group">
        <me-radio-button :value="FloatStyleEnum.NONE"><CloseOutlined /></me-radio-button>
        <me-radio-button :value="FloatStyleEnum.LEFT"><MenuFoldOutlined /></me-radio-button>
        <me-radio-button :value="FloatStyleEnum.RIGHT"><MenuUnfoldOutlined /></me-radio-button>
      </me-radio-group>
    </div>

    <!-- Display & Position -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Display</div>
        <me-select v-model="model.display" class="style-config-select" :options="displayOptions" placeholder="block" clearable />
      </div>
      <div class="style-config-col">
        <div class="style-config-label">Position</div>
        <me-select v-model="model.position" class="style-config-select" :options="POSITION_OPTIONS" placeholder="static" clearable />
      </div>
    </div>

    <!-- Overflow -->
    <div class="style-config-section">
      <div class="style-config-label">Overflow</div>
      <me-select v-model="model.overflow" class="style-config-select" :options="OVERFLOW_OPTIONS" placeholder="visible" clearable />
    </div>

    <!-- Top & Right -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Top</div>
        <div class="style-config-input-group">
          <me-input v-model="model.top" class="style-config-input" placeholder="auto" @blur="handleUnitBlur('top', 'topUnit')" />
          <me-select v-model="model.topUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
        </div>
      </div>
      <div class="style-config-col">
        <div class="style-config-label">Right</div>
        <div class="style-config-input-group">
          <me-input v-model="model.right" class="style-config-input" placeholder="auto" @blur="handleUnitBlur('right', 'rightUnit')" />
          <me-select v-model="model.rightUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
        </div>
      </div>
    </div>

    <!-- Left & Bottom -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Left</div>
        <div class="style-config-input-group">
          <me-input v-model="model.left" class="style-config-input" placeholder="auto" @blur="handleUnitBlur('left', 'leftUnit')" />
          <me-select v-model="model.leftUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
        </div>
      </div>
      <div class="style-config-col">
        <div class="style-config-label">Bottom</div>
        <div class="style-config-input-group">
          <me-input v-model="model.bottom" class="style-config-input" placeholder="auto" @blur="handleUnitBlur('bottom', 'bottomUnit')" />
          <me-select v-model="model.bottomUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
        </div>
      </div>
    </div>

    <!-- Z-Index -->
    <div class="style-config-section">
      <div class="style-config-label">Z-Index</div>
      <a-input-number v-model:value="model.zIndex" class="style-config-input-number" placeholder="auto" :precision="0" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { CloseOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue';
import { MeInput, MeRadioButton, MeRadioGroup, MeSelect } from '@zyf_dsb/me-ui';
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
