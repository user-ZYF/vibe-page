import {
  SAFE_DATA_MIME_PREFIXES,
  URL_ATTRIBUTES,
  NAVIGATION_URL_ATTRIBUTES,
  MULTI_URL_ATTRIBUTES,
  SPACE_URL_ATTRIBUTES,
  SVG_ANIMATION_VALUE_ATTRIBUTES,
  CSS_ESCAPE_REGEX,
  CSS_COMMENT_REGEX,
  CSS_QUOTED_STRING_REGEX,
  CSS_URL_FUNCTION_REGEX,
  CSS_URL_AT_RULE_REGEX,
  CSS_URL_STRING_FUNCTION_REGEX,
  CSS_RE_ESCAPE_CODE_POINTS,
  EVENT_ATTR_NAME_REGEX,
  SVG_DANGEROUS_PROTOCOL_REGEX,
  SPACE_SEPARATOR_REGEX,
} from '@/constants/sanitize';
import { ATTR_NAME_REGEX } from '@/constants/html';
import { sanitizeUrl as sanitizeUrlString } from '@braintree/sanitize-url';
import { parseSrcset, stringifySrcset } from 'srcset';

/**
 * 判断 URL 是否使用安全协议
 * @example isSafeUrl('https://a.com/x.png') → true
 * @example isSafeUrl('data:image/png;base64,AAAA') → true
 * @example isSafeUrl('javascript:alert(1)') → false
 * @example isSafeUrl('data:text/html,<h1>x</h1>') → false
 */
export function isSafeUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('data:')) {
    return SAFE_DATA_MIME_PREFIXES.some((prefix) => lower.startsWith(prefix));
  }
  if (lower.startsWith('file:')) return false;
  // about:blank 为合法空白页
  if (lower === 'about:blank') return true;
  return sanitizeUrlString(trimmed) !== 'about:blank';
}

/**
 * 净化 URL，不安全时返回空字符串
 * @example sanitizeUrl('  https://a.com/x.png  ') → 'https://a.com/x.png'
 * @example sanitizeUrl('javascript:alert(1)') → ''
 */
export function sanitizeUrl(url: string): string {
  return isSafeUrl(url) ? url.trim() : '';
}

/**
 * 解码 CSS 转义序列（\XXXXXX 十六进制转义、\c 简单转义、反斜杠换行续行）
 * 解码结果为 CSS_RE_ESCAPE_CODE_POINTS 中码点的，回写为定长 6 位十六进制转义：
 * 字面输出引号会破坏字符串边界，反斜杠在输出被重新分词时会与后续字符组成新转义（如 \5c 72 → \72），
 * < 会生成 </style> 等截断样式上下文的序列
 * 简单转义 \"、\'、\\ 保留原样（浏览器解析结果等价，无上述风险）
 * @example decodeCssEscapes('u\\72l(x)') → 'url(x)'
 * @example decodeCssEscapes('u\\5c 72l(x)') → 'u\\00005c72l(x)'（反斜杠回写为定长转义，防二次分词重组）
 * @example decodeCssEscapes('"a\\22b"') → '"a\\000022b"'（引号回写为定长转义，不破坏字符串边界）
 */
function decodeCssEscapes(value: string): string {
  return value.replace(CSS_ESCAPE_REGEX, (raw, hex: string | undefined, ch: string | undefined) => {
    if (hex !== undefined) {
      const cp = parseInt(hex, 16);
      // NULL、越界、代理对码点按规范统一回退为 U+FFFD（fromCodePoint 会输出孤立代理对字符）
      if (cp === 0 || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff)) return String.fromCodePoint(0xfffd);
      if (CSS_RE_ESCAPE_CODE_POINTS.has(cp)) return `\\${cp.toString(16).padStart(6, '0')}`;
      return String.fromCodePoint(cp);
    }
    const c = ch ?? '';
    if (c === '"' || c === "'" || c === '\\') return raw;
    // 反斜杠换行为续行符，直接移除
    if (c === '\r\n' || c === '\n' || c === '\r' || c === '\f') return '';
    return c;
  });
}

