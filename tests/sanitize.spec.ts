import { describe, it, expect } from 'vitest';
import { isSafeUrl, sanitizeUrl, sanitizeCssUrl, sanitizeAttributeValue } from '@/utils/sanitize';

describe('isSafeUrl', () => {
  it('放行 http/https/ftp/mailto/tel 协议', () => {
    expect(isSafeUrl('https://example.com/a.png')).toBe(true);
    expect(isSafeUrl('http://example.com')).toBe(true);
    expect(isSafeUrl('ftp://example.com/f.zip')).toBe(true);
    expect(isSafeUrl('mailto:a@b.com')).toBe(true);
    expect(isSafeUrl('tel:12345')).toBe(true);
  });

  it('放行相对路径与锚点', () => {
    expect(isSafeUrl('#top')).toBe(true);
    expect(isSafeUrl('./a.png')).toBe(true);
    expect(isSafeUrl('../b.png')).toBe(true);
    expect(isSafeUrl('/abs/path.png')).toBe(true);
  });

  it('空值视为安全', () => {
    expect(isSafeUrl('')).toBe(true);
    expect(isSafeUrl('   ')).toBe(true);
  });

  it('拒绝 javascript:/vbscript:/file: 协议', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeUrl('  javascript:alert(1)  ')).toBe(false);
    expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
    expect(isSafeUrl('file:///etc/passwd')).toBe(false);
  });

  it('放行媒体类 data: URL（base64 资源）', () => {
    expect(isSafeUrl('data:image/png;base64,iVBORw0KGgo=')).toBe(true);
    expect(isSafeUrl('data:image/svg+xml,<svg></svg>')).toBe(true);
    expect(isSafeUrl('data:audio/mp3;base64,AAAA')).toBe(true);
    expect(isSafeUrl('data:video/mp4;base64,AAAA')).toBe(true);
    expect(isSafeUrl('data:font/woff2;base64,AAAA')).toBe(true);
  });

  it('data: MIME 前缀大小写不敏感', () => {
    expect(isSafeUrl('DATA:IMAGE/PNG;base64,AAAA')).toBe(true);
    expect(isSafeUrl('Data:Text/Html,<h1>x</h1>')).toBe(false);
  });

  it('拒绝非媒体类 data: URL', () => {
    expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isSafeUrl('data:text/javascript,alert(1)')).toBe(false);
    expect(isSafeUrl('data:application/pdf;base64,AAAA')).toBe(false);
    expect(isSafeUrl('data:;base64,AAAA')).toBe(false);
  });

  it('无法解析的 URL 视为不安全', () => {
    expect(isSafeUrl('http://[invalid')).toBe(false);
  });

  it('放行 about:blank 空白页', () => {
    expect(isSafeUrl('about:blank')).toBe(true);
  });
});

describe('sanitizeUrl', () => {
  it('安全 URL 原样返回（去除首尾空白）', () => {
    expect(sanitizeUrl('  https://a.com/x.png  ')).toBe('https://a.com/x.png');
    expect(sanitizeUrl('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
  });

  it('不安全 URL 返回空字符串', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeUrl('data:text/html,<h1>x</h1>')).toBe('');
  });
});

describe('sanitizeCssUrl', () => {
  it('安全 url() 保持引号形式不变', () => {
    expect(sanitizeCssUrl('url("https://a.com/x.png")')).toBe('url("https://a.com/x.png")');
    expect(sanitizeCssUrl("url('./y.png')")).toBe("url('./y.png')");
    expect(sanitizeCssUrl('url(z.png)')).toBe('url(z.png)');
  });

  it('媒体类 data: url() 保留', () => {
    expect(sanitizeCssUrl('url("data:image/png;base64,AAAA")')).toBe('url("data:image/png;base64,AAAA")');
  });

  it('不安全协议 url() 替换为空 url()', () => {
    expect(sanitizeCssUrl('url("javascript:alert(1)")')).toBe('url()');
    expect(sanitizeCssUrl('URL(javascript:alert)')).toBe('url()');
    expect(sanitizeCssUrl('url(data:text/html;base64,PHNjcmlwdD4=)')).toBe('url()');
  });

  it('bare url() 内嵌括号时仍清除危险协议', () => {
    expect(sanitizeCssUrl('url(javascript:alert(1))')).not.toContain('javascript:');
  });

  it('剥离 URL 内部 CSS 注释防绕过', () => {
    expect(sanitizeCssUrl('url(jav/**/ascript:x)')).toBe('url()');
  });

  it('非 url() 值原样返回', () => {
    expect(sanitizeCssUrl('linear-gradient(red, blue)')).toBe('linear-gradient(red, blue)');
    expect(sanitizeCssUrl('')).toBe('');
  });
});

