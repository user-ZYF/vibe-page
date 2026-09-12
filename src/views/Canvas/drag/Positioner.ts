import type { CanvasInnerElement, CanvasRootElement, CanvasParentElement, CanvasInnerElementTypeEnum } from "@/views/Canvas/types";
import { DropPositionEnum } from "@/constants/home";
import { isParentElement, isChildTypeAllowed, isSubtreeAllowed } from "@/views/Canvas/types";
import { findElementInTree } from "@/views/Canvas/utils/treeTraversal";
import type { NodeInfo, DropIndicator } from "./types";
import type { NodeRegistry } from "./NodeRegistry";
import { DisplayStyleEnum, FlexDirectionEnum, FloatStyleEnum, PositionStyleEnum } from "@/constants/style";

/**
 * 纯函数：根据子元素维度数组和鼠标坐标计算插入位置
 *
 * 核心思路：遍历容器内所有子元素，用鼠标坐标与每个元素的中心点比较，
 * 找到鼠标最接近的元素，并判断鼠标在该元素的上半/下半（纵向流）
 * 或左半/右半（横向排列），从而决定插入到该元素的前面还是后面。
 *
 * - 文档流元素（inFlow = true）：纵向堆叠，用 Y 轴中心点判断，确定后立即 break
 * - 非文档流元素（inFlow = false，如 float/absolute）：横向排列，用 X 轴中心点判断，
 *   需要处理多行换行的情况，不能提前退出
 */
export function findDropPosition(
  /** 子元素维度数组（包含位置、尺寸、是否在文档流中） */
  dims: NodeInfo[],
  /** 鼠标 X 坐标（视口坐标） */
  posX: number,
  /** 鼠标 Y 坐标（视口坐标） */
  posY: number
): { index: number; where: DropPositionEnum.BEFORE | DropPositionEnum.AFTER } {
  /** 默认结果：插入到第一个元素之前 */
  let result = { index: 0, where: DropPositionEnum.BEFORE as DropPositionEnum.BEFORE | DropPositionEnum.AFTER };

  /**
   * 三个"限制线"用于多行横排场景的优化跳过：
   * - leftLimit：已确定鼠标在某元素右侧（AFTER）后，右边缘还不到此线的元素可跳过
   * - xLimit：已确定鼠标在某元素左侧（BEFORE）后，左边缘超过此线的元素可跳过
   * - yLimit：已确定鼠标在某元素上方后，中心点低于此线的元素（下一行）可跳过
   */
  let leftLimit = 0;
  let xLimit = 0;
  let yLimit = 0;

  /** 当前元素的右边缘坐标 */
  let dimRight = 0;
  /** 当前元素的水平中心点 */
  let xCenter = 0;
  /** 当前元素的垂直中心点 */
  let yCenter = 0;
  /** 当前元素的下边缘坐标 */
  let dimDown = 0;

  for (let i = 0; i < dims.length; i++) {
    const dim = dims[i];

    /** 计算当前元素的四个关键坐标 */
    dimRight = dim.left + dim.outerWidth;
    dimDown = dim.top + dim.outerHeight;
    xCenter = dim.left + dim.outerWidth / 2;
    yCenter = dim.top + dim.outerHeight / 2;

    /**
     * 跳过不可能匹配的元素（主要用于 float 横排多行场景）：
     * 1. xLimit 已设置且当前元素左边缘超过 xLimit → 鼠标已确定在更左边，跳过更靠右的元素
     * 2. yLimit 已设置且当前元素中心点 >= yLimit → 鼠标已确定在更上方，跳过下一行的元素
     * 3. leftLimit 已设置且当前元素右边缘不到 leftLimit → 鼠标已确定在更右边，跳过更靠左的元素
     */
    if (
      (xLimit && dim.left > xLimit) ||
      (yLimit && yCenter >= yLimit) ||
      (leftLimit && dimRight < leftLimit)
    ) {
      continue;
    }

    /** 更新当前匹配到的元素索引 */
    result.index = i;

    if (!dim.inFlow) {
      /**
       * 非文档流元素（float/absolute 等）：横向排列，用 X 轴中心点判断
       */

      /** 鼠标还在当前元素上方（未超出下边缘），设置 yLimit 排除下一行的元素 */
      if (posY < dimDown) yLimit = dimDown;

      if (posX < xCenter) {
        /** 鼠标在水平中心左侧 → 插入到该元素前面，设置 xLimit 排除更靠右的元素 */
        xLimit = xCenter;
        result.where = DropPositionEnum.BEFORE;
      } else {
        /** 鼠标在水平中心右侧 → 插入到该元素后面，设置 leftLimit 排除更靠左的元素 */
        leftLimit = xCenter;
        result.where = DropPositionEnum.AFTER;
      }
    } else {
      /**
       * 文档流元素：纵向堆叠，用 Y 轴中心点判断
       */

      if (posY < yCenter) {
        /** 鼠标在垂直中心上方 → 插入到该元素前面，后续元素更靠下，不可能匹配，直接退出 */
        result.where = DropPositionEnum.BEFORE;
        break;
      } else {
        /** 鼠标在垂直中心下方 → 插入到该元素后面，继续检查下一个元素是否更接近 */
        result.where = DropPositionEnum.AFTER;
      }
    }
  }

  return result;
}

