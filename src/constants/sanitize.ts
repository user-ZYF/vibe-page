/** 允许的 dataURL 的 MIME 前缀 */
export const SAFE_DATA_MIME_PREFIXES = ['data:image/', 'data:audio/', 'data:video/', 'data:font/'];

/** URL 类属性（取值需经协议白名单校验） */
export const URL_ATTRIBUTES = new Set([
  'href',
  'src',
  'action',
  'formaction',
  'poster',
  'cite',
  'background',
  'longdesc',
  'xlink:href',
]);

/** 导航类 URL 属性 */
export const NAVIGATION_URL_ATTRIBUTES = new Set(['href', 'action', 'formaction', 'xlink:href']);

/** 多 URL 列表属性 */
export const MULTI_URL_ATTRIBUTES = new Set(['srcset', 'imagesrcset']);

/** 特殊的 SVG 动画取值属性（分号分隔取值中可能夹带 javascript: 等危险协议） */
export const SVG_ANIMATION_VALUE_ATTRIBUTES = new Set(['to', 'from', 'by', 'values']);
