import { customAlphabet } from 'nanoid';

/** 5 位随机串生成器（字符集为字母、数字、下划线），拼接 vp_ 前缀后总长 8 位 */
const nanoid5 = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_', 5);

/** 生成 5 位随机元素 ID，拼接 vp_ 前缀确保以字母开头、符合 CSS_NAME_REGEX 校验规则 */
export function generateId() {
  return `vp_${nanoid5()}`;
}
