<!-- ? 视觉配置面板 -->
<template>
  <div>
    <!-- Background -->
    <div class="style-config-section">
      <div class="style-config-label style-config-label--flex">
        <span>
          Background
          <CloseCircleOutlined
            v-if="(model.backgrounds?.length ?? 0) > 0"
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
          <input
            v-if="bg.type === BackgroundTypeEnum.COLOR"
            type="color"
            v-model="bg.color"
            class="style-config-color-picker style-config-color-picker--small"
          />
          <CloseOutlined class="style-config-shadow-close" @click="model.backgrounds?.splice(index, 1)" />
        </div>

        <!-- 类型切换 -->
        <a-radio-group v-model:value="bg.type" button-style="solid" size="small" class="style-config-radio-group style-config-radio-group--mb">
          <a-radio-button :value="BackgroundTypeEnum.IMAGE"><PictureOutlined /></a-radio-button>
          <a-radio-button :value="BackgroundTypeEnum.COLOR"><BgColorsOutlined /></a-radio-button>
          <a-radio-button :value="BackgroundTypeEnum.GRADIENT"><GatewayOutlined /></a-radio-button>
        </a-radio-group>

        <!-- Image 类型 -->
        <template v-if="bg.type === BackgroundTypeEnum.IMAGE">
          <div class="style-config-label">Image</div>
          <a-input v-model:value="bg.imageUrl" size="small" placeholder="url(...)" class="style-config-mb" />
          <div class="style-config-row">
            <div class="style-config-col">
              <div class="style-config-label">Repeat</div>
              <a-select v-model:value="bg.repeat" size="small" class="style-config-select" :options="BG_REPEAT_OPTIONS" />
            </div>
            <div class="style-config-col">
              <div class="style-config-label">Position</div>
              <a-select v-model:value="bg.position" size="small" class="style-config-select" :options="BG_POSITION_OPTIONS" />
            </div>
          </div>
          <div class="style-config-row">
            <div class="style-config-col">
              <div class="style-config-label">Attachment</div>
              <a-select v-model:value="bg.attachment" size="small" class="style-config-select" :options="BG_ATTACHMENT_OPTIONS" />
            </div>
            <div class="style-config-col">
              <div class="style-config-label">Size</div>
              <a-select v-model:value="bg.size" size="small" class="style-config-select" :options="BG_SIZE_OPTIONS" />
            </div>
          </div>
        </template>

        <!-- Color 类型 -->
        <template v-else-if="bg.type === BackgroundTypeEnum.COLOR">
          <div class="style-config-label">Color</div>
          <div class="style-config-color-row">
            <a-input v-model:value="bg.color" size="small" class="style-config-input" placeholder="#ffffff" />
            <input type="color" v-model="bg.color" class="style-config-color-picker" />
          </div>
        </template>

        <!-- Gradient 类型 -->
        <template v-else>
          <div class="style-config-label">Gradient</div>
          <a-input v-model:value="bg.gradient" size="small" placeholder="linear-gradient(...)" />
        </template>
      </div>
    </div>

    <!-- Border -->
    <div v-if="!onlyBackground" class="style-config-section">
      <div class="style-config-label">Border</div>
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">Width</div>
          <div class="style-config-input-group">
            <a-input-number v-model:value="model.borderWidth" size="small" class="style-config-input-number" :min="0" placeholder="0" />
            <a-select v-model:value="model.borderWidthUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
          </div>
        </div>
        <div class="style-config-col">
          <div class="style-config-label">Style</div>
          <a-select v-model:value="model.borderStyle" size="small" class="style-config-select" :options="BORDER_STYLE_OPTIONS" />
        </div>
      </div>
      <div class="style-config-label">Color</div>
      <div class="style-config-color-row">
        <a-input v-model:value="model.borderColor" size="small" class="style-config-input" placeholder="#000000" />
        <input type="color" v-model="model.borderColor" class="style-config-color-picker" />
      </div>
    </div>

    <!-- Border radius -->
    <div v-if="!onlyBackground" class="style-config-section">
      <div class="style-config-label">Border radius</div>
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">TL</div>
          <div class="style-config-input-group">
            <a-input-number v-model:value="model.borderRadiusTL" size="small" class="style-config-input-number" :min="0" placeholder="0" />
            <a-select v-model:value="model.borderRadiusUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
          </div>
        </div>
        <div class="style-config-col">
          <div class="style-config-label">TR</div>
          <div class="style-config-input-group">
            <a-input-number v-model:value="model.borderRadiusTR" size="small" class="style-config-input-number" :min="0" placeholder="0" />
            <a-select v-model:value="model.borderRadiusUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
          </div>
        </div>
      </div>
      <div class="style-config-row">
        <div class="style-config-col">
          <div class="style-config-label">BL</div>
          <div class="style-config-input-group">
            <a-input-number v-model:value="model.borderRadiusBL" size="small" class="style-config-input-number" :min="0" placeholder="0" />
            <a-select v-model:value="model.borderRadiusUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
          </div>
        </div>
        <div class="style-config-col">
          <div class="style-config-label">BR</div>
          <div class="style-config-input-group">
            <a-input-number v-model:value="model.borderRadiusBR" size="small" class="style-config-input-number" :min="0" placeholder="0" />
            <a-select v-model:value="model.borderRadiusUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
          </div>
        </div>
      </div>
    </div>

    <!-- Opacity -->
    <div v-if="!onlyBackground" class="style-config-section">
      <div class="style-config-label">Opacity</div>
      <div class="style-config-opacity-row">
        <a-slider v-model:value="model.opacity" :min="0" :max="1" :step="0.01" class="style-config-slider" />
        <a-input-number
          v-model:value="model.opacity"
          size="small"
          :min="0"
          :max="1"
          :step="0.01"
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
              <a-input-number v-model:value="shadow.x" size="small" class="style-config-input-number" placeholder="0" />
              <a-select v-model:value="shadow.xUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
            </div>
          </div>
          <div class="style-config-col">
            <div class="style-config-label">Y</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="shadow.y" size="small" class="style-config-input-number" placeholder="0" />
              <a-select v-model:value="shadow.yUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
            </div>
          </div>
        </div>
        <div class="style-config-row">
          <div class="style-config-col">
            <div class="style-config-label">Blur</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="shadow.blur" size="small" class="style-config-input-number" :min="0" placeholder="0" />
              <a-select v-model:value="shadow.blurUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
            </div>
          </div>
          <div class="style-config-col">
            <div class="style-config-label">Spread</div>
            <div class="style-config-input-group">
              <a-input-number v-model:value="shadow.spread" size="small" class="style-config-input-number" placeholder="0" />
              <a-select v-model:value="shadow.spreadUnit" size="small" class="style-config-unit" :options="SIZE_UNIT_OPTIONS" />
            </div>
          </div>
        </div>
        <div class="style-config-label">Color</div>
        <div class="style-config-color-row style-config-color-row--mb">
          <a-input v-model:value="shadow.color" size="small" class="style-config-input" placeholder="#000000" />
          <input type="color" v-model="shadow.color" class="style-config-color-picker" />
        </div>
        <a-checkbox v-model:checked="shadow.inset" size="small">
          <span class="style-config-checkbox-label">Inset</span>
        </a-checkbox>
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
import {
  SIZE_UNIT_OPTIONS,
  BORDER_STYLE_OPTIONS,
  BG_ATTACHMENT_OPTIONS,
  BG_REPEAT_OPTIONS,
  BG_SIZE_OPTIONS,
  BG_POSITION_OPTIONS,
  BackgroundTypeEnum,
  BackgroundRepeatEnum,
  BackgroundPositionEnum,
  BackgroundAttachmentEnum,
  BackgroundSizeEnum,
  SizeUnitEnum,
} from '@/constants/style';
import type { VisualConfig } from '@/views/Canvas/types';

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

/**
 * 添加 background 层
 */
function handleAddBackground() {
  if (!model.value.backgrounds) model.value.backgrounds = [];
  model.value.backgrounds.push({});
}

/**
 * 添加 box-shadow 项
 */
function handleAddBoxShadow() {
  if (!model.value.boxShadows) model.value.boxShadows = [];
  model.value.boxShadows.push({
    x: 0, xUnit: SizeUnitEnum.PX,
    y: 0, yUnit: SizeUnitEnum.PX,
    blur: 0, blurUnit: SizeUnitEnum.PX,
    spread: 0, spreadUnit: SizeUnitEnum.PX,
    color: '#000000',
    inset: false,
  });
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

.style-config-color-picker--small {
  width: 20px;
  height: 20px;
  margin-left: auto;
}

.style-config-color-row--mb {
  margin-bottom: 8px;
}
</style>
