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
  ROOT,
  /** 单行文本框 */
  INPUT,
  /** 多行文本框 */
  TEXTAREA,
  /** 单选框 */
  RADIO,
  /** 多选框 */
  CHECKBOX,
  /** 视频 */
  VIDEO,
  /** 音频 */
  AUDIO,
  /** 标签 */
  LABEL,
  /** 表单 */
  FORM,
}

/** 画布元素label */
export const CanvasElementLabelMap: Record<CanvasElementTypeEnum, string> = {
  [CanvasElementTypeEnum.CONTAINER]: "container",
  [CanvasElementTypeEnum.LINK]: "link",
  [CanvasElementTypeEnum.IMAGE]: "image",
  [CanvasElementTypeEnum.BUTTON]: "button",
  [CanvasElementTypeEnum.PARAGRAPH]: "paragaph",
  [CanvasElementTypeEnum.ROOT]: "root",
  [CanvasElementTypeEnum.INPUT]: "input",
  [CanvasElementTypeEnum.TEXTAREA]: "textarea",
  [CanvasElementTypeEnum.RADIO]: "radio",
  [CanvasElementTypeEnum.CHECKBOX]: "checkbox",
  [CanvasElementTypeEnum.VIDEO]: "video",
  [CanvasElementTypeEnum.AUDIO]: "audio",
  [CanvasElementTypeEnum.LABEL]: "label",
  [CanvasElementTypeEnum.FORM]: "form",
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

/** 按钮类型选项 */
export const BUTTON_TYPE_OPTIONS = [
  { label: 'button', value: ButtonTypeEnum.BUTTON },
  { label: 'reset', value: ButtonTypeEnum.RESET },
  { label: 'submit', value: ButtonTypeEnum.SUBMIT },
];

/** 超链接打开方式 */
export enum LinkTargetEnum {
  /** 当前窗口 */
  SELF = 1,
  /** 新窗口 */
  BLANK = 2,
}

/** 超链接打开方式选项 */
export const LINK_TARGET_OPTIONS = [
  { label: '当前窗口', value: LinkTargetEnum.SELF },
  { label: '新窗口', value: LinkTargetEnum.BLANK },
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

/** 表单提交方式 */
export enum FormMethodEnum {
  /** GET */
  GET = 'get',
  /** POST */
  POST = 'post',
}

/** 表单提交方式选项 */
export const FORM_METHOD_OPTIONS = [
  { label: 'GET', value: FormMethodEnum.GET },
  { label: 'POST', value: FormMethodEnum.POST },
];

/** label可关联的表单元素类型集合 */
export const FORM_ELEMENT_TYPES = [
  CanvasElementTypeEnum.INPUT,
  CanvasElementTypeEnum.TEXTAREA,
  CanvasElementTypeEnum.RADIO,
  CanvasElementTypeEnum.CHECKBOX,
];

/**
 * a元素不允许嵌套的子元素类型集合
 * 根据 HTML 规范，a 元素（带 href）的内容模型为透明模型，
 * 但不得包含交互式内容（interactive content）后代
 */
export const LINK_EXCLUDE_TYPES: Exclude<CanvasElementTypeEnum, CanvasElementTypeEnum.ROOT>[] = [
  CanvasElementTypeEnum.LINK,
  CanvasElementTypeEnum.BUTTON,
  CanvasElementTypeEnum.INPUT,
  CanvasElementTypeEnum.TEXTAREA,
  CanvasElementTypeEnum.RADIO,
  CanvasElementTypeEnum.CHECKBOX,
  CanvasElementTypeEnum.VIDEO,
  CanvasElementTypeEnum.AUDIO,
  CanvasElementTypeEnum.LABEL,
];

/**
 * form元素不允许嵌套的子元素类型集合
 * 根据 HTML 规范，form 元素不得包含另一个 form 元素
 */
export const FORM_EXCLUDE_TYPES: Exclude<CanvasElementTypeEnum, CanvasElementTypeEnum.ROOT>[] = [
  CanvasElementTypeEnum.FORM,
];
