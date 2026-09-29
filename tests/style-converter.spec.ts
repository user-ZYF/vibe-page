import { describe, it, expect } from 'vitest';
import {
  styleConfigToCss,
  cssToStyleConfig,
  declarationWins,
  isImportantDecl,
  mergeDeclarations,
  hasBackgroundContent,
} from '@/utils/style-converter';
import { BackgroundTypeEnum, StyleRuleTypeEnum, UnitEnum } from '@/constants/style';
import type { CanvasStyleRule, StyleConfig } from '@/views/Canvas/types';

/** 构造空白样式配置 */
function emptyConfig(): StyleConfig {
  return {
    general: {},
    size: {},
    font: { textShadows: [] },
    visual: { backgrounds: [], boxShadows: [] },
    flex: {},
  };
}

describe('styleConfigToCss', () => {
  it('数值与单位拼接，缺省单位补 px', () => {
    const config = emptyConfig();
    config.size.width = '100';
    config.size.widthUnit = UnitEnum.PX;
    config.size.height = '50';
    const css = styleConfigToCss(config);
    expect(css.width).toBe('100px');
    expect(css.height).toBe('50px');
  });

  it('kebabCase 模式输出短横线键名', () => {
    const config = emptyConfig();
    config.size.marginTop = '8';
    config.size.marginTopUnit = UnitEnum.PX;
    const css = styleConfigToCss(config, true);
    expect(css['margin-top']).toBe('8px');
    expect(css.marginTop).toBeUndefined();
  });

  it('零值不带单位', () => {
    const config = emptyConfig();
    config.size.paddingTop = 0;
    expect(styleConfigToCss(config).paddingTop).toBe('0');
  });

  it('无内容的占位背景层不产出声明', () => {
    const config = emptyConfig();
    config.visual.backgrounds = [{}];
    const css = styleConfigToCss(config);
    expect(css.backgroundImage).toBeUndefined();
    expect(css.backgroundColor).toBeUndefined();
  });

  it('已选类型但未填内容的背景层不产出声明', () => {
    const config = emptyConfig();
    config.visual.backgrounds = [
      { type: BackgroundTypeEnum.COLOR },
      { type: BackgroundTypeEnum.IMAGE },
      { type: BackgroundTypeEnum.GRADIENT },
    ];
    const css = styleConfigToCss(config);
    expect(css.backgroundImage).toBeUndefined();
    expect(css.backgroundColor).toBeUndefined();
  });

  it('占位层不影响有内容层的序列化', () => {
    const config = emptyConfig();
    config.visual.backgrounds = [{}, { type: BackgroundTypeEnum.COLOR, color: '#ff0000' }];
    const css = styleConfigToCss(config);
    expect(css.backgroundColor).toBe('#ff0000');
    expect(css.backgroundImage).toBeUndefined();
  });

  it('图片地址正常输出为 url("...")', () => {
    const config = emptyConfig();
    config.visual.backgrounds = [{ type: BackgroundTypeEnum.IMAGE, imageUrl: 'https://a.com/x.png' }];
    const css = styleConfigToCss(config);
    expect(css.backgroundImage).toBe('url("https://a.com/x.png")');
  });

  it('图片地址含破坏字符串边界的字符时输出 none', () => {
    const config = emptyConfig();
    config.visual.backgrounds = [{ type: BackgroundTypeEnum.IMAGE, imageUrl: 'a"b.png' }];
    const css = styleConfigToCss(config);
    expect(css.backgroundImage).toBe('none');
  });

  it('渐变层仅允许渐变函数/var()，url()/image-set()/paint() 等写法输出 none', () => {
    const config = emptyConfig();
    config.visual.backgrounds = [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'url("https://a.com/x.png")' }];
    expect(styleConfigToCss(config).backgroundImage).toBe('none');
    config.visual.backgrounds = [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'image-set("https://a.com/x.png" 1x)' }];
    expect(styleConfigToCss(config).backgroundImage).toBe('none');
    config.visual.backgrounds = [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'cross-fade(url("a.png"), linear-gradient(red, blue))' }];
    expect(styleConfigToCss(config).backgroundImage).toBe('none');
    config.visual.backgrounds = [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'paint(foo)' }];
    expect(styleConfigToCss(config).backgroundImage).toBe('none');
  });

  it('渐变函数与 var() 正常输出', () => {
    const config = emptyConfig();
    config.visual.backgrounds = [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'linear-gradient(red, blue)' }];
    expect(styleConfigToCss(config).backgroundImage).toBe('linear-gradient(red, blue)');
    config.visual.backgrounds = [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'repeating-conic-gradient(red 0% 25%, blue 0% 50%)' }];
    expect(styleConfigToCss(config).backgroundImage).toBe('repeating-conic-gradient(red 0% 25%, blue 0% 50%)');
    config.visual.backgrounds = [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'var(--my-grad)' }];
    expect(styleConfigToCss(config).backgroundImage).toBe('var(--my-grad)');
  });

  it('纯色层夹带请求类函数时输出 revert，正常颜色不受影响', () => {
    const config = emptyConfig();
    config.visual.backgrounds = [{ type: BackgroundTypeEnum.COLOR, color: 'paint(foo)' }];
    expect(styleConfigToCss(config).backgroundColor).toBe('revert');
    config.visual.backgrounds = [{ type: BackgroundTypeEnum.COLOR, color: 'element(#x)' }];
    expect(styleConfigToCss(config).backgroundColor).toBe('revert');
    config.visual.backgrounds = [{ type: BackgroundTypeEnum.COLOR, color: 'rgb(1, 2, 3)' }];
    expect(styleConfigToCss(config).backgroundColor).toBe('rgb(1, 2, 3)');
  });
});

