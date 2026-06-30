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
  CanvasHeading1Element,
  CanvasHeading2Element,
  CanvasHeading3Element,
  CanvasHeading4Element,
  CanvasHeading5Element,
  CanvasHeading6Element,
} from '@/views/Canvas/types';
import { CanvasElementTypeEnum, LinkTargetEnum, TABLE_SCOPE_ATTR_MAP } from '@/constants/home';
import { convertStyleConfig } from './styleConfig';
import type { StyleConfig } from '@/views/Canvas/types';

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
  [CanvasElementTypeEnum.HEADING_1]: 'h1',
  [CanvasElementTypeEnum.HEADING_2]: 'h2',
  [CanvasElementTypeEnum.HEADING_3]: 'h3',
  [CanvasElementTypeEnum.HEADING_4]: 'h4',
  [CanvasElementTypeEnum.HEADING_5]: 'h5',
  [CanvasElementTypeEnum.HEADING_6]: 'h6',
};

/** 自闭合标签集合 */
const VOID_TAGS = new Set(['img', 'input', 'col']);

/**
 * 将 camelCase 的 CSS 属性名转换为 kebab-case
 * @example fontSize → font-size
 */
function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * 将 style 对象转换为格式化后的 CSS 声明块内容
 * @example { color: 'red', fontSize: '16px' } → "  color: red;\n  font-size: 16px;"
 */
function styleObjectToCss(style: Record<string, string>): string {
  return Object.entries(style)
    .filter(([, value]) => value !== '' && value !== undefined)
    .map(([prop, value]) => `  ${camelToKebab(prop)}: ${value};`)
    .join('\n');
}

/**
 * 转义 HTML 属性值中的特殊字符
 */
