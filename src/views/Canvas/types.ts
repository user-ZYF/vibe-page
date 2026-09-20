/**
 * 样式面板各配置项的类型定义
 */

import { CanvasElementTypeEnum, ELEMENT_TYPE_CONSTRAINTS } from '@/constants/home';
import type { ButtonTypeEnum, DropPositionEnum, FormMethodEnum, HeadingLevelEnum, LinkTargetEnum, TableScopeEnum } from '@/constants/home';
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
  UnitEnum,
  TextAlignEnum,
  TextDecorationEnum,
  ResizeDirEnum,
  StyleRuleTypeEnum,
} from '@/constants/style';

/**
 * 文本阴影单项
 */
export interface TextShadowItem {
  /** X 偏移值 */
  x?: number;
  /** X 偏移单位 */
  xUnit?: UnitEnum;
  /** Y 偏移值 */
  y?: number;
  /** Y 偏移单位 */
  yUnit?: UnitEnum;
  /** 模糊半径 */
  blur?: number;
  /** 模糊半径单位 */
  blurUnit?: UnitEnum;
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
  xUnit?: UnitEnum;
  /** Y 偏移值 */
  y?: number;
  /** Y 偏移单位 */
  yUnit?: UnitEnum;
  /** 模糊半径 */
  blur?: number;
  /** 模糊半径单位 */
  blurUnit?: UnitEnum;
  /** 扩展半径 */
  spread?: number;
  /** 扩展半径单位 */
  spreadUnit?: UnitEnum;
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
  topUnit?: UnitEnum;
  /** 右侧偏移值 */
  right?: string;
  /** 右侧偏移单位 */
  rightUnit?: UnitEnum;
  /** 左侧偏移值 */
  left?: string;
  /** 左侧偏移单位 */
  leftUnit?: UnitEnum;
  /** 底部偏移值 */
  bottom?: string;
  /** 底部偏移单位 */
  bottomUnit?: UnitEnum;
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
  widthUnit?: UnitEnum;
  /** 高度值 */
  height?: string;
  /** 高度单位 */
  heightUnit?: UnitEnum;
  /** 最大宽度值 */
  maxWidth?: string;
  /** 最大宽度单位 */
  maxWidthUnit?: UnitEnum;
  /** 最小宽度值 */
  minWidth?: string;
  /** 最小宽度单位 */
  minWidthUnit?: UnitEnum;
  /** 最大高度值 */
  maxHeight?: string;
  /** 最大高度单位 */
  maxHeightUnit?: UnitEnum;
  /** 最小高度值 */
  minHeight?: string;
  /** 最小高度单位 */
  minHeightUnit?: UnitEnum;
  /** 上外边距 */
  marginTop?: string;
  /** 上外边距单位 */
  marginTopUnit?: UnitEnum;
  /** 右外边距 */
  marginRight?: string;
  /** 右外边距单位 */
  marginRightUnit?: UnitEnum;
  /** 下外边距 */
  marginBottom?: string;
  /** 下外边距单位 */
  marginBottomUnit?: UnitEnum;
  /** 左外边距 */
  marginLeft?: string;
  /** 左外边距单位 */
  marginLeftUnit?: UnitEnum;
  /** 上内边距 */
  paddingTop?: number;
  /** 上内边距单位 */
  paddingTopUnit?: UnitEnum;
  /** 右内边距 */
  paddingRight?: number;
  /** 右内边距单位 */
  paddingRightUnit?: UnitEnum;
  /** 下内边距 */
  paddingBottom?: number;
  /** 下内边距单位 */
  paddingBottomUnit?: UnitEnum;
  /** 左内边距 */
  paddingLeft?: number;
  /** 左内边距单位 */
  paddingLeftUnit?: UnitEnum;
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
  fontSizeUnit?: UnitEnum;
  /** 字体粗细 */
  fontWeight?: FontWeightEnum;
  /** 字体倾斜 */
  fontStyle?: FontStyleEnum;
  /** 字母间距值 */
  letterSpacing?: string;
  /** 字母间距单位 */
  letterSpacingUnit?: UnitEnum;
  /** 文字颜色 */
  color?: string;
  /** 行高值 */
  lineHeight?: string;
  /** 行高单位 */
  lineHeightUnit?: UnitEnum;
  /** 文本缩进值 */
  textIndent?: string;
  /** 文本缩进单位 */
  textIndentUnit?: UnitEnum;
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
  borderWidthUnit?: UnitEnum;
  /** 边框样式 */
  borderStyle?: BorderStyleEnum;
  /** 边框颜色 */
  borderColor?: string;
  /** 左上圆角 */
  borderRadiusTL?: number;
  /** 左上圆角单位 */
  borderRadiusTLUnit?: UnitEnum;
  /** 右上圆角 */
  borderRadiusTR?: number;
  /** 右上圆角单位 */
  borderRadiusTRUnit?: UnitEnum;
  /** 左下圆角 */
  borderRadiusBL?: number;
  /** 左下圆角单位 */
  borderRadiusBLUnit?: UnitEnum;
  /** 右下圆角 */
  borderRadiusBR?: number;
  /** 右下圆角单位 */
  borderRadiusBRUnit?: UnitEnum;
  /** outline 宽度 */
  outlineWidth?: number;
  /** outline 宽度单位 */
  outlineWidthUnit?: UnitEnum;
  /** outline 样式 */
  outlineStyle?: BorderStyleEnum;
  /** outline 颜色 */
  outlineColor?: string;
  /** outline 偏移值 */
  outlineOffset?: number;
  /** outline 偏移单位 */
  outlineOffsetUnit?: UnitEnum;
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
  flexBasisUnit?: UnitEnum;
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


/** 解析后的 CSS 规则描述 */
export interface ParsedCssRule {
  /** 选择器文本（atRuleCssText 规则为空字符串） */
  selector: string;
  /** 
   * 样式声明原始内容键值对（EDITABLE，RAW时使用）
   * @remarks
   * - 只包含展开的 longhand 属性
   * - kebab-case 键名
   * - 包含 !important 标记
   * - 不包含非法样式或样式值的键值对
   */
  style: Record<string, string>;
  /** 完整 at-rule 文本（AT_RULE时使用） */
  atRuleCssText?: string;
}

/**
 * 画布样式规则项，按用户输入顺序排列，type 区分可编辑与透传规则。
 * style 承载全量声明（kebab-case，含 !important），是输出的事实来源；
 * 面板编辑使用选择器级 StyleConfig（getStyleConfig），由同名 EDITABLE 规则的 style 合并派生，
 * 不随规则存储，修改后按属性 diff 写回同名规则集
 */
export interface CanvasStyleRule extends ParsedCssRule {
  /** 规则类型 */
  type: StyleRuleTypeEnum;
}

/** 元素 class 项 */
export interface ElementClass {
  /** class 名称 */
  name: string;
  /** 是否启用（应用到 DOM） */
  enabled: boolean;
}

/** class 引用项（引用该 class 的元素 id 及启用状态） */
export interface ClassRef {
  /** 引用元素的 id */
  id: string;
  /** 该 class 在此元素上是否启用 */
  enabled: boolean;
}

/** 全局 class 列表项（含引用元素信息），供全局 class 管理面板使用 */
export interface ClassListItem {
  /** class 名称 */
  name: string;
  /** 引用该 class 的元素列表 */
  refs: ClassRef[];
}

/** 画布元素通用属性 */
export interface CanvasElementBase {
  /** 元素id */
  id: string;
  /** 元素管理的 class 列表（含启用/禁用状态） */
  classes: ElementClass[];
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
  buttonType?: ButtonTypeEnum;
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
  target?: LinkTargetEnum;
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
  /** 行数（缺省时由浏览器默认） */
  rows?: number;
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
  /** 关联的表单元素 id（缺省表示未绑定） */
  for?: string;
}

/** 画布表单元素 */
export interface CanvasFormElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.FORM;
  /** 提交地址 */
  action: string;
  /** 提交方式 */
  method?: FormMethodEnum;
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
  /** 跨列数（缺省为 1） */
  colspan?: number;
  /** 跨行数（缺省为 1） */
  rowspan?: number;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布表头单元格元素 */
export interface CanvasTableHeaderCellElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.TABLE_HEADER_CELL;
  /** 跨列数（缺省为 1） */
  colspan?: number;
  /** 跨行数（缺省为 1） */
  rowspan?: number;
  /** 表头范围 */
  scope?: TableScopeEnum;
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
  /** 跨列数（缺省为 1） */
  span?: number;
  /** 子元素 */
  children: CanvasInnerElement[];
}

