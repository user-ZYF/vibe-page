import type { CanvasInnerElement, CanvasRootElement, CanvasParentElement, CanvasInnerElementTypeEnum } from "@/views/Canvas/types";
import { DropPositionEnum } from "@/constants/home";
import { isParentElement, isChildTypeAllowed, isSubtreeAllowed } from "@/views/Canvas/types";
import { findElementInTree } from "@/views/Canvas/utils/treeTraversal";
import type { NodeInfo, DropIndicator, PlaceholderLine, DropPositionResult } from "./types";
import type { NodeRegistry } from "./NodeRegistry";
import { DisplayStyleEnum, FlexDirectionEnum, FloatStyleEnum, LayoutModeEnum, PositionStyleEnum } from "@/constants/style";

/**
 * 根据子元素维度数组和鼠标坐标计算插入位置
 *
 * 核心思路：取矩形边缘距鼠标最近的子元素作锚点，
 * 再按锚点自身的布局轴与排列方向判断插入到其前面还是后面
 */
export function findDropPosition(
  /** 子元素维度数组 */
  dims: NodeInfo[],
  /** 鼠标 X 坐标（视口坐标） */
  posX: number,
  /** 鼠标 Y 坐标（视口坐标） */
  posY: number
): DropPositionResult {
  /** 非 absolute/fixed 定位锚点集合 */
  const anchors = dims.filter((d) => d.mode !== LayoutModeEnum.FREE);

  /** 容器内无可参考的子元素 → 插到容器开头 */
  if (anchors.length === 0) {
    return { anchor: null, where: DropPositionEnum.BEFORE };
  }

  const anchor = nearestAnchor(anchors, posX, posY);
  const where = isBeforeAnchor(anchor, posX, posY)
    ? DropPositionEnum.BEFORE
    : DropPositionEnum.AFTER;
  return { anchor, where };
}

/** 取矩形边缘距鼠标最近的元素（距离相等时偏向 DOM 靠后的元素） */
function nearestAnchor(dims: NodeInfo[], posX: number, posY: number): NodeInfo {
  let anchor = dims[0];
  let minDist = Infinity;

  for (const dim of dims) {
    const dx = Math.max(dim.left - posX, 0, posX - dim.right);
    const dy = Math.max(dim.top - posY, 0, posY - dim.bottom);
    /** 鼠标到矩形边缘的平方距离（比较大小无需开方） */
    const dist = dx * dx + dy * dy;
    if (dist <= minDist) {
      minDist = dist;
      anchor = dim;
    }
  }

  return anchor;
}

/**
 * 判断鼠标是否位于锚点「之前」
 * - 纵向锚点：比较垂直中心点；横向锚点：比较水平中心点
 * - 主轴反向（flex-direction: *-reverse、float: right）：轴向比较取反，与视觉顺序保持一致
 */
