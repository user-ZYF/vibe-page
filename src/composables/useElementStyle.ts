import { computed, type Ref } from 'vue';
import type { CanvasElementBase } from '@/views/Home/types';
import { convertStyleConfig } from '@/utils/styleConfig';
import { useCanvasStore } from '@/store/canvas';

/**
 * 计算画布元素的最终内联样式
 *
 * 合并顺序遵循 CSS 层叠规则：
 * 1. 先合并所有已启用 class 选择器的样式（按 classes 数组顺序，后者覆盖前者）
 * 2. 再用元素自身的 styleConfig（id 选择器）覆盖 class 样式
 *
 * @param data 元素数据的响应式引用
 * @returns 合并后的内联样式对象
 */
export function useElementStyle<T extends CanvasElementBase>(data: Ref<T>) {
  const canvasStore = useCanvasStore();

  /** 最终合并的内联样式 */
  const style = computed(() => {
    /** 收集所有 class 选择器的 CSS 样式 */
    const merged: Record<string, string> = {};

    for (const className of data.value.classes) {
      const classCss = canvasStore.covertClassStyles[className];
      if (classCss) {
        Object.assign(merged, classCss);
      }
    }

    /** id 选择器（元素自身 styleConfig）覆盖 class 选择器 */
    const idCss = convertStyleConfig(data.value.styleConfig);
    Object.assign(merged, idCss);

    return merged;
  });

  return style;
}