/** 画布表格列元素 */
export interface CanvasTableColElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.TABLE_COL;
  /** 跨列数（缺省为 1） */
  span?: number;
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

/** 画布标题元素 */
export interface CanvasHeadingElement extends CanvasElementBase {
  /** 元素类型 */
  type: CanvasElementTypeEnum.HEADING;
  /** 标题级别（未定义时按一级标题处理） */
  level?: HeadingLevelEnum;
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
export type CanvasInnerElement = CanvasContainerElement | CanvasButtonElement | CanvasParagraphElement | CanvasLinkElement | CanvasImageElement | CanvasInputElement | CanvasTextareaElement | CanvasRadioElement | CanvasCheckboxElement | CanvasVideoElement | CanvasAudioElement | CanvasLabelElement | CanvasFormElement | CanvasSpanElement | CanvasTextElement | CanvasUnorderedListElement | CanvasOrderedListElement | CanvasListItemElement | CanvasTableElement | CanvasTableHeadElement | CanvasTableBodyElement | CanvasTableFootElement | CanvasTableRowElement | CanvasTableDataElement | CanvasTableHeaderCellElement | CanvasTableCaptionElement | CanvasTableColGroupElement | CanvasTableColElement | CanvasHeaderElement | CanvasFooterElement | CanvasArticleElement | CanvasSectionElement | CanvasAsideElement | CanvasHeadingElement;

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
export function isChildTypeAllowed(parent: CanvasElement, childType: CanvasInnerElementTypeEnum): boolean {
  const { directInclude, directExclude, descendantInclude, descendantExclude } = ELEMENT_TYPE_CONSTRAINTS[parent.type] ?? {};
  if (directInclude && directInclude.length > 0 && !directInclude.includes(childType)) return false;
  if (directExclude && directExclude.length > 0 && directExclude.includes(childType)) return false;
  if (descendantInclude && descendantInclude.length > 0 && !descendantInclude.includes(childType)) return false;
  if (descendantExclude && descendantExclude.length > 0 && descendantExclude.includes(childType)) return false;
  return true;
}

/**
 * 判断拖拽元素及其所有后代是否均允许作为指定父元素的子元素
 *
 * 校验规则基于父元素类型对应的固定结构约束（ELEMENT_TYPE_CONSTRAINTS），按作用范围分为两组：
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
export function isSubtreeAllowed(parent: CanvasElement, child: CanvasInnerElement): boolean {
  const { directInclude, directExclude, descendantInclude, descendantExclude } = ELEMENT_TYPE_CONSTRAINTS[parent.type] ?? {};
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
function isDescendantAllowed(parent: CanvasElement, descendant: CanvasInnerElement): boolean {
  const { descendantInclude, descendantExclude } = ELEMENT_TYPE_CONSTRAINTS[parent.type] ?? {};
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

/** LocalStorage 中持久化的画布数据结构 */
export interface CanvasStorageData {
  /** 数据结构版本号，与 CANVAS_DATA_VERSION 不匹配时数据作废 */
  version?: number;
  /** 画布元素列表 */
  children: CanvasInnerElement[];
  /** 样式规则清单 */
  styleRules?: CanvasStyleRule[];
}

/** 层级树节点数据（LayersPanel 使用） */
export interface LayerTreeNodeData {
  /** 元素id */
  id: string;
  /** 元素类型 */
  type: CanvasElementTypeEnum;
  /** 元素别名 */
  alias?: string;
  /** 标题级别（仅标题元素） */
  level?: HeadingLevelEnum;
  /** 子节点 */
  children: LayerTreeNodeData[];
}
