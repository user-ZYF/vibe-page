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
  /** 一级标题 */
  HEADING_1,
  /** 二级标题 */
  HEADING_2,
  /** 三级标题 */
  HEADING_3,
  /** 四级标题 */
  HEADING_4,
  /** 五级标题 */
  HEADING_5,
  /** 六级标题 */
  HEADING_6,
}

/** 画布元素label */
export const CanvasElementLabelMap: Record<CanvasElementTypeEnum, string> = {
  [CanvasElementTypeEnum.CONTAINER]: "container",
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
  [CanvasElementTypeEnum.HEADING_1]: "h1",
  [CanvasElementTypeEnum.HEADING_2]: "h2",
  [CanvasElementTypeEnum.HEADING_3]: "h3",
  [CanvasElementTypeEnum.HEADING_4]: "h4",
  [CanvasElementTypeEnum.HEADING_5]: "h5",
  [CanvasElementTypeEnum.HEADING_6]: "h6",
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
 * a元素不允许嵌套的后代元素类型集合
 * 根据 HTML 规范，a 元素（带 href）的内容模型为透明模型，
 * 但不得包含交互式内容（interactive content）后代
 */
export const LINK_DESCENDANT_EXCLUDE_TYPES: Exclude<CanvasElementTypeEnum, CanvasElementTypeEnum.ROOT>[] = [
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
 * form元素不允许嵌套的后代元素类型集合
 * 根据 HTML 规范，form 元素不得包含另一个 form 元素
 */
export const FORM_DESCENDANT_EXCLUDE_TYPES: Exclude<CanvasElementTypeEnum, CanvasElementTypeEnum.ROOT>[] = [
  CanvasElementTypeEnum.FORM,
];

/**
 * ul元素允许的直接子元素类型集合
 * 根据 HTML 规范，ul 元素仅允许包含 li 作为直接子元素
 */
export const UL_DIRECT_INCLUDE_TYPES: Exclude<CanvasElementTypeEnum, CanvasElementTypeEnum.ROOT>[] = [
  CanvasElementTypeEnum.LIST_ITEM,
];

/**
 * ol元素允许的直接子元素类型集合
 * 根据 HTML 规范，ol 元素仅允许包含 li 作为直接子元素
 */
export const OL_DIRECT_INCLUDE_TYPES: Exclude<CanvasElementTypeEnum, CanvasElementTypeEnum.ROOT>[] = [
  CanvasElementTypeEnum.LIST_ITEM,
];

/**
 * span元素允许的后代元素类型集合
 * 根据 HTML 规范，span 元素的内容模型为 phrasing content，
 * 所有后代必须是 phrasing content 类型
 */
export const SPAN_DESCENDANT_INCLUDE_TYPES: Exclude<CanvasElementTypeEnum, CanvasElementTypeEnum.ROOT>[] = [
  CanvasElementTypeEnum.LINK,
  CanvasElementTypeEnum.IMAGE,
  CanvasElementTypeEnum.BUTTON,
  CanvasElementTypeEnum.INPUT,
  CanvasElementTypeEnum.TEXTAREA,
  CanvasElementTypeEnum.RADIO,
  CanvasElementTypeEnum.CHECKBOX,
  CanvasElementTypeEnum.VIDEO,
  CanvasElementTypeEnum.AUDIO,
  CanvasElementTypeEnum.LABEL,
  CanvasElementTypeEnum.SPAN,
  CanvasElementTypeEnum.TEXT,
];

/**
 * table元素允许的直接子元素类型集合
 * 根据 HTML 规范，table 元素允许包含 caption、colgroup、thead、tbody、tfoot、tr 作为直接子元素
 */
export const TABLE_DIRECT_INCLUDE_TYPES: Exclude<CanvasElementTypeEnum, CanvasElementTypeEnum.ROOT>[] = [
  CanvasElementTypeEnum.TABLE_CAPTION,
  CanvasElementTypeEnum.TABLE_COL_GROUP,
  CanvasElementTypeEnum.TABLE_HEAD,
  CanvasElementTypeEnum.TABLE_BODY,
  CanvasElementTypeEnum.TABLE_FOOT,
  CanvasElementTypeEnum.TABLE_ROW,
];

/**
 * thead元素允许的直接子元素类型集合
 * 根据 HTML 规范，thead 元素仅允许包含 tr 作为直接子元素
 */
export const THEAD_DIRECT_INCLUDE_TYPES: Exclude<CanvasElementTypeEnum, CanvasElementTypeEnum.ROOT>[] = [
  CanvasElementTypeEnum.TABLE_ROW,
];

/**
 * tbody元素允许的直接子元素类型集合
 * 根据 HTML 规范，tbody 元素仅允许包含 tr 作为直接子元素
 */
export const TBODY_DIRECT_INCLUDE_TYPES: Exclude<CanvasElementTypeEnum, CanvasElementTypeEnum.ROOT>[] = [
  CanvasElementTypeEnum.TABLE_ROW,
];

/**
 * tfoot元素允许的直接子元素类型集合
 * 根据 HTML 规范，tfoot 元素仅允许包含 tr 作为直接子元素
 */
export const TFOOT_DIRECT_INCLUDE_TYPES: Exclude<CanvasElementTypeEnum, CanvasElementTypeEnum.ROOT>[] = [
  CanvasElementTypeEnum.TABLE_ROW,
];

/**
 * tr元素允许的直接子元素类型集合
 * 根据 HTML 规范，tr 元素允许包含 td 和 th 作为直接子元素
 */
export const TR_DIRECT_INCLUDE_TYPES: Exclude<CanvasElementTypeEnum, CanvasElementTypeEnum.ROOT>[] = [
  CanvasElementTypeEnum.TABLE_DATA,
  CanvasElementTypeEnum.TABLE_HEADER_CELL,
];

/**
 * colgroup元素允许的直接子元素类型集合
 * 根据 HTML 规范，colgroup 元素仅允许包含 col 作为直接子元素
 */
export const COLGROUP_DIRECT_INCLUDE_TYPES: Exclude<CanvasElementTypeEnum, CanvasElementTypeEnum.ROOT>[] = [
  CanvasElementTypeEnum.TABLE_COL,
];

/** 表头单元格 scope 属性枚举 */
export enum TableScopeEnum {
  /** 未定义 */
  UNDEFINED = 0,
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
  [TableScopeEnum.UNDEFINED]: '',
  [TableScopeEnum.ROW]: 'row',
  [TableScopeEnum.COL]: 'col',
  [TableScopeEnum.ROWGROUP]: 'rowgroup',
  [TableScopeEnum.COLGROUP]: 'colgroup',
};

/** 表头单元格 scope 属性选项 */
export const TABLE_SCOPE_OPTIONS = [
  { label: '未设置', value: TableScopeEnum.UNDEFINED },
  { label: 'row', value: TableScopeEnum.ROW },
  { label: 'col', value: TableScopeEnum.COL },
  { label: 'rowgroup', value: TableScopeEnum.ROWGROUP },
  { label: 'colgroup', value: TableScopeEnum.COLGROUP },
];
