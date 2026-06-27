import {
  CanvasInnerElement,
  CanvasContainerElement,
  CanvasButtonElement,
  CanvasParagraphElement,
  CanvasImageElement,
  CanvasLinkElement,
  InteractionRule,
  CanvasRootElement,
  CanvasElement,
} from '@/views/Canvas/types';
import { CanvasElementTypeEnum, InteractionEventEnum, InteractionActionEnum } from '@/constants/home';
import { convertStyleConfig } from './styleConfig';

/** 元素类型到 HTML 标签的映射 */
const TAG_MAP: Record<CanvasElementTypeEnum, string> = {
  [CanvasElementTypeEnum.CONTAINER]: 'div',
  [CanvasElementTypeEnum.BUTTON]: 'button',
  [CanvasElementTypeEnum.PARAGRAPH]: 'p',
  [CanvasElementTypeEnum.IMAGE]: 'img',
  [CanvasElementTypeEnum.LINK]: 'a',
  [CanvasElementTypeEnum.ROOT]: 'body',
};

/** 自闭合标签集合 */
const VOID_TAGS = new Set(['img']);

// /**
//  * 将 style 对象转换为内联样式字符串
//  * @example { color: 'red', 'font-size': '16px' } → "color:red;font-size:16px;"
//  */
// function styleObjectToString(style: Record<string, string>): string {
//   return Object.entries(style)
//     .filter(([, value]) => value !== '' && value !== undefined)
//     .map(([prop, value]) => `${prop}:${value};`)
//     .join('');
// }

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
      break;
    }
  }

  // /** 内联样式 */
  // const styleObj = convertStyleConfig(element.styleConfig);
  // const styleStr = styleObjectToString(styleObj);
  // if (styleStr) {
  //   attrs.push(`style="${escapeAttrValue(styleStr)}"`);
  // }

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
    case CanvasElementTypeEnum.LINK:
      return escapeAttrValue((element as CanvasLinkElement).text);
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
  if (element.type === CanvasElementTypeEnum.CONTAINER || element.type === CanvasElementTypeEnum.ROOT) {
    const container = element as CanvasContainerElement | CanvasRootElement;
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
 * 每个元素通过 #id 选择器关联其内联样式
 */
function collectCssRules(root: CanvasRootElement): string {
  const rules: string[] = [`* {\n  box-sizing: border-box;\n}`];

  function collect(el: CanvasInnerElement) {
    const styleObj = convertStyleConfig(el.styleConfig);
    const styleStr = styleObjectToCss(styleObj);
    if (styleStr) {
      rules.push(`#${el.id} {\n${styleStr}\n}`);
    }

    if (el.type === CanvasElementTypeEnum.CONTAINER) {
      (el as CanvasContainerElement).children.forEach(collect);
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
 * @param elements 画布根层级元素列表
 * @returns CSS 规则字符串
 */
export function generateCss(root: CanvasRootElement): string {
  return collectCssRules(root);
}

/** 事件枚举到 DOM 事件名的映射 */
const EVENT_NAME_MAP: Record<InteractionEventEnum, string> = {
  [InteractionEventEnum.CLICK]: 'click',
  [InteractionEventEnum.DOUBLE_CLICK]: 'dblclick',
  [InteractionEventEnum.MOUSE_ENTER]: 'mouseenter',
  [InteractionEventEnum.MOUSE_LEAVE]: 'mouseleave',
};

/**
 * 生成单条交互规则的 JS 代码
 */
function interactionRuleToJs(rule: InteractionRule): string {
  const eventName = EVENT_NAME_MAP[rule.event];
  const targetSelector = rule.targetId
    ? `document.querySelector('[data-canvas-id="${rule.targetId}"]')`
    : 'el';

  let actionCode = '';
  switch (rule.action) {
    case InteractionActionEnum.SHOW:
      actionCode = `${targetSelector}.style.display = '';`;
      break;
    case InteractionActionEnum.HIDE:
      actionCode = `${targetSelector}.style.display = 'none';`;
      break;
    case InteractionActionEnum.TOGGLE_VISIBILITY:
      actionCode = `{ var d = ${targetSelector}.style.display; ${targetSelector}.style.display = d === 'none' ? '' : 'none'; }`;
      break;
    case InteractionActionEnum.TOGGLE_CLASS:
      actionCode = `${targetSelector}.classList.toggle('${rule.params.className || ''}');`;
      break;
    case InteractionActionEnum.NAVIGATE:
      actionCode = `window.open('${rule.params.url || '#'}', '_blank');`;
      break;
  }

  return `el.addEventListener('${eventName}', function(e) {\n  ${actionCode}\n});`;
}

/**
 * 从画布元素列表生成交互 JS 代码
 * @param root 画布根元素
 * @returns JS 代码字符串
 */
export function generateJs(root: CanvasRootElement): string {
  const blocks: string[] = [];

  function collect(el: CanvasInnerElement) {
    if (el.interactions && el.interactions.length > 0) {
      const rules = el.interactions
        .map((rule) => `  ${interactionRuleToJs(rule)}`)
        .join('\n');
      blocks.push(`(function() {\n  var el = document.getElementById('${el.id}');\n  if (!el) return;\n${rules}\n})();`);
    }
    if (el.type === CanvasElementTypeEnum.CONTAINER) {
      (el as CanvasContainerElement).children.forEach(collect);
    }
  }

  root.children.forEach(collect);
  return blocks.join('\n\n');
}

/**
 * 从画布元素列表同时生成 HTML、CSS 和 JS
 * @param root 画布根元素
 * @returns { html: string, css: string, js: string }
 */
export function generateCode(root: CanvasRootElement): { html: string; css: string; js: string } {
  return {
    html: generateHtml(root),
    css: generateCss(root),
    js: generateJs(root),
  };
}
