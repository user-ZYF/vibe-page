import type { Ref } from 'vue';
import { SizeUnitEnum } from '@/constants/style';

/** 判断值是否不为 null、undefined 和空字符串 */
function isNotEmptyish<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined && value !== '';
}

/**
 * 对普通对象执行单位自动填充
 *
 * 值不为空且单位为空时，自动填充 px
 *
 * @param obj 目标对象
 * @param valueKey 值字段名（或数组）
 * @param unitKey 单位字段名
 */
export function autoFillUnit<T extends Record<string, any>>(
  obj: T,
  valueKey: keyof T | (keyof T)[],
  unitKey: keyof T,
): void {
  const keys = Array.isArray(valueKey) ? valueKey : [valueKey];
  const hasValue = keys.some((k) => isNotEmptyish(obj[k]));

  if (hasValue && !isNotEmptyish(obj[unitKey])) {
    obj[unitKey] = SizeUnitEnum.PX as T[keyof T];
  }
}

/**
 * 创建单位自动填充的 blur 处理函数
 *
 * 值不为空且单位为空时，自动填充 px
 *
 * @param objRef 响应式对象的 Ref
 * @returns 接受 valueKey / unitKey 的 blur 处理函数
 */
export function useUnitAutoFill<T extends Record<string, any>>(
  objRef: Ref<T>,
): (valueKey: keyof T | (keyof T)[], unitKey: keyof T) => void {
  return (valueKey, unitKey) => autoFillUnit(objRef.value, valueKey, unitKey);
}
