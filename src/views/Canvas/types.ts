/**
 * 样式面板各配置项的类型定义
 */

import { CanvasElementTypeEnum } from '@/constants/home';
import type { ButtonTypeEnum, DropPositionEnum, FormMethodEnum, LinkTargetEnum, TableScopeEnum } from '@/constants/home';
import type {
  BackgroundTypeEnum,
  BackgroundAttachmentEnum,
  FontWeightEnum,
  FontStyleEnum,
  BackgroundPositionEnum,
  BackgroundRepeatEnum,
  BackgroundSizeEnum,
  BorderCollapseEnum,
  BorderStyleEnum,
  DisplayStyleEnum,
  FloatStyleEnum,
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
  /** 表格边框合并方式 */
  borderCollapse?: BorderCollapseEnum;
  /** 层叠顺序 */
  zIndex?: number;
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
  /** 最小宽度值 */
  minWidth?: string;
  /** 最小宽度单位 */
  minWidthUnit?: SizeUnitEnum;
  /** 最大高度值 */
  maxHeight?: string;
  /** 最大高度单位 */
  maxHeightUnit?: SizeUnitEnum;
  /** 最小高度值 */
  minHeight?: string;
  /** 最小高度单位 */
  minHeightUnit?: SizeUnitEnum;
  /** 上外边距 */
  marginTop?: string;
  /** 上外边距单位 */
  marginTopUnit?: SizeUnitEnum;
  /** 右外边距 */
  marginRight?: string;
  /** 右外边距单位 */
  marginRightUnit?: SizeUnitEnum;
  /** 下外边距 */
  marginBottom?: string;
  /** 下外边距单位 */
  marginBottomUnit?: SizeUnitEnum;
  /** 左外边距 */
  marginLeft?: string;
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
  /** 字体倾斜 */
  fontStyle?: FontStyleEnum;
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
  /** 文本缩进值 */
  textIndent?: string;
  /** 文本缩进单位 */
  textIndentUnit?: SizeUnitEnum;
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
 * 弹性盒配置
 */
export interface FlexConfig {
  /** 主轴方向 */
  flexDirection?: FlexDirectionEnum;
  /** 主轴对齐 */
  justifyContent?: JustifyContentEnum;
  /** 交叉轴对齐 */
  alignItems?: AlignItemsEnum;
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
  /** 允许的直接子元素类型列表（仅约束直接子元素，为空或不设置表示不限制） */
  directInclude?: CanvasInnerElementTypeEnum[];
  /** 不允许的直接子元素类型列表（仅约束直接子元素，为空或不设置表示不限制） */
  directExclude?: CanvasInnerElementTypeEnum[];
  /** 允许的后代元素类型列表（约束所有后代含直接子元素，为空或不设置表示不限制） */
  descendantInclude?: CanvasInnerElementTypeEnum[];
  /** 不允许的后代元素类型列表（约束所有后代含直接子元素，为空或不设置表示不限制） */
  descendantExclude?: CanvasInnerElementTypeEnum[];
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
  /** 打开方式 */
  target: LinkTargetEnum;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布单行文本框元素 */
export interface CanvasInputElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.INPUT;
  /** 占位提示文本 */
  placeholder: string;
  /** 当前值 */
  value: string;
  /** 是否必填 */
  required: boolean;
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
  /** 是否必填 */
  required: boolean;
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
  /** 是否必填 */
  required: boolean;
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
  /** 是否必填 */
  required: boolean;
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

/** 画布表单元素 */
export interface CanvasFormElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.FORM;
  /** 提交地址 */
  action: string;
  /** 提交方式 */
  method: FormMethodEnum;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布行内容器元素 */
export interface CanvasSpanElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.SPAN;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布纯文本元素 */
export interface CanvasTextElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.TEXT;
  /** 文本内容 */
  text: string;
}

/** 画布无序列表元素 */
export interface CanvasUnorderedListElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.UNORDERED_LIST;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布有序列表元素 */
export interface CanvasOrderedListElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.ORDERED_LIST;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布列表项元素 */
export interface CanvasListItemElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.LIST_ITEM;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布表格元素 */
export interface CanvasTableElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.TABLE;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布表头元素 */
export interface CanvasTableHeadElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.TABLE_HEAD;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布表体元素 */
export interface CanvasTableBodyElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.TABLE_BODY;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布表脚元素 */
export interface CanvasTableFootElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.TABLE_FOOT;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布表格行元素 */
export interface CanvasTableRowElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.TABLE_ROW;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布表格单元格元素 */
export interface CanvasTableDataElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.TABLE_DATA;
  /** 跨列数 */
  colspan: number;
  /** 跨行数 */
  rowspan: number;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布表头单元格元素 */
export interface CanvasTableHeaderCellElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.TABLE_HEADER_CELL;
  /** 跨列数 */
  colspan: number;
  /** 跨行数 */
  rowspan: number;
  /** 表头范围 */
  scope: TableScopeEnum;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布表格标题元素 */
export interface CanvasTableCaptionElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.TABLE_CAPTION;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布表格列组元素 */
export interface CanvasTableColGroupElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.TABLE_COL_GROUP;
  /** 跨列数 */
  span: number;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布表格列元素 */
export interface CanvasTableColElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.TABLE_COL;
  /** 跨列数 */
  span: number;
}

