import { describe, it, expect } from 'vitest';
import { isSubtreeAllowed, isChildTypeAllowed } from '@/views/Canvas/types';
import type {
  CanvasInnerElement,
  CanvasGeneralElement,
  CanvasDivElement,
  CanvasSpanElement,
  CanvasLinkElement,
  CanvasTextElement,
  CanvasListItemElement,
  CanvasButtonElement,
  CanvasRootElement,
  CanvasTableElement,
  CanvasTableCaptionElement,
  CanvasHeaderElement,
  CanvasFooterElement,
} from '@/views/Canvas/types';
import { CanvasElementTypeEnum, ButtonTypeEnum, LinkTargetEnum } from '@/constants/home';

/** 构造通用元素 */
function mkGeneral(tagName: string, children: CanvasInnerElement[] = []): CanvasGeneralElement {
  return { id: `g-${tagName}`, type: CanvasElementTypeEnum.GENERAL, tagName, classes: [], children };
}

/** 构造容器元素 */
function mkDiv(children: CanvasInnerElement[] = []): CanvasDivElement {
  return { id: 'div1', type: CanvasElementTypeEnum.DIV, classes: [], children };
}

/** 构造 span 元素 */
function mkSpan(children: CanvasInnerElement[] = []): CanvasSpanElement {
  return { id: 'span1', type: CanvasElementTypeEnum.SPAN, classes: [], children };
}

/** 构造超链接元素 */
function mkLink(children: CanvasInnerElement[] = []): CanvasLinkElement {
  return { id: 'a1', type: CanvasElementTypeEnum.LINK, classes: [], href: '', target: LinkTargetEnum.SELF, children };
}

/** 构造纯文本元素 */
function mkText(text = 'hi'): CanvasTextElement {
  return { id: 't1', type: CanvasElementTypeEnum.TEXT, classes: [], text };
}

/** 构造列表项元素 */
function mkListItem(children: CanvasInnerElement[] = []): CanvasListItemElement {
  return { id: 'li1', type: CanvasElementTypeEnum.LIST_ITEM, classes: [], children };
}

/** 构造按钮元素 */
function mkButton(): CanvasButtonElement {
  return { id: 'btn1', type: CanvasElementTypeEnum.BUTTON, classes: [], text: 'x', buttonType: ButtonTypeEnum.BUTTON, disabled: false };
}

/** 构造根元素 */
function mkRoot(children: CanvasInnerElement[] = []): CanvasRootElement {
  return { id: 'root1', type: CanvasElementTypeEnum.ROOT, classes: [], children };
}

/** 构造表格元素 */
function mkTable(children: CanvasInnerElement[] = []): CanvasTableElement {
  return { id: 'table1', type: CanvasElementTypeEnum.TABLE, classes: [], children };
}

/** 构造表格标题元素 */
function mkCaption(children: CanvasInnerElement[] = []): CanvasTableCaptionElement {
  return { id: 'caption1', type: CanvasElementTypeEnum.TABLE_CAPTION, classes: [], children };
}

/** 构造页头元素 */
function mkHeader(children: CanvasInnerElement[] = []): CanvasHeaderElement {
  return { id: 'header1', type: CanvasElementTypeEnum.HEADER, classes: [], children };
}

/** 构造页脚元素 */
function mkFooter(children: CanvasInnerElement[] = []): CanvasFooterElement {
  return { id: 'footer1', type: CanvasElementTypeEnum.FOOTER, classes: [], children };
}

describe('通用元素作为父元素的标签约束', () => {
  it('select 只接收 option/optgroup 等，拒绝 div 与 button', () => {
    const select = mkGeneral('select');
    expect(isSubtreeAllowed(select, mkGeneral('option'))).toBe(true);
    expect(isSubtreeAllowed(select, mkGeneral('optgroup'))).toBe(true);
    expect(isSubtreeAllowed(select, mkDiv())).toBe(false);
    expect(isSubtreeAllowed(select, mkButton())).toBe(false);
    expect(isChildTypeAllowed(select, CanvasElementTypeEnum.BUTTON)).toBe(false);
    expect(isChildTypeAllowed(select, CanvasElementTypeEnum.DIV)).toBe(false);
  });

  it('optgroup 只接收 option', () => {
    const optgroup = mkGeneral('optgroup');
    expect(isSubtreeAllowed(optgroup, mkGeneral('option'))).toBe(true);
    expect(isSubtreeAllowed(optgroup, mkGeneral('optgroup'))).toBe(false);
  });

  it('option 只接收文本，拒绝元素子节点', () => {
    const option = mkGeneral('option');
    expect(isSubtreeAllowed(option, mkText())).toBe(true);
    expect(isSubtreeAllowed(option, mkSpan())).toBe(false);
  });

  it('select 白名单不含 #text，拒绝文本子节点', () => {
    expect(isSubtreeAllowed(mkGeneral('select'), mkText())).toBe(false);
  });

  it('dl 接收 dt/dd/div，拒绝其他', () => {
    const dl = mkGeneral('dl');
    expect(isSubtreeAllowed(dl, mkGeneral('dt'))).toBe(true);
    expect(isSubtreeAllowed(dl, mkGeneral('dd'))).toBe(true);
    expect(isSubtreeAllowed(dl, mkDiv())).toBe(true);
    expect(isSubtreeAllowed(dl, mkGeneral('select'))).toBe(false);
    expect(isChildTypeAllowed(dl, CanvasElementTypeEnum.PARAGRAPH)).toBe(false);
  });

  it('行内通用元素后代必须是 phrasing content', () => {
    const em = mkGeneral('em');
    expect(isSubtreeAllowed(em, mkGeneral('strong'))).toBe(true);
    expect(isSubtreeAllowed(em, mkSpan())).toBe(true);
    expect(isSubtreeAllowed(em, mkDiv())).toBe(false);
    /** 后代递归：em 内含 div 的子树被整体拒绝 */
    expect(isSubtreeAllowed(em, mkGeneral('strong', [mkDiv()]))).toBe(false);
  });

  it('无标签约束的通用元素接受所有子元素', () => {
    const marquee = mkGeneral('marquee');
    expect(isSubtreeAllowed(marquee, mkDiv())).toBe(true);
    expect(isSubtreeAllowed(marquee, mkGeneral('whatever'))).toBe(true);
  });
});

