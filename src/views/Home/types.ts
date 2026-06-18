/**
 * 样式面板各配置项的类型定义
 */

import type { BackgroundTypeEnum } from '@/constants/home';

/**
 * 文本阴影单项
 */
export interface TextShadowItem {
  /** X 偏移值 */
  x: number;
  /** X 偏移单位 */
  xUnit: string;
  /** Y 偏移值 */
  y: number;
  /** Y 偏移单位 */
  yUnit: string;
  /** 模糊半径 */
  blur: number;
  /** 模糊半径单位 */
  blurUnit: string;
  /** 阴影颜色 */
  color: string;
}

/**
 * 盒阴影单项
 */
export interface BoxShadowItem {
  /** X 偏移值 */
  x: number;
  /** X 偏移单位 */
  xUnit: string;
  /** Y 偏移值 */
  y: number;
  /** Y 偏移单位 */
  yUnit: string;
  /** 模糊半径 */
  blur: number;
  /** 模糊半径单位 */
  blurUnit: string;
  /** 扩展半径 */
  spread: number;
  /** 扩展半径单位 */
  spreadUnit: string;
  /** 阴影颜色 */
  color: string;
  /** 是否为内阴影 */
  inset: boolean;
}

/**
 * 背景层单项
 */
export interface BackgroundItem {
  /** 背景类型 */
  type: BackgroundTypeEnum;
  /** 图片地址（type 为 image 时有效） */
  imageUrl: string;
  /** 背景重复方式 */
  repeat: string;
  /** 背景位置 */
  position: string;
  /** 背景附着方式 */
  attachment: string;
  /** 背景尺寸 */
  size: string;
  /** 背景颜色（type 为 color 时有效） */
  color: string;
  /** 渐变值（type 为 gradient 时有效） */
  gradient: string;
}

/**
 * 常规配置
 */
export interface GeneralConfig {
  /** 浮动 */
  float: string;
  /** 显示方式 */
  display: string;
  /** 定位方式 */
  position: string;
  /** 顶部偏移值 */
  top: string;
  /** 顶部偏移单位 */
  topUnit: string;
  /** 右侧偏移值 */
  right: string;
  /** 右侧偏移单位 */
  rightUnit: string;
  /** 左侧偏移值 */
  left: string;
  /** 左侧偏移单位 */
  leftUnit: string;
  /** 底部偏移值 */
  bottom: string;
  /** 底部偏移单位 */
  bottomUnit: string;
}

/**
 * 尺寸配置
 */
export interface SizeConfig {
  /** 宽度值 */
  width: string;
  /** 宽度单位 */
  widthUnit: string;
  /** 高度值 */
  height: string;
  /** 高度单位 */
  heightUnit: string;
  /** 最大宽度值 */
  maxWidth: string;
  /** 最大宽度单位 */
  maxWidthUnit: string;
  /** 最小高度值 */
  minHeight: string;
  /** 最小高度单位 */
  minHeightUnit: string;
  /** 上外边距 */
  marginTop: number;
  /** 上外边距单位 */
  marginTopUnit: string;
  /** 右外边距 */
  marginRight: number;
  /** 右外边距单位 */
  marginRightUnit: string;
  /** 下外边距 */
  marginBottom: number;
  /** 下外边距单位 */
  marginBottomUnit: string;
  /** 左外边距 */
  marginLeft: number;
  /** 左外边距单位 */
  marginLeftUnit: string;
}

/**
 * 字体配置
 */
export interface FontConfig {
  /** 字体族 */
  fontFamily: string;
  /** 字体大小 */
  fontSize: number;
  /** 字体大小单位 */
  fontSizeUnit: string;
  /** 字体粗细 */
  fontWeight: string;
  /** 字母间距值 */
  letterSpacing: string;
  /** 字母间距单位 */
  letterSpacingUnit: string;
  /** 文字颜色 */
  color: string;
  /** 行高值 */
  lineHeight: string;
  /** 行高单位 */
  lineHeightUnit: string;
  /** 文字对齐方式 */
  textAlign: string;
  /** 文字装饰 */
  textDecoration: string;
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
  borderWidth: number;
  /** 边框宽度单位 */
  borderWidthUnit: string;
  /** 边框样式 */
  borderStyle: string;
  /** 边框颜色 */
  borderColor: string;
  /** 左上圆角 */
  borderRadiusTL: number;
  /** 右上圆角 */
  borderRadiusTR: number;
  /** 左下圆角 */
  borderRadiusBL: number;
  /** 右下圆角 */
  borderRadiusBR: number;
  /** 圆角单位 */
  borderRadiusUnit: string;
  /** 不透明度 */
  opacity: number;
  /** 盒阴影列表 */
  boxShadows: BoxShadowItem[];
}

/**
 * 布局（Flex）配置
 */
export interface FlexConfig {
  /** Flex 容器类型 */
  flexContainer: string;
  /** Flex 父级值 */
  flexParent: number | null;
  /** 主轴方向 */
  flexDirection: string;
  /** 主轴对齐 */
  justifyContent: string;
  /** 交叉轴对齐 */
  alignItems: string;
  /** Flex 子级值 */
  flexChildren: number | null;
  /** 排列顺序 */
  order: number | null;
  /** 放大比例 */
  flexGrow: number;
  /** 缩小比例 */
  flexShrink: number;
  /** 基准尺寸值 */
  flexBasis: string;
  /** 基准尺寸单位 */
  flexBasisUnit: string;
  /** 自身对齐方式 */
  alignSelf: string;
}
