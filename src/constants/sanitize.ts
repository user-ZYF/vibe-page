/** 允许的 dataURL 的 MIME 前缀 */
export const SAFE_DATA_MIME_PREFIXES = ['data:image/', 'data:audio/', 'data:video/', 'data:font/'];

/** URL 协议白名单（dataURL单独处理，不在白名单范围中） */
export const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

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
  'xml:base',
]);

/** 导航类 URL 属性 */
export const NAVIGATION_URL_ATTRIBUTES = new Set(['href', 'action', 'formaction', 'xlink:href']);

/** 多 URL 列表属性 */
export const MULTI_URL_ATTRIBUTES = new Set(['srcset', 'imagesrcset']);

/** 空格分隔多 URL 属性 */
export const SPACE_URL_ATTRIBUTES = new Set(['ping']);

/** 取值为 CSS 值的表现属性（SVG 表现属性值可含 url()，按 style 属性同策略净化值内地址） */
export const CSS_URL_VALUE_ATTRIBUTES = new Set([
  'fill',
  'stroke',
  'filter',
  'clip-path',
  'mask',
  'marker',
  'marker-start',
  'marker-mid',
  'marker-end',
  'cursor',
]);

/**
 * CSS 转义序列（decodeCssEscapes 解码用，两个分支匹配不同转义形式）
 * - 捕获组1：十六进制转义，形如 \72、\3a、\00005C（反斜杠 + 1~6 位 hex，末尾可跟一个 CSS 空白终止符，\r\n 整体计为一个）
 * - 捕获组2：简单转义或续行符，形如 \*、\.、\换行（反斜杠 + 任意单个字符）
 * 终止符仅取 CSS 空白字符（空格/\t/\n/\f/\r），\s 会误消费 \u00a0 等浏览器不认作终止符的字符导致分词偏差
 * 匹配示例：输入 "u\72l(javascript\3a x)" 会命中 \72 与 \3a 两处转义
 * （\72 → r、\3a → :，冒号转义后的空格作为终止符被一并消费，解码后即 url(javascript:x)）
 */
export const CSS_ESCAPE_REGEX = /\\([0-9a-fA-F]{1,6})(?:\r\n|[ \t\n\f\r])?|\\(\r\n|[\s\S])/g;

/**
 * 已闭合的 CSS 注释（未闭合注释由扫描逻辑单独处理，不经此正则）
 * 匹配示例：斜杠星 … 星斜杠 形式的成对块注释（中间可为任意含换行内容）
 */
export const CSS_COMMENT_REGEX = /\/\*[\s\S]*?\*\//g;

/**
 * url() 函数：捕获组1/2/3分别为双引号、单引号、无引号形式的地址
 * 匹配示例：url("a.png")、url('a.png')、url( https://a.com/x.png )、URL(./x)
 */
export const CSS_URL_FUNCTION_REGEX = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]+))\s*\)/gi;

/**
 * CSS 转义解码后不得字面输出、需回写为 6 位 hex 转义的码点（" ' \ <）
 * decodeCssEscapes 的解码结果即净化输出，会被浏览器再次分词，以下字符字面输出会改变语义：
 * - \：与后续字符组成新转义绕过净化（u\5c 72l 若输出为 u\72l，重新分词即 url()）
 * - " '：在字符串内凭空改变字符串边界，合法 CSS 被破坏（content:"a\22 b" → "a"b"）
 * - <：可拼出 </style> 等序列截断样式上下文
 * 6 位 hex 写满自带终止，浏览器解码后与原始转义语义等价，无需终止空格
 */
export const CSS_RE_ESCAPE_CODE_POINTS = new Set([0x22, 0x27, 0x3c, 0x5c]);

/** on* 事件属性名（匹配示例：onclick、onload、ONERROR；不带 g 标记，供 .test() 使用） */
export const EVENT_ATTR_NAME_REGEX = /^on/i;

/** 顶层导航时可执行脚本的 data: MIME 前缀（SVG 可内嵌 <script>，故单独拦截） */
export const DANGEROUS_DATA_MIME_PREFIX = 'data:image/svg';

/**
 * 渐变背景合法取值（仅允许渐变函数与 var() 引用）
 * url()/image()/image-set()/cross-fade() 可加载外部资源，paint() 执行 Paint Worklet，
 * element() 将指定 DOM 渲染为位图——渐变语义字段一律不放行这些写法
 */
export const GRADIENT_VALUE_REGEX = /^(?:(?:-webkit-)?(?:repeating-)?(?:linear|radial|conic)-gradient|var)\s*\(/i;

/**
 * CSS <image> 取值中会发起请求或执行脚本的函数名
 * 用于非 url() 语义的原始取值兜底校验（如纯色层防止夹带 paint()/element() 等函数）
 */
export const CSS_REQUESTING_FUNCTION_REGEX = /\b(?:url|image|image-set|cross-fade|element|paint)\s*\(/i;

/** 空白分隔符（ping 等空格分隔多 URL 属性值的拆分） */
export const SPACE_SEPARATOR_REGEX = /\s+/;

/** 特殊的 SVG 动画取值属性（分号分隔取值中可能夹带 javascript: 等危险协议） */
export const SVG_ANIMATION_VALUE_ATTRIBUTES = new Set(['to', 'from', 'by', 'values']);

/**
 * 写入 url("...") 的地址中禁止出现的字符（会破坏引号字符串边界或 CSS 分词，且并非合法 URL 字符）
 * 匹配示例：空白、"、'、(、)、<、>、\
 */
export const CSS_URL_ADDRESS_FORBIDDEN_REGEX = /[\s"'()<>\\]/;
