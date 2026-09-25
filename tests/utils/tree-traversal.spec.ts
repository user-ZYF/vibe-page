import { describe, it, expect } from 'vitest';
import { findElementInTree } from '@/utils/tree-traversal';
import type { CanvasDivElement, CanvasRootElement, CanvasSpanElement, CanvasTextElement } from '@/views/Canvas/types';
import { CanvasElementTypeEnum } from '@/constants/home';

/** 构造嵌套元素树：root > div > span > text */
function mkTree(): { root: CanvasRootElement; div: CanvasDivElement; span: CanvasSpanElement; text: CanvasTextElement } {
  const text: CanvasTextElement = {
    id: 'text-1',
    type: CanvasElementTypeEnum.TEXT,
    classes: [],
    text: '文本',
  };
  const span: CanvasSpanElement = {
    id: 'span-1',
    type: CanvasElementTypeEnum.SPAN,
    classes: [],
    children: [text],
  };
  const div: CanvasDivElement = {
    id: 'div-1',
    type: CanvasElementTypeEnum.DIV,
    classes: [],
    children: [span],
  };
  const root: CanvasRootElement = {
    id: 'root-1',
    type: CanvasElementTypeEnum.ROOT,
    classes: [],
    children: [div],
  };
  return { root, div, span, text };
}

describe('findElementInTree', () => {
  it('命中根元素', () => {
    const { root } = mkTree();
    expect(findElementInTree(root, 'root-1')).toBe(root);
  });

  it('命中深层嵌套元素', () => {
    const { root, text } = mkTree();
    expect(findElementInTree(root, 'text-1')).toBe(text);
  });

  it('命中中间层元素', () => {
    const { root, span } = mkTree();
    expect(findElementInTree(root, 'span-1')).toBe(span);
  });

  it('未命中返回 null', () => {
    const { root } = mkTree();
    expect(findElementInTree(root, 'not-exist')).toBeNull();
  });

  it('空树未命中返回 null', () => {
    const root: CanvasRootElement = {
      id: 'root-1',
      type: CanvasElementTypeEnum.ROOT,
      classes: [],
      children: [],
    };
    expect(findElementInTree(root, 'any')).toBeNull();
  });
});
