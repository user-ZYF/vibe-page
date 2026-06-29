/** 安全协议白名单 */
const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:', 'ftp:', 'ftps:'];

/** 相对路径或锚点前缀（不需要协议校验） */
const SAFE_URL_PREFIXES = ['/', '#', './', '../', 'mailto:', 'tel:'];

/**
 * 判断 URL 是否使用安全协议
 * 允许：http/https/mailto/tel/ftp/ftps、相对路径、锚点
 * 拒绝：javascript:/data:/vbscript:/file: 等危险协议
 */
export function isSafeUrl(url: string): boolean {
  if (!url) return true;
  const trimmed = url.trim();
  if (!trimmed) return true;

  /** 相对路径或锚点直接放行 */
  if (SAFE_URL_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) return true;

  /** 尝试解析协议 */
  try {
    const parsed = new URL(trimmed, window.location.origin);
    return SAFE_PROTOCOLS.includes(parsed.protocol);
  } catch {
    /** 无法解析的 URL 视为不安全 */
    return false;
  }
}

/**
 * 净化 URL，不安全时返回空字符串
 */
export function sanitizeUrl(url: string): string {
  return isSafeUrl(url) ? url : '';
}

/**
 * 从 CSS 值中提取所有 url(...) 内的地址并校验
 * 净化不安全协议的 url()，返回处理后的 CSS 值
 */
export function sanitizeCssUrl(cssValue: string): string {
  if (!cssValue) return cssValue;
  /** 匹配 url("...")、url('...')、url(...) 三种形式 */
  return cssValue.replace(/url\(\s*["']?([^"')]+)["']?\s*\)/g, (match, url: string) => {
    if (isSafeUrl(url)) return match;
    return 'url()';
  });
}
