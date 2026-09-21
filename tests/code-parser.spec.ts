import { describe, it, expect } from 'vitest';
import { parseCodeToCanvas } from '@/utils/code-parser';
import { generateCss, generateHtml } from '@/utils/code-generator';
import { CanvasElementTypeEnum, HeadingLevelEnum } from '@/constants/home';
import { StyleRuleTypeEnum } from '@/constants/style';
import type { CanvasDivElement, CanvasGeneralElement, CanvasRootElement } from '@/views/Canvas/types';

describe('parseCodeToCanvas', () => {
  it('解析常见标签为对应画布元素', () => {
    const { children } = parseCodeToCanvas('<div id="d1"></div><h2 id="h2">标题</h2>', '');
    expect(children[0].type).toBe(CanvasElementTypeEnum.DIV);
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

  it('未知标签保留为通用元素', () => {
    const { children } = parseCodeToCanvas('<custom-el data-x="1"><b>hi</b></custom-el><div></div>', '');
    expect(children).toHaveLength(2);
    expect(children[0].type).toBe(CanvasElementTypeEnum.GENERAL);
    const general = children[0] as CanvasGeneralElement;
    expect(general.tagName).toBe('custom-el');
    expect(general.attributes['data-x']).toBe('1');
    expect(general.children).toHaveLength(1);
    expect((general.children[0] as CanvasGeneralElement).tagName).toBe('b');
  });

  it('通用元素的 on* 事件属性与危险 URL 属性被净化，id 不进入属性表', () => {
    const { children } = parseCodeToCanvas(
      '<custom-el id="c1" onclick="alert(1)" formaction="javascript:alert(1)" title="t"></custom-el>',
      ''
    );
    const general = children[0] as CanvasGeneralElement;
    expect(general.id).toBe('c1');
    expect(general.attributes).not.toHaveProperty('id');
    expect(general.attributes).not.toHaveProperty('onclick');
    expect(general.attributes).not.toHaveProperty('formaction');
    expect(general.attributes.title).toBe('t');
  });

  it('script/iframe/object 等危险标签连同子树被丢弃，不进入画布', () => {
    const { children } = parseCodeToCanvas(
      '<script>alert(1)</script><iframe src="https://a.com"><p>inner</p></iframe><object><div>inner</div></object><div id="ok"></div>',
      ''
    );
    expect(children).toHaveLength(1);
    expect(children[0].id).toBe('ok');
  });

  it('style 元素内容并入 CSS 规则且排在用户输入 CSS 之前，元素本身不进入画布', () => {
    const { children, styleRules } = parseCodeToCanvas(
      '<style>.a { color: red; }</style><div></div>',
      '.b { color: blue; }'
    );
    expect(children).toHaveLength(1);
    const aIndex = styleRules.findIndex((r) => r.selector === '.a');
    const bIndex = styleRules.findIndex((r) => r.selector === '.b');
    expect(aIndex).toBeGreaterThanOrEqual(0);
    expect(bIndex).toBeGreaterThan(aIndex);
  });

  it('style 元素与用户 CSS 同选择器时用户 CSS 胜出（用户 CSS 位于其下方）', () => {
    const { styleRules } = parseCodeToCanvas(
      '<style>.a { color: red; }</style>',
      '.a { color: blue; }'
    );
    const cssText = generateCss(styleRules);
    expect(cssText).toContain('color: blue');
    expect(cssText).not.toContain('color: red');
  });

  it('head 中的 style 元素内容同样并入 CSS 规则', () => {
    const { children, styleRules } = parseCodeToCanvas(
      '<head><style>.h { color: red; }</style></head><div></div>',
      ''
    );
    expect(children).toHaveLength(1);
    expect(styleRules.find((r) => r.selector === '.h')?.style.color).toBe('red');
  });

  it('style 元素的 media 属性包装为 @media 规则', () => {
    const { styleRules } = parseCodeToCanvas(
      '<style media="print">.p { color: red; }</style>',
      ''
    );
    const rule = styleRules.find((r) => r.type === StyleRuleTypeEnum.AT_RULE);
    expect(rule?.atRuleCssText).toContain('@media print');
    expect(rule?.atRuleCssText).toContain('color: red');
  });

  it('on* 事件属性不进入画布元素模型', () => {
    const { children } = parseCodeToCanvas(
      '<div id="d1" onclick="alert(1)"><img id="i1" src="x.png" onerror="alert(2)"></div>',
      ''
    );
    expect(children[0]).not.toHaveProperty('onclick');
    const img = (children[0] as CanvasDivElement).children[0];
    expect(img).not.toHaveProperty('onerror');
    expect((img as { src?: string }).src).toBe('x.png');
  });

  it('非法 id 重新生成，data-* 等未识别属性不进入模型', () => {
    const { children } = parseCodeToCanvas('<div id="a&quot;b" data-x="1" aria-hidden="true"></div>', '');
    expect(children[0].id).not.toBe('a"b');
    expect(children[0]).not.toHaveProperty('data-x');
    expect(children[0]).not.toHaveProperty('aria-hidden');
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

  it('危险协议 URL 属性导入时净化为空', () => {
    const { children } = parseCodeToCanvas(
      '<a href="javascript:alert(1)">x</a><img src="data:text/html,<h1>x</h1>"><form action="file:///x"></form>',
      ''
    );
    expect((children[0] as { href?: string }).href).toBe('');
    expect((children[1] as { src?: string }).src).toBe('');
    expect((children[2] as { action?: string }).action).toBe('');
  });

  it('媒体类 data: URL 属性导入时保留', () => {
    const { children } = parseCodeToCanvas(
      '<img src="data:image/png;base64,AAAA"><a href="https://a.com/p">x</a>',
      ''
    );
    expect((children[0] as { src?: string }).src).toBe('data:image/png;base64,AAAA');
    expect((children[1] as { href?: string }).href).toBe('https://a.com/p');
  });

  it('行内样式中的不安全 url() 导入时净化', () => {
    const { styleRules } = parseCodeToCanvas('<div id="d1" style="background-image: url(\'file:///x\')"></div>', '');
    expect(styleRules.find((r) => r.selector === '#d1')?.style['background-image']).toBe('url()');
  });

  it('CSS 规则声明中的不安全 url() 导入时净化', () => {
    const { styleRules } = parseCodeToCanvas('', '.a { background-image: url("file:///x"); }');
    expect(styleRules.find((r) => r.selector === '.a')?.style['background-image']).toBe('url()');
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
    expect((second.children[0] as CanvasDivElement).children[0].id).toBe('p1');
    expect(generateCss(second.styleRules)).toBe(firstCss);
  });

  it('通用元素往返保持标签、属性与子元素', () => {
    const html = '<marquee id="m1" direction="left" scrollamount="4"><span id="s1">hi</span></marquee>';
    const first = parseCodeToCanvas(html, '');
    const root: CanvasRootElement = {
      id: 'b1',
      type: CanvasElementTypeEnum.ROOT,
      classes: [],
      children: first.children,
    };
    const generated = generateHtml(root);
    expect(generated).toContain('<marquee');
    expect(generated).toContain('direction="left"');
    expect(generated).toContain('scrollamount="4"');
    const second = parseCodeToCanvas(generated, '', 'b1');
    const general = second.children[0] as CanvasGeneralElement;
    expect(general.type).toBe(CanvasElementTypeEnum.GENERAL);
    expect(general.tagName).toBe('marquee');
    expect(general.attributes.direction).toBe('left');
    expect(general.children).toHaveLength(1);
  });

  it('script 元素不进入画布，生成代码中也不再保留', () => {
    const first = parseCodeToCanvas('<script id="sc" type="module">const a = 1;</script>', '');
    expect(first.children).toHaveLength(0);
    const root: CanvasRootElement = {
      id: 'b1',
      type: CanvasElementTypeEnum.ROOT,
      classes: [],
      children: first.children,
    };
    const generated = generateHtml(root);
    expect(generated).not.toContain('<script');
    expect(generated).not.toContain('const a = 1;');
  });
});
