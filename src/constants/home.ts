import type { CanvasElement, TagConstraints } from '@/views/Canvas/types';

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
  /** 全局 class 管理 */
  CLASS_MANAGER,
}

/** 画布元素类型 */
export enum CanvasElementTypeEnum {
  /** div 容器 */
  DIV,
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
  /** 行内容器 */
  SPAN,
  /** 纯文本 */
  TEXT,
  /** 无序列表 */
  UNORDERED_LIST,
  /** 有序列表 */
  ORDERED_LIST,
  /** 列表项 */
  LIST_ITEM,
  /** 表格 */
  TABLE,
  /** 表头 */
  TABLE_HEAD,
  /** 表体 */
  TABLE_BODY,
  /** 表脚 */
  TABLE_FOOT,
  /** 表格行 */
  TABLE_ROW,
  /** 表格单元格 */
  TABLE_DATA,
  /** 表头单元格 */
  TABLE_HEADER_CELL,
  /** 表格标题 */
  TABLE_CAPTION,
  /** 表格列组 */
  TABLE_COL_GROUP,
  /** 表格列 */
  TABLE_COL,
  /** 页头 */
  HEADER,
  /** 页脚 */
  FOOTER,
  /** 文章 */
  ARTICLE,
  /** 章节 */
  SECTION,
  /** 侧边栏 */
  ASIDE,
  /** 标题 */
  HEADING,
  /** 通用元素（未在组件定义范围内的任意 HTML 标签） */
  GENERAL,
}