/**
 * 剥离已闭合的 CSS 注释（字符串内的注释标记为字面内容，不剥离）
 * 按扫描顺序处理：先出现的结构生效，与浏览器分词规则一致——字符串先开始则注释标记为串内字面内容，注释先开始则其中的引号不构成字符串边界
 * 未闭合注释保留原文：浏览器本就视其到末尾均为注释（无执行风险），
 * 且可避免把无引号 url() 中字面的 /* 误当注释起点而截断合法地址
 * @example stripClosedComments('a/*x*\/b') → 'ab'
 * @example stripClosedComments('"a/*x*\/b"') → '"a/*x*\/b"'（串内注释标记为字面内容）
 * @example stripClosedComments('a/*x') → 'a/*x'（未闭合注释保留原文）
 */
function stripClosedComments(value: string): string {
  let result = '';
  let i = 0;
  while (i < value.length) {
    const c = value[i];
    if (c === '"' || c === "'") {
      // 字符串字面量整体保留（串内 \\ 转义整体跳过，防止转义引号被误判为串结束）
      const start = i++;
      while (i < value.length) {
        if (value[i] === '\\') {
          i += 2;
          continue;
        }
        if (value[i++] === c) break;
      }
      result += value.slice(start, i);
    } else if (c === '/' && value[i + 1] === '*') {
      const end = value.indexOf('*/', i + 2);
      if (end === -1) {
        result += value.slice(i);
        break;
      }
      i = end + 2;
    } else if (c === '\\' && i + 1 < value.length) {
      // 字符串外的转义对（\'、\"、\\）整体保留：\' 是字面字符而非字符串边界，拆开会把转义引号误认作串起点
      result += value.slice(i, i + 2);
      i += 2;
    } else {
      result += c;
      i++;
    }
  }
  return result;
}

/**
 * 扫描字符串字面量与未闭合注释区间（注释优先于字符串，与浏览器分词规则一致）
 * 供 url()/at-rule/函数匹配时跳过字面量内的伪匹配
 * @example scanLiteralRanges('"url(x)" url(y)') → [[0, 9]]（字符串区间）
 * @example scanLiteralRanges('a/*x') → [[1, 4]]（未闭合注释至末尾）
 */
function scanLiteralRanges(value: string): [number, number][] {
  const ranges: [number, number][] = [];
  let i = 0;
  while (i < value.length) {
    const c = value[i];
    if (c === '"' || c === "'") {
      const start = i++;
      while (i < value.length) {
        if (value[i] === '\\') {
          i += 2;
          continue;
        }
        if (value[i++] === c) break;
      }
      ranges.push([start, i]);
    } else if (c === '/' && value[i + 1] === '*') {
      const end = value.indexOf('*/', i + 2);
      if (end === -1) {
        ranges.push([i, value.length]);
        break;
      }
      i = end + 2;
    } else if (c === '\\') {
      // 字符串外的转义对整体跳过：\' 是字面字符，其引号不构成字符串边界
      i += 2;
    } else {
      i++;
    }
  }
  return ranges;
}

/**
 * 剥离 URL 内部的 CSS 注释并去除首尾空白，返回待校验的地址
 * @example extractCssUrl(' a.png ') → 'a.png'
 * @example extractCssUrl('jav/*x*\/ascript:x') → 'javascript:x'
 */
function extractCssUrl(url: string): string {
  return url.replace(CSS_COMMENT_REGEX, '').trim();
}

/**
 * 从 CSS 值中净化所有 URL 引用
 * - 先做归一化（解码 CSS 转义、剥离已闭合注释），防止 u\72l(...)、url 与括号间插注释、javascript\3a x 等写法绕过检测
 * - url(...) 三种引号形式逐个校验协议，不安全替换为空 url()
 * - @import/@namespace 的字符串形式 URL、image-set()/src()/image() 的字符串参数同样按协议校验
 *   （@import 规则整体已在 stripCssImports 中剔除，此处仅兜底防御脏数据）
 * - 匹配起点落在字符串字面量/未闭合注释内的为文本内容，跳过不改写
 * 返回处理后的 CSS 值
 * @example sanitizeCssUrl('url("a.png")') → 'url("a.png")'
 * @example sanitizeCssUrl('url("javascript:x")') → 'url()'
 * @example sanitizeCssUrl('@import "javascript:x"') → '@import ""'
 * @example sanitizeCssUrl('image-set("javascript:x" 1x)') → 'image-set("" 1x)'
 * @example sanitizeCssUrl('content:"url(javascript:x)"') → 'content:"url(javascript:x)"'（字符串内文本不改写）
 */
