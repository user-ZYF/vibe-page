<!-- ? 字体配置面板 -->
<template>
  <div>
    <!-- Font family & Font size -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Font family</div>
        <a-select v-model:value="model.fontFamily" size="small" class="style-config-select" :options="FONT_FAMILY_OPTIONS" placeholder="inherit" />
      </div>
      <div class="style-config-col">
        <div class="style-config-label">Font size</div>
        <div class="style-config-input-group">
          <a-input-number v-model:value="model.fontSize" size="small" class="style-config-input-number" placeholder="16" @blur="handleUnitBlur('fontSize', 'fontSizeUnit')" />
          <a-select v-model:value="model.fontSizeUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" allow-clear />
        </div>
      </div>
    </div>

    <!-- Font weight & Letter spacing -->
    <div class="style-config-row">
      <div class="style-config-col">
        <div class="style-config-label">Font weight</div>
        <a-select v-model:value="model.fontWeight" size="small" class="style-config-select" :options="FONT_WEIGHT_OPTIONS" placeholder="normal" />
      </div>
      <div class="style-config-col">
        <div class="style-config-label">Letter spacing</div>
        <div class="style-config-input-group">
          <a-input v-model:value="model.letterSpacing" size="small" class="style-config-input" placeholder="normal" @blur="handleUnitBlur('letterSpacing', 'letterSpacingUnit')" />
          <span class="style-config-separator">-</span>
          <a-select v-model:value="model.letterSpacingUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" allow-clear />
        </div>
      </div>
    </div>

    <!-- Font style -->
    <div class="style-config-section">
      <div class="style-config-label">Font style</div>
      <a-select v-model:value="model.fontStyle" size="small" class="style-config-select" :options="FONT_STYLE_OPTIONS" placeholder="normal" allow-clear />
    </div>

    <!-- Color -->
    <div class="style-config-section">
      <div class="style-config-label">Color</div>
      <div class="style-config-color-row">
        <a-input v-model:value="model.color" size="small" class="style-config-input" placeholder="#000000" />
        <input type="color" v-model="model.color" class="style-config-color-picker" />
      </div>
    </div>

    <!-- Line height -->
    <div class="style-config-section">
      <div class="style-config-label">Line height</div>
      <div class="style-config-input-group style-config-input-group--half">
        <a-input v-model:value="model.lineHeight" size="small" class="style-config-input" placeholder="normal" @blur="handleUnitBlur('lineHeight', 'lineHeightUnit')" />
        <span class="style-config-separator">-</span>
        <a-select v-model:value="model.lineHeightUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" allow-clear />
      </div>
    </div>

    <!-- Text align -->
    <div class="style-config-section">
      <div class="style-config-label">Text align</div>
      <a-radio-group v-model:value="model.textAlign" button-style="solid" size="small" class="style-config-radio-group">
        <a-radio-button :value="TextAlignEnum.LEFT"><AlignLeftOutlined /></a-radio-button>
        <a-radio-button :value="TextAlignEnum.CENTER"><AlignCenterOutlined /></a-radio-button>
        <a-radio-button :value="TextAlignEnum.RIGHT"><AlignRightOutlined /></a-radio-button>
        <a-radio-button :value="TextAlignEnum.JUSTIFY"><MenuOutlined /></a-radio-button>
      </a-radio-group>
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
      <a-radio-group v-model:value="model.textDecoration" button-style="solid" size="small" class="style-config-radio-group">
        <a-radio-button :value="TextDecorationEnum.NONE"><CloseOutlined /></a-radio-button>
        <a-radio-button :value="TextDecorationEnum.UNDERLINE"><UnderlineOutlined /></a-radio-button>
        <a-radio-button :value="TextDecorationEnum.LINE_THROUGH"><StrikethroughOutlined /></a-radio-button>
      </a-radio-group>
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
              <a-input-number v-model:value="shadow.x" size="small" class="style-config-input-number" placeholder="0" @blur="handleTextShadowUnitBlur(shadow, 'x', 'xUnit')" />
              <a-select v-model:value="shadow.xUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" allow-clear />
            </div>
          </div>
          <div class="style-config-col">
            <div class="style-config-label">Y</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="shadow.y" size="small" class="style-config-input-number" placeholder="0" @blur="handleTextShadowUnitBlur(shadow, 'y', 'yUnit')" />
              <a-select v-model:value="shadow.yUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" allow-clear />
            </div>
          </div>
        </div>
        <!-- Blur -->
        <div class="style-config-section">
          <div class="style-config-label">Blur</div>
          <div class="style-config-input-group style-config-input-group--half">
            <a-input-number v-model:value="shadow.blur" size="small" class="style-config-input-number" placeholder="0" @blur="handleTextShadowUnitBlur(shadow, 'blur', 'blurUnit')" />
            <a-select v-model:value="shadow.blurUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" allow-clear />
          </div>
        </div>
        <!-- Shadow Color -->
        <div class="style-config-section">
          <div class="style-config-label">Color</div>
          <div class="style-config-color-row">
            <a-input v-model:value="shadow.color" size="small" class="style-config-input" placeholder="#000000" />
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
import { SIZE_UNIT_OPTIONS, FONT_FAMILY_OPTIONS, FONT_WEIGHT_OPTIONS, FONT_STYLE_OPTIONS, TextAlignEnum, TextDecorationEnum, SizeUnitEnum } from '@/constants/style';
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
    x: 0, xUnit: SizeUnitEnum.PX,
    y: 0, yUnit: SizeUnitEnum.PX,
    blur: 0, blurUnit: SizeUnitEnum.PX,
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
