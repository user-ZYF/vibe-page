/**
 * 拖拽引擎类型定义
 */

/** 单个子元素的几何维度（复用于 findDropPosition） */
export interface NodeInfo {
  /** 元素 id */
  id: string;
  /** 顶部距视口距离 */
  top: number;
  /** 左侧距视口距离 */
  left: number;
  /** 外部宽度 */
  outerWidth: number;
  /** 外部高度 */
  outerHeight: number;
  /** 底部距视口距离 */
  bottom: number;
  /** 是否在文档流中（非 float/absolute） */
  inFlow: boolean;
}

/** 落点位置 */
export interface DropPosition {
  /** 目标父容器 id（null = 根画布） */
  parentId: string | null;
  /** 插入位置 index */
  index: number;
  /** before / after */
  where: "before" | "after";
}

/** DOM 节点注册信息 */
export interface NodeRegistration {
  /** 元素 id */
  id: string;
  /** 对应的 DOM 元素 */
  el: HTMLElement;
  /** 是否为可接收子元素的容器 */
  isCanvas: boolean;
}

/** 占位线 Indicator */
export interface DropIndicator {
  /** 目标父容器 id（null = 根画布） */
  parentId: string | null;
  /** 插入位置 index */
  index: number;
  /** before / after */
  where: "before" | "after";
  /** 占位线几何信息（供 CSS 定位，使用视口坐标） */
  rect: { top: number; left: number; width: number; height: number };
  /** 是否为非法落点 */
  error: boolean;
}