export function sanitizeCssUrl(cssValue: string): string {
  if (!cssValue) return cssValue;

  let value = stripClosedComments(decodeCssEscapes(cssValue));

  /** 匹配起点是否落在字面量区间（字符串/未闭合注释）内 */
  const isLiteral = (ranges: [number, number][], offset: number) =>
    ranges.some(([start, end]) => offset >= start && offset < end);

  /** 匹配 url("...")、url('...')、url(...) 三种形式，大小写不敏感 */
  let literalRanges = scanLiteralRanges(value);
  value = value.replace(
    CSS_URL_FUNCTION_REGEX,
    (match, dq: string | undefined, sq: string | undefined, bare: string | undefined, offset: number) => {
      if (isLiteral(literalRanges, offset)) return match;
      const url = extractCssUrl(dq ?? sq ?? bare ?? '');
      if (!url || !isSafeUrl(url)) return 'url()';
      /** 重建净化后的 url() 表达式 */
      if (dq !== undefined) return `url("${url}")`;
      if (sq !== undefined) return `url('${url}')`;
      return `url(${url})`;
    },
  );

  /** @import/@namespace 字符串形式 URL 协议校验，不安全替换为空字符串参数（@import 已在 stripCssImports 剔除，此处兜底） */
  literalRanges = scanLiteralRanges(value);
  value = value.replace(
    CSS_URL_AT_RULE_REGEX,
    (match, atName: string, _quoted: string, dq: string | undefined, sq: string | undefined, offset: number) => {
      if (isLiteral(literalRanges, offset)) return match;
      const url = extractCssUrl(dq ?? sq ?? '');
      return url && isSafeUrl(url) ? match : `@${atName} ""`;
    },
  );

  /** image-set()/src()/image() 等函数内的字符串参数按 URL 校验，不安全替换为空字符串 */
  literalRanges = scanLiteralRanges(value);
  value = value.replace(
    CSS_URL_STRING_FUNCTION_REGEX,
    (match, prefix: string, fnName: string, args: string, offset: number) => {
      // prefix 为正则消费的前置字符（或空串），函数名起点才是真实匹配位置
      if (isLiteral(literalRanges, offset + prefix.length)) return match;
      const safeArgs = args.replace(CSS_QUOTED_STRING_REGEX, (token: string, dq: string | undefined, sq: string | undefined) => {
        const url = extractCssUrl(dq ?? sq ?? '');
        return url && isSafeUrl(url) ? token : '""';
      });
      return `${prefix}${fnName}(${safeArgs})`;
    },
  );

  return value;
}

/**
 * 剔除 CSS 文本中的全部 @import 规则（整条丢弃，不进入 CSSOM 解析，从源头杜绝外部样式表请求）
 * - 先解码 CSS 转义，防止 @im\70 ort 等写法绕过关键词匹配
 * - 注释视作空白边界（@import + 注释 + url 仍命中），且注释会切断标识符：
 *   @im + 注释 + port 按浏览器分词规则为两个 ident，本就不构成 @import 规则，故不剔除
 * - 字符串字面量整体跳过（content:"@import x" 为文本内容不删）
 * - 规则体消费至顶层首个分号或文件尾；遇 { 停止且不消费（@import 语法不含块，非法块交给 CSSOM 丢弃）
 * @example stripCssImports('@import "a.css"; .a{}') → ' .a{}'
 * @example stripCssImports('@im\\70 ort url(a.css)') → ''
 * @example stripCssImports('@im /*注释*∕ port "a.css"; .a{}') → '@im   port "a.css"; .a{}'（注释切断标识符，不构成 @import）
 * @example stripCssImports('content:"@import x"') → 'content:"@import x"'
 */
