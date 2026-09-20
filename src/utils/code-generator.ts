import {
  CanvasInnerElement,
  CanvasButtonElement,
  CanvasParagraphElement,
  CanvasImageElement,
  CanvasLinkElement,
  CanvasRootElement,
  CanvasElement,
  isParentElement,
  CanvasParentElement,
  CanvasInputElement,
  CanvasTextareaElement,
  CanvasRadioElement,
  CanvasCheckboxElement,
  CanvasVideoElement,
  CanvasAudioElement,
  CanvasLabelElement,
  CanvasFormElement,
  CanvasTextElement,
  CanvasTableColElement,
  CanvasTableDataElement,
  CanvasTableHeaderCellElement,
  CanvasTableColGroupElement,
  CanvasHeadingElement,
} from '@/views/Canvas/types';
import { CanvasElementTypeEnum, LinkTargetEnum, TABLE_SCOPE_ATTR_MAP, normalizeHeadingLevel } from '@/constants/home';
import { StyleRuleTypeEnum } from '@/constants/style';

import type { CanvasStyleRule } from '@/views/Canvas/types';
import { sanitizeUrl } from '@/utils/sanitize';

/** 元素类型到 HTML 标签的映射 */
const TAG_MAP: Record<CanvasElementTypeEnum, string> = {
  [CanvasElementTypeEnum.CONTAINER]: 'div',
  [CanvasElementTypeEnum.BUTTON]: 'button',
  [CanvasElementTypeEnum.PARAGRAPH]: 'p',
  [CanvasElementTypeEnum.IMAGE]: 'img',
  [CanvasElementTypeEnum.LINK]: 'a',
  [CanvasElementTypeEnum.ROOT]: 'body',
  [CanvasElementTypeEnum.INPUT]: 'input',
  [CanvasElementTypeEnum.TEXTAREA]: 'textarea',
  [CanvasElementTypeEnum.RADIO]: 'input',
  [CanvasElementTypeEnum.CHECKBOX]: 'input',
  [CanvasElementTypeEnum.VIDEO]: 'video',
  [CanvasElementTypeEnum.AUDIO]: 'audio',
  [CanvasElementTypeEnum.LABEL]: 'label',
  [CanvasElementTypeEnum.FORM]: 'form',
  [CanvasElementTypeEnum.SPAN]: 'span',
  [CanvasElementTypeEnum.TEXT]: '',
  [CanvasElementTypeEnum.UNORDERED_LIST]: 'ul',
  [CanvasElementTypeEnum.ORDERED_LIST]: 'ol',
  [CanvasElementTypeEnum.LIST_ITEM]: 'li',
  [CanvasElementTypeEnum.TABLE]: 'table',
  [CanvasElementTypeEnum.TABLE_HEAD]: 'thead',
  [CanvasElementTypeEnum.TABLE_BODY]: 'tbody',
  [CanvasElementTypeEnum.TABLE_FOOT]: 'tfoot',
  [CanvasElementTypeEnum.TABLE_ROW]: 'tr',
  [CanvasElementTypeEnum.TABLE_DATA]: 'td',
  [CanvasElementTypeEnum.TABLE_HEADER_CELL]: 'th',
  [CanvasElementTypeEnum.TABLE_CAPTION]: 'caption',
  [CanvasElementTypeEnum.TABLE_COL_GROUP]: 'colgroup',
  [CanvasElementTypeEnum.TABLE_COL]: 'col',
  [CanvasElementTypeEnum.HEADER]: 'header',
  [CanvasElementTypeEnum.FOOTER]: 'footer',
  [CanvasElementTypeEnum.ARTICLE]: 'article',
  [CanvasElementTypeEnum.SECTION]: 'section',
  [CanvasElementTypeEnum.ASIDE]: 'aside',
  [CanvasElementTypeEnum.HEADING]: 'h1',
};

/** 自闭合标签集合 */
const VOID_TAGS = new Set(['img', 'input', 'col']);

/**
 * 转义 HTML 特殊字符（属性值与文本内容通用）
 */
function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * 生成元素的 HTML 属性字符串
 */
