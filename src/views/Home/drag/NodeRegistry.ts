import type { NodeRegistration } from "./types";
import type { CanvasElement } from "@/views/Home/types";
import { CanvasElementTypeEnum } from "@/constants/home";
import type { CanvasContainerElement } from "@/views/Home/types";

/**
 * DOM 节点注册表，替代 Craft.js 中 store.actions.setDOM(id, el) 的功能
 */
export class NodeRegistry {
  private map: Map<string, NodeRegistration> = new Map();

  /** 注册一个 DOM 节点 */
  register(id: string, el: HTMLElement, isCanvas: boolean): void {
    this.map.set(id, { id, el, isCanvas });
  }

  /** 注销一个 DOM 节点 */
  unregister(id: string): void {
    this.map.delete(id);
  }

  /** 根据 id 获取注册信息 */
  get(id: string): NodeRegistration | undefined {
    return this.map.get(id);
  }

  /** 获取所有注册信息 */
  getAll(): NodeRegistration[] {
    return Array.from(this.map.values());
  }

  /** 根据 DOM 元素向上查找最近的注册节点 */
  getNodeFromElement(el: HTMLElement): NodeRegistration | undefined {
    let current: HTMLElement | null = el;
    while (current) {
      const id = current.dataset.canvasId;
      if (id && this.map.has(id)) {
        return this.map.get(id);
      }
      current = current.parentElement;
    }
    return undefined;
  }

  /** 获取最近的 isCanvas 祖先节点 id（包括自身） */
  getCanvasAncestor(id: string, elements: CanvasElement[]): string | null {
    const reg = this.map.get(id);
    if (!reg) return null;

    if (reg.isCanvas) return id;

    /** 在元素树中查找父节点 id */
    const findParentId = (list: CanvasElement[], childId: string): string | null => {
      for (const el of list) {
        if (el.type === CanvasElementTypeEnum.CONTAINER) {
          const container = el as CanvasContainerElement;
          if (container.children.some((c) => c.id === childId)) {
            return container.id;
          }
          const found = findParentId(container.children, childId);
          if (found) return found;
        }
      }
      return null;
    };

    let currentId: string | null = id;
    while (currentId) {
      const parentId = findParentId(elements, currentId);
      if (!parentId) return null;
      const parentReg = this.map.get(parentId);
      if (parentReg?.isCanvas) return parentId;
      currentId = parentId;
    }

    return null;
  }
}

/** 全局单例 */
export const nodeRegistry = new NodeRegistry();