export function stripCssImports(input: string): string {
  if (!input.includes('@')) return input;
  const value = decodeCssEscapes(input);
  const n = value.length;
  let result = '';
  let i = 0;

  /** 跳过字符串字面量，返回字面量结束后的下标（未闭合则到末尾） */
  const skipString = (pos: number) => {
    const quote = value[pos++];
    while (pos < n) {
      if (value[pos] === '\\') {
        pos += 2;
        continue;
      }
      if (value[pos++] === quote) break;
    }
    return pos;
  };

  while (i < n) {
    const c = value[i];
    if (c === '"' || c === "'") {
      const end = skipString(i);
      result += value.slice(i, end);
      i = end;
      continue;
    }
    if (c === '/' && value[i + 1] === '*') {
      const end = value.indexOf('*/', i + 2);
      // 注释替换为空白：保持其标识边界作用，未闭合注释则后续均为注释内容
      result += ' ';
      if (end === -1) break;
      i = end + 2;
      continue;
    }
    if (
      c === '@' &&
      value.slice(i + 1, i + 7).toLowerCase() === 'import' &&
      (value[i + 7] === undefined || !/[a-zA-Z0-9_-]/.test(value[i + 7]))
    ) {
      i += 7;
      while (i < n) {
        const ch = value[i];
        if (ch === '"' || ch === "'") {
          i = skipString(i);
          continue;
        }
        if (ch === '/' && value[i + 1] === '*') {
          const end = value.indexOf('*/', i + 2);
          if (end === -1) {
            i = n;
            break;
          }
          i = end + 2;
          continue;
        }
        if (ch === ';') {
          i++;
          break;
        }
        if (ch === '{') break;
        i++;
      }
      continue;
    }
    result += c;
    i++;
  }
  return result;
}

/**
 * 将 < 重写为定长转义 \00003c，防止 </style> 等序列截断样式文本上下文（浏览器解码后语义不变）
 * @example escapeCssLt('"</style>"') → '"\\00003c/style>"'
 */
export function escapeCssLt(value: string): string {
  return value.replace(/</g, '\\00003c');
}

/**
 * 判断 CSS 声明值中是否含可逃逸声明上下文的字符
 * 字符串字面量与括号（含嵌套）内的 ; { } 视为值内容放行；顶层出现的 ; { } 可闭合当前声明/规则块注入任意规则
 * @example hasCssDeclarationInjection('url("a;b")') → false
 * @example hasCssDeclarationInjection('red;}*{display:none') → true
 * @example hasCssDeclarationInjection('"a;b"') → false
 */
function hasCssDeclarationInjection(value: string): boolean {
  let quote: string | null = null;
  let depth = 0;
  for (let i = 0; i < value.length; i++) {
    const c = value[i];
    if (quote !== null) {
      // 串内反斜杠转义整体跳过，防止转义引号被误判为串结束
      if (c === '\\') i++;
      else if (c === quote) quote = null;
      continue;
    }
    // 字符串外的转义对整体跳过：\' 是字面字符而非字符串边界，拆开会让转义引号误开字符串、隐藏其后真实的 ; { }
    if (c === '\\') {
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      continue;
    }
    if (c === '(') {
      depth++;
      continue;
    }
    if (c === ')') {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth === 0 && (c === ';' || c === '{' || c === '}')) return true;
  }
  // 未闭合括号会把生成的 ; 与规则 } 吞进函数 token，破坏后续规则，整条丢弃
  return depth !== 0;
}

/**
 * 净化单条 CSS 声明值（规则块上下文：selector { prop: value; } 中的 value 部分）
 * - 先经 sanitizeCssUrl 归一化并校验值内 URL 协议（与 style 属性路径保持一致）
 * - 归一化后字符串/括号外出现 ; { } 视为可逃逸声明上下文的注入，返回 null 整条丢弃
 *   （必须在归一化后校验：\3b 解码为字面 ; 会成为真实分隔符，原样检查会漏判）
 * - < 统一重写为定长转义，防止 </style> 截断样式文本
 * @example sanitizeCssDeclarationValue('linear-gradient(red, blue)') → 'linear-gradient(red, blue)'
 * @example sanitizeCssDeclarationValue('url("data:image/png;base64,AA")') → 'url("data:image/png;base64,AA")'（引号内 ; 放行）
 * @example sanitizeCssDeclarationValue('url(javascript:x)') → 'url()'
 * @example sanitizeCssDeclarationValue('red;}*{display:none') → null
 * @example sanitizeCssDeclarationValue("\\';}body{display:none") → null（\' 是字面字符，不能隐藏注入字符）
 * @example sanitizeCssDeclarationValue('"a</style>b"') → '"a\\00003c/style>b"'
 */
export function sanitizeCssDeclarationValue(value: string): string | null {
  const normalized = sanitizeCssUrl(value);
  if (hasCssDeclarationInjection(normalized)) return null;
  return escapeCssLt(normalized);
}

