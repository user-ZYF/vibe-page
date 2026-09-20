import { describe, it, expect } from 'vitest';
import {
  styleConfigToCss,
  cssToStyleConfig,
  declarationWins,
  isImportantDecl,
  mergeDeclarations,
} from '@/utils/style-converter';
import { StyleRuleTypeEnum, UnitEnum } from '@/constants/style';
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
