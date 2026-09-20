<!-- ? 字体配置面板 -->
<template>
  <div>
    <!-- Font family & Font size -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Font family</div>
        <me-select v-model="model.fontFamily" class="style-config-select" :options="FONT_FAMILY_OPTIONS" placeholder="inherit" clearable />
      </div>
      <div class="style-config-col">
        <div class="style-config-label">Font size</div>
        <div class="style-config-input-group">
          <a-input-number v-model:value="model.fontSize" class="style-config-input-number" placeholder="16" @blur="handleUnitBlur('fontSize', 'fontSizeUnit')" />
          <me-select v-model="model.fontSizeUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
        </div>
      </div>
    </div>

    <!-- Font weight & Letter spacing -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Font weight</div>
        <me-select v-model="model.fontWeight" class="style-config-select" :options="FONT_WEIGHT_OPTIONS" placeholder="normal" clearable />
      </div>
      <div class="style-config-col">
        <div class="style-config-label">Letter spacing</div>
        <div class="style-config-input-group">
          <me-input v-model="model.letterSpacing" class="style-config-input" placeholder="normal" @blur="handleUnitBlur('letterSpacing', 'letterSpacingUnit')" />
          <me-select v-model="model.letterSpacingUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
        </div>
      </div>
    </div>

    <!-- Font style -->
    <div class="style-config-section">
      <div class="style-config-label">Font style</div>
      <me-select v-model="model.fontStyle" class="style-config-select" :options="FONT_STYLE_OPTIONS" placeholder="normal" clearable />
    </div>

    <!-- Color -->
    <div class="style-config-section">
      <div class="style-config-label">Color</div>
      <div class="style-config-color-row">
        <me-input v-model="model.color" class="style-config-input" placeholder="#000000" />
        <input type="color" v-model="model.color" class="style-config-color-picker" />
      </div>
    </div>

    <!-- Line height -->
    <div class="style-config-section">
      <div class="style-config-label">Line height</div>
      <div class="style-config-input-group style-config-input-group--half">
        <me-input v-model="model.lineHeight" class="style-config-input" placeholder="normal" @blur="handleUnitBlur('lineHeight', 'lineHeightUnit')" />
        <me-select v-model="model.lineHeightUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
      </div>
    </div>

    <!-- Text indent -->
    <div class="style-config-section">
      <div class="style-config-label">Text indent</div>
      <div class="style-config-input-group style-config-input-group--half">
        <me-input v-model="model.textIndent" class="style-config-input" placeholder="0" @blur="handleUnitBlur('textIndent', 'textIndentUnit')" />
        <me-select v-model="model.textIndentUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
      </div>
    </div>

    <!-- Text align -->
    <div class="style-config-section">
      <div class="style-config-label">Text align</div>
      <me-radio-group v-model="model.textAlign" class="style-config-radio-group">
        <me-radio-button :value="TextAlignEnum.LEFT"><AlignLeftOutlined /></me-radio-button>
        <me-radio-button :value="TextAlignEnum.CENTER"><AlignCenterOutlined /></me-radio-button>
        <me-radio-button :value="TextAlignEnum.RIGHT"><AlignRightOutlined /></me-radio-button>
        <me-radio-button :value="TextAlignEnum.JUSTIFY"><MenuOutlined /></me-radio-button>
      </me-radio-group>
    </div>

    <!-- Text decoration -->
    <div class="style-config-section">
      <div class="style-config-label">
        Text decoration
        <CloseCircleOutlined
          v-if="model.textDecoration !== TextDecorationEnum.NONE"
          class="style-config-clear"
          @click="model.textDecoration = TextDecorationEnum.NONE"
        />
      </div>
      <me-radio-group v-model="model.textDecoration" class="style-config-radio-group">
        <me-radio-button :value="TextDecorationEnum.NONE"><CloseOutlined /></me-radio-button>
        <me-radio-button :value="TextDecorationEnum.UNDERLINE"><UnderlineOutlined /></me-radio-button>
        <me-radio-button :value="TextDecorationEnum.LINE_THROUGH"><StrikethroughOutlined /></me-radio-button>
      </me-radio-group>
    </div>

    <!-- Text shadow -->
    <div class="style-config-section">
      <div class="style-config-label style-config-label--flex">
        <span>Text shadow</span>
        <PlusOutlined class="style-config-add" @click="handleAddTextShadow" />
      </div>
      <div
        v-for="(shadow, index) in (model.textShadows ?? [])"
        :key="index"
        class="style-config-box style-config-box--shadow"
      >
        <div class="style-config-shadow-preview">
          <DragOutlined class="style-config-drag-icon" />
          <span>{{ shadow.x }} {{ shadow.y }} {{ shadow.blur }}</span>
          <BoldOutlined class="style-config-shadow-icon" />
          <CloseOutlined class="style-config-shadow-close" @click="model.textShadows?.splice(index, 1)" />
        </div>
        <!-- X & Y -->
        <div class="style-config-row">
          <div class="style-config-col">
            <div class="style-config-label">X</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="shadow.x" class="style-config-input-number" placeholder="0" @blur="handleTextShadowUnitBlur(shadow, 'x', 'xUnit')" />
              <me-select v-model="shadow.xUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
            </div>
          </div>
          <div class="style-config-col">
            <div class="style-config-label">Y</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="shadow.y" class="style-config-input-number" placeholder="0" @blur="handleTextShadowUnitBlur(shadow, 'y', 'yUnit')" />
              <me-select v-model="shadow.yUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
            </div>
          </div>
        </div>
        <!-- Blur -->
        <div class="style-config-section">
          <div class="style-config-label">Blur</div>
          <div class="style-config-input-group style-config-input-group--half">
            <a-input-number v-model:value="shadow.blur" class="style-config-input-number" placeholder="0" @blur="handleTextShadowUnitBlur(shadow, 'blur', 'blurUnit')" />
            <me-select v-model="shadow.blurUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
          </div>
        </div>
        <!-- Shadow Color -->
        <div class="style-config-section">
          <div class="style-config-label">Color</div>
          <div class="style-config-color-row">
            <me-input v-model="shadow.color" class="style-config-input" placeholder="#000000" />
            <input type="color" v-model="shadow.color" class="style-config-color-picker" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  CloseOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  MenuOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  DragOutlined,
  BoldOutlined,
} from '@ant-design/icons-vue';
import { MeInput, MeRadioButton, MeRadioGroup, MeSelect } from '@zyf_dsb/me-ui';
import { SIZE_UNIT_OPTIONS, FONT_FAMILY_OPTIONS, FONT_WEIGHT_OPTIONS, FONT_STYLE_OPTIONS, TextAlignEnum, TextDecorationEnum, UnitEnum } from '@/constants/style';
import { useUnitAutoFill, autoFillUnit } from '@/composables/useUnitAutoFill';
import type { FontConfig, TextShadowItem } from '@/views/Canvas/types';

defineOptions({
  name: 'FontConfig',
});

/** 字体配置数据 */
const model = defineModel<FontConfig>({ required: true });

/** 各字体值失焦时自动填充单位 */
const handleUnitBlur = useUnitAutoFill(model);

/** 文字阴影各值失焦时自动填充单位 */
function handleTextShadowUnitBlur(shadow: TextShadowItem, valueKey: keyof TextShadowItem, unitKey: keyof TextShadowItem) {
  autoFillUnit(shadow, valueKey, unitKey);
}

/**
 * 添加 text-shadow 项
 */
function handleAddTextShadow() {
  if (!model.value.textShadows) model.value.textShadows = [];
  model.value.textShadows.push({
    x: 0, xUnit: UnitEnum.PX,
    y: 0, yUnit: UnitEnum.PX,
    blur: 0, blurUnit: UnitEnum.PX,
    color: '#000000',
  });
}
</script>

<style scoped lang="less">
@import './style-config.less';

.style-config-input-group--half {
  width: 50%;
  padding-right: 4px;
}
</style>
