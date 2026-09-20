import { describe, it, expect } from 'vitest';
import { generateId } from '@/utils/id';
import { CSS_NAME_REGEX } from '@/constants/style';

describe('generateId', () => {
  it('生成以 vp_ 开头且总长 8 位的 id', () => {
    const id = generateId();
    expect(id.startsWith('vp_')).toBe(true);
    expect(id.length).toBe(8);
  });

  it('随机部分仅包含字母、数字和下划线', () => {
    expect(generateId().slice(3)).toMatch(/^[A-Za-z0-9_]{5}$/);
  });

  it('符合 CSS 名称校验规则', () => {
    expect(CSS_NAME_REGEX.test(generateId())).toBe(true);
  });

  it('批量生成不重复', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});
