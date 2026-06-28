/**
 * 样式面板各配置项的类型定义
 */

import type { ButtonTypeEnum, CanvasElementTypeEnum, DropPositionEnum } from '@/constants/home';
import type {
  BackgroundTypeEnum,
  BackgroundAttachmentEnum,
  FontWeightEnum,
  BackgroundPositionEnum,
  BackgroundRepeatEnum,
  BackgroundSizeEnum,
  BorderStyleEnum,
  DisplayStyleEnum,
  FloatStyleEnum,
  FlexContainerEnum,
  FlexDirectionEnum,
  JustifyContentEnum,
  AlignItemsEnum,
  AlignSelfEnum,
  OverflowStyleEnum,
  PositionStyleEnum,
  SizeUnitEnum,
  TextAlignEnum,
  TextDecorationEnum,
  ResizeDirEnum,
} from '@/constants/style';

/**
 * 文本阴影单项
 */
export interface TextShadowItem {
  /** X 偏移值 */
  x?: number;
  /** X 偏移单位 */
  xUnit?: SizeUnitEnum;
  /** Y 偏移值 */
  y?: number;
  /** Y 偏移单位 */
  yUnit?: SizeUnitEnum;
  /** 模糊半径 */
  blur?: number;
  /** 模糊半径单位 */
  blurUnit?: SizeUnitEnum;
  /** 阴影颜色 */
  color?: string;
}

/**
 * 盒阴影单项
 */
export interface BoxShadowItem {
  /** X 偏移值 */
  x?: number;
  /** X 偏移单位 */
  xUnit?: SizeUnitEnum;
  /** Y 偏移值 */
  y?: number;
  /** Y 偏移单位 */
  yUnit?: SizeUnitEnum;
  /** 模糊半径 */
  blur?: number;
  /** 模糊半径单位 */
  blurUnit?: SizeUnitEnum;
  /** 扩展半径 */
  spread?: number;
  /** 扩展半径单位 */
  spreadUnit?: SizeUnitEnum;
  /** 阴影颜色 */
  color?: string;
  /** 是否为内阴影 */
  inset?: boolean;
}

/**
 * 背景层单项
 */
export interface BackgroundItem {
  /** 背景类型 */
  type?: BackgroundTypeEnum;
  /** 图片地址（type 为 image 时有效） */
  imageUrl?: string;
  /** 背景重复方式 */
  repeat?: BackgroundRepeatEnum;
  /** 背景位置 */
  position?: BackgroundPositionEnum;
  /** 背景附着方式 */
  attachment?: BackgroundAttachmentEnum;
  /** 背景尺寸 */
  size?: BackgroundSizeEnum;
  /** 背景颜色（type 为 color 时有效） */
  color?: string;
  /** 渐变值（type 为 gradient 时有效） */
  gradient?: string;
}

/**
 * 常规配置
 */
export interface GeneralConfig {
  /** 浮动 */
  float?: FloatStyleEnum;
  /** 显示方式 */
  display?: DisplayStyleEnum;
  /** 定位方式 */
  position?: PositionStyleEnum;
  /** 顶部偏移值 */
  top?: string;
  /** 顶部偏移单位 */
  topUnit?: SizeUnitEnum;
  /** 右侧偏移值 */
  right?: string;
  /** 右侧偏移单位 */
  rightUnit?: SizeUnitEnum;
  /** 左侧偏移值 */
  left?: string;
  /** 左侧偏移单位 */
  leftUnit?: SizeUnitEnum;
  /** 底部偏移值 */
  bottom?: string;
  /** 底部偏移单位 */
  bottomUnit?: SizeUnitEnum;
  /** 溢出处理方式 */
  overflow?: OverflowStyleEnum;
}

/**
 * 尺寸配置
 */
