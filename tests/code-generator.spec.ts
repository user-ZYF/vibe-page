import { describe, it, expect } from 'vitest';
import { generateHtml, generateCss } from '@/utils/code-generator';
import { ButtonTypeEnum, CanvasElementTypeEnum, HeadingLevelEnum } from '@/constants/home';
import { StyleRuleTypeEnum } from '@/constants/style';
import type {
  CanvasButtonElement,
  CanvasHeadingElement,
  CanvasImageElement,
  CanvasInnerElement,
  CanvasRootElement,
  CanvasStyleRule,
} from '@/views/Canvas/types';

/** 构造根元素 */
function mkRoot(children: CanvasInnerElement[] = []): CanvasRootElement {
  return { id: 'root1', type: CanvasElementTypeEnum.ROOT, classes: [], children };
}

/** 构造按钮元素 */
function mkButton(id: string, text: string): CanvasButtonElement {
  return { id, type: CanvasElementTypeEnum.BUTTON, classes: [], text, buttonType: ButtonTypeEnum.BUTTON };
}

/** 构造标题元素 */
function mkHeading(id: string, level: HeadingLevelEnum | undefined): CanvasHeadingElement {
  return { id, type: CanvasElementTypeEnum.HEADING, classes: [], text: '标题', level };
}

/** 构造图片元素 */
function mkImage(id: string): CanvasImageElement {
  return { id, type: CanvasElementTypeEnum.IMAGE, classes: [], src: 'a.png', title: '图' };
}

describe('generateHtml', () => {
  it('根元素渲染为 body 标签并携带 id', () => {
    expect(generateHtml(mkRoot())).toBe('<body id="root1"></body>');
  });

  it('子元素按缩进换行输出', () => {
    const html = generateHtml(mkRoot([mkButton('b1', '按钮')]));
    expect(html).toBe('<body id="root1">\n  <button id="b1" type="button">按钮</button>\n</body>');
  });

  it('标题按 level 渲染 h1~h6，脏数据回退 h1', () => {
    expect(generateHtml(mkRoot([mkHeading('h2', HeadingLevelEnum.H2)]))).toContain('<h2 id="h2">');
    expect(generateHtml(mkRoot([mkHeading('h7', 7 as HeadingLevelEnum)]))).toContain('<h1 id="h7">');
    expect(generateHtml(mkRoot([mkHeading('h0', undefined)]))).toContain('<h1 id="h0">');
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

  it('at-rule 原样透传', () => {
    const css = generateCss([
      { type: StyleRuleTypeEnum.AT_RULE, selector: '', style: {}, atRuleCssText: '@media print { .a { color: red; } }' },
    ]);
    expect(css).toContain('@media print');
  });
});
