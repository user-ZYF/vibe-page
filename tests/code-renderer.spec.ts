import { describe, it, expect } from 'vitest';
import { renderElements, renderToContainer } from '@/views/playground/utils/code-renderer';
import { parseHtml } from '@/utils/html-parser';
import type { ParsedCssRule } from '@/views/Canvas/types';

/** 解析 HTML 字符串并渲染为 DOM 节点数组 */
function renderHtml(html: string): HTMLElement[] {
  return renderElements(parseHtml(html)) as HTMLElement[];
}

describe('renderElements 安全过滤', () => {
  it('script 标签不渲染', () => {
    const nodes = renderHtml('<script>alert(1)</script><p>ok</p>');
    expect(nodes).toHaveLength(1);
    expect(nodes[0].tagName).toBe('P');
  });

  it('iframe/object/embed/meta/link/base 标签不渲染', () => {
    const nodes = renderHtml(
      '<iframe src="https://a.com"></iframe><object data="x"></object><embed src="y">' +
        '<meta http-equiv="refresh" content="0"><link rel="stylesheet" href="z.css"><base href="https://a.com"><div></div>',
    );
    expect(nodes).toHaveLength(1);
    expect(nodes[0].tagName).toBe('DIV');
  });

  it('黑名单标签的子树一并跳过', () => {
    const nodes = renderHtml('<object><p>inner</p></object><span>ok</span>');
    expect(nodes).toHaveLength(1);
    expect(nodes[0].tagName).toBe('SPAN');
  });

  it('on* 事件属性被剥离', () => {
    const nodes = renderHtml('<img src="x.png" onerror="alert(1)" onclick="alert(2)">');
    expect(nodes[0].hasAttribute('onerror')).toBe(false);
    expect(nodes[0].hasAttribute('onclick')).toBe(false);
    expect(nodes[0].getAttribute('src')).toBe('x.png');
  });

  it('javascript: URL 属性被丢弃', () => {
    const nodes = renderHtml('<a href="javascript:alert(1)">x</a>');
    expect(nodes[0].hasAttribute('href')).toBe(false);
  });

  it('安全 URL 属性保留', () => {
    const nodes = renderHtml('<a href="https://a.com/p" title="t">x</a>');
    expect(nodes[0].getAttribute('href')).toBe('https://a.com/p');
    expect(nodes[0].getAttribute('title')).toBe('t');
  });

  it('base64 图片 data: URL 保留', () => {
    const nodes = renderHtml('<img src="data:image/png;base64,iVBORw0KGgo=">');
    expect(nodes[0].getAttribute('src')).toBe('data:image/png;base64,iVBORw0KGgo=');
  });

  it('非媒体类 data: URL 属性被丢弃', () => {
    const nodes = renderHtml('<a href="data:text/html,<script>alert(1)</script>">x</a>');
    expect(nodes[0].hasAttribute('href')).toBe(false);
  });

  it('行内样式中的不安全 url() 被净化', () => {
    const nodes = renderHtml('<div style="background-image: url(\'file:///etc/passwd\')"></div>');
    const style = nodes[0].getAttribute('style') ?? '';
    expect(style).toContain('url()');
    expect(style).not.toContain('file:');
  });

  it('行内样式中的 base64 图片 url() 保留', () => {
    const nodes = renderHtml('<div style="background-image: url(&quot;data:image/png;base64,AAAA&quot;)"></div>');
    expect(nodes[0].getAttribute('style')).toContain('data:image/png;base64,AAAA');
  });
});

describe('renderToContainer CSS 净化', () => {
  it('样式规则与 at-rule 中的不安全 url() 注入前被净化', () => {
    const container = document.createElement('div');
    const styleEl = document.createElement('style');
    const rules: ParsedCssRule[] = [
      { selector: '.a', style: { 'background-image': 'url("javascript:alert(1)")' } },
      { selector: '', style: {}, atRuleCssText: '@media print { .b { background: url(file:///x) } }' },
    ];
    renderToContainer(container, [], rules, styleEl);
    const css = styleEl.textContent ?? '';
    expect(css).toContain('url()');
    expect(css).not.toContain('javascript:');
    expect(css).not.toContain('file:');
  });

  it('样式规则中的安全 url() 保留', () => {
    const container = document.createElement('div');
    const styleEl = document.createElement('style');
    const rules: ParsedCssRule[] = [
      { selector: '.a', style: { 'background-image': 'url("https://a.com/x.png")' } },
    ];
    renderToContainer(container, [], rules, styleEl);
    expect(styleEl.textContent).toContain('https://a.com/x.png');
  });
});
