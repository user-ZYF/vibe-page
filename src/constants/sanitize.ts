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

/** 空格分隔多 URL 属性 */
export const SPACE_URL_ATTRIBUTES = new Set(['ping']);

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
 * CSS 字符串字面量：捕获组1为双引号串内容，捕获组2为单引号串内容
 * 匹配示例："a.png"、'x.css'、""、''
 */
export const CSS_QUOTED_STRING_REGEX = /"([^"]*)"|'([^']*)'/g;

/**
 * url() 函数：捕获组1/2/3分别为双引号、单引号、无引号形式的地址
 * 匹配示例：url("a.png")、url('a.png')、url( https://a.com/x.png )、URL(./x)
 */
export const CSS_URL_FUNCTION_REGEX = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]+))\s*\)/gi;

/**
 * CSS 中以字符串形式承载 URL 的 at-rule（@import/@namespace 首个字符串参数为 URL 地址，at-keyword 与字符串间允许零空白）
 * 匹配示例：@import "x.css"、@import"x.css"、@NAMESPACE 'x'
 */
export const CSS_URL_AT_RULE_REGEX = /@(import|namespace)\s*("([^"]*)"|'([^']*)')/gi;

/**
 * CSS 转义解码后不得字面输出、需回写为 6 位 hex 转义的码点（" ' \ <）
 * decodeCssEscapes 的解码结果即净化输出，会被浏览器再次分词，以下字符字面输出会改变语义：
 * - \：与后续字符组成新转义绕过净化（u\5c 72l 若输出为 u\72l，重新分词即 url()）
 * - " '：在字符串内凭空改变字符串边界，合法 CSS 被破坏（content:"a\22 b" → "a"b"）
 * - <：可拼出 </style> 等序列截断样式上下文
 * 6 位 hex 写满自带终止，浏览器解码后与原始转义语义等价，无需终止空格
 */
export const CSS_RE_ESCAPE_CODE_POINTS = new Set([0x22, 0x27, 0x3c, 0x5c]);

/**
 * CSS 中以字符串参数承载 URL 的函数（image-set/src/image 等）
 * 捕获组1为前置边界（^ 或非单词/连字符字符）：防止误匹配 -webkit-image-set 中的 image-set 子串、--src() 自定义函数等更长名字的后缀
 * 捕获组2为函数名：长名写在前仅为先尝更全候选的习惯（JS 正则有回溯，顺序不影响匹配结果）
 * 捕获组3为括号参数：普通字符或一层嵌套括号（如 type("image/png")），两层以上嵌套不匹配
 * 匹配示例：image-set("a.png" 1x)、-webkit-image-set('a.png' 1x type("image/png"))、src("a.png")、image("a.png" #fff)
 */
export const CSS_URL_STRING_FUNCTION_REGEX = /(^|[^\w-])(-webkit-image-set|image-set|image|src)\(((?:[^()]|\([^()]*\))*)\)/gi;

/** on* 事件属性名（匹配示例：onclick、onload、ONERROR；不带 g 标记，供 .test() 使用） */
export const EVENT_ATTR_NAME_REGEX = /^on/i;

/**
 * SVG 动画取值中的危险协议 token（属性值按分号拆分后逐项校验）
 * 匹配示例：javascript:、 vbscript:、data:text/html:；不带 g 标记，供 .test() 使用
 */
export const SVG_DANGEROUS_PROTOCOL_REGEX = /^\s*(javascript|vbscript|data:text\/html)\s*:/i;

/** 空白分隔符（ping 等空格分隔多 URL 属性值的拆分） */
export const SPACE_SEPARATOR_REGEX = /\s+/;

/** 特殊的 SVG 动画取值属性（分号分隔取值中可能夹带 javascript: 等危险协议） */
export const SVG_ANIMATION_VALUE_ATTRIBUTES = new Set(['to', 'from', 'by', 'values']);