function escapeAttrValue(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * 生成元素的 HTML 属性字符串
 */
function buildAttributes(element: CanvasElement): string {
  const attrs: string[] = [];

  /** id */
  attrs.push(`id="${escapeAttrValue(element.id)}"`);

  /** class */
  if (element.classes.length > 0) {
    attrs.push(`class="${escapeAttrValue(element.classes.join(' '))}"`);
  }

  /** 类型特有属性 */
  switch (element.type) {
    case CanvasElementTypeEnum.BUTTON: {
      const btn = element as CanvasButtonElement;
      attrs.push(`type="${escapeAttrValue(btn.buttonType)}"`);
      break;
    }
    case CanvasElementTypeEnum.IMAGE: {
      const img = element as CanvasImageElement;
      if (img.src) attrs.push(`src="${escapeAttrValue(img.src)}"`);
      if (img.title) attrs.push(`alt="${escapeAttrValue(img.title)}"`);
      break;
    }
    case CanvasElementTypeEnum.LINK: {
      const link = element as CanvasLinkElement;
      if (link.href) attrs.push(`href="${escapeAttrValue(link.href)}"`);
      const TARGET_ATTR_MAP: Record<LinkTargetEnum, string> = {
        [LinkTargetEnum.SELF]: '_self',
        [LinkTargetEnum.BLANK]: '_blank',
      };
      const targetAttr = TARGET_ATTR_MAP[link.target];
      if (targetAttr) attrs.push(`target="${targetAttr}"`);
      break;
    }
    case CanvasElementTypeEnum.INPUT: {
      const input = element as CanvasInputElement;
      attrs.push(`type="text"`);
      if (input.placeholder) attrs.push(`placeholder="${escapeAttrValue(input.placeholder)}"`);
      if (input.value) attrs.push(`value="${escapeAttrValue(input.value)}"`);
      if (input.required) attrs.push(`required`);
      break;
    }
    case CanvasElementTypeEnum.TEXTAREA: {
      const textarea = element as CanvasTextareaElement;
      if (textarea.placeholder) attrs.push(`placeholder="${escapeAttrValue(textarea.placeholder)}"`);
      if (textarea.rows) attrs.push(`rows="${textarea.rows}"`);
      if (textarea.required) attrs.push(`required`);
      break;
    }
    case CanvasElementTypeEnum.RADIO: {
      const radio = element as CanvasRadioElement;
      attrs.push(`type="radio"`);
      if (radio.name) attrs.push(`name="${escapeAttrValue(radio.name)}"`);
      if (radio.value) attrs.push(`value="${escapeAttrValue(radio.value)}"`);
      if (radio.checked) attrs.push(`checked`);
      if (radio.required) attrs.push(`required`);
      break;
    }
    case CanvasElementTypeEnum.CHECKBOX: {
      const checkbox = element as CanvasCheckboxElement;
      attrs.push(`type="checkbox"`);
      if (checkbox.name) attrs.push(`name="${escapeAttrValue(checkbox.name)}"`);
      if (checkbox.value) attrs.push(`value="${escapeAttrValue(checkbox.value)}"`);
      if (checkbox.checked) attrs.push(`checked`);
      if (checkbox.required) attrs.push(`required`);
      break;
    }
    case CanvasElementTypeEnum.VIDEO: {
      const video = element as CanvasVideoElement;
      if (video.src) attrs.push(`src="${escapeAttrValue(video.src)}"`);
      if (video.controls) attrs.push(`controls`);
      break;
    }
    case CanvasElementTypeEnum.AUDIO: {
      const audio = element as CanvasAudioElement;
      if (audio.src) attrs.push(`src="${escapeAttrValue(audio.src)}"`);
      if (audio.controls) attrs.push(`controls`);
      break;
    }
    case CanvasElementTypeEnum.LABEL: {
      const label = element as CanvasLabelElement;
      if (label.for) attrs.push(`for="${escapeAttrValue(label.for)}"`);
      break;
    }
    case CanvasElementTypeEnum.FORM: {
      const form = element as CanvasFormElement;
      if (form.action) attrs.push(`action="${escapeAttrValue(form.action)}"`);
      attrs.push(`method="${escapeAttrValue(form.method)}"`);
      break;
    }
    case CanvasElementTypeEnum.TABLE_COL: {
      const col = element as CanvasTableColElement;
      if (col.span > 1) attrs.push(`span="${col.span}"`);
      break;
    }
    case CanvasElementTypeEnum.TABLE_DATA: {
      const td = element as CanvasTableDataElement;
      if (td.colspan > 1) attrs.push(`colspan="${td.colspan}"`);
      if (td.rowspan > 1) attrs.push(`rowspan="${td.rowspan}"`);
      break;
    }
    case CanvasElementTypeEnum.TABLE_HEADER_CELL: {
      const th = element as CanvasTableHeaderCellElement;
      if (th.colspan > 1) attrs.push(`colspan="${th.colspan}"`);
      if (th.rowspan > 1) attrs.push(`rowspan="${th.rowspan}"`);
      const scopeAttr = TABLE_SCOPE_ATTR_MAP[th.scope];
      if (scopeAttr) attrs.push(`scope="${scopeAttr}"`);
      break;
    }
    case CanvasElementTypeEnum.TABLE_COL_GROUP: {
      const colgroup = element as CanvasTableColGroupElement;
      if (colgroup.span > 1) attrs.push(`span="${colgroup.span}"`);
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
      return escapeAttrValue((element as CanvasButtonElement).text);
    case CanvasElementTypeEnum.PARAGRAPH:
      return escapeAttrValue((element as CanvasParagraphElement).text);
    case CanvasElementTypeEnum.TEXTAREA:
      return escapeAttrValue((element as CanvasTextareaElement).value);
    case CanvasElementTypeEnum.LABEL:
      return escapeAttrValue((element as CanvasLabelElement).text);
    case CanvasElementTypeEnum.TEXT:
      return escapeAttrValue((element as CanvasTextElement).text);
    case CanvasElementTypeEnum.HEADING_1:
      return escapeAttrValue((element as CanvasHeading1Element).text);
    case CanvasElementTypeEnum.HEADING_2:
      return escapeAttrValue((element as CanvasHeading2Element).text);
    case CanvasElementTypeEnum.HEADING_3:
      return escapeAttrValue((element as CanvasHeading3Element).text);
    case CanvasElementTypeEnum.HEADING_4:
      return escapeAttrValue((element as CanvasHeading4Element).text);
    case CanvasElementTypeEnum.HEADING_5:
      return escapeAttrValue((element as CanvasHeading5Element).text);
    case CanvasElementTypeEnum.HEADING_6:
      return escapeAttrValue((element as CanvasHeading6Element).text);
    default:
      return '';
  }
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

  const tag = TAG_MAP[element.type];
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
 * 1. 先生成全局 class 选择器规则（按定义顺序，模拟 CSS 源码顺序）
 * 2. 再生成各元素的 #id 选择器规则（id 特殊性高于 class，自然覆盖）
 */
function collectCssRules(root: CanvasRootElement, classStyles: Record<string, StyleConfig>): string {
  const rules: string[] = [`* {\n  box-sizing: border-box;\n}`];

  /** 全局 class 选择器规则（按定义顺序） */
  for (const [className, styleConfig] of Object.entries(classStyles)) {
    const styleStr = styleObjectToCss(convertStyleConfig(styleConfig));
    if (styleStr) {
      rules.push(`.${className} {\n${styleStr}\n}`);
    }
  }

  /** 各元素的 id 选择器规则 */
  function collect(el: CanvasInnerElement) {
    /** 纯文本元素在生成的代码中无标签无属性，跳过 CSS 规则生成 */
    if (el.type === CanvasElementTypeEnum.TEXT) return;

    const styleObj = convertStyleConfig(el.styleConfig);
    const styleStr = styleObjectToCss(styleObj);
    if (styleStr) {
      rules.push(`#${el.id} {\n${styleStr}\n}`);
    }

    if (isParentElement(el)) {
      el.children.forEach(collect);
    }
  }

  root.children.forEach(collect);
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
 * @param classStyles 全局 class 样式配置映射
 * @returns CSS 规则字符串
 */
export function generateCss(root: CanvasRootElement, classStyles: Record<string, StyleConfig>): string {
  return collectCssRules(root, classStyles);
}

/**
 * 从画布元素列表同时生成 HTML、CSS
 * @param root 画布根元素
 * @param classStyles 全局 class 样式配置映射
 * @returns { html: string, css: string }
 */
export function generateCode(root: CanvasRootElement, classStyles: Record<string, StyleConfig>): { html: string; css: string; } {
  return {
    html: generateHtml(root),
    css: generateCss(root, classStyles),
  };
}
