<!-- ? 视觉配置面板 -->
<template>
  <div>
    <!-- Background -->
    <div class="style-config-section">
      <div class="style-config-label style-config-label--flex">
        <span>
          Background
          <CloseCircleOutlined
            v-if="model.backgrounds?.length"
            class="style-config-clear"
            @click="model.backgrounds = []"
          />
        </span>
        <PlusOutlined class="style-config-add" @click="handleAddBackground" />
      </div>

      <!-- 每一层 background -->
      <div
        v-for="(bg, index) in (model.backgrounds ?? [])"
        :key="index"
        class="style-config-box style-config-box--shadow"
      >
        <!-- 层标题行 -->
        <div class="style-config-shadow-preview">
          <DragOutlined class="style-config-drag-icon" />
          <span>{{ bg.type === BackgroundTypeEnum.IMAGE ? 'Image' : bg.type === BackgroundTypeEnum.COLOR ? 'Color' : 'Gradient' }}</span>
          <!-- 颜色预览（color/gradient 类型） -->
          <ColorPicker v-if="bg.type === BackgroundTypeEnum.COLOR" v-model="bg.color" small />
          <CloseOutlined class="style-config-shadow-close" @click="model.backgrounds?.splice(index, 1)" />
        </div>

        <!-- 类型切换 -->
        <me-radio-group v-model="bg.type" class="style-config-radio-group style-config-radio-group--mb">
          <me-radio-button :value="BackgroundTypeEnum.IMAGE"><PictureOutlined /></me-radio-button>
          <me-radio-button :value="BackgroundTypeEnum.COLOR"><BgColorsOutlined /></me-radio-button>
          <me-radio-button :value="BackgroundTypeEnum.GRADIENT"><GatewayOutlined /></me-radio-button>
        </me-radio-group>

        <!-- Image 类型 -->
        <template v-if="bg.type === BackgroundTypeEnum.IMAGE">
          <div class="style-config-label">Image</div>
          <me-input
            :model-value="bgImageUrlValue(bg)"
            placeholder="https://"
            class="style-config-mb"
            @input="handleBgImageUrlInput(bg, $event)"
            @blur="handleBgImageUrlBlur(bg)"
          />
          <div class="style-config-row">
            <div class="style-config-col">
              <div class="style-config-label">Repeat</div>
              <me-select v-model="bg.repeat" class="style-config-select" :options="BG_REPEAT_OPTIONS" placeholder="repeat" clearable />
            </div>
            <div class="style-config-col">
              <div class="style-config-label">Position</div>
              <me-select v-model="bg.position" class="style-config-select" :options="BG_POSITION_OPTIONS" placeholder="center" clearable />
            </div>
          </div>
          <div class="style-config-row">
            <div class="style-config-col">
              <div class="style-config-label">Attachment</div>
              <me-select v-model="bg.attachment" class="style-config-select" :options="BG_ATTACHMENT_OPTIONS" placeholder="scroll" clearable />
            </div>
            <div class="style-config-col">
              <div class="style-config-label">Size</div>
              <me-select v-model="bg.size" class="style-config-select" :options="BG_SIZE_OPTIONS" placeholder="auto" clearable />
            </div>
          </div>
        </template>

        <!-- Color 类型 -->
        <template v-else-if="bg.type === BackgroundTypeEnum.COLOR">
          <div class="style-config-label">Color</div>
          <div class="style-config-color-row">
            <me-input v-model="bg.color" class="style-config-input" placeholder="#ffffff" />
            <ColorPicker v-model="bg.color" />
          </div>
        </template>

        <!-- Gradient 类型 -->
        <template v-else>
          <div class="style-config-label">Gradient</div>
          <me-input
            :model-value="bgGradientValue(bg)"
            placeholder="linear-gradient(...)"
            @input="handleBgGradientInput(bg, $event)"
            @blur="handleBgGradientBlur(bg)"
          />
        </template>
      </div>
    </div>

    <!-- Border -->
    <div v-if="!onlyBackground" class="style-config-section">
      <div class="style-config-label">Border</div>
      <div class="style-config-box">
        <div class="style-config-row">
          <div class="style-config-col">
            <div class="style-config-label">Width</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="model.borderWidth" class="style-config-input-number" :min="0" placeholder="0" @blur="handleUnitBlur('borderWidth', 'borderWidthUnit')" />
              <me-select v-model="model.borderWidthUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
            </div>
          </div>
          <div class="style-config-col">
            <div class="style-config-label">Style</div>
            <me-select v-model="model.borderStyle" class="style-config-select" :options="BORDER_STYLE_OPTIONS" placeholder="none" clearable />
          </div>
        </div>
        <div class="style-config-label">Color</div>
        <div class="style-config-color-row">
          <me-input v-model="model.borderColor" class="style-config-input" placeholder="#000000" />
          <ColorPicker v-model="model.borderColor" />
        </div>
      </div>
    </div>

    <!-- Border radius -->
    <div v-if="!onlyBackground" class="style-config-section">
      <div class="style-config-label">Border radius</div>
      <div class="style-config-box">
        <div class="style-config-row">
          <div class="style-config-col">
            <div class="style-config-label">TL</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="model.borderRadiusTL" class="style-config-input-number" :min="0" placeholder="0" @blur="handleUnitBlur('borderRadiusTL', 'borderRadiusTLUnit')" />
              <me-select v-model="model.borderRadiusTLUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
            </div>
          </div>
          <div class="style-config-col">
            <div class="style-config-label">TR</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="model.borderRadiusTR" class="style-config-input-number" :min="0" placeholder="0" @blur="handleUnitBlur('borderRadiusTR', 'borderRadiusTRUnit')" />
              <me-select v-model="model.borderRadiusTRUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
            </div>
          </div>
        </div>
        <div class="style-config-row">
          <div class="style-config-col">
            <div class="style-config-label">BL</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="model.borderRadiusBL" class="style-config-input-number" :min="0" placeholder="0" @blur="handleUnitBlur('borderRadiusBL', 'borderRadiusBLUnit')" />
              <me-select v-model="model.borderRadiusBLUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
            </div>
          </div>
          <div class="style-config-col">
            <div class="style-config-label">BR</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="model.borderRadiusBR" class="style-config-input-number" :min="0" placeholder="0" @blur="handleUnitBlur('borderRadiusBR', 'borderRadiusBRUnit')" />
              <me-select v-model="model.borderRadiusBRUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Outline -->
    <div v-if="!onlyBackground" class="style-config-section">
      <div class="style-config-label">Outline</div>
      <div class="style-config-box">
        <div class="style-config-row">
          <div class="style-config-col">
            <div class="style-config-label">Width</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="model.outlineWidth" class="style-config-input-number" :min="0" placeholder="0" @blur="handleUnitBlur('outlineWidth', 'outlineWidthUnit')" />
              <me-select v-model="model.outlineWidthUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
            </div>
          </div>
          <div class="style-config-col">
            <div class="style-config-label">Style</div>
            <me-select v-model="model.outlineStyle" class="style-config-select" :options="BORDER_STYLE_OPTIONS" placeholder="none" clearable />
          </div>
        </div>
        <div class="style-config-label">Color</div>
        <div class="style-config-color-row">
          <me-input v-model="model.outlineColor" class="style-config-input" placeholder="#000000" />
          <ColorPicker v-model="model.outlineColor" />
        </div>
        <div class="style-config-label">Offset</div>
        <div class="style-config-input-group">
          <a-input-number v-model:value="model.outlineOffset" class="style-config-input-number" placeholder="0" @blur="handleUnitBlur('outlineOffset', 'outlineOffsetUnit')" />
          <me-select v-model="model.outlineOffsetUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
        </div>
      </div>
    </div>

    <!-- Opacity -->
    <div v-if="!onlyBackground" class="style-config-section">
      <div class="style-config-label">Opacity</div>
      <div class="style-config-opacity-row">
        <a-slider v-model:value="opacity" :min="0" :max="1" :step="0.01" class="style-config-slider" />
        <a-input-number
          v-model:value="model.opacity"
          :min="0"
          :max="1"
          :step="0.01"
          placeholder="1"
          class="style-config-opacity-input"
        />
      </div>
    </div>

    <!-- Box shadow -->
    <div v-if="!onlyBackground" class="style-config-section">
      <div class="style-config-label style-config-label--flex">
        <span>Box shadow</span>
        <PlusOutlined class="style-config-add" @click="handleAddBoxShadow" />
      </div>
      <div
        v-for="(shadow, index) in (model.boxShadows ?? [])"
        :key="index"
        class="style-config-box style-config-box--shadow"
      >
        <div class="style-config-shadow-preview">
          <DragOutlined class="style-config-drag-icon" />
          <span>{{ shadow.x }}px {{ shadow.y }}px {{ shadow.blur }}px {{ shadow.spread }}px</span>
          <CloseOutlined class="style-config-shadow-close" @click="model.boxShadows?.splice(index, 1)" />
        </div>
        <div class="style-config-row">
          <div class="style-config-col">
            <div class="style-config-label">X</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="shadow.x" class="style-config-input-number" placeholder="0" @blur="handleBoxShadowUnitBlur(shadow, 'x', 'xUnit')" />
              <me-select v-model="shadow.xUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
            </div>
          </div>
          <div class="style-config-col">
            <div class="style-config-label">Y</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="shadow.y" class="style-config-input-number" placeholder="0" @blur="handleBoxShadowUnitBlur(shadow, 'y', 'yUnit')" />
              <me-select v-model="shadow.yUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
            </div>
          </div>
        </div>
        <div class="style-config-row">
          <div class="style-config-col">
            <div class="style-config-label">Blur</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="shadow.blur" class="style-config-input-number" :min="0" placeholder="0" @blur="handleBoxShadowUnitBlur(shadow, 'blur', 'blurUnit')" />
              <me-select v-model="shadow.blurUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
            </div>
          </div>
          <div class="style-config-col">
            <div class="style-config-label">Spread</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="shadow.spread" class="style-config-input-number" placeholder="0" @blur="handleBoxShadowUnitBlur(shadow, 'spread', 'spreadUnit')" />
              <me-select v-model="shadow.spreadUnit" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" placeholder="px" clearable />
            </div>
          </div>
        </div>
        <div class="style-config-label">Color</div>
        <div class="style-config-color-row style-config-color-row--mb">
          <me-input v-model="shadow.color" class="style-config-input" placeholder="#000000" />
          <ColorPicker v-model="shadow.color" />
        </div>
        <me-checkbox v-model="shadow.inset">
          <span class="style-config-checkbox-label">Inset</span>
        </me-checkbox>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  CloseOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  DragOutlined,
  PictureOutlined,
  BgColorsOutlined,
  GatewayOutlined,
} from '@ant-design/icons-vue';
import { MeCheckbox, MeInput, MeRadioButton, MeRadioGroup, MeSelect } from '@zyf_dsb/me-ui';
import {
  SIZE_UNIT_OPTIONS,
  BORDER_STYLE_OPTIONS,
  BG_ATTACHMENT_OPTIONS,
  BG_REPEAT_OPTIONS,
  BG_SIZE_OPTIONS,
  BG_POSITION_OPTIONS,
  BackgroundTypeEnum,
  UnitEnum,
} from '@/constants/style';
import ColorPicker from './ColorPicker.vue';
import type { VisualConfig, BoxShadowItem, BackgroundItem } from '@/views/Canvas/types';
import { useUnitAutoFill, autoFillUnit } from '@/composables/useUnitAutoFill';
import { isSafeUrl, sanitizeCssUrl } from '@/utils/sanitize';
import { CSS_URL_ADDRESS_FORBIDDEN_REGEX, GRADIENT_VALUE_REGEX } from '@/constants/sanitize';
import { message } from 'ant-design-vue';
import { computed, ref } from 'vue';

