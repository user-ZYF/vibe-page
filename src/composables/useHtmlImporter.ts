import { nanoid } from 'nanoid';
import { cloneDeep } from 'lodash';
import {
  CanvasInnerElement,
  CanvasContainerElement,
  CanvasButtonElement,
  CanvasParagraphElement,
  CanvasImageElement,
  CanvasLinkElement,
} from '@/views/Canvas/types';
import { CanvasElementTypeEnum, ButtonTypeEnum, CanvasElementLabelMap, LinkTargetEnum } from '@/constants/home';
import { DefaultStyleConfigMap } from '@/constants/style';

/** HTML 标签名到画布元素类型的映射 */
const TAG_TO_TYPE_MAP: Record<string, CanvasElementTypeEnum> = {
  div: CanvasElementTypeEnum.CONTAINER,
  section: CanvasElementTypeEnum.CONTAINER,
  article: CanvasElementTypeEnum.CONTAINER,
  main: CanvasElementTypeEnum.CONTAINER,
  header: CanvasElementTypeEnum.CONTAINER,
  footer: CanvasElementTypeEnum.CONTAINER,
  nav: CanvasElementTypeEnum.CONTAINER,
  aside: CanvasElementTypeEnum.CONTAINER,
  span: CanvasElementTypeEnum.CONTAINER,
  ul: CanvasElementTypeEnum.CONTAINER,
  ol: CanvasElementTypeEnum.CONTAINER,
  li: CanvasElementTypeEnum.CONTAINER,
  button: CanvasElementTypeEnum.BUTTON,
  p: CanvasElementTypeEnum.PARAGRAPH,
  h1: CanvasElementTypeEnum.PARAGRAPH,
  h2: CanvasElementTypeEnum.PARAGRAPH,
  h3: CanvasElementTypeEnum.PARAGRAPH,
  h4: CanvasElementTypeEnum.PARAGRAPH,
  h5: CanvasElementTypeEnum.PARAGRAPH,
  h6: CanvasElementTypeEnum.PARAGRAPH,
  label: CanvasElementTypeEnum.PARAGRAPH,
  img: CanvasElementTypeEnum.IMAGE,
  a: CanvasElementTypeEnum.LINK,
};

/**
 * 从 DOM 元素的 style 属性中提取 class 列表
 */
function extractClasses(el: Element): string[] {
  const cls = el.getAttribute('class');
  if (!cls) return [];
  return cls.split(/\s+/).filter(Boolean);
}

/**
 * 递归将 DOM 节点转换为 CanvasInnerElement
 * 忽略 script/style/meta/link/head/html/body 标签
 * 纯文本节点也会被跳过（在父级提取 textContent）
 */
function domNodeToCanvasElement(node: Element): CanvasInnerElement | null {
  const tag = node.tagName.toLowerCase();

  /** 忽略不支持的标签 */
  const ignoredTags = new Set(['script', 'style', 'meta', 'link', 'head', 'html', 'body', 'br', 'hr', 'input', 'textarea', 'select', 'form']);
  if (ignoredTags.has(tag)) return null;

  const type = TAG_TO_TYPE_MAP[tag];
  /** 未知标签降级为 CONTAINER */
  const resolvedType = type ?? CanvasElementTypeEnum.CONTAINER;

  const id = nanoid();
  const classes = extractClasses(node);
  const styleConfig = cloneDeep(DefaultStyleConfigMap[resolvedType as CanvasElementTypeEnum]);

  const base = {
    id,
    styleConfig,
    classes,
    classNames: [] as string[],
    alias: CanvasElementLabelMap[resolvedType as CanvasElementTypeEnum],
  };

  switch (resolvedType) {
    case CanvasElementTypeEnum.BUTTON: {
      const typeAttr = node.getAttribute('type') as ButtonTypeEnum | null;
      return {
        ...base,
        type: CanvasElementTypeEnum.BUTTON,
        text: node.textContent?.trim() || '按钮',
        buttonType: typeAttr && Object.values(ButtonTypeEnum).includes(typeAttr)
          ? typeAttr
          : ButtonTypeEnum.BUTTON,
      } as CanvasButtonElement;
    }
    case CanvasElementTypeEnum.PARAGRAPH: {
      return {
        ...base,
        type: CanvasElementTypeEnum.PARAGRAPH,
        text: node.textContent?.trim() || '段落',
      } as CanvasParagraphElement;
    }
    case CanvasElementTypeEnum.IMAGE: {
      return {
        ...base,
        type: CanvasElementTypeEnum.IMAGE,
        src: node.getAttribute('src') || '',
        title: node.getAttribute('alt') || node.getAttribute('title') || '图片',
      } as CanvasImageElement;
    }
    case CanvasElementTypeEnum.LINK: {
      const targetAttr = node.getAttribute('target');
      const TARGET_ATTR_MAP: Record<string, LinkTargetEnum> = {
        '_self': LinkTargetEnum.SELF,
        '_blank': LinkTargetEnum.BLANK,
      };
      /** 递归处理子节点 */
      const children: CanvasInnerElement[] = [];
      node.childNodes.forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const converted = domNodeToCanvasElement(child as Element);
          if (converted) children.push(converted);
        }
      });
      return {
        ...base,
        type: CanvasElementTypeEnum.LINK,
        href: node.getAttribute('href') || '',
        target: targetAttr && TARGET_ATTR_MAP[targetAttr] ? TARGET_ATTR_MAP[targetAttr] : LinkTargetEnum.SELF,
        children,
      } as CanvasLinkElement;
    }
    case CanvasElementTypeEnum.CONTAINER:
    default: {
      /** 递归处理子节点 */
      const children: CanvasInnerElement[] = [];
      node.childNodes.forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const converted = domNodeToCanvasElement(child as Element);
          if (converted) children.push(converted);
        }
      });
      return {
        ...base,
        type: CanvasElementTypeEnum.CONTAINER,
        children,
      } as CanvasContainerElement;
    }
  }
}

/**
 * 将 HTML 字符串解析为画布元素列表
 * 使用浏览器内置 DOMParser 解析，与 GrapesJS 的 BrowserParserHtml 逻辑一致：
 * 1. DOMParser 将字符串解析为完整文档
 * 2. 取 body 的直接子节点作为顶层画布元素
 * 3. 递归映射到 CanvasInnerElement 树形结构
 */
export function parseHtmlToCanvasElements(html: string): CanvasInnerElement[] {
  if (!html.trim()) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  const result: CanvasInnerElement[] = [];
  body.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = domNodeToCanvasElement(node as Element);
      if (el) result.push(el);
    }
  });

  return result;
}
