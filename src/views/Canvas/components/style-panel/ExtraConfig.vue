<!-- ? 元素额外属性配置面板 -->
<template>
  <div>
    <!-- 表格 table -->
    <template v-if="element.type === CanvasElementTypeEnum.TABLE">
      <div class="style-config-section">
        <div class="style-config-label">边框合并（border-collapse）</div>
        <me-select
          v-model="styleModel.general.borderCollapse"
          class="style-config-select"
          :options="BORDER_COLLAPSE_OPTIONS"
          placeholder="separate"
          clearable
        />
      </div>
    </template>

    <!-- 表格单元格 td -->
    <template v-else-if="element.type === CanvasElementTypeEnum.TABLE_DATA">
      <div class="style-config-section">
        <div class="style-config-label">跨列数（colspan）</div>
        <a-input-number v-model:value="(element as CanvasTableDataElement).colspan" class="style-config-input-number" :min="1" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">跨行数（rowspan）</div>
        <a-input-number v-model:value="(element as CanvasTableDataElement).rowspan" class="style-config-input-number" :min="1" />
      </div>
    </template>

    <!-- 表头单元格 th -->
    <template v-else-if="element.type === CanvasElementTypeEnum.TABLE_HEADER_CELL">
      <div class="style-config-section">
        <div class="style-config-label">跨列数（colspan）</div>
        <a-input-number v-model:value="(element as CanvasTableHeaderCellElement).colspan" class="style-config-input-number" :min="1" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">跨行数（rowspan）</div>
        <a-input-number v-model:value="(element as CanvasTableHeaderCellElement).rowspan" class="style-config-input-number" :min="1" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">表头范围（scope）</div>
        <me-select v-model="(element as CanvasTableHeaderCellElement).scope" class="style-config-select" :options="TABLE_SCOPE_OPTIONS" clearable />
      </div>
    </template>

    <!-- 表格列组 colgroup -->
    <template v-else-if="element.type === CanvasElementTypeEnum.TABLE_COL_GROUP">
      <div class="style-config-section">
        <div class="style-config-label">跨列数（span）</div>
        <a-input-number v-model:value="(element as CanvasTableColGroupElement).span" class="style-config-input-number" :min="1" />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { MeSelect } from '@zyf_dsb/me-ui';
import { CanvasElementTypeEnum, TABLE_SCOPE_OPTIONS } from '@/constants/home';
import { BORDER_COLLAPSE_OPTIONS } from '@/constants/style';
import type { CanvasInnerElement, CanvasTableDataElement, CanvasTableHeaderCellElement, CanvasTableColGroupElement, StyleConfig } from '@/views/Canvas/types';

defineOptions({
  name: 'ExtraConfig',
});

/** 元素数据 */
const element = defineModel<CanvasInnerElement>('element', { required: true });
/** 元素样式配置（父级维护的编辑副本，修改后由父级统一写回规则） */
const styleModel = defineModel<StyleConfig>('styleConfig', { required: true });
</script>

<style scoped lang="less">
@import './style-config.less';
</style>