defineOptions({
  name: 'VisualConfig',
});

defineProps({
  /** 是否仅显示 background 配置 */
  onlyBackground: {
    type: Boolean,
    default: false,
  },
});

/** 视觉配置数据 */
const model = defineModel<VisualConfig>({ required: true });

/** 各视觉值失焦时自动填充单位 */
const handleUnitBlur = useUnitAutoFill(model);

/** 盒阴影各值失焦时自动填充单位 */
function handleBoxShadowUnitBlur(shadow: BoxShadowItem, valueKey: keyof BoxShadowItem, unitKey: keyof BoxShadowItem) {
  autoFillUnit(shadow, valueKey, unitKey);
}

/** 透明度（无值时默认为 1） */
const opacity = computed({
  get: () => model.value.opacity ?? 1,
  set: (val) => { model.value.opacity = val; },
});

/**
 * 添加 background 层
 */
function handleAddBackground() {
  if (!model.value.backgrounds) model.value.backgrounds = [];
  /** 新增背景默认选中 color 类型，避免空类型导致预览行只显示占位文本 */
  model.value.backgrounds.push({ type: BackgroundTypeEnum.COLOR });
}

/**
 * 添加 box-shadow 项
 */
function handleAddBoxShadow() {
  if (!model.value.boxShadows) model.value.boxShadows = [];
  model.value.boxShadows.push({
    x: 0, xUnit: UnitEnum.PX,
    y: 0, yUnit: UnitEnum.PX,
    blur: 0, blurUnit: UnitEnum.PX,
    spread: 0, spreadUnit: UnitEnum.PX,
    color: '#000000',
    inset: false,
  });
}

