/**
 * HTML 代码解析器
 * 借助浏览器原生 DOMParser 将 HTML 字符串解析为 DOM，
 * 再递归遍历 DOM 树，生成与框架无关的元素描述对象树（ParsedElement[]）。
 * 已知取舍：纯空白文本节点会被丢弃、文本内容会去除首尾空白，
 */

/** 解析后的元素节点描述 */
export interface ParsedElement {
  /** 标签名（小写，文本节点为空字符串） */
  tagName: string;
  /** 普通属性键值对（已剔除 style/class） */
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

/** 自闭合/空元素集合，渲染时不需要子节点 */
const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

/** 判断标签是否为自闭合元素 */
export function isVoidElement(tagName: string): boolean {
  return VOID_ELEMENTS.has(tagName.toLowerCase());
}

/** 解析后的文档描述 */
export interface ParsedDocument {
  /** body 元素描述（含其属性、行内样式与 class；输入未显式书写 body 标签时为浏览器合成的无属性元素） */
  body: ParsedElement;
  /** body 的子元素（顶层元素列表） */
  children: ParsedElement[];
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
  return { body, children: body.children };
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

  Array.from(el.attributes).forEach((attr) => {
    if (attr.name === 'style') {
      Object.assign(style, parseInlineStyle(attr.value));
    } else if (attr.name === 'class') {
      classes = attr.value.split(/\s+/).filter(Boolean);
    } else {
      attributes[attr.name] = attr.value;
    }
  });

  return {
    tagName: el.tagName.toLowerCase(),
    attributes,
    style,
    classes,
    textContent: '',
    isText: false,
    children: parseNodeList(el.childNodes),
  };
}

/** 解析文本节点（跳过纯空白文本） */
function parseTextNode(textNode: Text): ParsedElement | null {
  const text = textNode.textContent || '';
  if (!text.trim()) return null;
  return {
    tagName: '',
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