export interface SizeConfig {
  /** 宽度值 */
  width?: string;
  /** 宽度单位 */
  widthUnit?: SizeUnitEnum;
  /** 高度值 */
  height?: string;
  /** 高度单位 */
  heightUnit?: SizeUnitEnum;
  /** 最大宽度值 */
  maxWidth?: string;
  /** 最大宽度单位 */
  maxWidthUnit?: SizeUnitEnum;
  /** 最小高度值 */
  minHeight?: string;
  /** 最小高度单位 */
  minHeightUnit?: SizeUnitEnum;
  /** 上外边距 */
  marginTop?: number;
  /** 上外边距单位 */
  marginTopUnit?: SizeUnitEnum;
  /** 右外边距 */
  marginRight?: number;
  /** 右外边距单位 */
  marginRightUnit?: SizeUnitEnum;
  /** 下外边距 */
  marginBottom?: number;
  /** 下外边距单位 */
  marginBottomUnit?: SizeUnitEnum;
  /** 左外边距 */
  marginLeft?: number;
  /** 左外边距单位 */
  marginLeftUnit?: SizeUnitEnum;
  /** 上内边距 */
  paddingTop?: number;
  /** 上内边距单位 */
  paddingTopUnit?: SizeUnitEnum;
  /** 右内边距 */
  paddingRight?: number;
  /** 右内边距单位 */
  paddingRightUnit?: SizeUnitEnum;
  /** 下内边距 */
  paddingBottom?: number;
  /** 下内边距单位 */
  paddingBottomUnit?: SizeUnitEnum;
  /** 左内边距 */
  paddingLeft?: number;
  /** 左内边距单位 */
  paddingLeftUnit?: SizeUnitEnum;
}

/**
 * 字体配置
 */
export interface FontConfig {
  /** 字体族 */
  fontFamily?: string;
  /** 字体大小 */
  fontSize?: number;
  /** 字体大小单位 */
  fontSizeUnit?: SizeUnitEnum;
  /** 字体粗细 */
  fontWeight?: FontWeightEnum;
  /** 字母间距值 */
  letterSpacing?: string;
  /** 字母间距单位 */
  letterSpacingUnit?: SizeUnitEnum;
  /** 文字颜色 */
  color?: string;
  /** 行高值 */
  lineHeight?: string;
  /** 行高单位 */
  lineHeightUnit?: SizeUnitEnum;
  /** 文字对齐方式 */
  textAlign?: TextAlignEnum;
  /** 文字装饰 */
  textDecoration?: TextDecorationEnum;
  /** 文字阴影列表 */
  textShadows: TextShadowItem[];
}

/**
 * 视觉配置
 */
export interface VisualConfig {
  /** 背景层列表 */
  backgrounds: BackgroundItem[];
  /** 边框宽度 */
  borderWidth?: number;
  /** 边框宽度单位 */
  borderWidthUnit?: SizeUnitEnum;
  /** 边框样式 */
  borderStyle?: BorderStyleEnum;
  /** 边框颜色 */
  borderColor?: string;
  /** 左上圆角 */
  borderRadiusTL?: number;
  /** 右上圆角 */
  borderRadiusTR?: number;
  /** 左下圆角 */
  borderRadiusBL?: number;
  /** 右下圆角 */
  borderRadiusBR?: number;
  /** 圆角单位 */
  borderRadiusUnit?: SizeUnitEnum;
  /** 不透明度 */
  opacity?: number;
  /** 盒阴影列表 */
  boxShadows: BoxShadowItem[];
}

/**
 * 布局（Flex）配置
 */
export interface FlexConfig {
  /** Flex 容器类型 */
  flexContainer?: FlexContainerEnum;
  /** Flex 父级值 */
  flexParent?: number;
  /** 主轴方向 */
  flexDirection?: FlexDirectionEnum;
  /** 主轴对齐 */
  justifyContent?: JustifyContentEnum;
  /** 交叉轴对齐 */
  alignItems?: AlignItemsEnum;
  /** Flex 子级值 */
  flexChildren?: number;
  /** 排列顺序 */
  order?: number;
  /** 放大比例 */
  flexGrow?: number;
  /** 缩小比例 */
  flexShrink?: number;
  /** 基准尺寸值 */
  flexBasis?: string;
  /** 基准尺寸单位 */
  flexBasisUnit?: SizeUnitEnum;
  /** 自身对齐方式 */
  alignSelf?: AlignSelfEnum;
}

/** 画布元素样式配置 */
export interface StyleConfig {
  /** 通用样式 */
  general: GeneralConfig;
  /** 尺寸样式 */
  size: SizeConfig;
  /** 字体样式 */
  font: FontConfig;
  /** 视觉样式 */
  visual: VisualConfig;
  /** 布局（Flex）样式 */
  flex: FlexConfig;
}

