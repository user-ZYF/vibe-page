<!-- ? 画布通用元素（未定义标签的兜底渲染，保留原始标签与属性） -->
<template>
  <component :is="tag" ref="generalEl" v-bind="attrs" :id="data.id" :data-canvas-id="data.id" :class="classes" @click.stop="handleSelect" @click.capture="guardInteraction" @submit.capture="guardInteraction">
    <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
  </component>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import type { CanvasGeneralElement } from '../../types';
import { useElementClasses } from '@/composables/useElementClasses';
import { CanvasElementComponentMap } from '../../constants';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';
import { sanitizeAttributeValue } from '@/utils/sanitize';
import { resolveSafeTagName } from '@/utils/html-parser';
import { CANVAS_MANAGED_ATTRIBUTES } from '@/constants/html';

const data = defineModel<CanvasGeneralElement>("data", {
  required: true
});

const { handleSelect, isPreview } = useCanvasInteraction(data.value.id);

/** 标签名（解析入库与改名时已校验，此处兜底防脏数据生成危险标签） */
const tag = computed(() => resolveSafeTagName(data.value.tagName));

/** 已启用的 class 名称列表 */
const classes = useElementClasses(data);

/** 透传到 DOM 的额外保留属性：剔除画布托管属性与 on* 事件属性、URL 类属性经协议校验 */
const attrs = computed(() => {
  const result: Record<string, string> = {};
  Object.entries(data.value.extraAttrs ?? {}).forEach(([name, value]) => {
    if (CANVAS_MANAGED_ATTRIBUTES.has(name.toLowerCase())) return;
    const safeValue = sanitizeAttributeValue(name, value);
    if (safeValue !== null) result[name] = safeValue;
  });
  return result;
});

/** 通用元素 DOM 引用 */
const generalEl = ref<HTMLElement>();

useElementVisibility(data.value.id);
useDragConnector(generalEl, data.value.id, { isCanvas: true });

/** 交互守卫：编辑模式下阻止激活类默认行为（details 开合、label 关联激活、嵌套表单提交等），预览模式下放行 */
function guardInteraction(e: Event) {
  if (!isPreview.value) {
    e.preventDefault();
  }
}
</script>
