/**
 * HTML 代码解析器
 * 借助浏览器原生 DOMParser 将 HTML 字符串解析为 DOM，
 * 再递归遍历 DOM 树，生成与框架无关的元素描述对象树（ParsedElement[]）。
 * 已知取舍：纯空白文本节点会被丢弃、文本内容会去除首尾空白，
 */

import { VOID_ELEMENTS, RAW_TEXT_ELEMENTS, BLOCKED_TAGS, GENERAL_FALLBACK_TAG_NAME, TAG_NAME_REGEX } from '@/constants/html';

/** 解析后的元素节点描述 */
export interface ParsedElement {
  /** 标签名（小写，文本节点为空字符串） */
  tagName: string;
  /** 元素 id（未声明为空字符串） */
  id: string;
  /** 普通属性键值对（已剔除 id/style/class） */
  attributes: Record<string, string>;
  /** 行内样式键值对 */
  style: Record<string, string>;
  /** 类名列表 */
  classes: string[];
  /** 文本内容（仅文本节点有值） */
  textContent: string;
  /** 是否为文本节点 */
  isText: boolean;
  /** 子元素 */
  children: ParsedElement[];
}

/** 判断标签是否为自闭合元素 */
export function isVoidElement(tagName: string): boolean {
  return VOID_ELEMENTS.has(tagName.toLowerCase());
}

/** 判断字符串是否为合法 HTML 标签名 */
export function isValidTagName(tagName: string): boolean {
  return TAG_NAME_REGEX.test(tagName);
}

/** 判断标签名是否允许出现在画布（大小写不敏感，统一按小写判定；危险标签与原始文本标签不允许） */
export function isAllowedTagName(tagName: string): boolean {
  const tag = tagName.toLowerCase();
  return isValidTagName(tag) && !BLOCKED_TAGS.has(tag) && !RAW_TEXT_ELEMENTS.has(tag);
}

/** 解析可用于渲染/生成的标签名：不允许的标签名回退为通用兜底标签，返回值一律为小写 */
export function resolveSafeTagName(tagName: string): string {
  const tag = tagName.toLowerCase();
  return isAllowedTagName(tag) ? tag : GENERAL_FALLBACK_TAG_NAME;
}

/** 文档内 style 元素的样式内容描述 */
export interface ParsedStyleBlock {
  /** CSS 文本内容 */
  css: string;
  /** media 属性值（未声明为空字符串） */
  media: string;
}

/** 解析后的文档描述 */
export interface ParsedDocument {
  /** body 元素描述（含其属性、行内样式与 class；输入未显式书写 body 标签时为浏览器合成的无属性元素） */
  body: ParsedElement;
  /** body 的子元素（顶层元素列表） */
  children: ParsedElement[];
  /** 文档内全部 style 元素的样式内容（含 head 与 body，按文档顺序） */
  styleBlocks: ParsedStyleBlock[];
}

/**
 * 将 HTML 字符串解析为文档描述（含 body 元素自身信息）
 * @param input HTML 字符串
 * @returns 文档描述（body 元素及其子元素）
 */
export function parseHtmlDocument(input: string): ParsedDocument {
  const parser = new DOMParser();
  // 使用 text/html 让浏览器自动修正 HTML 语法错误
  const doc = parser.parseFromString(input, 'text/html');
  const body = parseElementNode(doc.body);
  // querySelectorAll 按文档顺序返回结果，且不会深入 template 的 content 文档片段
  const styleBlocks = Array.from(doc.querySelectorAll('style')).map((styleEl) => ({
    css: styleEl.textContent ?? '',
    media: styleEl.getAttribute('media') ?? '',
  }));
  return { body, children: body.children, styleBlocks };
}

/**
 * 将 HTML 字符串解析为元素描述对象树
 * @param input HTML 字符串
 * @returns 顶层元素描述数组
 */
export function parseHtml(input: string): ParsedElement[] {
  return parseHtmlDocument(input).children;
}

/** 解析子节点列表 */
function parseNodeList(nodes: NodeListOf<ChildNode>): ParsedElement[] {
  const result: ParsedElement[] = [];
  nodes.forEach((node) => {
    const parsed = parseNode(node);
    if (parsed) result.push(parsed);
  });
  return result;
}

/** 解析单个节点 */
function parseNode(node: ChildNode): ParsedElement | null {
  if (node.nodeType === Node.ELEMENT_NODE) {
    return parseElementNode(node as Element);
  }
  if (node.nodeType === Node.TEXT_NODE) {
    return parseTextNode(node as Text);
  }
  return null;
}

/** 解析元素节点 */
function parseElementNode(el: Element): ParsedElement {
  const attributes: Record<string, string> = {};
  const style: Record<string, string> = {};
  let classes: string[] = [];
  let id = '';

  Array.from(el.attributes).forEach((attr) => {
    if (attr.name === 'style') {
      Object.assign(style, parseInlineStyle(attr.value));
    } else if (attr.name === 'class') {
      classes = attr.value.split(/\s+/).filter(Boolean);
    } else if (attr.name === 'id') {
      id = attr.value;
    } else {
      attributes[attr.name] = attr.value;
    }
  });

  return {
    tagName: el.tagName.toLowerCase(),
    id,
    attributes,
    style,
    classes,
    textContent: '',
    isText: false,
    // template 的子节点存放在 content 文档片段
    children: parseNodeList(
      el.tagName === 'TEMPLATE' ? (el as HTMLTemplateElement).content.childNodes : el.childNodes
    ),
  };
}

/** 解析文本节点（跳过纯空白文本） */
function parseTextNode(textNode: Text): ParsedElement | null {
  const text = textNode.textContent || '';
  if (!text.trim()) return null;
  return {
    tagName: '',
    id: '',
    attributes: {},
    style: {},
    classes: [],
    textContent: text,
    isText: true,
    children: [],
  };
}

/** 解析行内 style 字符串为对象（借助浏览器原生 CSSStyleDeclaration，自动展开简写、校验合法性） */
function parseInlineStyle(styleStr: string): Record<string, string> {
  const el = document.createElement('div');
  el.setAttribute('style', styleStr);
  const result: Record<string, string> = {};
  for (let i = 0; i < el.style.length; i++) {
    const prop = el.style[i];
    const value = el.style.getPropertyValue(prop);
    const important = el.style.getPropertyPriority(prop);
    result[prop] = important ? `${value} !${important}` : value;
  }
  return result;
}