describe('通用元素作为子元素的标签约束', () => {
  it('span 接受 phrasing 通用子元素，拒绝非 phrasing', () => {
    const span = mkSpan();
    expect(isSubtreeAllowed(span, mkGeneral('em'))).toBe(true);
    expect(isSubtreeAllowed(span, mkGeneral('select'))).toBe(true);
    expect(isSubtreeAllowed(span, mkGeneral('div'))).toBe(false);
    /** 类型层面放行，交给子树校验 */
    expect(isChildTypeAllowed(span, CanvasElementTypeEnum.GENERAL)).toBe(true);
  });

  it('span 内通用元素的后代也按 phrasing 校验', () => {
    const span = mkSpan();
    expect(isSubtreeAllowed(span, mkGeneral('em', [mkDiv()]))).toBe(false);
    expect(isSubtreeAllowed(span, mkGeneral('em', [mkGeneral('b')]))).toBe(true);
  });

  it('a 拒绝交互式通用子元素，放行普通 phrasing', () => {
    const link = mkLink();
    expect(isSubtreeAllowed(link, mkGeneral('select'))).toBe(false);
    expect(isSubtreeAllowed(link, mkGeneral('details'))).toBe(false);
    expect(isSubtreeAllowed(link, mkGeneral('em'))).toBe(true);
  });

  it('ul 直接子元素白名单仅含 li，拒绝通用子元素', () => {
    const ul: CanvasInnerElement = { id: 'ul1', type: CanvasElementTypeEnum.UNORDERED_LIST, classes: [], children: [] };
    expect(isSubtreeAllowed(ul, mkGeneral('anything'))).toBe(false);
    expect(isSubtreeAllowed(ul, mkListItem())).toBe(true);
  });

  it('无约束父元素（div/root）接受通用子元素', () => {
    expect(isSubtreeAllowed(mkDiv(), mkGeneral('custom-el'))).toBe(true);
    expect(isSubtreeAllowed(mkRoot(), mkGeneral('custom-el'))).toBe(true);
  });

  it('address/dt 拒绝标题、分节与 header/footer 后代', () => {
    const address = mkGeneral('address');
    expect(isSubtreeAllowed(address, mkGeneral('h1'))).toBe(false);
    expect(isSubtreeAllowed(address, mkGeneral('section'))).toBe(false);
    expect(isSubtreeAllowed(address, mkHeader())).toBe(false);
    expect(isSubtreeAllowed(address, mkDiv())).toBe(true);

    const dt = mkGeneral('dt');
    expect(isSubtreeAllowed(dt, mkGeneral('h2'))).toBe(false);
    expect(isSubtreeAllowed(dt, mkGeneral('footer'))).toBe(false);
    expect(isSubtreeAllowed(dt, mkGeneral('article'))).toBe(false);
    expect(isSubtreeAllowed(dt, mkDiv())).toBe(true);
  });

  it('hgroup 后代仅允许标题与 p', () => {
    const hgroup = mkGeneral('hgroup');
    expect(isSubtreeAllowed(hgroup, mkGeneral('h2'))).toBe(true);
    expect(isSubtreeAllowed(hgroup, mkDiv())).toBe(false);
    expect(isSubtreeAllowed(hgroup, mkSpan())).toBe(false);
    /** 含文本子节点的通用标题同样放行（文本存于子节点，与真实标题元素的 text 字段行为一致） */
    expect(isSubtreeAllowed(hgroup, mkGeneral('h2', [mkText()]))).toBe(true);
  });
});

describe('元素类型级后代约束', () => {
  it('caption 拒绝 table 后代，接收普通 flow 内容', () => {
    const caption = mkCaption();
    expect(isSubtreeAllowed(caption, mkTable())).toBe(false);
    expect(isChildTypeAllowed(caption, CanvasElementTypeEnum.TABLE)).toBe(false);
    /** 嵌套在容器中的 table 后代同样被拒绝 */
    expect(isSubtreeAllowed(caption, mkDiv([mkTable()]))).toBe(false);
    /** 通用 table 标签同样被拒绝 */
    expect(isSubtreeAllowed(caption, mkGeneral('table'))).toBe(false);
    expect(isSubtreeAllowed(caption, mkDiv())).toBe(true);
  });

  it('header/footer 拒绝嵌套 header/footer', () => {
    const header = mkHeader();
    expect(isSubtreeAllowed(header, mkFooter())).toBe(false);
    expect(isSubtreeAllowed(header, mkHeader())).toBe(false);
    /** 深层后代同样被拒绝 */
    expect(isSubtreeAllowed(header, mkDiv([mkFooter()]))).toBe(false);
    /** 通用 header/footer 标签同样被拒绝 */
    expect(isSubtreeAllowed(header, mkGeneral('footer'))).toBe(false);
    expect(isSubtreeAllowed(header, mkDiv())).toBe(true);

    const footer = mkFooter();
    expect(isSubtreeAllowed(footer, mkHeader())).toBe(false);
    expect(isSubtreeAllowed(footer, mkGeneral('header'))).toBe(false);
    expect(isSubtreeAllowed(footer, mkDiv())).toBe(true);
  });
});
