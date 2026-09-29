import tokenize from 'postcss/lib/tokenize';
import valueParser from 'postcss-value-parser';
import {
  SAFE_DATA_MIME_PREFIXES,
  SAFE_URL_PROTOCOLS,
  URL_ATTRIBUTES,
  NAVIGATION_URL_ATTRIBUTES,
  MULTI_URL_ATTRIBUTES,
  SPACE_URL_ATTRIBUTES,
  CSS_URL_VALUE_ATTRIBUTES,
  SVG_ANIMATION_VALUE_ATTRIBUTES,
  CSS_ESCAPE_REGEX,
  CSS_COMMENT_REGEX,
  CSS_URL_FUNCTION_REGEX,
  CSS_RE_ESCAPE_CODE_POINTS,
  EVENT_ATTR_NAME_REGEX,
  DANGEROUS_DATA_MIME_PREFIX,
  SPACE_SEPARATOR_REGEX,
} from '@/constants/sanitize';
import { ATTR_NAME_REGEX } from '@/constants/html';
import { parseSrcset, stringifySrcset } from 'srcset';

/**
 * 按浏览器地址解析规则解析 URL，解析失败返回 null
 * new URL 与浏览器地址解析规则一致：自动剥离 \t\n\r 与首尾控制字符，防止 java\tscript: 等混淆绕过
 * 注意：依赖 location.origin 作为解析基准，要求页面运行在 http/https 源下
 */
function parseUrl(url: string): URL | null {
  try {
    return new URL(url, location.origin);
  } catch {
    return null;
  }
}

/**
 * 判断 URL 是否使用安全协议（白名单制）
 * 先经 new URL 规范化再按 protocol 分派判定：仅放行 SAFE_URL_PROTOCOLS 中的协议、
 * 无协议的相对地址（按当前页面源解析后命中白名单）、data: 媒体资源与 about:blank；
 * 其余协议（javascript:/vbscript:/file:/ftp: 等）一律拒绝
 * @example isSafeUrl('https://a.com/x.png') → true
 * @example isSafeUrl('./a.png') → true
 * @example isSafeUrl('data:image/png;base64,AAAA') → true
 * @example isSafeUrl('javascript:alert(1)') → false
 * @example isSafeUrl('java\tscript:alert(1)') → false（规范化后等价 javascript:）
 * @example isSafeUrl('data:text/html,<h1>x</h1>') → false
 */
export function isSafeUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true;
  const parsed = parseUrl(trimmed);
  if (!parsed) return false;
  // data: 地址仅放行 SAFE_DATA_MIME_PREFIXES 中的媒体资源 MIME 前缀（href 已规范化，混淆写法不可绕过）
  if (parsed.protocol === 'data:') {
    return SAFE_DATA_MIME_PREFIXES.some((prefix) => parsed.href.toLowerCase().startsWith(prefix));
  }
  // about:blank 为合法空白页
  if (parsed.protocol === 'about:') return parsed.href.toLowerCase() === 'about:blank';
  return SAFE_URL_PROTOCOLS.has(parsed.protocol);
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
 * 净化导航类 URL（href/action/formaction/xlink:href 等可触发顶层导航的取值）
 * 在协议白名单基础上额外禁行 data:（data:image/svg+xml 顶层导航时可执行内嵌脚本）
 * @example sanitizeNavigationUrl('https://a.com') → 'https://a.com'
 * @example sanitizeNavigationUrl('data:image/png;base64,AA') → ''（导航语境 data: 一律不放行）
 */