function buildAttributes(element: CanvasElement): string {
  const attrs: string[] = [];

  /** id */
  attrs.push(`id="${escapeHtml(element.id)}"`);

  /** class */
  const enabledClasses = element.classes.filter((c) => c.enabled).map((c) => c.name);
  if (enabledClasses.length > 0) {
    attrs.push(`class="${escapeHtml(enabledClasses.join(' '))}"`);
  }

  /** 类型特有属性 */
  switch (element.type) {
    case CanvasElementTypeEnum.BUTTON: {
      const btn = element as CanvasButtonElement;
      if (btn.buttonType) attrs.push(`type="${escapeHtml(btn.buttonType)}"`);
      break;
    }
    case CanvasElementTypeEnum.IMAGE: {
      const img = element as CanvasImageElement;
      const safeSrc = sanitizeUrl(img.src ?? '');
      if (safeSrc) attrs.push(`src="${escapeHtml(safeSrc)}"`);
      if (img.title) attrs.push(`alt="${escapeHtml(img.title)}"`);
      break;
    }
    case CanvasElementTypeEnum.LINK: {
      const link = element as CanvasLinkElement;
      const safeHref = sanitizeUrl(link.href ?? '');
      if (safeHref) attrs.push(`href="${escapeHtml(safeHref)}"`);
      const TARGET_ATTR_MAP: Record<LinkTargetEnum, string> = {
        [LinkTargetEnum.SELF]: '_self',
        [LinkTargetEnum.BLANK]: '_blank',
      };
      if (link.target) {
        const targetAttr = TARGET_ATTR_MAP[link.target];
        if (targetAttr) attrs.push(`target="${targetAttr}"`);
      }
      break;
    }
    case CanvasElementTypeEnum.INPUT: {
      const input = element as CanvasInputElement;
      attrs.push('type="text"');
      if (input.placeholder) attrs.push(`placeholder="${escapeHtml(input.placeholder)}"`);
      if (input.value) attrs.push(`value="${escapeHtml(input.value)}"`);
      if (input.required) attrs.push(`required`);
      break;
    }
    case CanvasElementTypeEnum.TEXTAREA: {
      const textarea = element as CanvasTextareaElement;
      if (textarea.placeholder) attrs.push(`placeholder="${escapeHtml(textarea.placeholder)}"`);
      if (textarea.rows) attrs.push(`rows="${textarea.rows}"`);
      if (textarea.required) attrs.push(`required`);
      break;
    }
    case CanvasElementTypeEnum.RADIO: {
      const radio = element as CanvasRadioElement;
      attrs.push('type="radio"');
      if (radio.name) attrs.push(`name="${escapeHtml(radio.name)}"`);
      if (radio.value) attrs.push(`value="${escapeHtml(radio.value)}"`);
      if (radio.checked) attrs.push(`checked`);
      if (radio.required) attrs.push(`required`);
      break;
    }
    case CanvasElementTypeEnum.CHECKBOX: {
      const checkbox = element as CanvasCheckboxElement;
      attrs.push('type="checkbox"');
      if (checkbox.name) attrs.push(`name="${escapeHtml(checkbox.name)}"`);
      if (checkbox.value) attrs.push(`value="${escapeHtml(checkbox.value)}"`);
      if (checkbox.checked) attrs.push(`checked`);
      if (checkbox.required) attrs.push(`required`);
      break;
    }
    case CanvasElementTypeEnum.VIDEO: {
      const video = element as CanvasVideoElement;
      const safeSrc = sanitizeUrl(video.src ?? '');
      if (safeSrc) attrs.push(`src="${escapeHtml(safeSrc)}"`);
      if (video.controls) attrs.push(`controls`);
      break;
    }
    case CanvasElementTypeEnum.AUDIO: {
      const audio = element as CanvasAudioElement;
      const safeSrc = sanitizeUrl(audio.src ?? '');
      if (safeSrc) attrs.push(`src="${escapeHtml(safeSrc)}"`);
      if (audio.controls) attrs.push(`controls`);
      break;
    }
    case CanvasElementTypeEnum.LABEL: {
      const label = element as CanvasLabelElement;
      if (label.for) attrs.push(`for="${escapeHtml(label.for)}"`);
      break;
    }
    case CanvasElementTypeEnum.FORM: {
      const form = element as CanvasFormElement;
      const safeAction = sanitizeUrl(form.action ?? '');
      if (safeAction) attrs.push(`action="${escapeHtml(safeAction)}"`);
      if (form.method) attrs.push(`method="${escapeHtml(form.method)}"`);
      break;
    }
    case CanvasElementTypeEnum.TABLE_COL: {
      const col = element as CanvasTableColElement;
      if (col.span !== undefined && col.span > 1) attrs.push(`span="${col.span}"`);
      break;
    }
    case CanvasElementTypeEnum.TABLE_DATA: {
      const td = element as CanvasTableDataElement;
      if (td.colspan !== undefined && td.colspan > 1) attrs.push(`colspan="${td.colspan}"`);
      if (td.rowspan !== undefined && td.rowspan > 1) attrs.push(`rowspan="${td.rowspan}"`);
      break;
    }
    case CanvasElementTypeEnum.TABLE_HEADER_CELL: {
      const th = element as CanvasTableHeaderCellElement;
      if (th.colspan !== undefined && th.colspan > 1) attrs.push(`colspan="${th.colspan}"`);
      if (th.rowspan !== undefined && th.rowspan > 1) attrs.push(`rowspan="${th.rowspan}"`);
      if (th.scope) {
        const scopeAttr = TABLE_SCOPE_ATTR_MAP[th.scope];
        if (scopeAttr) attrs.push(`scope="${scopeAttr}"`);
      }
      break;
    }
    case CanvasElementTypeEnum.TABLE_COL_GROUP: {
      const colgroup = element as CanvasTableColGroupElement;
      if (colgroup.span !== undefined && colgroup.span > 1) attrs.push(`span="${colgroup.span}"`);
      break;
    }
  }

  return attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
}

