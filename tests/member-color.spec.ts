import { describe, it, expect } from 'vitest';
import { memberColor } from '@/utils/member-color';

describe('memberColor', () => {
  it('同一用户 ID 返回稳定颜色', () => {
    expect(memberColor(1)).toBe(memberColor(1));
    expect(memberColor(42)).toBe(memberColor(42));
  });

  it('返回合法十六进制颜色值', () => {
    expect(memberColor(1)).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('负数 ID 也能取到色板颜色', () => {
    expect(memberColor(-3)).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