export function sanitizeNavigationUrl(url: string): string {
  const safe = sanitizeUrl(url);
  // data: 判定在规范化后的 protocol 上进行：da\tta: 等混淆写法经 new URL 解析后与字面 data: 等价
  return safe && parseUrl(safe)?.protocol !== 'data:' ? safe : '';
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

/** 以字符串参数承载 URL 的 CSS 函数（image-set/src/image 等，含 -webkit- 前缀变体） */
const CSS_URL_STRING_FUNCTIONS = new Set(['image-set', '-webkit-image-set', 'image', 'src']);

/** 承载字符串形式 URL 的 at-keyword（@import/@namespace 首个字符串参数为地址） */
const CSS_URL_AT_KEYWORDS = /^@(import|namespace)$/i;

/** 提取 url() 函数节点的地址文本：唯一子节点为字符串时取其值（引号形式），其余拼接子节点原文后剥离注释与首尾空白 */
function extractUrlNodeAddress(node: valueParser.FunctionNode): string {
  const only = node.nodes.length === 1 ? node.nodes[0] : undefined;
  if (only?.type === 'string') return extractCssUrl(only.value);
  // word 与 string 混杂等非法形态按裸地址整体校验：混杂内容无法构成安全 URL 时清空
  return extractCssUrl(valueParser.stringify(node.nodes));
}

/** url() 地址不安全时清空参数并归一函数名（输出空 url()），安全则保留原节点不动 */
function sanitizeUrlFunction(node: valueParser.FunctionNode) {
  if (!isSafeUrl(extractUrlNodeAddress(node))) {
    node.nodes = [];
    node.value = 'url';
  }
}

/**
 * 递归净化值解析树中的 URL 引用（就地修改节点列表）
 * - 注释节点在净化检查完成后统一剔除：检查阶段保留注释可区分「注释切断」与「真实空白分隔」
 *   （u + 注释 + rl(x) 注释删除后还原为 url() 需校验，u rl(x) 在浏览器中本就是两个独立 token 不误改）；
 *   无引号 url() 中字面的 /* 由解析器归入地址 word 节点，不受影响
 * - url() 三种引号形式统一校验协议，不安全清空为 url()；函数名被注释切断的写法（word + function）
 *   拼接后命中 url 同样按 url() 处理
 * - @import/@namespace 的字符串参数、image-set()/src()/image() 的字符串参数按协议校验，不安全置空
 * - 字符串字面量为原子节点（content:"url(x)" 为文本内容），天然不会被误改
 */
function sanitizeValueNodes(nodes: valueParser.Node[]) {
  nodes.forEach((node, i) => {
    if (node.type === 'function') {
      const fnName = node.value.toLowerCase();
      if (fnName === 'url') sanitizeUrlFunction(node);
      else if (CSS_URL_STRING_FUNCTIONS.has(fnName)) {
        node.nodes.forEach((child) => {
          if (child.type === 'string' && !isSafeUrl(extractCssUrl(child.value))) {
            child.value = '';
            child.quote = '"';
          }
        });
      }
      sanitizeValueNodes(node.nodes);
      return;
    }
    if (node.type !== 'word') return;

    // at-keyword 字符串参数校验：下一个非空白/注释兄弟节点为字符串时按 URL 处理
    if (CSS_URL_AT_KEYWORDS.test(node.value)) {
      const nextIndex = nodes.findIndex(
        (sibling, j) => j > i && sibling.type !== 'space' && sibling.type !== 'comment',
      );
      const next = nextIndex === -1 ? undefined : nodes[nextIndex];
      if (next?.type === 'string' && !isSafeUrl(extractCssUrl(next.value))) {
        next.value = '';
        next.quote = '"';
        // 间隔仅为注释时补一个空格：注释删除后 at-keyword 与字符串会粘连
        if (nodes.slice(i + 1, nextIndex).every((sibling) => sibling.type === 'comment')) {
          nodes.splice(nextIndex, 0, { type: 'space', value: ' ', sourceIndex: 0, sourceEndIndex: 0 });
        }
      }
      return;
    }

    // url 函数名被注释切断（u + 注释 + rl(x)）或与括号间隔注释（url + 注释 + (x)）：
    // 仅 word 与其后函数节点之间全是注释（无真实空白）时才拼接判定，命中 url 按 url() 参数净化
    if (/^[a-zA-Z]+$/.test(node.value)) {
      const next = nodes.slice(i + 1).find((sibling) => sibling.type !== 'comment');
      if (next?.type === 'function' && (node.value + next.value).toLowerCase() === 'url') {
        // 不安全时清空 word 与函数参数，函数名归一为 url：两个节点合并输出空 url()
        if (!isSafeUrl(extractUrlNodeAddress(next))) {
          node.value = '';
          next.value = 'url';
          next.nodes = [];
        }
      }
    }
  });
  // 检查完成后剔除注释节点：注释是浏览器分词中的标识边界，删除不影响已完成的判定
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (nodes[i].type === 'comment') nodes.splice(i, 1);
  }
}