/** 画布页头元素 */
export interface CanvasHeaderElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.HEADER;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布页脚元素 */
export interface CanvasFooterElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.FOOTER;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布文章元素 */
export interface CanvasArticleElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.ARTICLE;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布章节元素 */
export interface CanvasSectionElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.SECTION;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布侧边栏元素 */
export interface CanvasAsideElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.ASIDE;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布一级标题元素 */
export interface CanvasHeading1Element extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.HEADING_1;
  /** 标题文本 */
  text: string;
}

/** 画布二级标题元素 */
export interface CanvasHeading2Element extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.HEADING_2;
  /** 标题文本 */
  text: string;
}

/** 画布三级标题元素 */
export interface CanvasHeading3Element extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.HEADING_3;
  /** 标题文本 */
  text: string;
}

/** 画布四级标题元素 */
export interface CanvasHeading4Element extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.HEADING_4;
  /** 标题文本 */
  text: string;
}

/** 画布五级标题元素 */
export interface CanvasHeading5Element extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.HEADING_5;
  /** 标题文本 */
  text: string;
}

/** 画布六级标题元素 */
export interface CanvasHeading6Element extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.HEADING_6;
  /** 标题文本 */
  text: string;
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
export type CanvasInnerElement = CanvasContainerElement | CanvasButtonElement | CanvasParagraphElement | CanvasLinkElement | CanvasImageElement | CanvasInputElement | CanvasTextareaElement | CanvasRadioElement | CanvasCheckboxElement | CanvasVideoElement | CanvasAudioElement | CanvasLabelElement | CanvasFormElement | CanvasSpanElement | CanvasTextElement | CanvasUnorderedListElement | CanvasOrderedListElement | CanvasListItemElement | CanvasTableElement | CanvasTableHeadElement | CanvasTableBodyElement | CanvasTableFootElement | CanvasTableRowElement | CanvasTableDataElement | CanvasTableHeaderCellElement | CanvasTableCaptionElement | CanvasTableColGroupElement | CanvasTableColElement | CanvasHeaderElement | CanvasFooterElement | CanvasArticleElement | CanvasSectionElement | CanvasAsideElement | CanvasHeading1Element | CanvasHeading2Element | CanvasHeading3Element | CanvasHeading4Element | CanvasHeading5Element | CanvasHeading6Element;

/** 可包含子元素的画布元素 */
export type CanvasParentElement = CanvasContainerElement | CanvasLinkElement | CanvasFormElement | CanvasSpanElement | CanvasUnorderedListElement | CanvasOrderedListElement | CanvasListItemElement | CanvasTableElement | CanvasTableHeadElement | CanvasTableBodyElement | CanvasTableFootElement | CanvasTableRowElement | CanvasTableDataElement | CanvasTableHeaderCellElement | CanvasTableCaptionElement | CanvasTableColGroupElement | CanvasHeaderElement | CanvasFooterElement | CanvasArticleElement | CanvasSectionElement | CanvasAsideElement;