/**
 * 获取元素的文本内容
 */
function getElementContent(element: CanvasElement): string {
  switch (element.type) {
    case CanvasElementTypeEnum.BUTTON:
      return escapeHtml((element as CanvasButtonElement).text);
    case CanvasElementTypeEnum.PARAGRAPH:
      return escapeHtml((element as CanvasParagraphElement).text);
    case CanvasElementTypeEnum.TEXTAREA:
      return escapeHtml((element as CanvasTextareaElement).value);
    case CanvasElementTypeEnum.LABEL:
      return escapeHtml((element as CanvasLabelElement).text);
    case CanvasElementTypeEnum.TEXT:
      return escapeHtml((element as CanvasTextElement).text);
    case CanvasElementTypeEnum.HEADING:
      return escapeHtml((element as CanvasHeadingElement).text);
    default:
      return '';
  }
}

/**
 * 解析元素对应的 HTML 标签（标题元素按 level 生成 h1-h6，未设置时默认 h1）
 */
function resolveTag(element: CanvasElement): string {
  if (element.type === CanvasElementTypeEnum.HEADING) {
    // level 收敛到 1~6，避免脏数据生成非法标签
    return `h${normalizeHeadingLevel((element as CanvasHeadingElement).level)}`;
  }
  return TAG_MAP[element.type];
}

/**
 * 递归生成单个元素的 HTML 字符串
 */
function elementToHtml(element: CanvasElement, indent: number = 0): string {
  const pad = '  '.repeat(indent);

  /** 纯文本元素：无标签无属性，直接输出文本内容 */
  if (element.type === CanvasElementTypeEnum.TEXT) {
    const content = getElementContent(element);
    return `${pad}${content}`;
  }

  const tag = resolveTag(element);
  const attrs = buildAttributes(element);

  /** 自闭合标签 */
  if (VOID_TAGS.has(tag)) {
    return `${pad}<${tag}${attrs} />`;
  }

  /** 容器元素或根元素：递归生成子元素 */
  if (element.type === CanvasElementTypeEnum.ROOT || isParentElement(element)) {
    const container = element as CanvasParentElement | CanvasRootElement;
    if (container.children.length === 0) {
      return `${pad}<${tag}${attrs}></${tag}>`;
    }
    const childrenHtml = container.children.map((child) => elementToHtml(child, indent + 1)).join('\n');
    return `${pad}<${tag}${attrs}>\n${childrenHtml}\n${pad}</${tag}>`;
  }

  /** 叶子元素（按钮、段落、链接） */
  const content = getElementContent(element);
  return `${pad}<${tag}${attrs}>${content}</${tag}>`;
}

/**
 * 递归收集所有元素的样式，生成 CSS 规则字符串
 */
function collectCssRules(styleRules: CanvasStyleRule[] = []): string {
  const rules: string[] = [];

  // 按 styleRules 原始顺序输出（style 为事实来源，面板修改已即时写回；at-rule 透传完整文本）
  for (const rule of styleRules) {
    const { selector, style, atRuleCssText } = rule;
    if (rule.type === StyleRuleTypeEnum.AT_RULE && atRuleCssText) {
      rules.push(atRuleCssText);
    } else {
      const declarations = Object.entries(style)
        .map(([prop, value]) => `  ${prop}: ${value};`)
        .join('\n');
      if (declarations) rules.push(`${selector} {\n${declarations}\n}`);
    }
  }

  // box-sizing: border-box 是画布元素正常渲染和编辑的默认前提；
  const hasBoxSizing = styleRules.some((r) => r.selector.trim() === '*' && 'box-sizing' in r.style);
  if (!hasBoxSizing) {
    rules.unshift('* {\n  box-sizing: border-box;\n}');
  }

  return rules.join('\n\n');
}

/**
 * 从画布元素列表生成完整的 HTML 字符串
 * @param root 画布根元素
 * @returns 格式化后的 HTML 字符串
 */
export function generateHtml(root: CanvasRootElement): string {
  return elementToHtml(root);
}

/**
 * 从画布元素列表生成 CSS 字符串
 * @param root 画布根元素
 * @param styleRules 样式规则有序清单（可编辑简单单层 class 规则 + 透传 raw 规则）
 * @returns CSS 规则字符串
 */
export function generateCss(styleRules: CanvasStyleRule[] = []): string {
  return collectCssRules(styleRules);
}

/**
 * 从画布元素列表同时生成 HTML、CSS
 * @param root 画布根元素
 * @param styleRules 样式规则有序清单
 * @returns { html: string, css: string }
 */
export function generateCode(root: CanvasRootElement, styleRules: CanvasStyleRule[] = []): { html: string; css: string; } {
  return {
    html: generateHtml(root),
    css: generateCss(styleRules),
  };
}
