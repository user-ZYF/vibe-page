import { describe, it, expect } from 'vitest';
import { isSafeUrl, sanitizeUrl, sanitizeCssUrl, sanitizeCssDeclarationValue, sanitizeAttributeValue, stripCssImports } from '@/utils/sanitize';

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

  it('CSS 转义写法的 url() 仍被净化', () => {
    // 转义函数名（裸 url 内嵌括号时残留外层右括号，危险协议已清除）
    expect(sanitizeCssUrl('u\\72l(javascript:alert(1))')).toBe('url())');
    expect(sanitizeCssUrl('\\75\\72\\6c(javascript:alert(1))')).toBe('url())');
    // URL 内部转义冒号
    expect(sanitizeCssUrl('url(javascript\\3a alert(1))')).toBe('url())');
  });

  it('url 函数名与括号之间的注释不再绕过', () => {
    expect(sanitizeCssUrl('url/**/(javascript:alert(1))')).toBe('url())');
    expect(sanitizeCssUrl('u/**/rl(javascript:alert(1))')).toBe('url())');
  });

  it('@import/@namespace 字符串形式 URL 按协议校验', () => {
    expect(sanitizeCssUrl('@import "javascript:alert(1)"')).toBe('@import ""');
    expect(sanitizeCssUrl("@import 'data:text/css,body{}'")).toBe('@import ""');
    expect(sanitizeCssUrl('@import "https://a.com/x.css"')).toBe('@import "https://a.com/x.css"');
    expect(sanitizeCssUrl('@namespace "http://www.w3.org/1999/xhtml"')).toBe('@namespace "http://www.w3.org/1999/xhtml"');
  });

  it('image-set()/src()/image() 字符串参数按 URL 校验', () => {
    expect(sanitizeCssUrl('image-set("javascript:alert(1)" 1x, "a.png" 2x)')).toBe('image-set("" 1x, "a.png" 2x)');
    expect(sanitizeCssUrl("image-set('https://a.com/b.png' 1x)")).toBe("image-set('https://a.com/b.png' 1x)");
    // url() 形式同样生效
    expect(sanitizeCssUrl('image-set(url("javascript:alert(1)") 1x)')).toBe('image-set(url() 1x)');
    // image() 的字符串参数即 URL
    expect(sanitizeCssUrl('image("javascript:alert(1)" red)')).toBe('image("" red)');
    expect(sanitizeCssUrl('image("https://a.com/x.png" red)')).toBe('image("https://a.com/x.png" red)');
    // ximage()/my-image-set() 等前缀变体不误伤
    expect(sanitizeCssUrl('ximage("javascript:x")')).toBe('ximage("javascript:x")');
    expect(sanitizeCssUrl('my-image-set("javascript:x")')).toBe('my-image-set("javascript:x")');
  });

  it('@import 与字符串间省略空白或插入注释的写法仍被校验', () => {
    expect(sanitizeCssUrl('@import"javascript:x"')).toBe('@import ""');
    expect(sanitizeCssUrl('@import/**/"javascript:x"')).toBe('@import ""');
  });

  it('解码出的反斜杠回写为定长转义，防止输出二次分词组成新转义绕过', () => {
    expect(sanitizeCssUrl('u\\5c 72l(javascript:x)')).toBe('u\\00005c72l(javascript:x)');
  });

  it('字符串字面量内的伪 url()/@import 为文本内容，不做改写', () => {
    expect(sanitizeCssUrl('content:"url(javascript:x)"')).toBe('content:"url(javascript:x)"');
    expect(sanitizeCssUrl('content:"@import \'javascript:x\'"')).toBe('content:"@import \'javascript:x\'"');
  });

  it('解码出的引号保留转义形式，不破坏字符串边界', () => {
    // \22 后的空格为转义终止符被消费，回写为定长转义后与后续字符安全拼接
    expect(sanitizeCssUrl('content:"a\\22 b"')).toBe('content:"a\\000022b"');
  });

  it('注释优先于字符串识别，注释闭合后的 url() 仍被净化', () => {
    expect(sanitizeCssUrl('/* " */ url(javascript:x)')).toBe(' url()');
  });

  it('无引号 url() 中字面的 /* 不再截断地址', () => {
    expect(sanitizeCssUrl('url(https://a.com/a/*b/c.png)')).toBe('url(https://a.com/a/*b/c.png)');
  });

  it('字符串外的转义引号是字面字符，其后 url() 仍被净化', () => {
    expect(sanitizeCssUrl("x:\\';background:url(javascript:x)")).toBe("x:\\';background:url()");
    // \\ 配对后，其后的 ' 仍是真实字符串边界：';content:' 为字符串，url() 在串外被净化
    expect(sanitizeCssUrl("x:\\\\';content:'url(javascript:x)'")).toBe("x:\\\\';content:'url()'");
  });

  it('代理对码点按规范回退为 U+FFFD', () => {
    expect(sanitizeCssUrl('a\\d800 b')).toBe('a\ufffdb');
  });
});

