/**
 * 拖拽引擎类型定义
 */

import { DropPositionEnum } from "@/constants/home";
import type { LayoutModeEnum } from "@/constants/style";

/** 单个子元素的几何维度（复用于 findDropPosition） */
export interface NodeInfo {
  /** 元素 id */
  id: string;
  /** 在父容器 children 数组中的真实下标 */
  childIndex: number;
  /** 元素自身布局模式（决定其作为锚点时的判定轴和占位线方向） */
  mode: LayoutModeEnum;
  /** 排列方向是否反向（flex-direction: *-reverse、float: right），影响「之前」的轴向比较方向 */
  reversed: boolean;
  /** 顶部距视口距离 */
  top: number;
  /** 左侧距视口距离 */
  left: number;
  /** 右侧距视口距离 */
  right: number;
  /** 外部宽度 */
  outerWidth: number;
  /** 外部高度 */
  outerHeight: number;
  /** 底部距视口距离 */
  bottom: number;
}

/** 落点计算结果（复用于 findDropPosition） */
export interface DropPositionResult {
  /** 插入参照的锚点元素（null = 容器中无可参照的子元素） */
  anchor: NodeInfo | null;
  /** 插入到锚点元素的前面还是后面 */
  where: DropPositionEnum.BEFORE | DropPositionEnum.AFTER;
}

/** 落点位置 */
export interface DropPosition {
  /** 目标父容器 id（null = 根画布） */
  parentId: string | null;
  /** 插入位置 index */
  index: number;
  /** before / after */
  where: DropPositionEnum.BEFORE | DropPositionEnum.AFTER;
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

/** 占位线 */
export interface PlaceholderLine {
  /** 距离视口顶部 */
  top: number;
  /** 距离视口左侧 */
  left: number;
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
}

/** 落点指示器 */
export interface DropIndicator {
  /** 目标父容器 id */
  parentId: string;
  /** 插入位置索引 */
  index: number;
  /** 具体插入位置 */
  where: DropPositionEnum.BEFORE | DropPositionEnum.AFTER;
  /** 占位线 */
  rect: PlaceholderLine;
  /** 错误信息 */
  error: string;
}
