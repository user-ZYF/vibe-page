import type { CanvasElement, CanvasInnerElement, CanvasRootElement } from '@/views/Canvas/types';
import { isParentElement } from '@/views/Canvas/types';

/**
 * 在元素树中查找指定 id 的元素（含根元素）
 * 纯函数，不依赖 store，供 Positioner 和 canvasStore 共享
 * @param root 根元素
 * @param id 目标元素 id
 */
export function findElementInTree(root: CanvasRootElement, id: string): CanvasElement | null {
  if (id === root.id) return root;
  const find = (list: CanvasInnerElement[]): CanvasInnerElement | null => {
    for (const el of list) {
      if (el.id === id) return el;
      if (isParentElement(el)) {
        const found = find(el.children);
        if (found) return found;
      }
    }
    return null;
  };
  return find(root.children);
}

/**
 * 遍历元素树中所有子孙元素（不含根元素）
 * @param root 根元素
 * @param callback 对每个元素执行的回调
 */
export function forEachElementInTree(root: CanvasRootElement, callback: (el: CanvasInnerElement) => void): void {
  const walk = (list: CanvasInnerElement[]) => {
    for (const el of list) {
      callback(el);
      if (isParentElement(el)) {
        walk(el.children);
      }
    }
  };
  walk(root.children);
}