/** 画布元素label */
export const CanvasElementLabelMap: Record<CanvasElementTypeEnum, string> = {
  [CanvasElementTypeEnum.DIV]: "div",
  [CanvasElementTypeEnum.LINK]: "link",
  [CanvasElementTypeEnum.IMAGE]: "image",
  [CanvasElementTypeEnum.BUTTON]: "button",
  [CanvasElementTypeEnum.PARAGRAPH]: "paragraph",
  [CanvasElementTypeEnum.ROOT]: "root",
  [CanvasElementTypeEnum.INPUT]: "input",
  [CanvasElementTypeEnum.TEXTAREA]: "textarea",
  [CanvasElementTypeEnum.RADIO]: "radio",
  [CanvasElementTypeEnum.CHECKBOX]: "checkbox",
  [CanvasElementTypeEnum.VIDEO]: "video",
  [CanvasElementTypeEnum.AUDIO]: "audio",
  [CanvasElementTypeEnum.LABEL]: "label",
  [CanvasElementTypeEnum.FORM]: "form",
  [CanvasElementTypeEnum.SPAN]: "span",
  [CanvasElementTypeEnum.TEXT]: "text",
  [CanvasElementTypeEnum.UNORDERED_LIST]: "ul",
  [CanvasElementTypeEnum.ORDERED_LIST]: "ol",
  [CanvasElementTypeEnum.LIST_ITEM]: "li",
  [CanvasElementTypeEnum.TABLE]: "table",
  [CanvasElementTypeEnum.TABLE_HEAD]: "thead",
  [CanvasElementTypeEnum.TABLE_BODY]: "tbody",
  [CanvasElementTypeEnum.TABLE_FOOT]: "tfoot",
  [CanvasElementTypeEnum.TABLE_ROW]: "tr",
  [CanvasElementTypeEnum.TABLE_DATA]: "td",
  [CanvasElementTypeEnum.TABLE_HEADER_CELL]: "th",
  [CanvasElementTypeEnum.TABLE_CAPTION]: "caption",
  [CanvasElementTypeEnum.TABLE_COL_GROUP]: "colgroup",
  [CanvasElementTypeEnum.TABLE_COL]: "col",
  [CanvasElementTypeEnum.HEADER]: "header",
  [CanvasElementTypeEnum.FOOTER]: "footer",
  [CanvasElementTypeEnum.ARTICLE]: "article",
  [CanvasElementTypeEnum.SECTION]: "section",
  [CanvasElementTypeEnum.ASIDE]: "aside",
  [CanvasElementTypeEnum.HEADING]: "heading",
  [CanvasElementTypeEnum.GENERAL]: "general",
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

/** 文本节点伪标签 */
export const TEXT_NODE_TAG = '#text';

/** 元素类型到 HTML 标签的映射 */
export const ELEMENT_TYPE_TAG_MAP: Record<CanvasElementTypeEnum, string> = {
  [CanvasElementTypeEnum.DIV]: 'div',
  [CanvasElementTypeEnum.BUTTON]: 'button',
  [CanvasElementTypeEnum.PARAGRAPH]: 'p',
  [CanvasElementTypeEnum.IMAGE]: 'img',
  [CanvasElementTypeEnum.LINK]: 'a',
  [CanvasElementTypeEnum.ROOT]: 'body',
  [CanvasElementTypeEnum.INPUT]: 'input',
  [CanvasElementTypeEnum.TEXTAREA]: 'textarea',
  [CanvasElementTypeEnum.RADIO]: 'input',
  [CanvasElementTypeEnum.CHECKBOX]: 'input',
  [CanvasElementTypeEnum.VIDEO]: 'video',
  [CanvasElementTypeEnum.AUDIO]: 'audio',
  [CanvasElementTypeEnum.LABEL]: 'label',
  [CanvasElementTypeEnum.FORM]: 'form',
  [CanvasElementTypeEnum.SPAN]: 'span',
  [CanvasElementTypeEnum.TEXT]: '',
  [CanvasElementTypeEnum.UNORDERED_LIST]: 'ul',
  [CanvasElementTypeEnum.ORDERED_LIST]: 'ol',
  [CanvasElementTypeEnum.LIST_ITEM]: 'li',
  [CanvasElementTypeEnum.TABLE]: 'table',
  [CanvasElementTypeEnum.TABLE_HEAD]: 'thead',
  [CanvasElementTypeEnum.TABLE_BODY]: 'tbody',
  [CanvasElementTypeEnum.TABLE_FOOT]: 'tfoot',
  [CanvasElementTypeEnum.TABLE_ROW]: 'tr',
  [CanvasElementTypeEnum.TABLE_DATA]: 'td',
  [CanvasElementTypeEnum.TABLE_HEADER_CELL]: 'th',
  [CanvasElementTypeEnum.TABLE_CAPTION]: 'caption',
  [CanvasElementTypeEnum.TABLE_COL_GROUP]: 'colgroup',
  [CanvasElementTypeEnum.TABLE_COL]: 'col',
  [CanvasElementTypeEnum.HEADER]: 'header',
  [CanvasElementTypeEnum.FOOTER]: 'footer',
  [CanvasElementTypeEnum.ARTICLE]: 'article',
  [CanvasElementTypeEnum.SECTION]: 'section',
  [CanvasElementTypeEnum.ASIDE]: 'aside',
  [CanvasElementTypeEnum.HEADING]: 'h1',
  [CanvasElementTypeEnum.GENERAL]: '',
};

/** phrasing content 标签名集合（HTML 规范行内内容，'#text' 表示文本节点） */
export const PHRASING_CONTENT_TAGS: readonly string[] = [
  TEXT_NODE_TAG,
  'a', 'abbr', 'audio', 'b', 'bdi', 'bdo', 'br', 'button', 'canvas', 'cite', 'code', 'data',
  'datalist', 'del', 'dfn', 'em', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'map', 'mark',
  'math', 'meter', 'noscript', 'output', 'picture', 'progress', 'q', 'ruby', 's', 'samp',
  'select', 'slot', 'small', 'span', 'strong', 'sub', 'sup', 'svg', 'template', 'textarea',
  'time', 'u', 'var', 'video', 'wbr',
];

/** a 元素内不允许出现的后代标签（交互式内容 + 媒体元素） */
const LINK_DESCENDANT_EXCLUDE_TAGS: readonly string[] = [
  'a', 'audio', 'button', 'details', 'embed', 'iframe', 'input', 'label', 'object', 'select', 'textarea', 'video',
];

/** header/footer 元素内不允许出现的后代标签 */
const HEADER_FOOTER_DESCENDANT_EXCLUDE_TAGS: readonly string[] = ['header', 'footer'];

/** 标题标签名（用于约束白名单匹配及 h1~h6 类型级校验） */
export const HEADING_TAGS: readonly string[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

/** 仅允许文本子节点的约束（白名单仅含 '#text'，等价于禁止任何元素子节点） */
const TEXT_ONLY_CONSTRAINTS: TagConstraints = { directIncludeTags: [TEXT_NODE_TAG] };

/** 分节内容标签名集合（address/dt 等元素不允许的后代） */
const SECTIONING_TAGS: readonly string[] = ['article', 'aside', 'nav', 'section'];

/** address/dt 元素内不允许出现的标签（标题内容 + 分节内容 + header/footer） */
const ADDRESS_DT_DESCENDANT_EXCLUDE_TAGS: readonly string[] = [
  ...HEADING_TAGS, 'hgroup', ...SECTIONING_TAGS, 'header', 'footer',
];

/**
 * 元素结构约束（按 HTML 标签名索引）
 */
export const TAG_CONSTRAINTS: Readonly<Record<string, TagConstraints>> = {
  /** 直接子元素结构约束 */
  colgroup: { directIncludeTags: ['col'] },
  datalist: { directIncludeTags: ['option', ...PHRASING_CONTENT_TAGS] },
  dl: { directIncludeTags: ['dt', 'dd', 'div', 'template'] },
  ol: { directIncludeTags: ['li'] },
  optgroup: { directIncludeTags: ['option', 'template'] },
  option: TEXT_ONLY_CONSTRAINTS,
  picture: { directIncludeTags: ['source', 'img', 'template'] },
  select: { directIncludeTags: ['option', 'optgroup', 'hr', 'template'] },
  table: { directIncludeTags: ['caption', 'colgroup', 'tbody', 'tfoot', 'thead', 'tr'] },
  tbody: { directIncludeTags: ['tr'] },
  tfoot: { directIncludeTags: ['tr'] },
  thead: { directIncludeTags: ['tr'] },
  tr: { directIncludeTags: ['td', 'th'] },
  ul: { directIncludeTags: ['li'] },

  /** 后代元素结构约束 */
  a: { descendantExcludeTags: LINK_DESCENDANT_EXCLUDE_TAGS },
  address: { descendantExcludeTags: ADDRESS_DT_DESCENDANT_EXCLUDE_TAGS },
  caption: { descendantExcludeTags: ['table'] },
  dt: { descendantExcludeTags: ADDRESS_DT_DESCENDANT_EXCLUDE_TAGS },
  footer: { descendantExcludeTags: HEADER_FOOTER_DESCENDANT_EXCLUDE_TAGS },
  form: { descendantExcludeTags: ['form'] },
  header: { descendantExcludeTags: HEADER_FOOTER_DESCENDANT_EXCLUDE_TAGS },
  hgroup: { descendantIncludeTags: [...HEADING_TAGS, 'p', TEXT_NODE_TAG] },
  legend: { descendantIncludeTags: [...PHRASING_CONTENT_TAGS, ...HEADING_TAGS] },
  meter: { descendantIncludeTags: PHRASING_CONTENT_TAGS, descendantExcludeTags: ['meter'] },
  progress: { descendantIncludeTags: PHRASING_CONTENT_TAGS, descendantExcludeTags: ['progress'] },
  ruby: { descendantIncludeTags: [...PHRASING_CONTENT_TAGS, 'rt', 'rp'] },
  span: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  summary: { descendantIncludeTags: [...PHRASING_CONTENT_TAGS, ...HEADING_TAGS] },

  /** 仅允许 phrasing content 后代的行内标签 */
  abbr: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  b: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  bdi: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  bdo: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  cite: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  code: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  data: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  dfn: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  em: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  i: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  kbd: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  mark: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  output: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  q: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  rp: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  rt: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  s: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  samp: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  small: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  strong: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  sub: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  sup: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  time: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  u: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
  var: { descendantIncludeTags: PHRASING_CONTENT_TAGS },
};

/** 表头单元格 scope 属性枚举 */
export enum TableScopeEnum {
  /** 行 */
  ROW = 1,
  /** 列 */
  COL = 2,
  /** 行组 */
  ROWGROUP = 3,
  /** 列组 */
  COLGROUP = 4,
}

/** 表头单元格 scope 属性值到 HTML 属性值的映射 */
export const TABLE_SCOPE_ATTR_MAP: Record<TableScopeEnum, string> = {
  [TableScopeEnum.ROW]: 'row',
  [TableScopeEnum.COL]: 'col',
  [TableScopeEnum.ROWGROUP]: 'rowgroup',
  [TableScopeEnum.COLGROUP]: 'colgroup',
};

/** 表头单元格 scope 属性选项 */
export const TABLE_SCOPE_OPTIONS = [
  { label: 'row', value: TableScopeEnum.ROW },
  { label: 'col', value: TableScopeEnum.COL },
  { label: 'rowgroup', value: TableScopeEnum.ROWGROUP },
  { label: 'colgroup', value: TableScopeEnum.COLGROUP },
];

/** 标题级别枚举 */
export enum HeadingLevelEnum {
  /** 未定义 */
  UNDEFINED = 0,
  /** 一级标题 */
  H1 = 1,
  /** 二级标题 */
  H2 = 2,
  /** 三级标题 */
  H3 = 3,
  /** 四级标题 */
  H4 = 4,
  /** 五级标题 */
  H5 = 5,
  /** 六级标题 */
  H6 = 6,
}

/** 标题级别选项 */
export const HEADING_LEVEL_OPTIONS = [
  { label: 'h1', value: HeadingLevelEnum.H1 },
  { label: 'h2', value: HeadingLevelEnum.H2 },
  { label: 'h3', value: HeadingLevelEnum.H3 },
  { label: 'h4', value: HeadingLevelEnum.H4 },
  { label: 'h5', value: HeadingLevelEnum.H5 },
  { label: 'h6', value: HeadingLevelEnum.H6 },
];

/**
 * 获取元素显示名称
 */
export function getElementDisplayName(el: CanvasElement): string {
  if (el.alias) return el.alias;
  if (el.type === CanvasElementTypeEnum.HEADING) {
    return `h${el.level}`;
  }
  if (el.type === CanvasElementTypeEnum.GENERAL && el.tagName) {
    return el.tagName;
  }
  return CanvasElementLabelMap[el.type];
}