/** 画布元素通用属性 */
export interface CanvasElementBase {
  /** 元素id */
  id: string;
  /** 元素样式配置 */
  styleConfig: StyleConfig;
  /** 元素已启用的类名列表（实际应用到 DOM 的 class） */
  classes: string[];
  /** 元素管理的所有类名列表（包含启用和禁用的 class） */
  classNames: string[];
  /** 元素别名 */
  alias?: string;
}

/** 画布容器元素 */
export interface CanvasContainerElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.CONTAINER;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布按钮元素 */
export interface CanvasButtonElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.BUTTON;
  /** 按钮文本 */
  text: string;
  /** 按钮类型 */
  buttonType: ButtonTypeEnum;
}

/** 画布段落元素 */
export interface CanvasParagraphElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.PARAGRAPH;
  /** 段落文本 */
  text: string;
}

/** 画布图片元素 */
export interface CanvasImageElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.IMAGE;
  /** 图片地址 */
  src: string;
  /** 图片标题 */
  title: string;
}

/** 画布超链接元素 */
export interface CanvasLinkElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.LINK;
  /** 连接地址 */
  href: string;
  /** 链接文本 */
  text: string;
}

/** 画布单行文本框元素 */
export interface CanvasInputElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.INPUT;
  /** 占位提示文本 */
  placeholder: string;
  /** 当前值 */
  value: string;
}

/** 画布多行文本框元素 */
export interface CanvasTextareaElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.TEXTAREA;
  /** 占位提示文本 */
  placeholder: string;
  /** 当前值 */
  value: string;
  /** 行数 */
  rows: number;
}

/** 画布单选框元素 */
export interface CanvasRadioElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.RADIO;
  /** 单选组名称 */
  name: string;
  /** 选项值 */
  value: string;
  /** 是否选中 */
  checked: boolean;
}

/** 画布多选框元素 */
export interface CanvasCheckboxElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.CHECKBOX;
  /** 多选组名称 */
  name: string;
  /** 选项值 */
  value: string;
  /** 是否选中 */
  checked: boolean;
}

/** 画布视频元素 */
export interface CanvasVideoElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.VIDEO;
  /** 视频地址 */
  src: string;
  /** 是否显示控件 */
  controls: boolean;
}

/** 画布音频元素 */
export interface CanvasAudioElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.AUDIO;
  /** 音频地址 */
  src: string;
  /** 是否显示控件 */
  controls: boolean;
}

/** 画布标签元素 */
export interface CanvasLabelElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.LABEL;
  /** 标签文本 */
  text: string;
  /** 关联的表单元素 id（为空表示未绑定） */
  for: string;
}

/** 画布根元素 */
export interface CanvasRootElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.ROOT;
  /** 子元素列表 */
  children: CanvasInnerElement[];
}

/** 画布内部元素枚举 */
export type CanvasInnerElementTypeEnum = Exclude<CanvasElementTypeEnum, CanvasElementTypeEnum.ROOT>;

/** 画布内部元素 */
export type CanvasInnerElement = CanvasContainerElement | CanvasButtonElement | CanvasParagraphElement | CanvasLinkElement | CanvasImageElement | CanvasInputElement | CanvasTextareaElement | CanvasRadioElement | CanvasCheckboxElement | CanvasVideoElement | CanvasAudioElement | CanvasLabelElement;

/** 画布元素 */
export type CanvasElement = CanvasInnerElement | CanvasRootElement;

/** Layers拖拽落点目标 */
export interface LayersDropTarget {
  /** 拖拽目标落点 */
  position: DropPositionEnum;
  /** 目标父容器 id */
  parentId: string;
  /** 插入索引 */
  index: number;
}

/** 有效调整尺寸方向（排除 UNDEFINED） */
export type ValidResizeDirEnum = Exclude<ResizeDirEnum, ResizeDirEnum.UNDEFINED>;

/** 调整尺寸起始状态 */
export interface ResizeStartState {
  /** 拖拽方向 */
  dir: ResizeDirEnum;
  /** 起始鼠标 X 坐标 */
  startX: number;
  /** 起始鼠标 Y 坐标 */
  startY: number;
  /** 起始宽度（border-box） */
  startWidth: number;
  /** 起始高度（border-box） */
  startHeight: number;
}