describe('hasBackgroundContent', () => {
  it('未选类型或未填内容的层视为无内容', () => {
    expect(hasBackgroundContent({})).toBe(false);
    expect(hasBackgroundContent({ type: BackgroundTypeEnum.COLOR })).toBe(false);
    expect(hasBackgroundContent({ type: BackgroundTypeEnum.IMAGE })).toBe(false);
    expect(hasBackgroundContent({ type: BackgroundTypeEnum.GRADIENT, gradient: '' })).toBe(false);
  });

  it('已填内容的层视为有内容', () => {
    expect(hasBackgroundContent({ type: BackgroundTypeEnum.COLOR, color: 'red' })).toBe(true);
    expect(hasBackgroundContent({ type: BackgroundTypeEnum.IMAGE, imageUrl: 'a.png' })).toBe(true);
    expect(hasBackgroundContent({ type: BackgroundTypeEnum.GRADIENT, gradient: 'linear-gradient(red, blue)' })).toBe(true);
  });
});

describe('cssToStyleConfig', () => {
  it('长手声明映射到对应字段', () => {
    const config = cssToStyleConfig({ width: '100px', 'margin-top': '8px', color: 'red' });
    expect(config.size.width).toBe('100');
    expect(config.size.widthUnit).toBe(UnitEnum.PX);
    expect(config.size.marginTop).toBe('8');
    expect(config.size.marginTopUnit).toBe(UnitEnum.PX);
    expect(config.font.color).toBe('red');
  });

  it('简写经浏览器展开为四边长手', () => {
    const config = cssToStyleConfig({ margin: '10px 20px' });
    expect(config.size.marginTop).toBe('10');
    expect(config.size.marginRight).toBe('20');
  });

  it('面板不可表达的值跳过', () => {
    const config = cssToStyleConfig({ width: 'calc(100% - 10px)' });
    expect(config.size.width).toBeUndefined();
  });
});

describe('isImportantDecl', () => {
  it('识别 important 标记', () => {
    expect(isImportantDecl('1px !important')).toBe(true);
    expect(isImportantDecl('1px ! important')).toBe(true);
    expect(isImportantDecl('1px')).toBe(false);
    expect(isImportantDecl(undefined)).toBe(false);
  });
});

describe('declarationWins', () => {
  it('旧声明缺失时新声明胜出', () => {
    expect(declarationWins('a')).toBe(true);
  });

  it('后声明覆盖前声明', () => {
    expect(declarationWins('a', 'b')).toBe(true);
  });

  it('旧声明 important 时不被覆盖', () => {
    expect(declarationWins('a', 'b !important')).toBe(false);
  });

  it('新声明 important 时胜出', () => {
    expect(declarationWins('a !important', 'b !important')).toBe(true);
  });
});

describe('mergeDeclarations', () => {
  it('按级联合并多条规则声明', () => {
    const rules: CanvasStyleRule[] = [
      { type: StyleRuleTypeEnum.EDITABLE, selector: '.a', style: { margin: '0 !important' } },
      { type: StyleRuleTypeEnum.EDITABLE, selector: '.a', style: { margin: '5px', color: 'red' } },
    ];
    expect(mergeDeclarations(rules)).toEqual({ margin: '0 !important', color: 'red' });
  });
});
