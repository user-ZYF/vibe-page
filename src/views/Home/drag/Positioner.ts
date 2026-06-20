import type { CanvasElement } from "@/views/Home/types";
import { CanvasElementTypeEnum } from "@/constants/home";
import type { CanvasContainerElement } from "@/views/Home/types";
import type { NodeInfo, DropIndicator } from "./types";
import type { NodeRegistry } from "./NodeRegistry";

/**
 * 纯函数：根据子元素维度数组和鼠标坐标计算插入位置（同 Craft.js findPosition 逻辑）
 */
export function findDropPosition(
  dims: NodeInfo[],
  posX: number,
  posY: number
): { index: number; where: "before" | "after" } {
  let result = { index: 0, where: "before" as "before" | "after" };

  let leftLimit = 0;
  let xLimit = 0;
  let dimRight = 0;
  let yLimit = 0;
  let xCenter = 0;
  let yCenter = 0;
  let dimDown = 0;

  for (let i = 0, len = dims.length; i < len; i++) {
    const dim = dims[i];

    dimRight = dim.left + dim.outerWidth;
    dimDown = dim.top + dim.outerHeight;
    xCenter = dim.left + dim.outerWidth / 2;
    yCenter = dim.top + dim.outerHeight / 2;

    if (
      (xLimit && dim.left > xLimit) ||
      (yLimit && yCenter >= yLimit) ||
      (leftLimit && dimRight < leftLimit)
    ) {
      continue;
    }

    result.index = i;

    if (!dim.inFlow) {
      if (posY < dimDown) yLimit = dimDown;
      if (posX < xCenter) {
        xLimit = xCenter;
        result.where = "before";
      } else {
        leftLimit = xCenter;
        result.where = "after";
      }
    } else {
      if (posY < yCenter) {
        result.where = "before";
        break;
      } else {
        result.where = "after";
      }
    }
  }

  return result;
}

/**
 * Positioner 负责计算拖拽过程中的落点 Indicator（类比 Craft.js Positioner）
 */
export class Positioner {
  static BORDER_OFFSET = 10;

  /**
   * 计算落点 Indicator
   * @param dropTargetId 当前 dragover 的目标元素 id（null = 根画布）
   * @param x 鼠标 clientX
   * @param y 鼠标 clientY
   * @param elements 全量 CanvasElement 树
   * @param registry DOM 注册表
   * @param draggingId 当前被拖拽的元素 id（null = 新组件）
   */
  compute(
    dropTargetId: string | null,
    x: number,
    y: number,
    elements: CanvasElement[],
    registry: NodeRegistry,
    draggingId: string | null
  ): DropIndicator | null {
    /** 找到最近的 isCanvas 祖先（包括自身） */
    let parentId = this.getCanvasAncestor(dropTargetId, elements, registry);

    if (parentId === undefined) {
      /** dropTargetId 为 null 意味着根画布本身 */
      parentId = null;
    }

    /** 获取 parentId 对应的 DOM 元素 */
    const parentEl = parentId === null
      ? this.getRootCanvasEl(registry)
      : registry.get(parentId)?.el;

    if (!parentEl) return null;

    /** 如果鼠标接近容器边框，尝试上升到父级 */
    if (parentId !== null && this.isNearBorder(parentEl, x, y)) {
      const grandParentId = this.findParentId(parentId, elements);
      /** undefined 表示 parentId 已在根层级，上升到根画布（null） */
      parentId = grandParentId ?? null;
    }

    /** 获取父级内所有直接子元素的维度 */
    const childInfos = this.getChildNodeInfos(parentId, elements, registry);

    /** 过滤掉正在被拖拽的元素自身 */
    const filteredInfos = draggingId
      ? childInfos.filter((n) => n.id !== draggingId)
      : childInfos;

    const { index, where } = findDropPosition(filteredInfos, x, y);

    /** 是否为非法落点（不能拖入自身或其后代） */
    const error = draggingId !== null && this.isDescendantOrSelf(draggingId, parentId, elements);

    /** 计算占位线 rect */
    const rect = this.computeRect(filteredInfos, index, where, parentEl);

    return {
      parentId,
      index,
      where,
      rect,
      error,
    };
  }

  /** 获取根画布 el（第一个 isCanvas 且 id 为空的注册，或直接找 canvas-container） */
  private getRootCanvasEl(registry: NodeRegistry): HTMLElement | null {
    const root = registry.get("__root__");
    return root?.el ?? null;
  }

  /** 找最近的 isCanvas 祖先（包含自身），返回 null 表示根，undefined 表示找不到 */
  private getCanvasAncestor(
    id: string | null,
    elements: CanvasElement[],
    registry: NodeRegistry
  ): string | null | undefined {
    if (id === null) return null;

    const reg = registry.get(id);
    if (!reg) return null;
    if (reg.isCanvas) return id;

    const parentId = this.findParentId(id, elements);
    /** findParentId 返回 undefined 表示 id 在根层级，根画布可接受放置，返回 null */
    if (parentId === undefined) return null;
    return this.getCanvasAncestor(parentId, elements, registry);
  }

  /** 在元素树中查找父节点 id（undefined = 根层级） */
  private findParentId(childId: string, elements: CanvasElement[]): string | undefined {
    const find = (list: CanvasElement[], parentId: string | undefined): string | undefined => {
      for (const el of list) {
        if (el.id === childId) return parentId;
        if (el.type === CanvasElementTypeEnum.CONTAINER) {
          const found = find((el as CanvasContainerElement).children, el.id);
          if (found !== undefined) return found;
        }
      }
      return undefined;
    };

    return find(elements, undefined);
  }

