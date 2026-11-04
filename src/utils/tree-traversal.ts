import type { CanvasElement, CanvasInnerElement, CanvasRootElement } from '@/views/Canvas/types';
import { isParentElement } from '@/views/Canvas/types';

/**
 * 在元素列表（含子孙）中查找指定 id 的元素
 * @param list 元素列表
 * @param id 目标元素 id
 */
export function findElementInList(list: CanvasInnerElement[], id: string): CanvasInnerElement | null {
  for (const el of list) {
    if (el.id === id) return el;
    if (isParentElement(el)) {
      const found = findElementInList(el.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 在元素树中查找指定 id 的元素（根元素也参与匹配）
 * @param root 根元素
 * @param id 目标元素 id
 */
export function findElementInTree(root: CanvasRootElement, id: string): CanvasElement | null {
  if (id === root.id) return root;
  return findElementInList(root.children, id);
}

/**
 * 在元素列表（含子孙）中查找指定 id 元素的父元素 id
 * @param list 元素列表
 * @param id 目标元素 id
 * @param parentId 当前列表所属的父元素 id
 */
export function findParentIdInList(list: CanvasInnerElement[], id: string, parentId: string): string | null {
  for (const el of list) {
    if (el.id === id) return parentId;
    if (isParentElement(el)) {
      const found = findParentIdInList(el.children, id, el.id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 在元素树中查找指定 id 元素的父元素 id（根元素的直接子元素返回根元素 id，根元素自身返回 null）
 * @param root 根元素
 * @param id 目标元素 id
 */
export function findParentIdInTree(root: CanvasRootElement, id: string): string | null {
  if (id === root.id) return null;
  return findParentIdInList(root.children, id, root.id);
}

/**
 * 遍历元素列表中的所有元素（含子孙）
 * @param list 元素列表
 * @param callback 对每个元素执行的回调
 */
export function forEachElementInList(list: CanvasInnerElement[], callback: (el: CanvasInnerElement) => void): void {
  for (const el of list) {
    callback(el);
    if (isParentElement(el)) {
      forEachElementInList(el.children, callback);
    }
  }
}

/**
 * 遍历元素树中所有元素（含根元素自身）
 * @param root 根元素
 * @param callback 对每个元素执行的回调
 */
export function forEachElementInTree(root: CanvasRootElement, callback: (el: CanvasElement) => void): void {
  callback(root);
  forEachElementInList(root.children, callback);
}