/** 判断元素是否包含子元素 */
export function isParentElement(el: CanvasInnerElement): el is CanvasParentElement {
  return el.type === CanvasElementTypeEnum.CONTAINER || el.type === CanvasElementTypeEnum.LINK || el.type === CanvasElementTypeEnum.FORM || el.type === CanvasElementTypeEnum.SPAN || el.type === CanvasElementTypeEnum.UNORDERED_LIST || el.type === CanvasElementTypeEnum.ORDERED_LIST || el.type === CanvasElementTypeEnum.LIST_ITEM || el.type === CanvasElementTypeEnum.TABLE || el.type === CanvasElementTypeEnum.TABLE_HEAD || el.type === CanvasElementTypeEnum.TABLE_BODY || el.type === CanvasElementTypeEnum.TABLE_FOOT || el.type === CanvasElementTypeEnum.TABLE_ROW || el.type === CanvasElementTypeEnum.TABLE_DATA || el.type === CanvasElementTypeEnum.TABLE_HEADER_CELL || el.type === CanvasElementTypeEnum.TABLE_CAPTION || el.type === CanvasElementTypeEnum.TABLE_COL_GROUP || el.type === CanvasElementTypeEnum.HEADER || el.type === CanvasElementTypeEnum.FOOTER || el.type === CanvasElementTypeEnum.ARTICLE || el.type === CanvasElementTypeEnum.SECTION || el.type === CanvasElementTypeEnum.ASIDE;
}

/**
 * 判断元素类型是否允许作为指定父元素的直接子元素
 *
 * 仅检查类型本身，不递归检查后代子树。适用于新元素拖入时仅知道类型、不知道子树的场景。
 *
 * 校验时直接子元素同时受两组约束限制，每组约束的 include 与 exclude 组合规则如下：
 * 1. include 不为空且 exclude 为空：只接收 include 中的元素
 * 2. exclude 不为空且 include 为空：只忽略 exclude 中的元素
 * 3. include、exclude 均不为空：只接收存在于 include 且不存在于 exclude 中的元素
 * 4. include、exclude 均为空：接收所有元素
 *
 * 直接子元素约束（`directInclude` / `directExclude`）和后代元素约束（`descendantInclude` / `descendantExclude`）
 * 均适用上述规则，且直接子元素需同时满足两组约束。
 *
 * @param parent 父元素模型数据
 * @param childType 待放入的子元素类型
 */
export function isChildTypeAllowed(parent: CanvasElementBase, childType: CanvasInnerElementTypeEnum): boolean {
  const { directInclude, directExclude, descendantInclude, descendantExclude } = parent;
  if (directInclude && directInclude.length > 0 && !directInclude.includes(childType)) return false;
  if (directExclude && directExclude.length > 0 && directExclude.includes(childType)) return false;
  if (descendantInclude && descendantInclude.length > 0 && !descendantInclude.includes(childType)) return false;
  if (descendantExclude && descendantExclude.length > 0 && descendantExclude.includes(childType)) return false;
  return true;
}

