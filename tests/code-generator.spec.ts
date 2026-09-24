import { describe, it, expect } from 'vitest';
import { generateHtml, generateCss } from '@/utils/code-generator';
import { ButtonTypeEnum, CanvasElementTypeEnum, HeadingLevelEnum, LinkTargetEnum } from '@/constants/home';
import { StyleRuleTypeEnum } from '@/constants/style';
import type {
  CanvasButtonElement,
  CanvasGeneralElement,
  CanvasHeadingElement,
  CanvasImageElement,
  CanvasInnerElement,
  CanvasLinkElement,
  CanvasRootElement,
  CanvasStyleRule,
  CanvasTextElement,
} from '@/views/Canvas/types';

/** 构造根元素 */
function mkRoot(children: CanvasInnerElement[] = []): CanvasRootElement {
  return { id: 'root1', type: CanvasElementTypeEnum.ROOT, classes: [], children };
}

/** 构造按钮元素 */
function mkButton(id: string, text: string): CanvasButtonElement {
  return { id, type: CanvasElementTypeEnum.BUTTON, classes: [], text, buttonType: ButtonTypeEnum.BUTTON, disabled: false };
}

/** 构造标题元素 */
function mkHeading(id: string, level: HeadingLevelEnum): CanvasHeadingElement {
  return { id, type: CanvasElementTypeEnum.HEADING, classes: [], text: '标题', level };
}

/** 构造图片元素 */
function mkImage(id: string): CanvasImageElement {
  return { id, type: CanvasElementTypeEnum.IMAGE, classes: [], src: 'a.png', title: '图' };
}

/** 构造通用元素 */
function mkGeneral(id: string, tagName: string, children: CanvasInnerElement[] = []): CanvasGeneralElement {
  return { id, type: CanvasElementTypeEnum.GENERAL, classes: [], tagName, attributes: {}, children };
}

/** 构造纯文本元素 */
function mkText(id: string, text: string): CanvasTextElement {
  return { id, type: CanvasElementTypeEnum.TEXT, classes: [], text };
}

/** 构造超链接元素 */
function mkLink(id: string, target?: LinkTargetEnum): CanvasLinkElement {
  return { id, type: CanvasElementTypeEnum.LINK, classes: [], href: 'a.html', target, children: [] };
}

describe('generateHtml', () => {
  it('根元素渲染为 body 标签并携带 id', () => {
    expect(generateHtml(mkRoot())).toBe('<body id="root1"></body>');
  });

  it('子元素按缩进换行输出', () => {
    const html = generateHtml(mkRoot([mkButton('b1', '按钮')]));
    expect(html).toBe('<body id="root1">\n  <button id="b1" type="button">按钮</button>\n</body>');
  });

  it('标题按 level 渲染 h1~h6', () => {
    expect(generateHtml(mkRoot([mkHeading('h2', HeadingLevelEnum.H2)]))).toContain('<h2 id="h2">');
    expect(generateHtml(mkRoot([mkHeading('h6', HeadingLevelEnum.H6)]))).toContain('<h6 id="h6">');
  });

  it('文本内容做 HTML 转义', () => {
    const html = generateHtml(mkRoot([mkButton('b1', '<img>&')]));
    expect(html).not.toContain('<img>');
    expect(html).toContain('\u0026lt;img\u0026gt;\u0026amp;');
  });

  it('仅输出已启用的 class', () => {
    const el = mkButton('b1', '按钮');
    el.classes = [
      { name: 'on', enabled: true },
      { name: 'off', enabled: false },
    ];
    expect(generateHtml(mkRoot([el]))).toContain('class="on"');
  });

  it('img 等空元素自闭合', () => {
    const html = generateHtml(mkRoot([mkImage('i1')]));
    expect(html).toContain('<img id="i1" src="a.png" alt="图" />');
  });

  it('通用元素原样输出存储的标签名（合法性由解析入库与改名时保证）', () => {
    const el = mkGeneral('g1', 'marquee', [mkText('t1', '<b>raw</b>')]);
    const html = generateHtml(mkRoot([el]));
    expect(html).toContain('<marquee id="g1">');
  });

  it('通用元素内的文本内容照常转义', () => {
    const el = mkGeneral('g1', 'marquee', [mkText('t1', 'a</marquee>b')]);
    const html = generateHtml(mkRoot([el]));
    expect(html).toContain('a&lt;/marquee&gt;b');
  });
  it('通用元素脏数据标签名回退兜底标签（大小写不敏感）', () => {
    const html = generateHtml(mkRoot([mkGeneral('g1', 'script'), mkGeneral('g2', 'IFRAME')]));
    expect(html).toContain('<div id="g1"');
    expect(html).toContain('<div id="g2"');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<iframe');
  });

  it('target="_blank" 时自动补 rel="noopener"', () => {
    const html = generateHtml(mkRoot([mkLink('l1', LinkTargetEnum.BLANK)]));
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener"');
    // 非新窗口不输出 rel
    const selfHtml = generateHtml(mkRoot([mkLink('l2', LinkTargetEnum.SELF)]));
    expect(selfHtml).not.toContain('rel=');
  });

  it('标题 level 枚举范围外脏数据回退 h1', () => {
    const dirty = { ...mkHeading('h9', HeadingLevelEnum.H2), level: 9 as HeadingLevelEnum };
    expect(generateHtml(mkRoot([dirty]))).toContain('<h1 id="h9">');
    const zero = { ...mkHeading('h0', HeadingLevelEnum.H2), level: 0 as HeadingLevelEnum };
    expect(generateHtml(mkRoot([zero]))).toContain('<h1 id="h0">');
  });
});

