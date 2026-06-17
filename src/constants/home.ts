/** Sider 面板类型枚举 */
export enum SiderPanelEnum {
  /** 未定义 */
  UNDEFINED = 0,
  /** 编辑样式 */
  EDIT = 1,
  /** 层级管理 */
  BLOCKS = 2,
  /** 组件库 */
  LAYER = 3,
}

/** 样式配置类型枚举 */
export enum StyleConfigTypeEnum {
  /** 常规 */
  GENERAL = 1,
  /** 尺寸 */
  SIZE = 2,
  /** 额外的 */
  EXTRA = 3,
  /** 字体相关 */
  FONT = 4,
  /** 视觉 */
  VISUAL = 5,
  /** 布局 */
  FLEX = 6,
}

/** 样式配置类型名称 */
export const STYLE_CONFIG_TYPE_NAME = {
  [StyleConfigTypeEnum.GENERAL]: '常规',
  [StyleConfigTypeEnum.SIZE]: '尺寸',
  [StyleConfigTypeEnum.EXTRA]: '额外的',
  [StyleConfigTypeEnum.FONT]: '字体相关',
  [StyleConfigTypeEnum.VISUAL]: '视觉',
  [StyleConfigTypeEnum.FLEX]: '布局',
};

/** 尺寸&位置单位 */
export enum SizeUnitEnum {
  UNDEFINED,
  PX,
  PERCENT,
  REM,
  EM,
  VW,
  VH,
}

/** 尺寸&位置单位选项 */
export const SIZE_UNIT_OPTIONS = [
  { label: SizeUnitEnum.PX, value: "px" },
  { label: SizeUnitEnum.PERCENT, value: "%" },
  { label: SizeUnitEnum.REM, value: "rem" },
  { label: SizeUnitEnum.EM, value: "em" },
  { label: SizeUnitEnum.VW, value: "vw" },
  { label: SizeUnitEnum.VH, value: "vh" },
];

/** display值枚举 */
export enum DisplayEnum {
  UNDEFINED,
  BLOCK,
  INLINE,
  INLINE_BLOCK,
  FLEX,
  NONE,
}

/** display值选项 */
export const DISPLAY_OPTIONS = [
  { label: DisplayEnum.BLOCK, value: 'block' },
  { label: DisplayEnum.INLINE, value: 'inline' },
  { label: DisplayEnum.INLINE_BLOCK, value: 'inline-block' },
  { label: DisplayEnum.FLEX, value: 'flex' },
  { label: DisplayEnum.NONE, value: 'none' },
];

/** position值枚举 */
export enum PositionEnum {
  UNDEFINED,
  STATIC,
  RELATIVE,
  ABSOLUTE,
  FIXED,
}

/** position值选项 */
export const POSITION_OPTIONS = [
  { label: PositionEnum.STATIC, value: 'static' },
  { label: PositionEnum.RELATIVE, value: 'relative' },
  { label: PositionEnum.ABSOLUTE, value: 'absolute' },
  { label: PositionEnum.FIXED, value: 'fixed' },
];

/** font-family 选项 */
export const FONT_FAMILY_OPTIONS = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Tahoma', value: 'Tahoma' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS' },
];

/** font-weight 选项 */
export const FONT_WEIGHT_OPTIONS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Bold', value: 'bold' },
  { label: 'Lighter', value: 'lighter' },
  { label: '100', value: '100' },
  { label: '200', value: '200' },
  { label: '300', value: '300' },
  { label: '400', value: '400' },
  { label: '500', value: '500' },
  { label: '600', value: '600' },
  { label: '700', value: '700' },
  { label: '800', value: '800' },
  { label: '900', value: '900' },
];

/** text-align 枚举 */
export enum TextAlignEnum {
  /** 未定义 */
  UNDEFINED = 0,
  /** 左对齐 */
  LEFT = 1,
  /** 居中 */
  CENTER = 2,
  /** 右对齐 */
  RIGHT = 3,
  /** 两端对齐 */
  JUSTIFY = 4,
}

/** flex-container 选项 */
export const FLEX_CONTAINER_OPTIONS = [
  { label: 'Disable', value: 'disable' },
  { label: 'Enable', value: 'enable' },
];

/** flex-direction 选项 */
export const FLEX_DIRECTION_OPTIONS = [
  { label: 'row', value: 'row' },
  { label: 'row-reverse', value: 'row-reverse' },
  { label: 'column', value: 'column' },
  { label: 'column-reverse', value: 'column-reverse' },
];

/** justify-content 选项 */
export const JUSTIFY_CONTENT_OPTIONS = [
  { label: 'flex-start', value: 'flex-start' },
  { label: 'center', value: 'center' },
  { label: 'flex-end', value: 'flex-end' },
  { label: 'space-between', value: 'space-between' },
  { label: 'space-around', value: 'space-around' },
];

/** align-items 选项 */
export const ALIGN_ITEMS_OPTIONS = [
  { label: 'flex-start', value: 'flex-start' },
  { label: 'center', value: 'center' },
  { label: 'flex-end', value: 'flex-end' },
  { label: 'stretch', value: 'stretch' },
];

/** align-self 选项 */
export const ALIGN_SELF_OPTIONS = [
  { label: 'auto', value: 'auto' },
  { label: 'flex-start', value: 'flex-start' },
  { label: 'center', value: 'center' },
  { label: 'flex-end', value: 'flex-end' },
  { label: 'stretch', value: 'stretch' },
];

/** background-attachment 选项 */
export const BG_ATTACHMENT_OPTIONS = [
  { label: 'scroll', value: 'scroll' },
  { label: 'fixed', value: 'fixed' },
  { label: 'local', value: 'local' },
];

/** background-repeat 选项 */
export const BG_REPEAT_OPTIONS = [
  { label: 'no-repeat', value: 'no-repeat' },
  { label: 'repeat', value: 'repeat' },
  { label: 'repeat-x', value: 'repeat-x' },
  { label: 'repeat-y', value: 'repeat-y' },
  { label: 'space', value: 'space' },
  { label: 'round', value: 'round' },
];

/** background-size 选项 */
export const BG_SIZE_OPTIONS = [
  { label: 'auto', value: 'auto' },
  { label: 'cover', value: 'cover' },
  { label: 'contain', value: 'contain' },
];

/** background-position 选项 */
export const BG_POSITION_OPTIONS = [
  { label: 'center', value: 'center' },
  { label: 'top', value: 'top' },
  { label: 'bottom', value: 'bottom' },
  { label: 'left', value: 'left' },
  { label: 'right', value: 'right' },
  { label: 'top left', value: 'top left' },
  { label: 'top right', value: 'top right' },
  { label: 'bottom left', value: 'bottom left' },
  { label: 'bottom right', value: 'bottom right' },
];

/** border-style 选项 */
export const BORDER_STYLE_OPTIONS = [
  { label: 'none', value: 'none' },
  { label: 'solid', value: 'solid' },
  { label: 'dashed', value: 'dashed' },
  { label: 'dotted', value: 'dotted' },
  { label: 'double', value: 'double' },
  { label: 'groove', value: 'groove' },
  { label: 'ridge', value: 'ridge' },
  { label: 'inset', value: 'inset' },
  { label: 'outset', value: 'outset' },
];

/** text-decoration 枚举 */
export enum TextDecorationEnum {
  /** 未定义 */
  UNDEFINED = 0,
  /** 无 */
  NONE = 1,
  /** 下划线 */
  UNDERLINE = 2,
  /** 删除线 */
  LINE_THROUGH = 3,
}