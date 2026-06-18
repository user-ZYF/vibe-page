<!-- ? 样式编辑面板 -->
<template>
  <a-collapse v-model:activeKey="activeKey" ghost>
    <!-- 常规配置 -->
    <a-collapse-panel :key="StyleConfigTypeEnum.GENERAL" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.GENERAL]">
      <GeneralConfig v-model="generalConfig" />
    </a-collapse-panel>

    <!-- 尺寸配置 -->
    <a-collapse-panel :key="StyleConfigTypeEnum.SIZE" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.SIZE]">
      <SizeConfig v-model="sizeConfig" />
    </a-collapse-panel>

    <!-- 字体相关配置 -->
    <a-collapse-panel :key="StyleConfigTypeEnum.FONT" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.FONT]">
      <FontConfig v-model="fontConfig" />
    </a-collapse-panel>

    <!-- 视觉配置 -->
    <a-collapse-panel :key="StyleConfigTypeEnum.VISUAL" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.VISUAL]">
      <VisualConfig v-model="visualConfig" />
    </a-collapse-panel>

    <!-- 布局配置 -->
    <a-collapse-panel :key="StyleConfigTypeEnum.FLEX" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.FLEX]">
      <FlexConfig v-model="flexConfig" />
    </a-collapse-panel>
  </a-collapse>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { StyleConfigTypeEnum, STYLE_CONFIG_TYPE_NAME } from '@/constants/home';
import GeneralConfig from './style-panel/GeneralConfig.vue';
import SizeConfig from './style-panel/SizeConfig.vue';
import FontConfig from './style-panel/FontConfig.vue';
import VisualConfig from './style-panel/VisualConfig.vue';
import FlexConfig from './style-panel/FlexConfig.vue';
import type { GeneralConfig as GeneralConfigType, SizeConfig as SizeConfigType, FontConfig as FontConfigType, VisualConfig as VisualConfigType, FlexConfig as FlexConfigType } from '@/views/Home/types';

defineOptions({
  name: 'StyleConfig',
});

/** 展开的面板配置 */
const activeKey = ref([StyleConfigTypeEnum.GENERAL, StyleConfigTypeEnum.SIZE, StyleConfigTypeEnum.FONT, StyleConfigTypeEnum.VISUAL, StyleConfigTypeEnum.FLEX]);

/** 常规配置 */
const generalConfig = ref<GeneralConfigType>({
  float: 'none',
  display: 'block',
  position: 'static',
  top: 'auto',
  topUnit: 'px',
  right: 'auto',
  rightUnit: 'px',
  left: 'auto',
  leftUnit: 'px',
  bottom: 'auto',
  bottomUnit: 'px',
});

/** 尺寸配置 */
const sizeConfig = ref<SizeConfigType>({
  width: 'auto',
  widthUnit: 'px',
  height: 'auto',
  heightUnit: 'px',
  maxWidth: 'auto',
  maxWidthUnit: 'px',
  minHeight: 'auto',
  minHeightUnit: 'px',
  marginTop: 150,
  marginTopUnit: 'px',
  marginRight: 0,
  marginRightUnit: 'px',
  marginBottom: 30,
  marginBottomUnit: 'px',
  marginLeft: 0,
  marginLeftUnit: 'px',
});

/** 字体配置 */
const fontConfig = ref<FontConfigType>({
  fontFamily: 'Arial',
  fontSize: 40,
  fontSizeUnit: 'px',
  fontWeight: 'normal',
  letterSpacing: 'normal',
  letterSpacingUnit: 'px',
  color: '#000000',
  lineHeight: 'normal',
  lineHeightUnit: 'px',
  textAlign: 'left',
  textDecoration: 'none',
  textShadows: [],
});

/** 视觉配置 */
const visualConfig = ref<VisualConfigType>({
  backgrounds: [],
  borderWidth: 0,
  borderWidthUnit: 'px',
  borderStyle: 'none',
  borderColor: '#000000',
  borderRadiusTL: 0,
  borderRadiusTR: 0,
  borderRadiusBL: 0,
  borderRadiusBR: 0,
  borderRadiusUnit: 'px',
  opacity: 1,
  boxShadows: [],
});

/** 布局配置 */
const flexConfig = ref<FlexConfigType>({
  flexContainer: 'disable',
  flexParent: null,
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  flexChildren: null,
  order: null,
  flexGrow: 0,
  flexShrink: 1,
  flexBasis: 'auto',
  flexBasisUnit: 'px',
  alignSelf: 'auto',
});
</script>

<style scoped lang="less">
:deep(.ant-collapse-header-text) {
  color: #fff;
  font-weight: 500;
}

:deep(.ant-collapse-expand-icon) {
  color: #fff;
}
</style>