/** 背景图地址编辑的临时值（blur 后才同步到 bg.imageUrl，避免每输入一个字符就触发一次背景图请求） */
const pendingBgImageUrls = ref(new Map<BackgroundItem, string>());

/** 背景图地址输入框当前值（未编辑时显示 bg.imageUrl） */
function bgImageUrlValue(bg: BackgroundItem) {
  return pendingBgImageUrls.value.get(bg) ?? bg.imageUrl ?? '';
}

/** 背景图地址输入时暂存临时值 */
function handleBgImageUrlInput(bg: BackgroundItem, value: string) {
  pendingBgImageUrls.value.set(bg, value);
}

/** 背景图地址失焦时校验协议安全性并同步到 bg.imageUrl */
function handleBgImageUrlBlur(bg: BackgroundItem) {
  const url = bgImageUrlValue(bg).trim();
  pendingBgImageUrls.value.delete(bg);
  /** 校验未通过时还原显示为旧地址 */
  if (url && !isSafeUrl(url)) {
    message.warning('背景图地址协议不安全，仅支持 http、https、mailto、tel 及相对路径');
    return;
  }
  /** 校验地址能否安全写入 url("...")：引号、括号、<>、反斜杠、空白会破坏 CSS 字符串边界 */
  if (url && CSS_URL_ADDRESS_FORBIDDEN_REGEX.test(url)) {
    message.warning('背景图地址包含非法字符（空格、引号、括号等），请转义或改用 base64 编码');
    return;
  }
  bg.imageUrl = url;
}