describe('generateCss', () => {
  it('按声明输出规则（自动补 box-sizing 前缀）', () => {
    const rules: CanvasStyleRule[] = [
      { type: StyleRuleTypeEnum.EDITABLE, selector: '.a', style: { color: 'red' } },
    ];
    expect(generateCss(rules)).toBe('* {\n  box-sizing: border-box;\n}\n\n.a {\n  color: red;\n}');
  });

  it('无 box-sizing 规则时自动补在最前且不带 !important', () => {
    const css = generateCss([{ type: StyleRuleTypeEnum.EDITABLE, selector: '.a', style: { color: 'red' } }]);
    expect(css.startsWith('* {\n  box-sizing: border-box;\n}')).toBe(true);
    expect(css).not.toContain('!important');
  });

  it('已有 * box-sizing 声明时不重复添加', () => {
    const css = generateCss([
      { type: StyleRuleTypeEnum.EDITABLE, selector: '*', style: { 'box-sizing': 'content-box' } },
    ]);
    expect(css).not.toContain('border-box');
    expect(css).toContain('content-box');
  });

  it('at-rule 原样透传（仅重写 < 防 </style> 截断）', () => {
    const css = generateCss([
      { type: StyleRuleTypeEnum.AT_RULE, selector: '', style: {}, atRuleCssText: '@media print { .a { color: red; } }' },
    ]);
    expect(css).toContain('@media print { .a { color: red; } }');
    const withLt = generateCss([
      { type: StyleRuleTypeEnum.AT_RULE, selector: '', style: {}, atRuleCssText: '@media x { .a { content: "</style>"; } }' },
    ]);
    expect(withLt).not.toContain('</style>');
  });

  it('声明值含规则逃逸字符时整条声明丢弃', () => {
    const css = generateCss([
      {
        type: StyleRuleTypeEnum.EDITABLE,
        selector: '.a',
        style: {
          color: 'red;}*{display:none',
          background: 'linear-gradient(red, blue)',
          backgroundImage: 'url("data:image/png;base64,AA")',
        },
      },
    ]);
    expect(css).not.toContain('display:none');
    expect(css).toContain('background: linear-gradient(red, blue);');
    expect(css).toContain('backgroundImage: url("data:image/png;base64,AA");');
  });

  it('声明值中的 < 重写为定长转义，防 </style> 截断', () => {
    const css = generateCss([
      { type: StyleRuleTypeEnum.EDITABLE, selector: '.a', style: { content: '"x</style>y"' } },
    ]);
    expect(css).not.toContain('</style>');
    expect(css).toContain('\\00003c');
  });

  it('非法属性名与含 { } < / 的选择器对应声明/规则被丢弃', () => {
    const css = generateCss([
      { type: StyleRuleTypeEnum.EDITABLE, selector: '.a}*{', style: { color: 'red' } },
      { type: StyleRuleTypeEnum.EDITABLE, selector: '.e}', style: { color: 'red' } },
      { type: StyleRuleTypeEnum.EDITABLE, selector: '.d/*', style: { color: 'red' } },
      { type: StyleRuleTypeEnum.EDITABLE, selector: '.b', style: { 'x;y': 'red', color: 'blue' } },
    ]);
    expect(css).not.toContain('.a}*{');
    expect(css).not.toContain('.e}');
    expect(css).not.toContain('.d/*');
    expect(css).not.toContain('x;y');
    expect(css).toContain('.b {\n  color: blue;\n}');
  });
});