/**
 * 从 CSS 值中净化所有 URL 引用
 * - 先解码 CSS 转义做归一化，防止 u\72l(...)、javascript\3a x 等写法绕过检测；
 *   解码后危险的 ", ', \, < 码点已回写为定长转义，不会在输出中重组
 * - 分词与函数/字符串边界交给 postcss-value-parser（与浏览器分词规则一致），
 *   不再依赖手写正则模拟分词，避免字符串/注释/转义优先级等边界写漏写错
 * - url(...) 三种引号形式逐个校验协议，不安全替换为空 url()
 * - @import/@namespace 的字符串形式 URL、image-set()/src()/image() 的字符串参数同样按协议校验
 *   （@import 规则整体已在 stripCssImports 中剔除，此处仅兜底防御脏数据）
 * 返回处理后的 CSS 值
 * @example sanitizeCssUrl('url("a.png")') → 'url("a.png")'
 * @example sanitizeCssUrl('url("javascript:x")') → 'url()'
 * @example sanitizeCssUrl('@import "javascript:x"') → '@import ""'
 * @example sanitizeCssUrl('image-set("javascript:x" 1x)') → 'image-set("" 1x)'
 * @example sanitizeCssUrl('content:"url(javascript:x)"') → 'content:"url(javascript:x)"'（字符串内文本不改写）
 */
export function sanitizeCssUrl(cssValue: string): string {
  if (!cssValue) return cssValue;
  const parsed = valueParser(decodeCssEscapes(cssValue));
  sanitizeValueNodes(parsed.nodes);
  return valueParser.stringify(parsed.nodes);
}

/**
 * 收集 CSS 文本中全部 @import 规则的原文区间（含结尾分号）
 * 分词交给 postcss tokenize（与浏览器分词规则一致）：
 * - 字符串/注释/brackets 为独立 token，"@import" 位于其中时不会命中 at-word
 * - @im + 注释 + port 为两个独立 word/at-word，本就不构成 @import 规则，不剔除
 * - at-keyword 名中的转义会被分词器切成多个相邻 word token（@im\70 ort → @im + \70 + ort），
 *   偏移相邻的部分拼接后解码比对，@im\70 ort 等写法仍命中；注释/空白切断的不拼接（本就不构成规则）
 * - 只对名字解码而非整段文本：原文分词保证 source offset 有效，且值内 \3b 等转义不会被误作边界
 * - 规则体消费至首个分号或文件尾；遇 { 停止且不消费（@import 语法不含块，非法块交给 CSSOM 丢弃）
 * - 嵌套在块内的非法 @import 一并收集（保守剔除）
 * - space token 无 source offset，区间终点按逐 token +1 近似推进；即使低估，
 *   残留的也只是 @import 规则尾部片段（非法文本，CSSOM 丢弃），不构成绕过
 */
function findImportRanges(value: string): [number, number][] {
  const ranges: [number, number][] = [];
  // 只需 { css } 最小输入；error 回调在未闭合字符串/括号等畸形语法时被调用，
  // 抛错终止分词并返回已收集区间（未闭合字符串吞掉其后全部内容，不可能再构成 @import）
  const tokenizer = tokenize({
    css: value,
    error: () => {
      throw new Error('css tokenize error');
    },
  });
  let pendingStart = -1;
  try {
    let token = tokenizer.nextToken();
    while (token !== undefined) {
      if (token[0] === 'at-word') {
        let name = token[1].slice(1);
        const start = token[2] ?? 0;
        let nameEnd = token[3] ?? token[2] ?? 0;
        // at-keyword 名中的转义会被分词器切成后续 word token（@im + \70 + ort）；
        // 仅偏移相邻（无注释/空白间隔）时拼接：@im + 注释 + ort 本就不构成 @import
        let next = tokenizer.nextToken();
        while (next !== undefined && next[0] === 'word' && next[2] === nameEnd + 1) {
          name += next[1];
          nameEnd = next[3] ?? nameEnd;
          next = tokenizer.nextToken();
        }
        token = next;
        if (decodeCssEscapes(name).toLowerCase() !== 'import') continue;
        pendingStart = start;
        let end = nameEnd + 1;
        // 消费规则体至分号或文件尾
        while (token !== undefined) {
          if (token[0] === '{') break;
          end = (token[3] ?? token[2] ?? end) + 1;
          if (token[0] === ';') break;
          token = tokenizer.nextToken();
        }
        ranges.push([pendingStart, end]);
        pendingStart = -1;
        continue;
      }
      token = tokenizer.nextToken();
    }
  } catch {
    // 分词中断：@import 已开始未收尾时保守剔除至文件尾（其后内容多为未闭合字符串的一部分）
    if (pendingStart !== -1) ranges.push([pendingStart, value.length]);
  }
  return ranges;
}