/**
 * 判断拖拽元素及其所有后代是否均允许作为指定父元素的子元素
 *
 * 校验规则基于父元素的四个约束字段，按作用范围分为两组：
 *
 * **直接子元素约束**（仅检查待放入元素本身）：
 * - `directInclude`：白名单，列表不为空时，直接子元素类型必须在列表中
 * - `directExclude`：黑名单，列表不为空时，直接子元素类型不得在列表中
 *
 * **后代元素约束**（检查待放入元素及其所有递归后代，含直接子元素）：
 * - `descendantInclude`：白名单，列表不为空时，所有后代类型必须在列表中
 * - `descendantExclude`：黑名单，列表不为空时，所有后代类型不得在列表中
 *
 * 每组约束的 include 与 exclude 组合规则：
 * 1. include 不为空且 exclude 为空：只接收 include 中的元素
 * 2. exclude 不为空且 include 为空：只忽略 exclude 中的元素
 * 3. include、exclude 均不为空：只接收存在于 include 且不存在于 exclude 中的元素
 * 4. include、exclude 均为空：接收所有元素
 *
 * 校验流程：
 * - 直接子元素：同时检查直接子元素约束和后代元素约束（因为直接子元素也是后代）
 * - 更深层后代：仅检查后代元素约束（通过 isDescendantAllowed 递归）
 * - 仅当存在后代元素约束时才需要递归；仅有直接子元素约束时不递归
 *
 * 典型场景：
 * - `ul`：`directInclude=[li]` → 直接子元素只能是 li，li 内部不限制
 * - `span`：`descendantInclude=[link, image, text, ...]` → 所有后代必须是 phrasing content
 * - `a`：`descendantExclude=[link, button, input, ...]` → 所有后代不允许交互式内容
 * - `form`：`descendantExclude=[form]` → 所有后代不允许嵌套 form
 * @param parent 目标父元素模型数据
 * @param child 待放入的子元素（含其后代子树）
 */
export function isSubtreeAllowed(parent: CanvasElementBase, child: CanvasInnerElement): boolean {
  const { directInclude, directExclude, descendantInclude, descendantExclude } = parent;
  const hasDirectInclude = !!directInclude && directInclude.length > 0;
  const hasDirectExclude = !!directExclude && directExclude.length > 0;
  const hasDescendantInclude = !!descendantInclude && descendantInclude.length > 0;
  const hasDescendantExclude = !!descendantExclude && descendantExclude.length > 0;
  const childType = child.type as CanvasInnerElementTypeEnum;

  /** 检查直接子元素约束 */
  if (hasDirectInclude && !directInclude!.includes(childType)) return false;
  if (hasDirectExclude && directExclude!.includes(childType)) return false;

  /** 检查后代约束（直接子元素也是后代，需要检查） */
  if (hasDescendantInclude && !descendantInclude!.includes(childType)) return false;
  if (hasDescendantExclude && descendantExclude!.includes(childType)) return false;

  /** 若存在后代约束，需要递归检查所有更深层后代 */
  if ((hasDescendantInclude || hasDescendantExclude) && isParentElement(child)) {
    for (const descendant of child.children) {
      if (!isDescendantAllowed(parent, descendant)) return false;
    }
  }

  return true;
}

/**
 * 递归检查后代元素是否满足父元素的后代约束
 *
 * 仅检查 `descendantInclude` 和 `descendantExclude`，不检查直接子元素约束
 * （因为更深层后代不受直接子元素约束的限制）。
 *
 * include 与 exclude 组合规则：
 * 1. include 不为空且 exclude 为空：只接收 include 中的元素
 * 2. exclude 不为空且 include 为空：只忽略 exclude 中的元素
 * 3. include、exclude 均不为空：只接收存在于 include 且不存在于 exclude 中的元素
 * 4. include、exclude 均为空：接收所有元素
 *
 * @param parent 目标父元素模型数据
 * @param descendant 待检查的后代元素
 */
function isDescendantAllowed(parent: CanvasElementBase, descendant: CanvasInnerElement): boolean {
  const { descendantInclude, descendantExclude } = parent;
  const descendantType = descendant.type as CanvasInnerElementTypeEnum;

  if (descendantInclude && descendantInclude.length > 0 && !descendantInclude.includes(descendantType)) return false;
  if (descendantExclude && descendantExclude.length > 0 && descendantExclude.includes(descendantType)) return false;

  if (isParentElement(descendant)) {
    for (const child of descendant.children) {
      if (!isDescendantAllowed(parent, child)) return false;
    }
  }
  return true;
}

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

/** 组件分组配置 */
export interface ComponentGroup {
  /** 分组标识 */
  key: string;
  /** 分组标题 */
  header: string;
  /** 分组内组件列表 */
  components: CanvasInnerElementTypeEnum[];
}