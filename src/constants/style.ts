import { StyleConfig } from "@/views/Canvas/types";
import { CanvasElementTypeEnum } from "./home";
import { cloneDeep } from "lodash";

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
  GENERAL,
  /** 尺寸 */
  SIZE,
  /** 额外 */
  EXTRA,
  /** 字体 */
  FONT,
  /** 视觉 */
  VISUAL,
  /** 弹性盒 */
  FLEX,
  /** 设置 */
  SETTING,
}

/** 样式配置类型名称 */
export const STYLE_CONFIG_TYPE_NAME = {
  [StyleConfigTypeEnum.GENERAL]: '常规',
  [StyleConfigTypeEnum.SIZE]: '尺寸',
  [StyleConfigTypeEnum.EXTRA]: '额外',
  [StyleConfigTypeEnum.FONT]: '字体',
  [StyleConfigTypeEnum.VISUAL]: '视觉',
  [StyleConfigTypeEnum.FLEX]: '弹性盒',
  [StyleConfigTypeEnum.SETTING]: '设置',
};

/** 尺寸&位置单位 */
export enum SizeUnitEnum {
  /** px */
  PX = "px",
  /** 百分比 */
  PERCENT = "%",
  /** rem */
  REM = "rem",
  /** em */
  EM = "em",
  /** vw */
  VW = "vw",
  /** vh */
  VH = "vh",
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
  /** Arial */
  ARIAL = "Arial",
  /** Helvetica */
  HELVETICA = "Helvetica",
  /** Georgia */
  GEORGIA = "Georgia",
  /** Times New Roman */
  TIMES_NEW_ROMAN = "Times New Roman",
  /** Courier New */
  COURIER_NEW = "Courier New",
  /** Verdana */
  VERDANA = "Verdana",
  /** Tahoma */
  TAHOMA = "Tahoma",
  /** Trebuchet MS */
  TREBUCHET_MS = "Trebuchet MS",
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

/** font-style 枚举 */
export enum FontStyleEnum {
  /** 正常 */
  NORMAL = 'normal',
  /** 斜体 */
  ITALIC = 'italic',
}

/** font-style 选项 */
export const FONT_STYLE_OPTIONS = [
  { label: 'Normal', value: FontStyleEnum.NORMAL },
  { label: 'Italic', value: FontStyleEnum.ITALIC },
];

/** text-align 枚举 */
export enum TextAlignEnum {
  /** 左对齐 */
  LEFT = "left",
  /** 居中 */
  CENTER = "center",
  /** 右对齐 */
  RIGHT = "right",
  /** 两端对齐 */
  JUSTIFY = "justify",
}

/** text-align 选项 */
export const TEXT_ALIGN_OPTIONS = [
  { label: 'Left', value: TextAlignEnum.LEFT },
  { label: 'Center', value: TextAlignEnum.CENTER },
  { label: 'Right', value: TextAlignEnum.RIGHT },
  { label: 'Justify', value: TextAlignEnum.JUSTIFY },
];

/** flex-direction 枚举 */
export enum FlexDirectionEnum {
  /** row */
  ROW = "row",
  /** row-reverse */
  ROW_REVERSE = "row-reverse",
  /** column */
  COLUMN = "column",
  /** column-reverse */
  COLUMN_REVERSE = "column-reverse",
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
  /** flex-start */
  FLEX_START = "flex-start",
  /** center */
  CENTER = "center",
  /** flex-end */
  FLEX_END = "flex-end",
  /** space-between */
  SPACE_BETWEEN = "space-between",
  /** space-around */
  SPACE_AROUND = "space-around",
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
  /** flex-start */
  FLEX_START = "flex-start",
  /** center */
  CENTER = "center",
  /** flex-end */
  FLEX_END = "flex-end",
  /** stretch */
  STRETCH = "stretch",
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
  /** 自动 */
  AUTO = "auto",
  /** flex-start */
  FLEX_START = "flex-start",
  /** center */
  CENTER = "center",
  /** flex-end */
  FLEX_END = "flex-end",
  /** stretch */
  STRETCH = "stretch",
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
  /** 滚动 */
  SCROLL = "scroll",
  /** 固定 */
  FIXED = "fixed",
  /** 本地 */
  LOCAL = "local",
}

/** background-attachment 选项 */
export const BG_ATTACHMENT_OPTIONS = [
  { label: 'scroll', value: BackgroundAttachmentEnum.SCROLL },
  { label: 'fixed', value: BackgroundAttachmentEnum.FIXED },
  { label: 'local', value: BackgroundAttachmentEnum.LOCAL },
];



/** background-repeat枚举 */
export enum BackgroundRepeatEnum {
  /** 不重复 */
  NO_REPEAT = "no-repeat",
  /** 重复 */
  REPEAT = "repeat",
  /** 水平重复 */
  REPEAT_X = "repeat-x",
  /** 垂直重复 */
  REPEAT_Y = "repeat-y",
  /** 平铺 */
  SPACE = "space",
  /** 调整大小平铺 */
  ROUND = "round",
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
  /** 自动 */
  AUTO = "auto",
  /** 覆盖 */
  COVER = "cover",
  /** 包含 */
  CONTAIN = "contain",
}

/** background-size 选项 */
export const BG_SIZE_OPTIONS = [
  { label: 'auto', value: BackgroundSizeEnum.AUTO },
  { label: 'cover', value: BackgroundSizeEnum.COVER },
  { label: 'contain', value: BackgroundSizeEnum.CONTAIN },
];

/** background-position枚举 */
export enum BackgroundPositionEnum {
  /** 居中 */
  CENTER = "center",
  /** 顶部 */
  TOP = "top",
  /** 底部 */
  BOTTOM = "bottom",
  /** 左侧 */
  LEFT = "left",
  /** 右侧 */
  RIGHT = "right",
  /** 顶部左侧 */
  TOP_LEFT = "top left",
  /** 顶部右侧 */
  TOP_RIGHT = "top right",
  /** 底部左侧 */
  BOTTOM_LEFT = "bottom left",
  /** 底部右侧 */
  BOTTOM_RIGHT = "bottom right",
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
  /** 无样式 */
  NONE = "none",
  /** 实线 */
  SOLID = "solid",
  /** 虚线 */
  DASHED = "dashed",
  /** 点线 */
  DOTTED = "dotted",
  /** 双线 */
  DOUBLE = "double",
  /** 槽线 */
  GROOVE = "groove",
  /** 脊线 */
  RIDGE = "ridge",
  /** 内凹 */
  INSET = "inset",
  /** 外凸 */
  OUTSET = "outset",
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
  /** 无样式 */
  NONE = "none",
  /** 下划线 */
  UNDERLINE = "underline",
  /** 删除线 */
  LINE_THROUGH = "line-through",
}

/** text-decoration 选项 */
export const TEXT_DECORATION_OPTIONS = [
  { label: 'none', value: TextDecorationEnum.NONE },
  { label: 'underline', value: TextDecorationEnum.UNDERLINE },
  { label: 'line-through', value: TextDecorationEnum.LINE_THROUGH },
];

/** float枚举 */
export enum FloatStyleEnum {
  /** 无浮动 */
  NONE = "none",
  /** 左浮动 */
  LEFT = "left",
  /** 右浮动 */
  RIGHT = "right",
}

/** float选项 */
export const FLOAT_OPTIONS = [
  { label: 'none', value: FloatStyleEnum.NONE },
  { label: 'left', value: FloatStyleEnum.LEFT },
  { label: 'right', value: FloatStyleEnum.RIGHT },
];

/** position枚举 */
export enum PositionStyleEnum {
  /** 静态定位 */
  STATIC = "static",
  /** 相对定位 */
  RELATIVE = "relative",
  /** 绝对定位 */
  ABSOLUTE = "absolute",
  /** 固定定位 */
  FIXED = "fixed",
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
  /** 行内元素 */
  INLINE = "inline",
  /** 块级元素 */
  BLOCK = "block",
  /** 行内块元素 */
  INLINE_BLOCK = "inline-block",
  /** 弹性盒子 */
  FLEX = "flex",
  /** 隐藏 */
  NONE = "none",
}

/** display选项 */
export const DISPLAY_OPTIONS = [
  { label: 'inline', value: DisplayStyleEnum.INLINE },
  { label: 'block', value: DisplayStyleEnum.BLOCK },
  { label: 'inline-block', value: DisplayStyleEnum.INLINE_BLOCK },
  { label: 'flex', value: DisplayStyleEnum.FLEX },
  { label: 'none', value: DisplayStyleEnum.NONE },
];

/** overflow 枚举 */
export enum OverflowStyleEnum {
  /** 可见 */
  VISIBLE = "visible",
  /** 隐藏 */
  HIDDEN = "hidden",
  /** 滚动 */
  SCROLL = "scroll",
  /** 自动 */
  AUTO = "auto",
}

/** overflow 选项 */
export const OVERFLOW_OPTIONS = [
  { label: 'visible', value: OverflowStyleEnum.VISIBLE },
  { label: 'hidden', value: OverflowStyleEnum.HIDDEN },
  { label: 'scroll', value: OverflowStyleEnum.SCROLL },
  { label: 'auto', value: OverflowStyleEnum.AUTO },
];

export const DefaultGeneralStyleConfig: StyleConfig = {
  general: {},
  size: {},
  font: {
    textShadows: []
  },
  visual: {
    backgrounds: [],
    boxShadows: [],
  },
  flex: {},
};

/** 按钮元素默认样式配置 */
export const DefaultButtonStyleConfig: StyleConfig = {
  ...cloneDeep(DefaultGeneralStyleConfig),
};

/** 容器元素默认样式配置 */
export const DefaultContainerStyleConfig: StyleConfig = {
  ...cloneDeep(DefaultGeneralStyleConfig),
  size: {
    ...cloneDeep(DefaultGeneralStyleConfig.size),
    minHeight: '100',
    minHeightUnit: SizeUnitEnum.PX,
    paddingTop: 16,
    paddingTopUnit: SizeUnitEnum.PX,
    paddingRight: 16,
    paddingRightUnit: SizeUnitEnum.PX,
    paddingBottom: 16,
    paddingBottomUnit: SizeUnitEnum.PX,
    paddingLeft: 16,
    paddingLeftUnit: SizeUnitEnum.PX,
    marginTop: '16',
    marginTopUnit: SizeUnitEnum.PX,
    marginRight: '16',
    marginRightUnit: SizeUnitEnum.PX,
    marginBottom: '16',
    marginBottomUnit: SizeUnitEnum.PX,
    marginLeft: '16',
    marginLeftUnit: SizeUnitEnum.PX,
  },
};

/** 段落元素默认样式配置 */
export const DefaultParagraphStyleConfig: StyleConfig = {
  ...cloneDeep(DefaultGeneralStyleConfig)
};

/** 链接元素默认样式配置 */
export const DefaultLinkStyleConfig: StyleConfig = {
 ...cloneDeep(DefaultGeneralStyleConfig),
 general: {
  ...cloneDeep(DefaultGeneralStyleConfig.general),
  display: DisplayStyleEnum.INLINE_BLOCK,
 },
 size: {
  ...cloneDeep(DefaultGeneralStyleConfig.size),
  minWidth: '50',
  minWidthUnit: SizeUnitEnum.PX,
  minHeight: '30',
  minHeightUnit: SizeUnitEnum.PX,
 },
};

/** 图片元素默认样式配置 */
export const DefaultImageStyleConfig: StyleConfig = {
 ...cloneDeep(DefaultGeneralStyleConfig)
};

/** 根元素默认样式配置 */
export const DefaultRootStyleConfig: StyleConfig = {
 ...cloneDeep(DefaultGeneralStyleConfig),
 general: {
  ...cloneDeep(DefaultGeneralStyleConfig.general),
  position: PositionStyleEnum.RELATIVE
 }
};

/** 单行文本框元素默认样式配置 */
export const DefaultInputStyleConfig: StyleConfig = {
  ...cloneDeep(DefaultGeneralStyleConfig),
};

/** 多行文本框元素默认样式配置 */
export const DefaultTextareaStyleConfig: StyleConfig = {
  ...cloneDeep(DefaultGeneralStyleConfig),
};

/** 单选框元素默认样式配置 */
export const DefaultRadioStyleConfig: StyleConfig = {
  ...cloneDeep(DefaultGeneralStyleConfig),
};

/** 多选框元素默认样式配置 */
export const DefaultCheckboxStyleConfig: StyleConfig = {
  ...cloneDeep(DefaultGeneralStyleConfig),
};

/** 视频元素默认样式配置 */
export const DefaultVideoStyleConfig: StyleConfig = {
  ...cloneDeep(DefaultGeneralStyleConfig),
};

/** 音频元素默认样式配置 */
export const DefaultAudioStyleConfig: StyleConfig = {
  ...cloneDeep(DefaultGeneralStyleConfig),
};

/** 标签元素默认样式配置 */
export const DefaultLabelStyleConfig: StyleConfig = {
  ...cloneDeep(DefaultGeneralStyleConfig),
};

/** 表单元素默认样式配置 */
export const DefaultFormStyleConfig: StyleConfig = {
  ...cloneDeep(DefaultGeneralStyleConfig),
};

/** Class 默认样式配置（空白样式，所有属性均未设置） */
export const defaultClassStyleConfig: StyleConfig = {
 ...cloneDeep(DefaultGeneralStyleConfig)
};

/** 画布元素默认样式配置映射 */
export const DefaultStyleConfigMap: Record<CanvasElementTypeEnum, StyleConfig> = {
  [CanvasElementTypeEnum.BUTTON]: DefaultButtonStyleConfig,
  [CanvasElementTypeEnum.CONTAINER]: DefaultContainerStyleConfig,
  [CanvasElementTypeEnum.PARAGRAPH]: DefaultParagraphStyleConfig,
  [CanvasElementTypeEnum.LINK]: DefaultLinkStyleConfig,
  [CanvasElementTypeEnum.IMAGE]: DefaultImageStyleConfig,
  [CanvasElementTypeEnum.ROOT]: DefaultRootStyleConfig,
  [CanvasElementTypeEnum.INPUT]: DefaultInputStyleConfig,
  [CanvasElementTypeEnum.TEXTAREA]: DefaultTextareaStyleConfig,
  [CanvasElementTypeEnum.RADIO]: DefaultRadioStyleConfig,
  [CanvasElementTypeEnum.CHECKBOX]: DefaultCheckboxStyleConfig,
  [CanvasElementTypeEnum.VIDEO]: DefaultVideoStyleConfig,
  [CanvasElementTypeEnum.AUDIO]: DefaultAudioStyleConfig,
  [CanvasElementTypeEnum.LABEL]: DefaultLabelStyleConfig,
  [CanvasElementTypeEnum.FORM]: DefaultFormStyleConfig,
};

/** 调整尺寸方向枚举 */
export const enum ResizeDirEnum {
  /** 未定义 */
  UNDEFINED = 0,
  /** 北（上） */
  N = 1,
  /** 东（右） */
  E = 2,
  /** 南（下） */
  S = 3,
  /** 西（左） */
  W = 4,
  /** 东北（右上） */
  NE = 5,
  /** 西北（左上） */
  NW = 6,
  /** 东南（右下） */
  SE = 7,
  /** 西南（左下） */
  SW = 8,
}

/** CSS class/id 名称合法性校验正则（须以字母、下划线或连字符开头，仅包含字母、数字、下划线和连字符） */
export const CSS_NAME_REGEX = /^-?[_a-zA-Z][_a-zA-Z0-9-]*$/;
