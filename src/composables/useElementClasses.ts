import { computed, type Ref } from 'vue';
import type { CanvasElementBase } from '@/views/Canvas/types';

/**
 * 计算画布元素已启用的 class 名称列表
 *
 * 过滤元素 classes 中 enabled 为 true 的项，返回其 name 数组，
 * 供模板 :class 绑定使用，仅已启用的 class 会应用到 DOM。
 *
 * @param data 元素数据的响应式引用
 * @returns 已启用的 class 名称列表
 */
export function useElementClasses<T extends CanvasElementBase>(data: Ref<T>) {
  /** 已启用的 class 名称列表 */
  const classes = computed(() => data.value.classes.filter((c) => c.enabled).map((c) => c.name));
  return classes;
}
