/**
 * 代码渲染器
 * 参照 GrapesJS ComponentView 的实现思路：根据解析得到的元素描述对象树，
 * 递归创建真实 DOM 节点并挂载到预览容器；CSS 规则重建为字符串后注入 <style> 标签。
 */
import type { ParsedElement } from '@/utils/html-parser';
import { isVoidElement } from '@/utils/html-parser';
import { buildCssString } from '@/utils/css-parser';
import type { ParsedCssRule } from '@/views/Canvas/types';

/**
 * 渲染容器所需的最小结构化类型
 * 使用结构化类型而非 HTMLElement，避免跨模块 DOM lib 版本不一致导致的类型冲突
 * DOM 相关类型（Node/Document）使用 unknown，仅在实际调用处做断言
 */
export interface RenderContainer {
  /** 容器 innerHTML */
  innerHTML: string;
  /** 追加子节点 */
  appendChild(node: unknown): unknown;
  /** 所属 document */
  readonly ownerDocument: unknown;
}

/**
 * 根据解析后的元素树生成真实 DOM 节点
 * @param elements 元素描述数组
 * @param doc 目标 document（用于跨 iframe 渲染）
 * @returns DOM 节点数组
 */
export function renderElements(elements: ParsedElement[], doc: Document = document): Node[] {
  return elements.map((el) => renderElement(el, doc)).filter(Boolean) as Node[];
}

/** 递归渲染单个元素 */
function renderElement(el: ParsedElement, doc: Document): Node | null {
  if (el.isText) {
    return doc.createTextNode(el.textContent);
  }

  const node = doc.createElement(el.tagName);

  // 普通属性（剥离 on* 事件属性，避免预览中执行任意内联脚本）
  Object.entries(el.attributes).forEach(([name, value]) => {
    if (/^on/i.test(name)) return;
    node.setAttribute(name, value);
  });

  // 类名
  if (el.classes.length) {
    node.setAttribute('class', el.classes.join(' '));
  }

  // 行内样式
  const styleStr = Object.entries(el.style)
    .map(([prop, value]) => `${prop}: ${value}`)
    .join('; ');
  if (styleStr) {
    node.setAttribute('style', styleStr);
  }

  // 子节点（自闭合元素无子节点）
  if (!isVoidElement(el.tagName) && el.children.length) {
    el.children.forEach((child) => {
      const childNode = renderElement(child, doc);
      if (childNode) node.appendChild(childNode);
    });
  }

  return node;
}

/**
 * 渲染 HTML + CSS 到指定容器
 * @param container 容器元素
 * @param elements 解析后的元素树
 * @param rules 解析后的 CSS 规则
 * @param styleEl 用于注入 CSS 的 <style> 元素
 */
export function renderToContainer(
  container: RenderContainer,
  elements: ParsedElement[],
  rules: ParsedCssRule[],
  styleEl: HTMLStyleElement,
): void {
  // 清空容器
  container.innerHTML = '';
  // 注入 CSS
  styleEl.textContent = buildCssString(rules);
  // 挂载生成的 DOM 节点（ownerDocument 使用断言，因跨模块 DOM lib 类型可能不一致）
  const doc = container.ownerDocument as Document;
  renderElements(elements, doc).forEach((node) => {
    container.appendChild(node);
  });
}