  /** 鼠标是否在元素边框附近 */
  private isNearBorder(el: HTMLElement, x: number, y: number): boolean {
    const { top, bottom, left, right } = el.getBoundingClientRect();
    const offset = Positioner.BORDER_OFFSET;
    return (
      top + offset > y ||
      bottom - offset < y ||
      left + offset > x ||
      right - offset < x
    );
  }

  /** 获取父容器内直接子元素的 NodeInfo 列表 */
  private getChildNodeInfos(
    parentId: string | null,
    elements: CanvasElement[],
    registry: NodeRegistry
  ): NodeInfo[] {
    const children = this.getDirectChildren(parentId, elements);
    const result: NodeInfo[] = [];

    for (const child of children) {
      const reg = registry.get(child.id);
      if (!reg) continue;
      const rect = reg.el.getBoundingClientRect();
      const style = window.getComputedStyle(reg.el);
      const parentEl = reg.el.parentElement;
      const parentStyle = parentEl ? window.getComputedStyle(parentEl) : null;

      /** 参照 craft.js getDOMInfo.ts 的 styleInFlow 逻辑：判断元素是否在纵向文档流中 */
      const computeInFlow = (): boolean => {
        if (!parentStyle) return true;

        /** 父容器是 float */
        if (parentStyle.float !== "none") return false;

        /** 父容器是 grid */
        if (parentStyle.display === "grid") return false;

        /** 父容器是横向 flex（flex-direction 不为 column） */
        if (
          parentStyle.display === "flex" &&
          parentStyle.flexDirection !== "column"
        ) {
          return false;
        }

        /** 自身绝对/固定定位 */
        if (style.position === "absolute" || style.position === "fixed") return false;

        /** 自身浮动 */
        if (style.float !== "none") return false;

        /** 自身 display 类型 */
        switch (style.display) {
          case "block":
          case "list-item":
          case "table":
          case "flex":
          case "grid":
            return true;
        }

        return false;
      };

      const inFlow = computeInFlow();

      result.push({
        id: child.id,
        top: rect.top,
        left: rect.left,
        outerWidth: rect.width,
        outerHeight: rect.height,
        bottom: rect.bottom,
        inFlow,
      });
    }

    return result;
  }

  /** 获取指定父级的直接子元素列表 */
  private getDirectChildren(parentId: string | null, elements: CanvasElement[]): CanvasElement[] {
    if (parentId === null) return elements;

    const findContainer = (list: CanvasElement[]): CanvasContainerElement | null => {
      for (const el of list) {
        if (el.id === parentId) return el as CanvasContainerElement;
        if (el.type === CanvasElementTypeEnum.CONTAINER) {
          const found = findContainer((el as CanvasContainerElement).children);
          if (found) return found;
        }
      }
      return null;
    };

    const container = findContainer(elements);
    return container?.children ?? [];
  }

  /** 判断 targetId 是否是 sourceId 的后代或本身（防止拖入自身） */
  private isDescendantOrSelf(
    sourceId: string,
    targetId: string | null,
    elements: CanvasElement[]
  ): boolean {
    if (targetId === null) return false;
    if (sourceId === targetId) return true;

    const findEl = (list: CanvasElement[], id: string): CanvasElement | null => {
      for (const el of list) {
        if (el.id === id) return el;
        if (el.type === CanvasElementTypeEnum.CONTAINER) {
          const found = findEl((el as CanvasContainerElement).children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const sourceEl = findEl(elements, sourceId);
    if (!sourceEl || sourceEl.type !== CanvasElementTypeEnum.CONTAINER) return false;

    const isInside = (list: CanvasElement[], targetId: string): boolean => {
      for (const el of list) {
        if (el.id === targetId) return true;
        if (el.type === CanvasElementTypeEnum.CONTAINER) {
          if (isInside((el as CanvasContainerElement).children, targetId)) return true;
        }
      }
      return false;
    };

    return isInside((sourceEl as CanvasContainerElement).children, targetId);
  }

  /** 根据落点信息计算占位线的 rect（视口坐标） */
  private computeRect(
    dims: NodeInfo[],
    index: number,
    where: "before" | "after",
    parentEl: HTMLElement
  ): { top: number; left: number; width: number; height: number } {
    const thickness = 2;
    const targetDim = dims[index];

    if (targetDim) {
      if (!targetDim.inFlow) {
        /** 竖线（float 元素横排） */
        const l = where === "before" ? targetDim.left : targetDim.left + targetDim.outerWidth;
        return { top: targetDim.top, left: l, width: thickness, height: targetDim.outerHeight };
      } else {
        /** 横线（文档流竖排） */
        const t = where === "before" ? targetDim.top : targetDim.bottom;
        return { top: t, left: targetDim.left, width: targetDim.outerWidth, height: thickness };
      }
    }

    /** 容器为空时，显示在容器内顶部 */
    const parentRect = parentEl.getBoundingClientRect();
    const style = window.getComputedStyle(parentEl);
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingRight = parseFloat(style.paddingRight) || 0;

    return {
      top: parentRect.top + paddingTop,
      left: parentRect.left + paddingLeft,
      width: parentRect.width - paddingLeft - paddingRight,
      height: thickness,
    };
  }
}
