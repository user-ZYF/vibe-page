import type { NodeRegistration } from "./types";
import type { CanvasRootElement } from "@/views/Canvas/types";
import { findParentIdInTree } from "@/utils/tree-traversal";

/**
 * DOM 节点注册表，维护元素 id 与 DOM 节点的映射关系
 */
export class NodeRegistry {
  private map: Map<string, NodeRegistration> = new Map();

  /** 注册一个 DOM 节点 */
  register(id: string, el: HTMLElement, isContainer: boolean) {
    this.map.set(id, { id, el, isContainer });
  }

  /** 注销一个 DOM 节点 */
  unregister(id: string) {
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

  /** 获取最近的 isContainer 祖先节点 id（包括自身） */
  getContainerAncestor(id: string, root: CanvasRootElement): string | null {
    const reg = this.map.get(id);
    if (!reg) return null;

    if (reg.isContainer) return id;

    let currentId: string | null = id;
    while (currentId) {
      const parentId = findParentIdInTree(root, currentId);
      if (!parentId) return null;
      const parentReg = this.map.get(parentId);
      if (parentReg?.isContainer) return parentId;
      currentId = parentId;
    }

    return null;
  }
}

/** 全局单例 */
export const nodeRegistry = new NodeRegistry();
