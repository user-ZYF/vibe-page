import { describe, it, expect } from 'vitest';
import {
  CanvasElementTypeEnum,
  HeadingLevelEnum,
  getElementDisplayName,
} from '@/constants/home';
import type { CanvasDivElement, CanvasHeadingElement, CanvasButtonElement, CanvasGeneralElement } from '@/views/Canvas/types';
import { ButtonTypeEnum } from '@/constants/home';

describe('getElementDisplayName', () => {
  it('别名优先', () => {
    const el: CanvasDivElement = { id: 'c1', type: CanvasElementTypeEnum.DIV, classes: [], children: [], alias: '卡片' };
    expect(getElementDisplayName(el)).toBe('卡片');
  });

  it('标题元素按级别显示 h1~h6', () => {
    const el: CanvasHeadingElement = { id: 'h1', type: CanvasElementTypeEnum.HEADING, classes: [], level: HeadingLevelEnum.H3, text: '标题' };
    expect(getElementDisplayName(el)).toBe('h3');
  });

  it('通用元素显示原始标签名', () => {
    const el: CanvasGeneralElement = { id: 'g1', type: CanvasElementTypeEnum.GENERAL, classes: [], tagName: 'marquee', children: [] };
    expect(getElementDisplayName(el)).toBe('marquee');
  });

  it('其余查类型标签映射', () => {
    const button: CanvasButtonElement = { id: 'b1', type: CanvasElementTypeEnum.BUTTON, classes: [], text: '', buttonType: ButtonTypeEnum.BUTTON, disabled: false };
    const div: CanvasDivElement = { id: 'c2', type: CanvasElementTypeEnum.DIV, classes: [], children: [] };
    expect(getElementDisplayName(button)).toBe('button');
    expect(getElementDisplayName(div)).toBe('div');
  });
});
