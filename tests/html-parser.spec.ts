import { describe, it, expect } from 'vitest';
import { parseHtml, parseHtmlDocument } from '@/utils/html-parser';

describe('parseHtml', () => {
  it('解析顶层元素与嵌套子元素', () => {
    const els = parseHtml('<div><span>hi</span></div><p></p>');
    expect(els).toHaveLength(2);
    expect(els[0].tagName).toBe('div');
    expect(els[0].children[0].tagName).toBe('span');
  });

  it('剥离 id/class/style 到独立字段，其余进入 attributes', () => {
    const els = parseHtml('<div id="a" class="x y" style="color: red" data-v="1"></div>');
    expect(els[0].id).toBe('a');
    expect(els[0].classes).toEqual(['x', 'y']);
    expect(els[0].style).toEqual({ color: 'red' });
    expect(els[0].attributes).toEqual({ 'data-v': '1' });
  });

  it('保留非空白文本节点、丢弃纯空白文本节点', () => {
    const els = parseHtml('<p>hello</p>');
    expect(els[0].children).toHaveLength(1);
    expect(els[0].children[0].isText).toBe(true);
    expect(els[0].children[0].textContent).toBe('hello');
    expect(parseHtml('<p> </p>')[0].children).toHaveLength(0);
  });
});

describe('parseHtmlDocument', () => {
  it('返回 body 标签属性与子元素', () => {
    const doc = parseHtmlDocument('<body id="b1" class="c" style="color: red"><div>x</div></body>');
    expect(doc.body.id).toBe('b1');
    expect(doc.body.classes).toEqual(['c']);
    expect(doc.body.style.color).toBe('red');
    expect(doc.children).toHaveLength(1);
    expect(doc.children[0].tagName).toBe('div');
  });

  it('未书写 body 标签时 body 无属性', () => {
    const doc = parseHtmlDocument('<div>x</div>');
    expect(doc.body.attributes).toEqual({});
    expect(doc.body.classes).toEqual([]);
    expect(doc.children).toHaveLength(1);
  });
});
