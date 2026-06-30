<!-- ? 元素额外属性配置面板 -->
<template>
  <div>
    <!-- 表格 table -->
    <template v-if="model.type === CanvasElementTypeEnum.TABLE">
      <div class="style-config-section">
        <div class="style-config-label">边框合并（border-collapse）</div>
        <a-select
          v-model:value="(model as CanvasTableElement).styleConfig.general.borderCollapse"
          size="small"
          class="style-config-select"
          :options="BORDER_COLLAPSE_OPTIONS"
          placeholder="separate"
        />
      </div>
    </template>

    <!-- 表格单元格 td -->
    <template v-else-if="model.type === CanvasElementTypeEnum.TABLE_DATA">
      <div class="style-config-section">
        <div class="style-config-label">跨列数（colspan）</div>
        <a-input-number v-model:value="(model as CanvasTableDataElement).colspan" size="small" class="style-config-input-number" :min="1" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">跨行数（rowspan）</div>
        <a-input-number v-model:value="(model as CanvasTableDataElement).rowspan" size="small" class="style-config-input-number" :min="1" />
      </div>
    </template>

    <!-- 表头单元格 th -->
    <template v-else-if="model.type === CanvasElementTypeEnum.TABLE_HEADER_CELL">
      <div class="style-config-section">
        <div class="style-config-label">跨列数（colspan）</div>
        <a-input-number v-model:value="(model as CanvasTableHeaderCellElement).colspan" size="small" class="style-config-input-number" :min="1" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">跨行数（rowspan）</div>
        <a-input-number v-model:value="(model as CanvasTableHeaderCellElement).rowspan" size="small" class="style-config-input-number" :min="1" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">表头范围（scope）</div>
        <a-select v-model:value="(model as CanvasTableHeaderCellElement).scope" size="small" class="style-config-select" :options="TABLE_SCOPE_OPTIONS" />
      </div>
    </template>

    <!-- 表格列组 colgroup -->
    <template v-else-if="model.type === CanvasElementTypeEnum.TABLE_COL_GROUP">
      <div class="style-config-section">
        <div class="style-config-label">跨列数（span）</div>
        <a-input-number v-model:value="(model as CanvasTableColGroupElement).span" size="small" class="style-config-input-number" :min="1" />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { CanvasElementTypeEnum, TABLE_SCOPE_OPTIONS } from '@/constants/home';
import { BORDER_COLLAPSE_OPTIONS } from '@/constants/style';
import type { CanvasInnerElement, CanvasTableDataElement, CanvasTableHeaderCellElement, CanvasTableColGroupElement, CanvasTableElement } from '@/views/Canvas/types';

defineOptions({
  name: 'ExtraConfig',
});

/** 元素数据 */
const model = defineModel<CanvasInnerElement>({ required: true });
</script>

<style scoped lang="less">
@import './style-config.less';
</style>
