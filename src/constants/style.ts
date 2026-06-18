/** 背景类型枚举 */
export const enum BackgroundTypeEnum {
  /** 未定义 */
  UNDEFINED,
  /** 图片 */
  IMAGE,
  /** 纯色 */
  COLOR,
  /** 渐变 */
  GRADIENT,
}

/** 样式配置类型枚举 */
export enum StyleConfigTypeEnum {
  /** 未定义 */
  UNDEFINED,
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
  /** 未定义 */
  UNDEFINED,
  /** px */
  PX,
  /** 百分比 */
  PERCENT,
  /** rem */
  REM,
  /** em */
  EM,
  /** vw */
  VW,
  /** vh */
  VH,
}

/** 尺寸&位置单位选项 */
export const SIZE_UNIT_OPTIONS = [
  { label: 'px', value: SizeUnitEnum.PX },
  { label: '%', value: SizeUnitEnum.PERCENT },
  { label: 'rem', value: SizeUnitEnum.REM },
  { label: 'em', value: SizeUnitEnum.EM },
  { label: 'vw', value: SizeUnitEnum.VW },
  { label: 'vh', value: SizeUnitEnum.VH },
];

/** font-family枚举 */
export enum FontFamilyEnum {
  /** 未定义 */
  UNDEFINED,
  /** Arial */
  ARIAL,
  /** Helvetica */
  HELVETICA,
  /** Georgia */
  GEORGIA,
  /** Times New Roman */
  TIMES_NEW_ROMAN,
  /** Courier New */
  COURIER_NEW,
  /** Verdana */
  VERDANA,
  /** Tahoma */
  TAHOMA,
  /** Trebuchet MS */
  TREBUCHET_MS,
}

/** font-family 选项 */
export const FONT_FAMILY_OPTIONS = [
  { label: 'Arial', value: FontFamilyEnum.ARIAL },
  { label: 'Helvetica', value: FontFamilyEnum.HELVETICA },
  { label: 'Georgia', value: FontFamilyEnum.GEORGIA },
  { label: 'Times New Roman', value: FontFamilyEnum.TIMES_NEW_ROMAN },
  { label: 'Courier New', value: FontFamilyEnum.COURIER_NEW },
  { label: 'Verdana', value: FontFamilyEnum.VERDANA },
  { label: 'Tahoma', value: FontFamilyEnum.TAHOMA },
  { label: 'Trebuchet MS', value: FontFamilyEnum.TREBUCHET_MS },
];

/** font-weight枚举 */
export enum FontWeightEnum {
  /** 未定义 */
  UNDEFINED = 0,
  /** Thin */
  THIN = 100,
  /** Extra-Light */
  EXTRA_LIGHT = 200,
  /** Light */
  LIGHT = 300,
  /** Normal */
  NORMAL = 400,
  /** Medium */
  MEDIUM = 500,
  /** Semi-Bold */
  SEMI_BOLD = 600,
  /** Bold */
  BOLD = 700,
  /** Extra-Bold */
  EXTRA_BOLD = 800,
  /** Ultra-Bold */
  ULTRA_BOLD = 900,
}

