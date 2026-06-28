import { SizeUnitEnum } from '@/constants/style';

/**
 * 创建单位自动填充的 blur 处理函数
 *
 * 值不为空且单位为空时，自动填充 px
 *
 * @param obj 响应式对象
 * @returns 接受 valueKey / unitKey 的 blur 处理函数
 */
export function useUnitAutoFill<T extends Record<string, any>>(
  obj: T,
): (valueKey: keyof T | (keyof T)[], unitKey: keyof T) => void {
  return (valueKey, unitKey) => {
    const keys = Array.isArray(valueKey) ? valueKey : [valueKey];
    const hasValue = keys.some((k) => obj[k] !== null && obj[k] !== undefined && obj[k] !== '');

    if (hasValue && (obj[unitKey] === null || obj[unitKey] === undefined || obj[unitKey] === '')) {
      obj[unitKey] = SizeUnitEnum.PX as T[keyof T];
    }
  };
}