/**
 * 剔除 CSS 文本中的全部 @import 规则（整条丢弃，不进入 CSSOM 解析，从源头杜绝外部样式表请求）
 * - at-word 名解码后比对，@im\70 ort 等转义写法仍被剔除
 * - 按 at-word token 的 source offset 从原文切片，其余文本原样保留（含注释、转义形式与格式）
 * @example stripCssImports('@import "a.css"; .a{}') → ' .a{}'
 * @example stripCssImports('@im\\70 ort url(a.css)') → ''
 * @example stripCssImports('content:"@import x"') → 'content:"@import x"'
 */
export function stripCssImports(input: string): string {
  if (!input.includes('@')) return input;
  const ranges = findImportRanges(input);
  if (!ranges.length) return input;

  let result = '';
  let pos = 0;
  for (const [start, end] of ranges) {
    result += input.slice(pos, start);
    pos = end;
  }
  return result + input.slice(pos);
}

/**
 * 判断 CSSOM 序列化后的规则文本是否仍含危险协议 url()
 * CSSOM 已完成转义解码与规范化，序列化输出中 url() 地址可直接提取校验；
 * 字符串字面量内的 url( 为文本内容（如 content:"url(x)"），跳过不判
 */
function hasDangerousSerializedUrl(cssText: string): boolean {
  const literalRanges = scanLiteralRanges(cssText);
  let dangerous = false;
  cssText.replace(
    CSS_URL_FUNCTION_REGEX,
    (match, dq: string | undefined, sq: string | undefined, bare: string | undefined, offset: number) => {
      if (literalRanges.some(([start, end]) => offset >= start && offset < end)) return match;
      const url = extractCssUrl(dq ?? sq ?? bare ?? '');
      if (url && !isSafeUrl(url)) dangerous = true;
      return match;
    },
  );
  return dangerous;
}

/**
 * CSSOM 兜底校验：整段 CSS 规则文本经浏览器解析序列化后，仍含危险协议 url() 或残留 @import 时返回 true
 * 手写分词净化（sanitizeCssUrl/stripCssImports）的最终一致性检查：
 * 浏览器按自身分词规则复核一遍，任何被手写实现漏过的写法都会以真实解析结果暴露；
 * 命中即由调用方整条丢弃
 * - 解析走 CSSStyleSheet.replaceSync：不挂载 DOM、规范禁止加载外部资源与 @import，校验无网络副作用
 * - @import 判定不依赖解析器实现差异：规范实现由 replaceSync 抛错拦截，
 *   另有实现会静默丢弃 @import（如测试环境），故先用 postcss 独立扫描保证一致拦截
 * - replaceSync 抛错（非法语法）按危险处理
 * @example isDangerousCssRuleText('.a{background:url(javascript:x)}') → true
 * @example isDangerousCssRuleText('.a{color:red}') → false
 */
