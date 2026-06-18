/** Sider 面板类型枚举 */
export enum SiderPanelEnum {
  /** 未定义 */
  UNDEFINED,
  /** 编辑样式 */
  EDIT,
  /** 层级管理 */
  LAYER,
  /** 组件库 */
  BLOCKS,
}

/** 画布元素类型 */
export enum CanvasElementTypeEnum {
  /** 未定义 */
  UNDEFINED,
  /** 容器 */
  CONTAINER,
  /** 超链接 */
  LINK,
  /** 图片 */
  IMAGE,
  /** 按钮 */
  BUTTON,
  /** 段落 */
  PARAGRAPH,
}

/** 画布元素label */
export const CanvasElementLabelMap: Record<CanvasElementTypeEnum, string> = {
  [CanvasElementTypeEnum.UNDEFINED]: "未定义",
  [CanvasElementTypeEnum.CONTAINER]: "容器",
  [CanvasElementTypeEnum.LINK]: "超链接",
  [CanvasElementTypeEnum.IMAGE]: "图片",
  [CanvasElementTypeEnum.BUTTON]: "按钮",
  [CanvasElementTypeEnum.PARAGRAPH]: "段落",
}

/** 按钮类型 */
export enum ButtonTypeEnum {
  /** 按钮 */
  BUTTON,
  /** 重置 */
  RESET,
  /** 提交 */
  SUBMIT,
}