/**
 * Positioner 负责计算拖拽过程中的落点 Indicator
 */
export class Positioner {
  static BORDER_OFFSET = 10;

  /**
   * 计算落点 Indicator
   * @param dropTargetId 当前 dragover 的目标元素 id
   * @param x 鼠标 clientX
   * @param y 鼠标 clientY
   * @param elements 全量 CanvasElement 树
   * @param registry DOM 注册表
   * @param draggingId 当前被拖拽的元素 id（null = 新组件）
   * @param dragType 当前被拖拽的元素类型（null = 新组件）
   * @param dragElement 当前被拖拽的元素（null = 新组件）
   */
  compute(
    dropTargetId: string,
    x: number,
    y: number,
    root: CanvasRootElement,
    registry: NodeRegistry,
    draggingId: string | null,
    dragType: CanvasInnerElementTypeEnum | null,
    dragElement: CanvasInnerElement | null
  ): DropIndicator | null {
    /** 找到最近的 isCanvas 祖先 */
    let parentId = this.getCanvasAncestor(dropTargetId, root, registry)!;

    /** 获取 parentId 对应的 DOM 元素 */
    const parentEl = registry.get(parentId)?.el;
    
    if(!parentEl) {
      return null;
    }

    /** 如果鼠标接近元素的边框，则上升到父级 */
    if (parentId !== root.id && this.isNearBorder(parentEl, x, y)) {
      parentId = this.findParentId(parentId, root);
    }

    /** 获取父级内所有直接子元素的维度 */
    const childInfos = this.getChildNodeInfos(parentId, root, registry);

    const { index, where } = findDropPosition(childInfos, x, y);

    /** 错误信息 */
    let error = "";

    /** 是否为非法落点（不能拖入自身或其后代） */
    if(draggingId !== null && this.isDescendantOrSelf(draggingId, parentId, root)){
      error = "不允许插入到自身";
    }

    /** 检查子元素类型是否被父元素的 directInclude/directExclude/descendantInclude/descendantExclude 规则允许 */
    if(!error && dragType !== null){
      const parentElement = findElementInTree(root, parentId);
      if(parentElement){
        if(dragElement){
          /** 已有元素：递归检查整个子树 */
          if(!isSubtreeAllowed(parentElement, dragElement)){
            error = "该元素或其子元素不允许放入此容器";
          }
        } else {
          /** 新元素：仅检查类型 */
          if(!isChildTypeAllowed(parentElement, dragType)){
            error = "该元素不允许放入此容器";
          }
        }
      }
    }

    /** 计算占位线 rect */
    const rect = this.computeRect(childInfos, index, where, parentEl);

    return {
      parentId,
      index,
      where,
      rect,
      error,
    };
  }

  /** 找最近的 isCanvas 祖先（包含自身） */
  private getCanvasAncestor(
    id: string,
    root: CanvasRootElement,
    registry: NodeRegistry
  ): string | null {
    const reg = registry.get(id);
    if (!reg) return null;
    if (reg.isCanvas) return id;

    const parentId = this.findParentId(id, root);
    if (!parentId) return null;
    return this.getCanvasAncestor(parentId, root, registry);
  }

