/**
 * HTML 标签与属性常量
 * 供 HTML 解析器、代码解析/生成器、画布渲染与预览渲染共用
 */
import { CanvasElementTypeEnum, LinkTargetEnum, TableScopeEnum } from './home';

/** 自闭合元素 */
export const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

/** 
 * 危险标签（可执行脚本或加载外部资源/改变页面行为，解析阶段整棵子树丢弃，不进入画布） */
export const BLOCKED_TAGS = new Set([
  'script',
  'iframe',
  'object',
  'embed',
  'applet',
  'frame',
  'frameset',
  'meta',
  'link',
  'base',
]);

/** 原始文本元素集合 */
export const RAW_TEXT_ELEMENTS = new Set([
  'script',
  'style',
  'xmp',
  'iframe',
  'noembed',
  'noframes',
  'plaintext',
]);

/** 通用元素兜底标签名（tagName 缺失或非法时使用，也是新建通用元素的默认标签） */
export const GENERAL_FALLBACK_TAG_NAME = 'div';

/** HTML 标签名合法性校验正则（须以字母开头，仅包含字母、数字和短横线） */
export const TAG_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9-]*$/;

/** HTML 属性名合法性校验正则（不允许空白、引号、斜杠、等号、大于号与控制字符） */
export const ATTR_NAME_REGEX = /^[^\s"'/>=\x00-\x1f]+$/;

/**
 * 画布托管属性（渲染通用元素时不透传，统一按小写匹配）
 * id/class/style 由画布字段接管；draggable/contenteditable 由画布交互接管；
 * ref/key 为 Vue 保留属性（透传会覆盖模板 ref/影响 vnode diff）；
 * innerhtml/outerhtml/textcontent 为可注入任意内容的 DOM 属性（防脏数据经 v-bind 属性赋值注入）
 */
export const CANVAS_MANAGED_ATTRIBUTES = new Set([
  'id',
  'class',
  'style',
  'draggable',
  'contenteditable',
  'ref',
  'key',
  'innerhtml',
  'outerhtml',
  'textcontent',
]);

/** 标签名到画布元素类型映射（input 类元素特殊处理，需要根据 type 属性判定） */
export const TAG_TO_TYPE: Record<string, CanvasElementTypeEnum> = {
  div: CanvasElementTypeEnum.DIV,
  button: CanvasElementTypeEnum.BUTTON,
  p: CanvasElementTypeEnum.PARAGRAPH,
  img: CanvasElementTypeEnum.IMAGE,
  a: CanvasElementTypeEnum.LINK,
  textarea: CanvasElementTypeEnum.TEXTAREA,
  video: CanvasElementTypeEnum.VIDEO,
  audio: CanvasElementTypeEnum.AUDIO,
  label: CanvasElementTypeEnum.LABEL,
  form: CanvasElementTypeEnum.FORM,
  span: CanvasElementTypeEnum.SPAN,
  ul: CanvasElementTypeEnum.UNORDERED_LIST,
  ol: CanvasElementTypeEnum.ORDERED_LIST,
  li: CanvasElementTypeEnum.LIST_ITEM,
  table: CanvasElementTypeEnum.TABLE,
  thead: CanvasElementTypeEnum.TABLE_HEAD,
  tbody: CanvasElementTypeEnum.TABLE_BODY,
  tfoot: CanvasElementTypeEnum.TABLE_FOOT,
  tr: CanvasElementTypeEnum.TABLE_ROW,
  td: CanvasElementTypeEnum.TABLE_DATA,
  th: CanvasElementTypeEnum.TABLE_HEADER_CELL,
  caption: CanvasElementTypeEnum.TABLE_CAPTION,
  colgroup: CanvasElementTypeEnum.TABLE_COL_GROUP,
  col: CanvasElementTypeEnum.TABLE_COL,
  header: CanvasElementTypeEnum.HEADER,
  footer: CanvasElementTypeEnum.FOOTER,
  article: CanvasElementTypeEnum.ARTICLE,
  section: CanvasElementTypeEnum.SECTION,
  aside: CanvasElementTypeEnum.ASIDE,
  h1: CanvasElementTypeEnum.HEADING,
  h2: CanvasElementTypeEnum.HEADING,
  h3: CanvasElementTypeEnum.HEADING,
  h4: CanvasElementTypeEnum.HEADING,
  h5: CanvasElementTypeEnum.HEADING,
  h6: CanvasElementTypeEnum.HEADING
}

/** 超链接 target 属性值到枚举的映射 */
export const LINK_TARGET_ATTR_MAP: Record<string, LinkTargetEnum> = {
  _self: LinkTargetEnum.SELF,
  _blank: LinkTargetEnum.BLANK
}

/** 表头单元格 scope 属性值到枚举的反向映射 */
export const SCOPE_ATTR_MAP: Record<string, TableScopeEnum> = {
  row: TableScopeEnum.ROW,
  col: TableScopeEnum.COL,
  rowgroup: TableScopeEnum.ROWGROUP,
  colgroup: TableScopeEnum.COLGROUP,
}
