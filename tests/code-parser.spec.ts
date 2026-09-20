import { describe, it, expect } from 'vitest';
import { parseCodeToCanvas } from '@/utils/code-parser';
import { generateCss, generateHtml } from '@/utils/code-generator';
import { CanvasElementTypeEnum, HeadingLevelEnum } from '@/constants/home';
import { StyleRuleTypeEnum } from '@/constants/style';
import type { CanvasContainerElement, CanvasRootElement } from '@/views/Canvas/types';

describe('parseCodeToCanvas', () => {
  it('解析常见标签为对应画布元素', () => {
    const { children } = parseCodeToCanvas('<div id="d1"></div><h2 id="h2">标题</h2>', '');
    expect(children[0].type).toBe(CanvasElementTypeEnum.CONTAINER);
    expect(children[1].type).toBe(CanvasElementTypeEnum.HEADING);
    expect((children[1] as { level?: HeadingLevelEnum }).level).toBe(HeadingLevelEnum.H2);
  });

  it('保留元素 id 与 class', () => {
    const { children } = parseCodeToCanvas('<div id="d1" class="a b"></div>', '');
    expect(children[0].id).toBe('d1');
    expect(children[0].classes.map((c) => c.name)).toEqual(['a', 'b']);
  });

  it('重复 id 自动重新生成', () => {
    const { children } = parseCodeToCanvas('<div id="dup"></div><p id="dup"></p>', '');
    expect(children[0].id).toBe('dup');
    expect(children[1].id).not.toBe('dup');
  });

  it('行内样式合并进 #id 规则', () => {
    const { styleRules } = parseCodeToCanvas('<div id="d1" style="color: red"></div>', '');
    expect(styleRules.find((r) => r.selector === '#d1')?.style.color).toBe('red');
  });

  it('简单选择器规则可编辑、复合选择器透传', () => {
    const { styleRules } = parseCodeToCanvas('<div class="a"></div>', '.a { color: red; } .a .b { color: blue; }');
    expect(styleRules.find((r) => r.selector === '.a')?.type).toBe(StyleRuleTypeEnum.EDITABLE);
    expect(styleRules.find((r) => r.selector === '.a .b')?.type).toBe(StyleRuleTypeEnum.RAW);
  });

  it('引用但未定义的 class 补空规则', () => {
    const { styleRules } = parseCodeToCanvas('<div class="ghost"></div>', '');
    const rule = styleRules.find((r) => r.selector === '.ghost');
    expect(rule?.type).toBe(StyleRuleTypeEnum.EDITABLE);
    expect(Object.keys(rule?.style ?? {})).toHaveLength(0);
  });

  it('未知标签静默跳过', () => {
    const { children } = parseCodeToCanvas('<custom-el></custom-el><div></div>', '');
    expect(children).toHaveLength(1);
  });

  it('fragment 输入 rootPatch 为 null', () => {
    expect(parseCodeToCanvas('<div></div>', '').rootPatch).toBeNull();
  });

  it('body 标签属性进入 rootPatch，行内样式合并进 #bodyId 规则', () => {
    const { rootPatch, styleRules } = parseCodeToCanvas('<body id="b1" class="c" style="color: red"></body>', '');
    expect(rootPatch?.id).toBe('b1');
    expect(rootPatch?.classes.map((c) => c.name)).toEqual(['c']);
    expect(styleRules.find((r) => r.selector === '#b1')?.style.color).toBe('red');
  });

  it('body id 与子元素冲突时回退到传入的根 id', () => {
    const { rootPatch } = parseCodeToCanvas('<body id="d1"><div id="d1"></div></body>', '', 'fallbackId');
    expect(rootPatch?.id).toBe('fallbackId');
  });
});

describe('parseCodeToCanvas 与 code-generator 往返', () => {
  it('二次解析保持元素 id 与规则文本稳定', () => {
    const html = '<div id="d1" class="a"><p id="p1">hi</p></div>';
    const css = '#d1 { color: red; }';
    const first = parseCodeToCanvas(html, css);
    const root: CanvasRootElement = {
      id: 'b1',
      type: CanvasElementTypeEnum.ROOT,
      classes: [],
      children: first.children,
    };
    const firstCss = generateCss(first.styleRules);
    const second = parseCodeToCanvas(generateHtml(root), firstCss, 'b1');
    expect(second.children).toHaveLength(first.children.length);
    expect(second.children[0].id).toBe('d1');
    expect((second.children[0] as CanvasContainerElement).children[0].id).toBe('p1');
    expect(generateCss(second.styleRules)).toBe(firstCss);
  });
});