  /** 在元素树中查找父节点 id */
  private findParentId(childId: string, root: CanvasRootElement): string {
    const find = (list: CanvasInnerElement[], parentId: string): string | null => {
      for (const el of list) {
        if (el.id === childId) return parentId;
        if (isParentElement(el)) {
          const found = find(el.children, el.id);
          if (found) return found;
        }
      }
      return null;
    };

    return find(root.children, root.id)!;
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
    parentId: string,
    root: CanvasRootElement,
    registry: NodeRegistry
  ): NodeInfo[] {
    const children = this.getDirectChildren(parentId, root);
    const result: NodeInfo[] = [];

    for (const child of children) {
      const reg = registry.get(child.id);
      if (!reg) continue;
      const rect = reg.el.getBoundingClientRect();
      const style = getComputedStyle(reg.el);
      const parentEl = reg.el.parentElement;
      const parentStyle = parentEl ? getComputedStyle(parentEl) : null;

      /** 判断元素是否在纵向文档流中 */
      const computeInFlow = () => {
        if (!parentStyle) return true;

        /** 父容器是 float */
        if (parentStyle.float !== FloatStyleEnum.NONE) return false;

        /** 父容器是横向 flex（flex-direction 不为 column） */
        if (
          parentStyle.display === DisplayStyleEnum.FLEX &&
          parentStyle.flexDirection !== FlexDirectionEnum.COLUMN && 
          parentStyle.flexDirection !== FlexDirectionEnum.COLUMN_REVERSE
        ) {
          return false;
        }

        /** 自身绝对/固定定位 */
        if (style.position === PositionStyleEnum.ABSOLUTE || style.position === PositionStyleEnum.FIXED) return false;

        /** 自身浮动 */
        if (style.float !== FloatStyleEnum.NONE) return false;

        /** 自身 display 类型 */
        switch (style.display) {
          case DisplayStyleEnum.BLOCK:
          case DisplayStyleEnum.FLEX:
          /** 列表项纵向排列 */
          case DisplayStyleEnum.LIST_ITEM:
          /** 表格为块级元素，纵向排列 */
          case DisplayStyleEnum.TABLE:
          /** 表格行在表组内纵向排列 */
          case DisplayStyleEnum.TABLE_ROW:
          /** 表头/表体/表脚组在表格内纵向排列 */
          case DisplayStyleEnum.TABLE_HEADER_GROUP:
          case DisplayStyleEnum.TABLE_ROW_GROUP:
          case DisplayStyleEnum.TABLE_FOOTER_GROUP:
          /** 表格标题纵向排列 */
          case DisplayStyleEnum.TABLE_CAPTION:
            return true;
          /** 表格单元格在行内横向排列，类似横向 flex */
          case DisplayStyleEnum.TABLE_CELL:
          /** 列定义不参与视觉流 */
          case DisplayStyleEnum.TABLE_COLUMN:
          case DisplayStyleEnum.TABLE_COLUMN_GROUP:
          /** 行内表格非纵向流 */
          case DisplayStyleEnum.INLINE_TABLE:
            return false;
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
  private getDirectChildren(parentId: string, root: CanvasRootElement): CanvasInnerElement[] {
    if(parentId === root.id){
      return root.children;
    }
    const findParent = (list: CanvasInnerElement[]): CanvasParentElement | null => {
      for (const el of list) {
        if (el.id === parentId && isParentElement(el)) return el;
        if (isParentElement(el)) {
          const found = findParent(el.children);
          if (found) return found;
        }
      }
      return null;
    };

    const parent = findParent(root.children);
    return parent?.children ?? [];
  }

  /** 判断 targetId 是否是 sourceId 的后代或本身 */
  public isDescendantOrSelf(
    sourceId: string,
    targetId: string,
    root: CanvasRootElement
  ): boolean {
    if (sourceId === targetId) return true;

    const findEl = (list: CanvasInnerElement[], id: string): CanvasInnerElement | null => {
      for (const el of list) {
        if (el.id === id) return el;
        if (isParentElement(el)) {
          const found = findEl(el.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const sourceEl = findEl(root.children, sourceId);
    if (!sourceEl || !isParentElement(sourceEl)) return false;

    const isInside = (list: CanvasInnerElement[], targetId: string): boolean => {
      for (const el of list) {
        if (el.id === targetId) return true;
        if (isParentElement(el)) {
          if (isInside(el.children, targetId)) return true;
        }
      }
      return false;
    };

    return isInside((sourceEl as CanvasParentElement).children, targetId);
  }

  /** 根据落点信息计算占位线的 rect（视口坐标） */
  private computeRect(
    dims: NodeInfo[],
    index: number,
    where: DropPositionEnum.BEFORE | DropPositionEnum.AFTER,
    parentEl: HTMLElement
  ): { top: number; left: number; width: number; height: number } {
    const thickness = 2;
    const targetDim = dims[index];

    if (targetDim) {
      if (!targetDim.inFlow) {
        /** 竖线（float 元素横排） */
        const l = where === DropPositionEnum.BEFORE ? targetDim.left : targetDim.left + targetDim.outerWidth;
        return { top: targetDim.top, left: l, width: thickness, height: targetDim.outerHeight };
      } else {
        /** 横线（文档流竖排） */
        const t = where === DropPositionEnum.BEFORE ? targetDim.top : targetDim.bottom;
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
