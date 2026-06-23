<!-- ? 样式编辑面板 -->
<template>
  <div>
    <div class="empty-tip" v-if="!selectedElementId">请选择一个元素</div>
    <a-collapse v-else v-model:activeKey="activeKey" ghost>
      <!-- 常规配置 -->
      <a-collapse-panel :key="StyleConfigTypeEnum.GENERAL" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.GENERAL]">
        <GeneralConfig v-model="selectedElement!.styleConfig.general" />
      </a-collapse-panel>
  
      <!-- 尺寸配置 -->
      <a-collapse-panel :key="StyleConfigTypeEnum.SIZE" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.SIZE]">
        <SizeConfig v-model="selectedElement!.styleConfig.size" />
      </a-collapse-panel>
  
      <!-- 字体相关配置 -->
      <a-collapse-panel :key="StyleConfigTypeEnum.FONT" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.FONT]">
        <FontConfig v-model="selectedElement!.styleConfig.font" />
      </a-collapse-panel>
  
      <!-- 视觉配置 -->
      <a-collapse-panel :key="StyleConfigTypeEnum.VISUAL" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.VISUAL]">
        <VisualConfig v-model="selectedElement!.styleConfig.visual" />
      </a-collapse-panel>
  
      <!-- 布局配置 -->
      <a-collapse-panel :key="StyleConfigTypeEnum.FLEX" :header="STYLE_CONFIG_TYPE_NAME[StyleConfigTypeEnum.FLEX]">
        <FlexConfig v-model="selectedElement!.styleConfig.flex" />
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { StyleConfigTypeEnum, STYLE_CONFIG_TYPE_NAME } from '@/constants/style';
import GeneralConfig from './style-panel/GeneralConfig.vue';
import SizeConfig from './style-panel/SizeConfig.vue';
import FontConfig from './style-panel/FontConfig.vue';
import VisualConfig from './style-panel/VisualConfig.vue';
import FlexConfig from './style-panel/FlexConfig.vue';
import { useCanvasStore } from '@/store/canvas';
import { storeToRefs } from 'pinia';
import { CanvasElement } from '../types.ts';

defineOptions({
  name: 'StyleConfig',
});

/** 展开的面板配置 */
const activeKey = ref([StyleConfigTypeEnum.GENERAL, StyleConfigTypeEnum.SIZE, StyleConfigTypeEnum.FONT, StyleConfigTypeEnum.VISUAL, StyleConfigTypeEnum.FLEX]);

const canvasStore = useCanvasStore();
const { selectedElementId } = storeToRefs(canvasStore);

/** 选中的元素对象 */
const selectedElement = computed(()=>{
  if(!selectedElementId.value){
    return null;
  }
  return canvasStore.getElementById(selectedElementId.value);
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

.empty-tip {
  color: #fff;
  text-align: center;
  padding: 20px;
}
</style>

