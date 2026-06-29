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
} from '@/views/Canvas/types';
import { CanvasElementTypeEnum, LinkTargetEnum } from '@/constants/home';
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
};

/** 自闭合标签集合 */
const VOID_TAGS = new Set(['img', 'input']);

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
    default:
      return '';
  }
}

/**
 * 递归生成单个元素的 HTML 字符串
 */
function elementToHtml(element: CanvasElement, indent: number = 0): string {
  const tag = TAG_MAP[element.type];
  const attrs = buildAttributes(element);
  const pad = '  '.repeat(indent);

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