/** font-weight 选项 */
export const FONT_WEIGHT_OPTIONS = [
  { label: 'Thin', value: FontWeightEnum.THIN },
  { label: 'Extra-Light', value: FontWeightEnum.EXTRA_LIGHT },
  { label: 'Light', value: FontWeightEnum.LIGHT },
  { label: 'Normal', value: FontWeightEnum.NORMAL },
  { label: 'Medium', value: FontWeightEnum.MEDIUM },
  { label: 'Semi-Bold', value: FontWeightEnum.SEMI_BOLD },
  { label: 'Bold', value: FontWeightEnum.BOLD },
  { label: 'Extra-Bold', value: FontWeightEnum.EXTRA_BOLD },
  { label: 'Ultra-Bold', value: FontWeightEnum.ULTRA_BOLD },
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

/** text-align 选项 */
export const TEXT_ALIGN_OPTIONS = [
  { label: 'Left', value: TextAlignEnum.LEFT },
  { label: 'Center', value: TextAlignEnum.CENTER },
  { label: 'Right', value: TextAlignEnum.RIGHT },
  { label: 'Justify', value: TextAlignEnum.JUSTIFY },
];

/** flex-container 枚举 */
export enum FlexContainerEnum {
  /** 未定义 */
  UNDEFINED = 0,
  /** 禁用 */
  DISABLE = 1,
  /** 启用 */
  ENABLE = 2,
}

/** flex-container 选项 */
export const FLEX_CONTAINER_OPTIONS = [
  { label: 'Disable', value: FlexContainerEnum.DISABLE },
  { label: 'Enable', value: FlexContainerEnum.ENABLE },
];


/** flex-direction 枚举 */
export enum FlexDirectionEnum {
  /** 未定义 */
  UNDEFINED,
  /** row */
  ROW,
  /** row-reverse */
  ROW_REVERSE,
  /** column */
  COLUMN,
  /** column-reverse */
  COLUMN_REVERSE,
}

/** flex-direction 选项 */
export const FLEX_DIRECTION_OPTIONS = [
  { label: 'row', value: FlexDirectionEnum.ROW },
  { label: 'row-reverse', value: FlexDirectionEnum.ROW_REVERSE },
  { label: 'column', value: FlexDirectionEnum.COLUMN },
  { label: 'column-reverse', value: FlexDirectionEnum.COLUMN_REVERSE },
];

/** justify-content 枚举 */
export enum JustifyContentEnum {
  /** 未定义 */
  UNDEFINED,
  /** flex-start */
  FLEX_START,
  /** center */
  CENTER,
  /** flex-end */
  FLEX_END,
  /** space-between */
  SPACE_BETWEEN,
  /** space-around */
  SPACE_AROUND,
}

/** justify-content 选项 */
export const JUSTIFY_CONTENT_OPTIONS = [
  { label: 'flex-start', value: JustifyContentEnum.FLEX_START },
  { label: 'center', value: JustifyContentEnum.CENTER },
  { label: 'flex-end', value: JustifyContentEnum.FLEX_END },
  { label: 'space-between', value: JustifyContentEnum.SPACE_BETWEEN },
  { label: 'space-around', value: JustifyContentEnum.SPACE_AROUND },
];

/** align-items 枚举 */
export enum AlignItemsEnum {
  /** 未定义 */
  UNDEFINED,
  /** flex-start */
  FLEX_START,
  /** center */
  CENTER,
  /** flex-end */
  FLEX_END,
  /** stretch */
  STRETCH,
}

/** align-items 选项 */
export const ALIGN_ITEMS_OPTIONS = [
  { label: 'flex-start', value: AlignItemsEnum.FLEX_START },
  { label: 'center', value: AlignItemsEnum.CENTER },
  { label: 'flex-end', value: AlignItemsEnum.FLEX_END },
  { label: 'stretch', value: AlignItemsEnum.STRETCH },
];

/** align-self枚举 */
export enum AlignSelfEnum {
  /** 未定义 */
  UNDEFINED,
  /** 自动 */
  AUTO,
  /** flex-start */
  FLEX_START,
  /** center */
  CENTER,
  /** flex-end */
  FLEX_END,
  /** stretch */
  STRETCH,
}

/** align-self 选项 */
export const ALIGN_SELF_OPTIONS = [
  { label: 'auto', value: AlignSelfEnum.AUTO },
  { label: 'flex-start', value: AlignSelfEnum.FLEX_START },
  { label: 'center', value: AlignSelfEnum.CENTER },
  { label: 'flex-end', value: AlignSelfEnum.FLEX_END },
  { label: 'stretch', value: AlignSelfEnum.STRETCH },
];

/** background-attachment枚举 */
export enum BackgroundAttachmentEnum {
  /** 未定义 */
  UNDEFINED,
  /** 滚动 */
  SCROLL,
  /** 固定 */
  FIXED,
  /** 本地 */
  LOCAL,
}

/** background-attachment 选项 */
export const BG_ATTACHMENT_OPTIONS = [
  { label: 'scroll', value: BackgroundAttachmentEnum.SCROLL },
  { label: 'fixed', value: BackgroundAttachmentEnum.FIXED },
  { label: 'local', value: BackgroundAttachmentEnum.LOCAL },
];



/** background-repeat枚举 */
export enum BackgroundRepeatEnum {
  /** 未定义 */
  UNDEFINED,
  /** 不重复 */
  NO_REPEAT,
  /** 重复 */
  REPEAT,
  /** 水平重复 */
  REPEAT_X,
  /** 垂直重复 */
  REPEAT_Y,
  /** 平铺 */
  SPACE,
  /** 调整大小平铺 */
  ROUND,
}

/** background-repeat 选项 */
export const BG_REPEAT_OPTIONS = [
  { label: 'no-repeat', value: BackgroundRepeatEnum.NO_REPEAT },
  { label: 'repeat', value: BackgroundRepeatEnum.REPEAT },
  { label: 'repeat-x', value: BackgroundRepeatEnum.REPEAT_X },
  { label: 'repeat-y', value: BackgroundRepeatEnum.REPEAT_Y },
  { label: 'space', value: BackgroundRepeatEnum.SPACE },
  { label: 'round', value: BackgroundRepeatEnum.ROUND },
];

/** background-size枚举 */
export enum BackgroundSizeEnum {
  /** 未定义 */
  UNDEFINED,
  /** 自动 */
  AUTO,
  /** 覆盖 */
  COVER,
  /** 包含 */
  CONTAIN,
}

/** background-size 选项 */
export const BG_SIZE_OPTIONS = [
  { label: 'auto', value: BackgroundSizeEnum.AUTO },
  { label: 'cover', value: BackgroundSizeEnum.COVER },
  { label: 'contain', value: BackgroundSizeEnum.CONTAIN },
];

/** background-position枚举 */
export enum BackgroundPositionEnum {
  /** 未定义 */
  UNDEFINED,
  /** 居中 */
  CENTER,
  /** 顶部 */
  TOP,
  /** 底部 */
  BOTTOM,
  /** 左侧 */
  LEFT,
  /** 右侧 */
  RIGHT,
  /** 顶部左侧 */
  TOP_LEFT,
  /** 顶部右侧 */
  TOP_RIGHT,
  /** 底部左侧 */
  BOTTOM_LEFT,
  /** 底部右侧 */
  BOTTOM_RIGHT,
}

/** background-position 选项 */
export const BG_POSITION_OPTIONS = [
  { label: 'center', value: BackgroundPositionEnum.CENTER },
  { label: 'top', value: BackgroundPositionEnum.TOP },
  { label: 'bottom', value: BackgroundPositionEnum.BOTTOM },
  { label: 'left', value: BackgroundPositionEnum.LEFT },
  { label: 'right', value: BackgroundPositionEnum.RIGHT },
  { label: 'top left', value: BackgroundPositionEnum.TOP_LEFT },
  { label: 'top right', value: BackgroundPositionEnum.TOP_RIGHT },
  { label: 'bottom left', value: BackgroundPositionEnum.BOTTOM_LEFT },
  { label: 'bottom right', value: BackgroundPositionEnum.BOTTOM_RIGHT },
];

/** border-style枚举 */
export enum BorderStyleEnum {
  /** 未定义 */
  UNDEFINED,
  /** 无样式 */
  NONE,
  /** 实线 */
  SOLID,
  /** 虚线 */
  DASHED,
  /** 点线 */
  DOTTED,
  /** 双线 */
  DOUBLE,
  /** 槽线 */
  GROOVE,
  /** 脊线 */
  RIDGE,
  /** 内凹 */
  INSET,
  /** 外凸 */
  OUTSET,
}

/** border-style 选项 */
export const BORDER_STYLE_OPTIONS = [
  { label: 'none', value: BorderStyleEnum.NONE },
  { label: 'solid', value: BorderStyleEnum.SOLID },
  { label: 'dashed', value: BorderStyleEnum.DASHED },
  { label: 'dotted', value: BorderStyleEnum.DOTTED },
  { label: 'double', value: BorderStyleEnum.DOUBLE },
  { label: 'groove', value: BorderStyleEnum.GROOVE },
  { label: 'ridge', value: BorderStyleEnum.RIDGE },
  { label: 'inset', value: BorderStyleEnum.INSET },
  { label: 'outset', value: BorderStyleEnum.OUTSET },
];

/** text-decoration 枚举 */
export enum TextDecorationEnum {
  /** 未定义 */
  UNDEFINED,
  /** 无样式 */
  NONE,
  /** 下划线 */
  UNDERLINE,
  /** 删除线 */
  LINE_THROUGH,
}

/** text-decoration 选项 */
export const TEXT_DECORATION_OPTIONS = [
  { label: 'none', value: TextDecorationEnum.NONE },
  { label: 'underline', value: TextDecorationEnum.UNDERLINE },
  { label: 'line-through', value: TextDecorationEnum.LINE_THROUGH },
];

/** float枚举 */
export enum FloatStyleEnum {
  /** 未定义 */
  UNDEFINED,
  /** 无浮动 */
  NONE,
  /** 左浮动 */
  LEFT,
  /** 右浮动 */
  RIGHT,
}

/** float选项 */
export const FLOAT_OPTIONS = [
  { label: 'none', value: FloatStyleEnum.NONE },
  { label: 'left', value: FloatStyleEnum.LEFT },
  { label: 'right', value: FloatStyleEnum.RIGHT },
];

/** position枚举 */
export enum PositionStyleEnum {
  /** 未定义 */
  UNDEFINED,
  /** 静态定位 */
  STATIC,
  /** 相对定位 */
  RELATIVE,
  /** 绝对定位 */
  ABSOLUTE,
  /** 固定定位 */
  FIXED,
}

/** position选项 */
export const POSITION_OPTIONS = [
  { label: 'static', value: PositionStyleEnum.STATIC },
  { label: 'relative', value: PositionStyleEnum.RELATIVE },
  { label: 'absolute', value: PositionStyleEnum.ABSOLUTE },
  { label: 'fixed', value: PositionStyleEnum.FIXED },
];

/** display枚举 */
export enum DisplayStyleEnum {
  /** 未定义 */
  UNDEFINED,
  /** 行内元素 */
  INLINE,
  /** 块级元素 */
  BLOCK,
  /** 行内块元素 */
  INLINE_BLOCK,
  /** 弹性盒子 */
  FLEX,
  /** 隐藏 */
  NONE,
}

/** display选项 */
export const DISPLAY_OPTIONS = [
  { label: 'inline', value: DisplayStyleEnum.INLINE },
  { label: 'block', value: DisplayStyleEnum.BLOCK },
  { label: 'inline-block', value: DisplayStyleEnum.INLINE_BLOCK },
  { label: 'flex', value: DisplayStyleEnum.FLEX },
  { label: 'none', value: DisplayStyleEnum.NONE },
];