/**
 * 逐个校验 URL 协议，过滤不安全部分
 * @example sanitizeMultiUrl('a.png 1x, javascript:x 2x') → 'a.png 1x'
 * @example sanitizeMultiUrl('javascript:x') → ''
 */
function sanitizeMultiUrl(value: string): string {
  try {
    const candidates = parseSrcset(value, { strict: false })
      .map((candidate) => ({ ...candidate, url: sanitizeUrl(candidate.url) }))
      .filter((candidate) => candidate.url !== '');
    return stringifySrcset(candidates);
  } catch {
    return '';
  }
}

/**
 * 校验空格分隔的多 URL 属性值（如 ping），过滤不安全地址
 * @example sanitizeSpaceSeparatedUrls('https://a.com/p javascript:x https://b.com/q') → 'https://a.com/p https://b.com/q'
 * @example sanitizeSpaceSeparatedUrls('javascript:x') → ''
 */
function sanitizeSpaceSeparatedUrls(value: string): string {
  return value
    .split(SPACE_SEPARATOR_REGEX)
    .map((url) => sanitizeUrl(url))
    .filter((url) => url !== '')
    .join(' ');
}

/**
 * 判断 SVG 动画取值中是否夹带危险协议 token
 * @example hasDangerousAnimationValue('0; 0.5; 1') → false
 * @example hasDangerousAnimationValue('a.png; javascript:x') → true
 */
function hasDangerousAnimationValue(value: string): boolean {
  return value.split(';').some((token) => SVG_DANGEROUS_PROTOCOL_REGEX.test(token));
}

/**
 * 净化单个 HTML 属性值
 * - 属性名含非法字符（空白/引号/斜杠/等号/大于号等）：返回 null，防止名字本身破坏标签结构
 * - on* 事件属性：返回 null，整个属性丢弃
 * - URL 类属性：协议白名单校验，不安全返回 null；其中导航类属性（href/action/formaction/xlink:href）不放行 data: URL
 * - srcset/imagesrcset：逐候选 URL 校验，全部不安全返回 null
 * - ping 等空格分隔多 URL 属性：逐个校验并剔除不安全地址，全部不安全返回 null
 * - style 属性：值内 url() 地址经协议校验（兜底防脏数据内联样式注入）
 * - SVG 动画取值属性：含危险协议 token 时返回 null
 * @example sanitizeAttributeValue('href', 'javascript:x') → null
 * @example sanitizeAttributeValue('href', 'data:image/png;base64,AAAA') → null（导航类属性不放行 data:）
 * @example sanitizeAttributeValue('src', 'https://a.com/x.png') → 'https://a.com/x.png'
 * @example sanitizeAttributeValue('onclick', 'x') → null
 * @example sanitizeAttributeValue('ping', 'https://a.com javascript:x') → 'https://a.com'
 * @example sanitizeAttributeValue('style', 'background:url(javascript:x)') → 'background:url())'
 * @example sanitizeAttributeValue('title', 'hello') → 'hello'
 */
export function sanitizeAttributeValue(name: string, value: string): string | null {
  const lowerName = name.toLowerCase();
  if (!ATTR_NAME_REGEX.test(name)) return null;
  if (EVENT_ATTR_NAME_REGEX.test(lowerName)) return null;
  if (MULTI_URL_ATTRIBUTES.has(lowerName)) {
    const sanitized = sanitizeMultiUrl(value);
    return sanitized || null;
  }
  if (SPACE_URL_ATTRIBUTES.has(lowerName)) {
    const sanitized = sanitizeSpaceSeparatedUrls(value);
    return sanitized || null;
  }
  if (URL_ATTRIBUTES.has(lowerName)) {
    const safe = sanitizeUrl(value);
    if (!safe) return null;
    // 导航类属性不放行 data: URL（data:image/svg+xml 顶层导航时可执行内嵌脚本）
    if (NAVIGATION_URL_ATTRIBUTES.has(lowerName) && safe.toLowerCase().startsWith('data:')) return null;
    return safe;
  }
  if (lowerName === 'style') return sanitizeCssUrl(value);
  if (SVG_ANIMATION_VALUE_ATTRIBUTES.has(lowerName) && hasDangerousAnimationValue(value)) return null;
  return value;
}
