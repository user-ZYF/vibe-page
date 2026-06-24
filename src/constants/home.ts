/** Sider 面板类型枚举 */
export enum SiderPanelEnum {
  /** 编辑样式 */
  EDIT,
  /** 层级管理 */
  LAYER,
  /** 组件库 */
  COMPONENTS,
  /** 交互逻辑 */
  LOGIC,
}

/** 画布元素类型 */
export enum CanvasElementTypeEnum {
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
  /** 根元素 */
  ROOT
}

/** 画布元素label */
export const CanvasElementLabelMap: Record<CanvasElementTypeEnum, string> = {
  [CanvasElementTypeEnum.CONTAINER]: "container",
  [CanvasElementTypeEnum.LINK]: "link",
  [CanvasElementTypeEnum.IMAGE]: "image",
  [CanvasElementTypeEnum.BUTTON]: "button",
  [CanvasElementTypeEnum.PARAGRAPH]: "paragaph",
  [CanvasElementTypeEnum.ROOT]: "root",
}

/** 按钮类型 */
export enum ButtonTypeEnum {
  /** 按钮 */
  BUTTON = "button",
  /** 重置 */
  RESET = "reset",
  /** 提交 */
  SUBMIT = "submit",
}

/** 交互事件类型 */
export enum InteractionEventEnum {
  /** 点击 */
  CLICK,
  /** 双击 */
  DOUBLE_CLICK,
  /** 鼠标移入 */
  MOUSE_ENTER,
  /** 鼠标移出 */
  MOUSE_LEAVE,
}

/** 交互事件选项 */
export const INTERACTION_EVENT_OPTIONS: { label: string; value: InteractionEventEnum }[] = [
  { label: '点击', value: InteractionEventEnum.CLICK },
  { label: '双击', value: InteractionEventEnum.DOUBLE_CLICK },
  { label: '鼠标移入', value: InteractionEventEnum.MOUSE_ENTER },
  { label: '鼠标移出', value: InteractionEventEnum.MOUSE_LEAVE },
];

/** 交互动作类型 */
export enum InteractionActionEnum {
  /** 显示元素 */
  SHOW = 0,
  /** 隐藏元素 */
  HIDE = 1,
  /** 切换显示/隐藏 */
  TOGGLE_VISIBILITY = 2,
  /** 切换 CSS 类名 */
  TOGGLE_CLASS = 3,
  /** 跳转 URL */
  NAVIGATE = 4,
}

/** 交互动作选项 */
export const INTERACTION_ACTION_OPTIONS: { label: string; value: InteractionActionEnum }[] = [
  { label: '显示元素', value: InteractionActionEnum.SHOW },
  { label: '隐藏元素', value: InteractionActionEnum.HIDE },
  { label: '切换显示/隐藏', value: InteractionActionEnum.TOGGLE_VISIBILITY },
  { label: '切换 CSS 类名', value: InteractionActionEnum.TOGGLE_CLASS },
  { label: '跳转 URL', value: InteractionActionEnum.NAVIGATE },
];

/** 拖拽落点 */
export enum DropPositionEnum {
  /** 元素之前 */
  BEFORE,
  /** 元素之后 */
  AFTER,
  /** 元素内部 */
  INSIDE,
}

/** 拖拽来源枚举 */
export enum DrapSourceTypeEnum {
  /** 画布内已有元素 */
  EXISTING,
  /** 新元素 */
  NEW,
}