describe('sanitizeAttributeValue', () => {
  it('属性名含非法字符时整体丢弃', () => {
    expect(sanitizeAttributeValue('a b', 'v')).toBeNull();
    expect(sanitizeAttributeValue('x=y', 'v')).toBeNull();
    expect(sanitizeAttributeValue('a"b', 'v')).toBeNull();
    expect(sanitizeAttributeValue('x onmouseover=alert(1)', 'v')).toBeNull();
  });

  it('on* 事件属性整体丢弃', () => {
    expect(sanitizeAttributeValue('onclick', 'alert(1)')).toBeNull();
    expect(sanitizeAttributeValue('ONLOAD', 'alert(1)')).toBeNull();
  });

  it('URL 类属性经协议校验，危险协议整体丢弃', () => {
    expect(sanitizeAttributeValue('href', 'javascript:alert(1)')).toBeNull();
    expect(sanitizeAttributeValue('src', 'https://a.com/x.png')).toBe('https://a.com/x.png');
    expect(sanitizeAttributeValue('xlink:href', 'javascript:alert(1)')).toBeNull();
  });

  it('导航类 URL 属性不放行 data: URL（含 data:image/svg+xml）', () => {
    expect(sanitizeAttributeValue('href', 'data:image/svg+xml,<svg onload=alert(1)>')).toBeNull();
    expect(sanitizeAttributeValue('href', 'data:image/png;base64,AAAA')).toBeNull();
    expect(sanitizeAttributeValue('action', 'data:image/png;base64,AAAA')).toBeNull();
    expect(sanitizeAttributeValue('formaction', 'data:image/png;base64,AAAA')).toBeNull();
    /** 资源型 URL 属性不受影响 */
    expect(sanitizeAttributeValue('src', 'data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
    expect(sanitizeAttributeValue('poster', 'data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
    /** 导航类属性的安全协议正常放行 */
    expect(sanitizeAttributeValue('href', 'https://a.com/p')).toBe('https://a.com/p');
  });

  it('srcset 逐候选校验，不安全候选剔除、保留安全候选', () => {
    expect(sanitizeAttributeValue('srcset', 'a.png 1x, javascript:alert(1) 2x, https://a.com/b.png 3x')).toBe(
      'a.png 1x, https://a.com/b.png 3x'
    );
    expect(sanitizeAttributeValue('srcset', 'javascript:alert(1)')).toBeNull();
  });

  it('srcset 中的 data: URL 完整保留（逗号不拆分 URL）', () => {
    expect(
      sanitizeAttributeValue('srcset', 'data:image/png;base64,AAAA 1x, https://a.com/b.png 2x')
    ).toBe('data:image/png;base64,AAAA 1x, https://a.com/b.png 2x');
  });

  it('SVG 动画取值属性含危险协议 token 时整体丢弃', () => {
    expect(sanitizeAttributeValue('values', 'a.png; javascript:alert(1)')).toBeNull();
    expect(sanitizeAttributeValue('to', 'javascript:alert(1)')).toBeNull();
    expect(sanitizeAttributeValue('values', '0; 0.5; 1')).toBe('0; 0.5; 1');
  });

  it('普通属性原样返回', () => {
    expect(sanitizeAttributeValue('title', 'hello')).toBe('hello');
    expect(sanitizeAttributeValue('data-x', 'a;b,c:d')).toBe('a;b,c:d');
  });
});
