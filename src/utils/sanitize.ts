import {
  SAFE_DATA_MIME_PREFIXES,
  URL_ATTRIBUTES,
  NAVIGATION_URL_ATTRIBUTES,
  MULTI_URL_ATTRIBUTES,
  SVG_ANIMATION_VALUE_ATTRIBUTES,
} from '@/constants/sanitize';
import { ATTR_NAME_REGEX } from '@/constants/html';
import { sanitizeUrl as sanitizeUrlString } from '@braintree/sanitize-url';
import { parseSrcset, stringifySrcset } from 'srcset';

/**
 * 判断 URL 是否使用安全协议
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
 */
export function sanitizeUrl(url: string): string {
  return isSafeUrl(url) ? url.trim() : '';
}

/**
 * 从 CSS 值中提取所有 url(...) 内的地址并校验
 * 净化不安全协议的 url()，返回处理后的 CSS 值
 * 支持大小写不敏感匹配、URL 内部 CSS 注释剥离
 */
export function sanitizeCssUrl(cssValue: string): string {
  if (!cssValue) return cssValue;

  /** 匹配 url("...")、url('...')、url(...) 三种形式，大小写不敏感 */
  return cssValue.replace(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]+))\s*\)/gi, (match, dq: string | undefined, sq: string | undefined, bare: string | undefined) => {
    let url = dq ?? sq ?? bare ?? '';
    /** 剥离 URL 内部的 CSS 注释，防止通过注释绕过协议校验 */
    url = url.replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (!url || !isSafeUrl(url)) return 'url()';
    /** 重建净化后的 url() 表达式 */
    if (dq !== undefined) return `url("${url}")`;
    if (sq !== undefined) return `url('${url}')`;
    return `url(${url})`;
  });
}

/**
 * 逐个校验 URL 协议，过滤不安全部分
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

/** 判断 SVG 动画取值中是否夹带危险协议 token */
function hasDangerousAnimationValue(value: string): boolean {
  return value.split(';').some((token) => /^\s*(javascript|vbscript|data:text\/html)\s*:/i.test(token));
}

/**
 * 净化单个 HTML 属性值
 * - 属性名含非法字符（空白/引号/斜杠/等号/大于号等）：返回 null，防止名字本身破坏标签结构
 * - on* 事件属性：返回 null，整个属性丢弃
 * - URL 类属性：协议白名单校验，不安全返回 null；其中导航类属性（href/action/formaction/xlink:href）不放行 data: URL
 * - srcset/imagesrcset：逐候选 URL 校验，全部不安全返回 null
 * - SVG 动画取值属性：含危险协议 token 时返回 null
 */
export function sanitizeAttributeValue(name: string, value: string): string | null {
  const lowerName = name.toLowerCase();
  if (!ATTR_NAME_REGEX.test(name)) return null;
  if (/^on/i.test(lowerName)) return null;
  if (MULTI_URL_ATTRIBUTES.has(lowerName)) {
    const sanitized = sanitizeMultiUrl(value);
    return sanitized || null;
  }
  if (URL_ATTRIBUTES.has(lowerName)) {
    const safe = sanitizeUrl(value);
    if (!safe) return null;
    // 导航类属性不放行 data: URL（data:image/svg+xml 顶层导航时可执行内嵌脚本）
    if (NAVIGATION_URL_ATTRIBUTES.has(lowerName) && safe.toLowerCase().startsWith('data:')) return null;
    return safe;
  }
  if (SVG_ANIMATION_VALUE_ATTRIBUTES.has(lowerName) && hasDangerousAnimationValue(value)) return null;
  return value;
}