describe('sanitizeCssDeclarationValue', () => {
  it('正常声明值原样返回', () => {
    expect(sanitizeCssDeclarationValue('linear-gradient(red, blue)')).toBe('linear-gradient(red, blue)');
    expect(sanitizeCssDeclarationValue('url("data:image/png;base64,AA")')).toBe('url("data:image/png;base64,AA")');
  });

  it('值内 url() 经协议净化', () => {
    expect(sanitizeCssDeclarationValue('url(javascript:x)')).toBe('url()');
    expect(sanitizeCssDeclarationValue('u\\72l(javascript:x)')).toBe('url()');
  });

  it('字符串/括号外的 ; { } 整条丢弃', () => {
    expect(sanitizeCssDeclarationValue('red;}*{display:none')).toBeNull();
    expect(sanitizeCssDeclarationValue('"a;b"')).toBe('"a;b"');
  });

  it('字符串外转义引号不能隐藏注入字符', () => {
    // \' 是字面字符而非字符串边界，其后 ; } { 均为真实分隔符
    expect(sanitizeCssDeclarationValue("\\';}body{display:none")).toBeNull();
  });

  it('转义解码出的分隔符同样按注入处理', () => {
    expect(sanitizeCssDeclarationValue('red\\3b }x{y:z')).toBeNull();
  });

  it('未闭合括号整条丢弃，防止吞掉规则闭合符', () => {
    expect(sanitizeCssDeclarationValue('url(foo')).toBeNull();
    expect(sanitizeCssDeclarationValue('calc(100% - (10px')).toBeNull();
  });

  it('< 重写为定长转义防 </style> 截断', () => {
    expect(sanitizeCssDeclarationValue('"a</style>b"')).toBe('"a\\00003c/style>b"');
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

  it('ping 属性空格分隔 URL 逐个校验，不安全地址剔除', () => {
    expect(sanitizeAttributeValue('ping', 'https://a.com/p javascript:alert(1) https://b.com/q')).toBe(
      'https://a.com/p https://b.com/q'
    );
    expect(sanitizeAttributeValue('ping', 'javascript:alert(1)')).toBeNull();
  });

  it('style 属性值内 url() 经协议净化', () => {
    expect(sanitizeAttributeValue('style', 'background:url(javascript:alert(1))')).toBe('background:url())');
    expect(sanitizeAttributeValue('style', 'color:red')).toBe('color:red');
  });

  it('普通属性原样返回', () => {
    expect(sanitizeAttributeValue('title', 'hello')).toBe('hello');
    expect(sanitizeAttributeValue('data-x', 'a;b,c:d')).toBe('a;b,c:d');
  });
});

describe('stripCssImports', () => {
  it('剔除字符串与 url() 形式的 @import 规则', () => {
    expect(stripCssImports('@import "https://a.com/x.css"; .a{color:red}')).toBe(' .a{color:red}');
    expect(stripCssImports('@import url("https://a.com/x.css") screen; .b{}')).toBe(' .b{}');
  });

  it('剔除结尾无分号的 @import 规则', () => {
    expect(stripCssImports('.a{} @import "https://a.com/x.css"')).toBe('.a{} ');
  });

  it('大小写不敏感', () => {
    expect(stripCssImports('@IMPORT "a.css";')).toBe('');
  });

  it('关键词内插转义仍被剔除', () => {
    expect(stripCssImports('@im\\70 ort "a.css";')).toBe('');
  });

  it('关键词内插注释则不构成 @import（CSS 注释是标识边界），注释归一为空白', () => {
    expect(stripCssImports('@im/**/port "a.css";')).toBe('@im port "a.css";');
    expect(stripCssImports('@import/**/"a.css"; .a{}')).toBe(' .a{}');
  });

  it('规则体内字符串与注释正确跳过，不误截分号', () => {
    expect(stripCssImports('@import "a;b.css"; .c{}')).toBe(' .c{}');
    expect(stripCssImports('@import /*x;y*/ url(a.css); .d{}')).toBe(' .d{}');
  });

  it('字符串字面量内的伪 @import 为文本内容，不删除', () => {
    expect(stripCssImports('.a{content:"@import x.css"}')).toBe('.a{content:"@import x.css"}');
  });

  it('@importx 等非 @import at-keyword 不误删', () => {
    expect(stripCssImports('@importx "a";')).toBe('@importx "a";');
  });
});
