import { describe, it, expect } from 'vitest';
import {
  CanvasElementTypeEnum,
  HeadingLevelEnum,
  getElementDisplayName,
  normalizeHeadingLevel,
} from '@/constants/home';

describe('normalizeHeadingLevel', () => {
  it('合法级别原样返回', () => {
    expect(normalizeHeadingLevel(HeadingLevelEnum.H3)).toBe(HeadingLevelEnum.H3);
    expect(normalizeHeadingLevel(HeadingLevelEnum.H1)).toBe(HeadingLevelEnum.H1);
    expect(normalizeHeadingLevel(HeadingLevelEnum.H6)).toBe(HeadingLevelEnum.H6);
  });

  it('越界、非整数与未定义回退 H1', () => {
    expect(normalizeHeadingLevel(HeadingLevelEnum.UNDEFINED)).toBe(HeadingLevelEnum.H1);
    expect(normalizeHeadingLevel(7)).toBe(HeadingLevelEnum.H1);
    expect(normalizeHeadingLevel(1.5)).toBe(HeadingLevelEnum.H1);
    expect(normalizeHeadingLevel(undefined)).toBe(HeadingLevelEnum.H1);
  });
});

describe('getElementDisplayName', () => {
  it('别名优先', () => {
    expect(getElementDisplayName({ type: CanvasElementTypeEnum.CONTAINER, alias: '卡片' })).toBe('卡片');
  });

  it('标题元素按级别显示 h1~h6', () => {
    expect(getElementDisplayName({ type: CanvasElementTypeEnum.HEADING, level: HeadingLevelEnum.H3 })).toBe('h3');
    expect(getElementDisplayName({ type: CanvasElementTypeEnum.HEADING, level: undefined })).toBe('h1');
  });

  it('其余查类型标签映射', () => {
    expect(getElementDisplayName({ type: CanvasElementTypeEnum.BUTTON })).toBe('button');
    expect(getElementDisplayName({ type: CanvasElementTypeEnum.CONTAINER })).toBe('container');
  });
});