export function isDangerousCssRuleText(cssText: string): boolean {
  if (typeof CSSStyleSheet === 'undefined' || !cssText.trim()) return false;
  // @import 先用 tokenize 独立扫描：replaceSync 在规范实现中抛错，另有实现（如测试环境）静默丢弃；
  // at-word 名在 findImportRanges 内部解码比对，@im\70 ort 等转义写法不可绕过
  if (findImportRanges(cssText).length > 0) return true;
  const sheet = new CSSStyleSheet();
  try {
    sheet.replaceSync(cssText);
  } catch {
    return true;
  }
  return Array.from(sheet.cssRules).some(
    (rule) => rule.type === CSSRule.IMPORT_RULE || hasDangerousSerializedUrl(rule.cssText),
  );
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
 * 基于 postcss-value-parser 解析树判定：字符串字面量为原子节点天然放行；
 * 顶层 word/div 节点中出现 ; { } 可闭合当前声明/规则块注入任意规则；
 * 未闭合函数节点会把生成的 ; 与规则 } 吞进函数 token，破坏后续规则，同样拒绝
 * @example hasCssDeclarationInjection('url("a;b")') → false
 * @example hasCssDeclarationInjection('red;}*{display:none') → true
 * @example hasCssDeclarationInjection('"a;b"') → false
 */
function hasCssDeclarationInjection(value: string): boolean {
  const checkNodes = (nodes: valueParser.Node[], topLevel: boolean): boolean =>
    nodes.some((node) => {
      if (node.type === 'function') {
        return node.unclosed === true || checkNodes(node.nodes, false);
      }
      if (node.type === 'word' || node.type === 'div') {
        return topLevel && /[;{}]/.test(node.value);
      }
      return false;
    });
  return checkNodes(valueParser(value).nodes, true);
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
 * 判断 SVG 动画取值中是否夹带危险 URL token
 * 动画目标由 attributeName 指定（独立属性，无法静态判定），可能为导航类 URL 属性，
 * 故分号分隔的取值一律经 isSafeUrl 校验：其内部经浏览器 URL 解析归一化，
 * java\tscript: 等混淆写法不可绕过；数字、颜色、transform 等无 scheme 的普通取值视作相对引用放行；
 * 导航语境额外拦截 data:image/svg（顶层导航时 svg+xml 可执行内嵌脚本），其余安全 data: 类型放行
 * @example hasDangerousAnimationValue('0; 0.5; 1') → false
 * @example hasDangerousAnimationValue('a.png; javascript:x') → true
 * @example hasDangerousAnimationValue('java\tscript:x') → true（归一化后等价 javascript:）
 * @example hasDangerousAnimationValue('data:image/svg+xml,<svg/>') → true（导航可执行脚本）
 * @example hasDangerousAnimationValue('data:image/png;base64,AA') → false（资源类 data: 放行）
 */
function hasDangerousAnimationValue(value: string): boolean {
  return value.split(';').some((token) => {
    if (!isSafeUrl(token)) return true;
    // data:image/svg 判定在规范化后的地址上进行，防止 da\tta: 等混淆写法绕过
    const parsed = parseUrl(token);
    return (
      parsed !== null &&
      parsed.protocol === 'data:' &&
      parsed.href.toLowerCase().startsWith(DANGEROUS_DATA_MIME_PREFIX)
    );
  });
}

/**
 * 净化单个 HTML 属性值
 * - 属性名不在白名单内（须为字母/_/: 开头，仅含字母、数字、-、_、.、:）：返回 null，防止名字本身破坏标签结构或被 Vue 当作 DOM property 注入
 * - on* 事件属性：返回 null，整个属性丢弃
 * - URL 类属性：协议白名单校验，不安全返回 null；其中导航类属性（href/action/formaction/xlink:href）不放行 data: URL
 * - srcset/imagesrcset：逐候选 URL 校验，全部不安全返回 null
 * - ping 等空格分隔多 URL 属性：逐个校验并剔除不安全地址，全部不安全返回 null
 * - style 属性与 fill/stroke/filter 等 CSS 值表现属性：值内 url() 地址经协议校验（兜底防脏数据内联样式注入）
 * - SVG 动画取值属性：分号取值按 URL 协议白名单校验，危险协议或 data:image/svg 时返回 null
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
    const safe = NAVIGATION_URL_ATTRIBUTES.has(lowerName)
      ? sanitizeNavigationUrl(value)
      : sanitizeUrl(value);
    return safe || null;
  }
  if (lowerName === 'style') return sanitizeCssUrl(value);
  if (CSS_URL_VALUE_ATTRIBUTES.has(lowerName)) return sanitizeCssUrl(value);
  if (SVG_ANIMATION_VALUE_ATTRIBUTES.has(lowerName) && hasDangerousAnimationValue(value)) return null;
  return value;
}
