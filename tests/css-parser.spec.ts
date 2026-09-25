import { describe, it, expect } from 'vitest';
import { parseCss } from '@/utils/css-parser';

describe('parseCss', () => {
  it('解析简单规则为选择器与声明', () => {
    const rules = parseCss('.a { color: red; }');
    expect(rules).toHaveLength(1);
    expect(rules[0].selector).toBe('.a');
    expect(rules[0].style.color).toBe('red');
  });

  it('非法声明被丢弃', () => {
    const rules = parseCss('.a { color: bad-value!; }');
    expect(rules[0].style.color ?? '').toBe('');
  });

  it('important 标记保留在值中', () => {
    const rules = parseCss('.a { color: red !important; }');
    expect(rules[0].style.color).toContain('important');
  });

  it('at-rule 以完整文本透传', () => {
    const rules = parseCss('@media (min-width: 1px) { .a { color: red; } }');
    expect(rules[0].atRuleCssText).toContain('@media');
    expect(rules[0].selector).toBe('');
  });

  it('@import 规则被剔除，不进入解析结果', () => {
    const rules = parseCss('@import "https://a.com/x.css"; .a { color: red; }');
    expect(rules).toHaveLength(1);
    expect(rules[0].selector).toBe('.a');
  });
});