function isBeforeAnchor(anchor: NodeInfo, posX: number, posY: number): boolean {
  const center =
    anchor.mode === LayoutModeEnum.HORIZONTAL
      ? anchor.left + anchor.outerWidth / 2
      : anchor.top + anchor.outerHeight / 2;
  const pos = anchor.mode === LayoutModeEnum.HORIZONTAL ? posX : posY;

  return anchor.reversed ? pos > center : pos < center;
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
    let parentId = this.getCanvasAncestor(dropTargetId, root, registry);

    /** 获取 parentId 对应的 DOM 元素（注册表与元素树短暂不同步时兜底） */
    let parentEl = parentId ? registry.get(parentId)?.el : undefined;

    if (!parentId || !parentEl) {
      return null;
    }

    /** 如果鼠标接近元素的边框，则上升到父级 */
    if (parentId !== root.id && this.isNearBorder(parentEl, x, y)) {
      parentId = this.findParentId(parentId, root);
      parentEl = registry.get(parentId)?.el;
      if (!parentEl) return null;
    }

    /** 获取父级内所有直接子元素的维度（含各自布局模式） */
    const childInfos = this.getChildNodeInfos(parentId, root, registry, parentEl);

    const { anchor, where } = findDropPosition(childInfos, x, y);

    /** 锚点在 children 数组中的真实下标（无锚点时插入到容器开头） */
    const index = anchor ? anchor.childIndex : 0;

    /** 错误信息 */
    let error = "";

    /** 是否为非法落点（不能拖入自身或其后代） */
    if(draggingId !== null && this.isDescendantOrSelf(draggingId, parentId, root)){
      error = "不允许插入到自身";
    }

    /** 检查子元素类型是否被父元素类型的结构约束（directInclude/directExclude/descendantInclude/descendantExclude）允许 */
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
    const rect = this.computeRect(anchor, where, parentEl);

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
    registry: NodeRegistry,
    parentEl: HTMLElement
  ): NodeInfo[] {
    const children = this.getDirectChildren(parentId, root);
    const parentStyle = getComputedStyle(parentEl);
    const infos: NodeInfo[] = [];

    for (let i = 0; i < children.length; i++) {
      const reg = registry.get(children[i].id);
      if (!reg) continue;
      const style = getComputedStyle(reg.el);

      /** display:none 不渲染，不作插入锚点 */
      if (style.display === DisplayStyleEnum.NONE) continue;

      const rect = reg.el.getBoundingClientRect();
      const { mode, reversed } = this.classifyElementMode(style, parentStyle);

      infos.push({
        id: children[i].id,
        childIndex: i,
        mode,
        reversed,
        top: rect.top,
        left: rect.left,
        right: rect.right,
        outerWidth: rect.width,
        outerHeight: rect.height,
        bottom: rect.bottom,
      });
    }

    return infos;
  }

  /** 判断元素是否为 absolute/fixed 定位（完全脱离文档流，不影响兄弟布局） */
  private isPositioned(style: CSSStyleDeclaration): boolean {
    return (
      style.position === PositionStyleEnum.ABSOLUTE || style.position === PositionStyleEnum.FIXED
    );
  }

  /**
   * 判断子元素按自身 display 是否参与纵向文档流。
   * float / position / display:none 由调用方先行排除
   */
  private isInVerticalFlow(style: CSSStyleDeclaration): boolean {
    /** 自身 display 类型 */
    switch (style.display) {
      case DisplayStyleEnum.BLOCK:
      case DisplayStyleEnum.FLEX:
      /** 块级网格在文档流中纵向排列 */
      case DisplayStyleEnum.GRID:
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
    }

    return false;
  }

  /**
   * 判定元素的布局模式与主轴方向：
   * 1. absolute/fixed 定位 → 自由定位（完全脱离文档流，不影响兄弟布局）
   * 2. 父容器是 flex / inline-flex → 按 flex-direction 判定主轴方向与是否反向（float 对 flex/grid 子项无效）
   * 3. 父容器是 grid / inline-grid → 横向（二维布局按行处理）
   * 4. 自身浮动 → 横向（float 占据布局空间，成行排列并换行；float:right 为反向排列）
   * 5. 自身 display 是纵向流类型（block/表格行/列表项等）→ 纵向
   * 6. 其余（inline 系列/表格单元格等）→ 横向
   */
  private classifyElementMode(
    style: CSSStyleDeclaration,
    parentStyle: CSSStyleDeclaration
  ): { mode: LayoutModeEnum; reversed: boolean } {
    /** 正向结果 */
    const result = (mode: LayoutModeEnum, reversed = false) => ({ mode, reversed });

    if (this.isPositioned(style)) return result(LayoutModeEnum.FREE);

    if (
      parentStyle.display === DisplayStyleEnum.FLEX ||
      parentStyle.display === DisplayStyleEnum.INLINE_FLEX
    ) {
      const isColumn =
        parentStyle.flexDirection === FlexDirectionEnum.COLUMN ||
        parentStyle.flexDirection === FlexDirectionEnum.COLUMN_REVERSE;
      const isReverse =
        parentStyle.flexDirection === FlexDirectionEnum.ROW_REVERSE ||
        parentStyle.flexDirection === FlexDirectionEnum.COLUMN_REVERSE;
      return result(isColumn ? LayoutModeEnum.VERTICAL : LayoutModeEnum.HORIZONTAL, isReverse);
    }

    if (
      parentStyle.display === DisplayStyleEnum.GRID ||
      parentStyle.display === DisplayStyleEnum.INLINE_GRID
    ) {
      return result(LayoutModeEnum.HORIZONTAL);
    }

    /** 右浮动从容器右缘排起，视觉顺序与 DOM 顺序相反（同 row-reverse） */
    if (style.float !== FloatStyleEnum.NONE) {
      return result(LayoutModeEnum.HORIZONTAL, style.float === FloatStyleEnum.RIGHT);
    }

    return result(this.isInVerticalFlow(style) ? LayoutModeEnum.VERTICAL : LayoutModeEnum.HORIZONTAL);
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

  /** 根据落点信息计算占位线的 rect（视口坐标），方向跟随锚点自身的布局模式与排列方向 */
  private computeRect(
    anchor: NodeInfo | null,
    where: DropPositionEnum.BEFORE | DropPositionEnum.AFTER,
    parentEl: HTMLElement
  ): PlaceholderLine {
    const thickness = 2;

    /** 无锚点（容器内无可参照子元素）：在容器内容区顶部画横线 */
    if (!anchor) {
      const parentRect = parentEl.getBoundingClientRect();
      const style = window.getComputedStyle(parentEl);
      const paddingTop = parseFloat(style.paddingTop) || 0;
      const paddingBottom = parseFloat(style.paddingBottom) || 0;
      const paddingLeft = parseFloat(style.paddingLeft) || 0;
      const paddingRight = parseFloat(style.paddingRight) || 0;

      /** column-reverse 容器首项从底部排起，占位线画在底部 */
      const isColumnReverse =
        (style.display === DisplayStyleEnum.FLEX ||
          style.display === DisplayStyleEnum.INLINE_FLEX) &&
        style.flexDirection === FlexDirectionEnum.COLUMN_REVERSE;

      return {
        top: isColumnReverse
          ? parentRect.bottom - paddingBottom - thickness
          : parentRect.top + paddingTop,
        left: parentRect.left + paddingLeft,
        width: parentRect.width - paddingLeft - paddingRight,
        height: thickness,
      };
    }

    /**
     * where 是 DOM 语义（插到锚点 DOM 前/后），占位线要画在锚点的视觉边缘上：
     * 正向排列时 DOM 前 = 视觉前（左缘/上缘），反向排列时相反，故翻转取值
     */
    const visualBefore = anchor.reversed
      ? where === DropPositionEnum.AFTER
      : where === DropPositionEnum.BEFORE;

    /** 横向排列的锚点：插入缝隙是竖直的，画竖线 */
    if (anchor.mode === LayoutModeEnum.HORIZONTAL) {
      return {
        top: anchor.top,
        left: visualBefore ? anchor.left : anchor.right,
        width: thickness,
        height: anchor.outerHeight,
      };
    }

    /** 纵向流锚点：插入缝隙是水平的，画横线 */
    return {
      top: visualBefore ? anchor.top : anchor.bottom,
      left: anchor.left,
      width: anchor.outerWidth,
      height: thickness,
    };
  }
}