/** 背景渐变编辑的临时值（blur 校验后才同步到 bg.gradient，避免每输入一个字符就改写样式） */
const pendingBgGradients = ref(new Map<BackgroundItem, string>());

/** 背景渐变输入框当前值（未编辑时显示 bg.gradient） */
function bgGradientValue(bg: BackgroundItem) {
  return pendingBgGradients.value.get(bg) ?? bg.gradient ?? '';
}

/** 背景渐变输入时暂存临时值 */
function handleBgGradientInput(bg: BackgroundItem, value: string) {
  pendingBgGradients.value.set(bg, value);
}

/** 背景渐变失焦时校验并同步到 bg.gradient */
function handleBgGradientBlur(bg: BackgroundItem) {
  const gradient = bgGradientValue(bg).trim();
  pendingBgGradients.value.delete(bg);
  /**
   * 校验规则（任一不通过即还原为旧值，不写入 model）：
   * 1. 取值必须以渐变函数开头（linear/radial/conic-gradient 及 repeating-/-webkit- 变体）或 var() 引用，
   *    url()、image-set()、paint()、element() 等可发起请求或执行脚本的写法直接拒绝
   * 2. 渐变函数内部不得夹带 url()（如 linear-gradient(red, url(x))），经协议校验兜底
   */
  if (gradient && (!GRADIENT_VALUE_REGEX.test(gradient) || sanitizeCssUrl(gradient) !== gradient)) {
    message.warning('渐变仅支持 linear-gradient、radial-gradient、conic-gradient 等渐变函数');
    return;
  }
  bg.gradient = gradient;
}
</script>

<style scoped lang="less">
@import './style-config.less';

.style-config-radio-group--mb {
  margin-bottom: 8px;
}

.style-config-mb {
  margin-bottom: 8px;
}

.style-config-color-row--mb {
  margin-bottom: 8px;
}
</style>
