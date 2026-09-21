/**
 * StyleConfig ⇄ CSS 样式转换工具
 */
import type { StyleConfig, BackgroundItem, TextShadowItem, BoxShadowItem, CanvasStyleRule } from '@/views/Canvas/types';
import {
  StyleRuleTypeEnum,
  BackgroundTypeEnum,
  UnitEnum,
  FontWeightEnum,
  FontStyleEnum,
  TextAlignEnum,
  TextDecorationEnum,
  FloatStyleEnum,
  PositionStyleEnum,
  DisplayStyleEnum,
  OverflowStyleEnum,
  BorderCollapseEnum,
  BorderStyleEnum,
  FlexDirectionEnum,
  JustifyContentEnum,
  AlignItemsEnum,
  AlignSelfEnum,
  BackgroundRepeatEnum,
  BackgroundPositionEnum,
  BackgroundAttachmentEnum,
  BackgroundSizeEnum,
  defaultClassStyleConfig,
} from '@/constants/style';
import { sanitizeCssUrl, sanitizeUrl } from '@/utils/sanitize';
import { cloneDeep } from 'lodash';

/**
 * 判断值是否不为 null、undefined 和空字符串
 */
function isNotEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined && value !== '';
}

/**
 * 数值拼接单位，非数值直接返回
 * @example withUnit(10, 'px') → '10px'
 * @example withUnit('auto', 'px') → 'auto'（非数值值直接返回）
 * @example withUnit(0, undefined) → '0'（零值不带单位）
 * @example withUnit(10, undefined) → '10px'（非零数值无单位默认 px）
 */
function withUnit(value: number | string | null | undefined, unit: string | null | undefined): string {
  if(value === null || value === undefined){
    value = 0;
  }
  if (typeof value === 'string' && isNaN(Number(value))) return value;
  if(Number(value) === 0){
      unit = '';
  } else {
    unit = unit || UnitEnum.PX;
  }
  return `${value}${unit}`;
}

/** 
 * camelCase（驼峰） 转 kebab-case（短横线）
 * @example marginTop → margin-top
 */
function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * 判断值是在枚举范围内
 * @example enumValue('bold', FontWeightEnum) → 'bold'（若在枚举中）
 * @example enumValue('abc', FontWeightEnum) → undefined
 */
export function enumValue<T extends string>(value: string | undefined, enumObj: object): T | undefined {
  if (value === undefined) return undefined;
  const v = value.trim();
  if (!v) return undefined;
  return Object.values(enumObj).includes(v) ? (v as T) : undefined;
}

/**
 * 简写展开、值规范化、非法值丢弃、important分离
 * @example createBrowserStyle({ margin: '10px', color: 'bad-value!' }).getPropertyValue('margin-top') → '10px'
 * @example createBrowserStyle({ color: 'bad-value!' }).getPropertyValue('color') → ''（非法值被丢弃）
 */
function createBrowserStyle(declarations: Record<string, string>): CSSStyleDeclaration {
  const el = document.createElement('div');
  for (const [rawKey, rawValue] of Object.entries(declarations)) {
    // setProperty 只接受kebab-case
    const kebabKey = camelToKebab(rawKey);
    // !important会被视为非法值，需要特殊处理
    const important = /!\s*important\s*$/i.test(rawValue);
    const value = rawValue.replace(/!\s*important\s*$/i, '').trim();
    el.style.setProperty(kebabKey, value, important ? 'important' : '');
  }
  // getProperty需要传递kebab-case
  return el.style;
}

/**
 * 读取值
 * @example get(style, 'width') → '100px'
 * @example get(style, 'width') → undefined（未声明时）
 */
function get(style: CSSStyleDeclaration, prop: string): string | undefined {
  const v = style.getPropertyValue(camelToKebab(prop));
  return v.trim() || undefined;
}

/**
 * 数值单位拆分
 * @example "10px" → { value: '10', unit: 'px' }
 * @example "auto" → { value: 'auto', unit: '' }
 */
function splitValueUnit(raw: string): { value: string; unit: string } {
  const m = raw.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
  if (m) return { value: m[1], unit: m[2] };
  return { value: raw, unit: '' };
}

/**
 * 转数字
 * @example toNumber('3') → 3
 * @example toNumber('abc') → 0
 * @example toNumber(Infinity) → 0
 */
function toNumber(raw: string | undefined): number {
  if (raw === undefined) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

/**
 * 设置带单位的长度字段
 * @param style 浏览器 CSSStyleDeclaration
 * @param prop CSS 属性名（kebab-case）
 * @param target 目标对象
 * @param valueKey 值字段名
 * @param unitKey 单位字段名
 * @param isNumber 值是否为数字类型（padding 等为数字，width 等为字符串）
 * @example width='200px' → target.width='200', target.widthUnit='px'
 * @example width='auto' → target.width='auto'
 * @example paddingTop='16px'（isNumber=true）→ target.paddingTop=16, target.paddingTopUnit='px'
 */
function setLengthField<T extends object>(
  style: CSSStyleDeclaration,
  prop: string,
  target: T,
  valueKey: string,
  unitKey: string,
  isNumber = false,
) {
  const raw = get(style, prop);
  if (raw === undefined) return;
  const record = target as Record<string, string | number | UnitEnum | undefined>;
  if (raw === 'auto' || raw === 'normal') {
    record[valueKey] = isNumber ? undefined : raw;
    return;
  }
  const { value, unit } = splitValueUnit(raw);
  const unitEnum = (Object.values(UnitEnum) as string[]).includes(unit) ? (unit as UnitEnum) : undefined;
  // 非「数值 + 支持单位」的值（calc()、var()、ch 等）无法被面板表达：不写入字段，原声明保留在 rule.style 中透传
  if (!Number.isFinite(Number(value)) || (unit !== '' && unitEnum === undefined)) return;
  record[valueKey] = isNumber ? Number(value) || 0 : value;
  if (unitEnum) record[unitKey] = unitEnum;
}

/**
 * 四边长手属性取值是否一致（如 border-{side}-width）
 * 仅当四边均已声明且值相同时返回 true；不一致或仅部分声明时面板无法表达，返回 false
 */
function areBorderSidesUniform(style: CSSStyleDeclaration, suffix: string): boolean {
  const sides = ['top', 'right', 'bottom', 'left'].map((side) => get(style, `border-${side}-${suffix}`));
  return sides.every((v) => v !== undefined) && new Set(sides).size === 1;
}

/**
 * 按顶层分隔符拆分（忽略括号内的分隔符，用于 rgb()/url()/gradient() 等）
 * @example splitTopLevel('rgb(0, 0, 0) 1px 1px, rgba(255, 0, 0, .5) 2px 2px', ',') → ['rgb(0, 0, 0) 1px 1px', 'rgba(255, 0, 0, .5) 2px 2px']
 */
function splitTopLevel(s: string, sep: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    if (depth === 0 && ch === sep) {
      parts.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
}

/**
 * 按空白拆分（忽略括号内的空白，用于阴影分量提取）
 * @example splitWhitespace('2px 4px rgba(0, 0, 0, 0.5) inset') → ['2px', '4px', 'rgba(0, 0, 0, 0.5)', 'inset']
 */
function splitWhitespace(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    if (depth === 0 && /\s/.test(ch)) {
      if (cur) parts.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur) parts.push(cur);
  return parts;
}

/**
 * 从 url(...) 中提取地址
 * @example extractUrl('url("a.png")') → 'a.png'
 * @example extractUrl("url( 'b.jpg' )") → 'b.jpg'
 */
function extractUrl(layer: string): string {
  // 得到url()括号内的内容，可能包含引号
  const m = layer.match(/url\(\s*([^)]*?)\s*\)/i);
  // 去除内容的首尾空格
  const raw = (m?.[1] ?? '').trim();
  // 去掉首尾成对的引号
  return raw.replace(/^(["'])(.*)\1$/, '$2');
}

/** 
 * 将声明键（可为简写）经浏览器展开为长手属性名列表
 * @example expandLonghands('margin', '10px') → ['margin-top', 'margin-right', 'margin-bottom', 'margin-left']
 * @example expandLonghands('color', 'red') → ['color']
 */
function expandLonghands(prop: string, value: string): string[] {
  const style = createBrowserStyle({ [prop]: value });
  const longhands: string[] = [];
  for (let i = 0; i < style.length; i++) longhands.push(style[i]);
  return longhands;
}

/**
 * @example backgroundItemToCss({ type: COLOR, color: 'red' }) → 'red'
 * @example backgroundItemToCss({ type: GRADIENT, gradient: 'linear-gradient(red, blue)' }) → 'linear-gradient(red, blue)'
 * @example backgroundItemToCss({ type: IMAGE, imageUrl: 'a.png' }) → 'url("a.png")'
 */
function backgroundItemToCss(item: BackgroundItem): string {
  if (item.type === BackgroundTypeEnum.COLOR) {
    return item.color || 'revert';
  }
  if (item.type === BackgroundTypeEnum.GRADIENT) {
    return sanitizeCssUrl(item.gradient || 'none');
  }
  if (item.type === BackgroundTypeEnum.IMAGE) {
    return `url("${sanitizeUrl(item.imageUrl ?? '')}")`;
  }
  return 'none';
}

/** 
 * 文字阴影配置转 text-shadow style
 * @example textShadowItemToCss({ x: 2, xUnit: 'px', y: 4, yUnit: 'px', blur: 6, blurUnit: 'px', color: 'red' }) → '2px 4px 6px red'
 */
function textShadowItemToCss(item: TextShadowItem): string {
  const parts: string[] = [withUnit(item.x, item.xUnit), withUnit(item.y, item.yUnit)];
  if (isNotEmpty(item.blur)) parts.push(withUnit(item.blur, item.blurUnit));
  if (isNotEmpty(item.color)) parts.push(item.color);
  return parts.join(' ');
}

/**
 * @example boxShadowItemToCss({ inset: true, x: 2, xUnit: 'px', y: 4, yUnit: 'px', blur: 6, blurUnit: 'px', spread: 8, spreadUnit: 'px', color: 'red' }) → 'inset 2px 4px 6px 8px red'
 */
function boxShadowItemToCss(item: BoxShadowItem): string {
  const inset = item.inset ? 'inset ' : '';
  const parts: string[] = [withUnit(item.x, item.xUnit), withUnit(item.y, item.yUnit)];
  /** blur 是 spread 的前置位置参数：spread 有值而 blur 缺失时必须补 0 占位，否则 spread 会被解析为 blur */
  if (isNotEmpty(item.blur) || isNotEmpty(item.spread)) {
    parts.push(withUnit(item.blur, item.blurUnit));
  }
  if (isNotEmpty(item.spread)) parts.push(withUnit(item.spread, item.spreadUnit));
  if (isNotEmpty(item.color)) parts.push(item.color);
  return `${inset}${parts.join(' ')}`;
}

/**
 * styleConfig 转 style obj（key 均为长手属性，不使用简写）
 * @param kebabCase 为 true 时输出 kebab-case 键（用于写入 rule.style），默认输出 camelCase 键（内联样式对象）
 * @example styleConfigToCss(config) → { width: '100px', marginTop: '8px', color: 'rgb(255, 0, 0)' }
 * @example styleConfigToCss(config, true) → { 'width': '100px', 'margin-top': '8px' }
 */
export function styleConfigToCss(styleConfig: StyleConfig, kebabCase = false): Record<string, string> {
  const { general, size, font, visual, flex } = styleConfig;
  const css: Record<string, string> = {};

  // --- general ---
  if (isNotEmpty(general.float)) css['float'] = general.float;
  if (isNotEmpty(general.display)) css['display'] = general.display;
  if (isNotEmpty(general.position)) css['position'] = general.position;
  if (isNotEmpty(general.top)) css['top'] = withUnit(general.top, general.topUnit);
  if (isNotEmpty(general.right)) css['right'] = withUnit(general.right, general.rightUnit);
  if (isNotEmpty(general.bottom)) css['bottom'] = withUnit(general.bottom, general.bottomUnit);
  if (isNotEmpty(general.left)) css['left'] = withUnit(general.left, general.leftUnit);
  if (isNotEmpty(general.overflow)) {
    css['overflowX'] = general.overflow;
    css['overflowY'] = general.overflow;
  }
  if (isNotEmpty(general.borderCollapse)) css['borderCollapse'] = general.borderCollapse;
  if (isNotEmpty(general.zIndex)) css['zIndex'] = String(general.zIndex);

  // --- size ---
  if (isNotEmpty(size.width)) css['width'] = withUnit(size.width, size.widthUnit);
  if (isNotEmpty(size.height)) css['height'] = withUnit(size.height, size.heightUnit);
  if (isNotEmpty(size.maxWidth)) css['maxWidth'] = withUnit(size.maxWidth, size.maxWidthUnit);
  if (isNotEmpty(size.minWidth)) css['minWidth'] = withUnit(size.minWidth, size.minWidthUnit);
  if (isNotEmpty(size.maxHeight)) css['maxHeight'] = withUnit(size.maxHeight, size.maxHeightUnit);
  if (isNotEmpty(size.minHeight)) css['minHeight'] = withUnit(size.minHeight, size.minHeightUnit);
  if (isNotEmpty(size.marginTop)) css['marginTop'] = withUnit(size.marginTop, size.marginTopUnit);
  if (isNotEmpty(size.marginRight)) css['marginRight'] = withUnit(size.marginRight, size.marginRightUnit);
  if (isNotEmpty(size.marginBottom)) css['marginBottom'] = withUnit(size.marginBottom, size.marginBottomUnit);
  if (isNotEmpty(size.marginLeft)) css['marginLeft'] = withUnit(size.marginLeft, size.marginLeftUnit);
  if (isNotEmpty(size.paddingTop)) css['paddingTop'] = withUnit(size.paddingTop, size.paddingTopUnit);
  if (isNotEmpty(size.paddingRight)) css['paddingRight'] = withUnit(size.paddingRight, size.paddingRightUnit);
  if (isNotEmpty(size.paddingBottom)) css['paddingBottom'] = withUnit(size.paddingBottom, size.paddingBottomUnit);
  if (isNotEmpty(size.paddingLeft)) css['paddingLeft'] = withUnit(size.paddingLeft, size.paddingLeftUnit);

  // --- font ---
  if (font.fontFamily) css['fontFamily'] = font.fontFamily;
  if (isNotEmpty(font.fontSize)) css['fontSize'] = withUnit(font.fontSize, font.fontSizeUnit);
  if (isNotEmpty(font.fontWeight)) css['fontWeight'] = String(font.fontWeight);
  if (isNotEmpty(font.fontStyle)) css['fontStyle'] = font.fontStyle;
  if (isNotEmpty(font.letterSpacing)) css['letterSpacing'] = withUnit(font.letterSpacing, font.letterSpacingUnit);
  if (isNotEmpty(font.color)) css['color'] = font.color;
  // 行高的属性值无单位时代表相对字号
  if (isNotEmpty(font.lineHeight)) css['lineHeight'] = font.lineHeight === 'normal' ? font.lineHeight : `${font.lineHeight}${font.lineHeightUnit ?? ''}`;
  if (isNotEmpty(font.textIndent)) css['textIndent'] = withUnit(font.textIndent, font.textIndentUnit);
  if (isNotEmpty(font.textAlign)) css['textAlign'] = font.textAlign;
  if (isNotEmpty(font.textDecoration)) css['textDecorationLine'] = font.textDecoration;
  if (isNotEmpty(font.textShadows) && font.textShadows.length > 0) {
    css['textShadow'] = font.textShadows.map(textShadowItemToCss).join(', ');
  }

  // --- visual ---
  if (isNotEmpty(visual.backgrounds) && visual.backgrounds.length > 0) {
    const colorBgs = visual.backgrounds.filter((b) => b.type === BackgroundTypeEnum.COLOR);
    const imageBgs = visual.backgrounds.filter((b) => b.type !== BackgroundTypeEnum.COLOR);
    if (imageBgs.length > 0) {
      /** 各长手属性均为逗号分隔的层列表，缺省值需按层补齐以保持层对齐 */
      css['backgroundImage'] = imageBgs.map(backgroundItemToCss).join(', ');
      css['backgroundPosition'] = imageBgs.map((b) => b.position ?? 'center').join(', ');
      css['backgroundSize'] = imageBgs.map((b) => b.size ?? 'auto').join(', ');
      css['backgroundRepeat'] = imageBgs.map((b) => b.repeat ?? 'repeat').join(', ');
      css['backgroundAttachment'] = imageBgs.map((b) => b.attachment ?? 'scroll').join(', ');
    }
    if (colorBgs.length > 0) {
      css['backgroundColor'] = colorBgs[colorBgs.length - 1].color || 'revert';
    }
  }
  if (isNotEmpty(visual.borderWidth)) {
    const w = withUnit(visual.borderWidth, visual.borderWidthUnit);
    css['borderTopWidth'] = w;
    css['borderRightWidth'] = w;
    css['borderBottomWidth'] = w;
    css['borderLeftWidth'] = w;
  }
  if (isNotEmpty(visual.borderStyle)) {
    css['borderTopStyle'] = visual.borderStyle;
    css['borderRightStyle'] = visual.borderStyle;
    css['borderBottomStyle'] = visual.borderStyle;
    css['borderLeftStyle'] = visual.borderStyle;
  }
  if (isNotEmpty(visual.borderColor)) {
    css['borderTopColor'] = visual.borderColor;
    css['borderRightColor'] = visual.borderColor;
    css['borderBottomColor'] = visual.borderColor;
    css['borderLeftColor'] = visual.borderColor;
  }
  if (isNotEmpty(visual.borderRadiusTL)) css['borderTopLeftRadius'] = withUnit(visual.borderRadiusTL, visual.borderRadiusTLUnit);
  if (isNotEmpty(visual.borderRadiusTR)) css['borderTopRightRadius'] = withUnit(visual.borderRadiusTR, visual.borderRadiusTRUnit);
  if (isNotEmpty(visual.borderRadiusBR)) css['borderBottomRightRadius'] = withUnit(visual.borderRadiusBR, visual.borderRadiusBRUnit);
  if (isNotEmpty(visual.borderRadiusBL)) css['borderBottomLeftRadius'] = withUnit(visual.borderRadiusBL, visual.borderRadiusBLUnit);
  if (isNotEmpty(visual.outlineWidth)) css['outlineWidth'] = withUnit(visual.outlineWidth, visual.outlineWidthUnit);
  if (isNotEmpty(visual.outlineStyle)) css['outlineStyle'] = visual.outlineStyle;
  if (isNotEmpty(visual.outlineColor)) css['outlineColor'] = visual.outlineColor;
  if (isNotEmpty(visual.outlineOffset)) css['outlineOffset'] = withUnit(visual.outlineOffset, visual.outlineOffsetUnit);
  if (isNotEmpty(visual.opacity)) css['opacity'] = String(visual.opacity);
  if (isNotEmpty(visual.boxShadows) && visual.boxShadows.length > 0) {
    css['boxShadow'] = visual.boxShadows.map(boxShadowItemToCss).join(', ');
  }

  // --- flex ---
  if (isNotEmpty(flex.flexDirection)) css['flexDirection'] = flex.flexDirection;
  if (isNotEmpty(flex.justifyContent)) css['justifyContent'] = flex.justifyContent;
  if (isNotEmpty(flex.alignItems)) css['alignItems'] = flex.alignItems;
  if (isNotEmpty(flex.order)) css['order'] = String(flex.order);
  if (isNotEmpty(flex.flexGrow)) css['flexGrow'] = String(flex.flexGrow);
  if (isNotEmpty(flex.flexShrink)) css['flexShrink'] = String(flex.flexShrink);
  if (isNotEmpty(flex.flexBasis)) css['flexBasis'] = withUnit(flex.flexBasis, flex.flexBasisUnit);
  if (isNotEmpty(flex.alignSelf)) css['alignSelf'] = flex.alignSelf;

  return kebabCase
    ? Object.fromEntries(Object.entries(css).map(([prop, value]) => [camelToKebab(prop), value]))
    : css;
}

/**
 * 字重CSS值转 FontWeightEnum
 * @example cssToFontWeight('bold') → FontWeightEnum.BOLD
 * @example cssToFontWeight('700') → FontWeightEnum.BOLD
 * @example cssToFontWeight('abc') → undefined
 */
function cssToFontWeight(value: string | undefined): FontWeightEnum | undefined {
  if (value === undefined) return undefined;
  const v = value.trim();
  if (!v) return undefined;
  if (v === 'normal' || v === 'lighter') return FontWeightEnum.NORMAL;
  if (v === 'bold' || v === 'bolder') return FontWeightEnum.BOLD;
  const n = Number(v);
  return Object.values(FontWeightEnum).includes(n) ? n : undefined;
}

/**
 * 文本阴影CSS 转 TextShadowItem
 * @example cssToTextShadowItem('2px 4px 6px rgba(0, 0, 0, 0.5)') → { x: 2, xUnit: 'px', y: 4, yUnit: 'px', blur: 6, blurUnit: 'px', color: 'rgba(0, 0, 0, 0.5)' }
 */
function cssToTextShadowItem(raw: string): TextShadowItem {
  const tokens = splitWhitespace(raw);
  const item: TextShadowItem = {};
  const colorTokens: string[] = [];
  let lengthIdx = 0;
  tokens.forEach((tok) => {
    if (/^(-?\d*\.?\d+)([a-z%]*)$/i.test(tok)) {
      const { value, unit } = splitValueUnit(tok);
      const unitEnum = (Object.values(UnitEnum) as string[]).includes(unit) ? (unit as UnitEnum) : undefined;
      // 单位不可表达时跳过该字段（避免后续单位被withUnit替换为px）
      if (unit !== '' && unitEnum === undefined) {
        lengthIdx++;
        return;
      }
      if (lengthIdx === 0) {
        item.x = Number(value);
        if (unitEnum) item.xUnit = unitEnum;
      } else if (lengthIdx === 1) {
        item.y = Number(value);
        if (unitEnum) item.yUnit = unitEnum;
      } else if (lengthIdx === 2) {
        item.blur = Number(value);
        if (unitEnum) item.blurUnit = unitEnum;
      }
      lengthIdx++;
    } else {
      colorTokens.push(tok);
    }
  });
  if (colorTokens.length > 0) item.color = colorTokens.join(' ');
  return item;
}

/**
 * 盒阴影CSS 转 BoxShadowItem
 * @example cssToBoxShadowItem('inset 2px 4px 6px 8px rgba(0, 0, 0, 0.5)') → { inset: true, x: 2, y: 4, blur: 6, spread: 8, xUnit: 'px', ..., color: 'rgba(0, 0, 0, 0.5)' }
 */
function cssToBoxShadowItem(raw: string): BoxShadowItem {
  const tokens = splitWhitespace(raw);
  const item: BoxShadowItem = {};
  const colorTokens: string[] = [];
  let lengthIdx = 0;
  tokens.forEach((tok) => {
    if (tok.toLowerCase() === 'inset') {
      item.inset = true;
      return;
    }
    if (/^(-?\d*\.?\d+)([a-z%]*)$/i.test(tok)) {
      const { value, unit } = splitValueUnit(tok);
      const unitEnum = (Object.values(UnitEnum) as string[]).includes(unit) ? (unit as UnitEnum) : undefined;
      if (unit !== '' && unitEnum === undefined) {
        lengthIdx++;
        return;
      }
      if (lengthIdx === 0) {
        item.x = Number(value);
        if (unitEnum) item.xUnit = unitEnum;
      } else if (lengthIdx === 1) {
        item.y = Number(value);
        if (unitEnum) item.yUnit = unitEnum;
      } else if (lengthIdx === 2) {
        item.blur = Number(value);
        if (unitEnum) item.blurUnit = unitEnum;
      } else if (lengthIdx === 3) {
        item.spread = Number(value);
        if (unitEnum) item.spreadUnit = unitEnum;
      }
      lengthIdx++;
    } else {
      colorTokens.push(tok);
    }
  });
  if (colorTokens.length > 0) item.color = colorTokens.join(' ');
  return item;
}

/**
 * @example cssToBackgroundItem('url("a.png")') → { type: IMAGE, imageUrl: 'a.png' }
 * @example cssToBackgroundItem('linear-gradient(red, blue)') → { type: GRADIENT, gradient: 'linear-gradient(red, blue)' }
 * @example cssToBackgroundItem('rgb(255, 0, 0)') → { type: COLOR, color: 'rgb(255, 0, 0)' }
 * @example cssToBackgroundItem('none') → null
 */
function cssToBackgroundItem(layer: string): BackgroundItem | null {
  if (/gradient\(/i.test(layer)) {
    return { type: BackgroundTypeEnum.GRADIENT, gradient: layer };
  }
  if (/url\(/i.test(layer)) {
    return { type: BackgroundTypeEnum.IMAGE, imageUrl: extractUrl(layer) };
  }
  if (layer !== 'none' && layer !== '') {
    return { type: BackgroundTypeEnum.COLOR, color: layer };
  }
  return null;
}

/** 判断颜色值是否为全透明（alpha 为 0）：transparent、rgba/hsla 的 alpha=0、8 位 hex 末两位 00 */
function isTransparentColor(raw: string): boolean {
  const v = raw.trim().toLowerCase();
  if (v === 'transparent') return true;
  if (/^#[0-9a-f]{6}00$/.test(v) || /^#[0-9a-f]{3}0$/.test(v)) return true;
  // rgba(…, 0) / rgb(… / 0) / hsla(…, 0) / hsl(… / 0%)，兼容新旧语法与百分比
  return /(?:rgba|hsla|rgb|hsl)\([^)]*?[,/]\s*0(?:\.0*)?%?\s*\)/i.test(v);
}

/**
 * 背景css转 BackgroundItem 列表
 * @example background-image: url("a.png"), background-position: center, background-size: cover, background-repeat: no-repeat, background-color: rgb(255, 0, 0) → [{ type: IMAGE, imageUrl: 'a.png', position: 'center', size: 'cover', repeat: 'no-repeat' }, { type: COLOR, color: 'rgb(255, 0, 0)' }]
 */
function cssToBackgroundItems(style: CSSStyleDeclaration): BackgroundItem[] {
  const items: BackgroundItem[] = [];

  // 读取 background-image 长手属性，按逗号分层
  const imageRaw = get(style, 'background-image');
  if (imageRaw && imageRaw !== 'none') {
    const imageLayers = splitTopLevel(imageRaw, ',');
    // 各长手属性同样按逗号分层，按层索引对应
    const positions = get(style, 'background-position') ? splitTopLevel(get(style, 'background-position')!, ',') : [];
    const sizes = get(style, 'background-size') ? splitTopLevel(get(style, 'background-size')!, ',') : [];
    const repeats = get(style, 'background-repeat') ? splitTopLevel(get(style, 'background-repeat')!, ',') : [];
    const attachments = get(style, 'background-attachment') ? splitTopLevel(get(style, 'background-attachment')!, ',') : [];

    imageLayers.forEach((layer, idx) => {
      const item = cssToBackgroundItem(layer);
      if (!item) return;
      // position 枚举值为 'top left' 这类整串；浏览器可能序列化为相反顺序（'left top'），两种顺序都尝试匹配
      const posRaw = (positions[idx] ?? '').trim();
      if (posRaw) {
        const pos =
          enumValue<BackgroundPositionEnum>(posRaw, BackgroundPositionEnum) ??
          enumValue<BackgroundPositionEnum>(splitWhitespace(posRaw).reverse().join(' '), BackgroundPositionEnum);
        if (pos) item.position = pos;
      }
      const sizeTok = (sizes[idx] ?? '').trim();
      if (sizeTok) {
        const size = enumValue<BackgroundSizeEnum>(sizeTok, BackgroundSizeEnum);
        if (size) item.size = size;
      }
      const repTok = (repeats[idx] ?? '').trim();
      if (repTok) {
        const rep = enumValue<BackgroundRepeatEnum>(repTok, BackgroundRepeatEnum);
        if (rep) item.repeat = rep;
      }
      const attTok = (attachments[idx] ?? '').trim();
      if (attTok) {
        const att = enumValue<BackgroundAttachmentEnum>(attTok, BackgroundAttachmentEnum);
        if (att) item.attachment = att;
      }
      items.push(item);
    });
  }

  // 纯色层：background-color 长手属性（全透明等价于无背景色，不产出 COLOR 项）
  const colorRaw = get(style, 'background-color');
  if (colorRaw && !isTransparentColor(colorRaw)) {
    items.push({ type: BackgroundTypeEnum.COLOR, color: colorRaw });
  }

  return items;
}

/**
 * styleObj 转 StyleConfig
 * @param declarations 键为 CSS 属性名（kebab-case 或 camelCase），值为 CSS 字符串（可含简写与 !important）
 * @example cssToStyleConfig({ width: '100px', 'margin-top': '8px' }) → config.size.width='100'、config.size.widthUnit='px'、config.size.marginTop='8'、config.size.marginTopUnit='px'
 * @example cssToStyleConfig({ margin: '10px 20px' }) → 浏览器展开简写后，config.size.marginTop='10'、config.size.marginLeft='20'
 */
export function cssToStyleConfig(declarations: Record<string, string>): StyleConfig {
  const style = createBrowserStyle(declarations);

  const config = cloneDeep(defaultClassStyleConfig);
  const { general, size, font, visual, flex } = config;

  // --- general ---
  general.float = enumValue<FloatStyleEnum>(get(style, 'float'), FloatStyleEnum);
  general.display = enumValue<DisplayStyleEnum>(get(style, 'display'), DisplayStyleEnum);
  general.position = enumValue<PositionStyleEnum>(get(style, 'position'), PositionStyleEnum);
  setLengthField(style, 'top', general, 'top', 'topUnit');
  setLengthField(style, 'right', general, 'right', 'rightUnit');
  setLengthField(style, 'bottom', general, 'bottom', 'bottomUnit');
  setLengthField(style, 'left', general, 'left', 'leftUnit');
  const overflowXRaw = get(style, 'overflow-x');
  const overflowYRaw = get(style, 'overflow-y');
  // 两轴取值不一致时面板无法表达：不写入，原声明保留在 rule.style 中透传
  if (overflowXRaw === undefined || overflowYRaw === undefined || overflowXRaw === overflowYRaw) {
    general.overflow = enumValue<OverflowStyleEnum>(overflowXRaw ?? overflowYRaw, OverflowStyleEnum);
  }
  general.borderCollapse = enumValue<BorderCollapseEnum>(get(style, 'border-collapse'), BorderCollapseEnum);
  const zIndexRaw = get(style, 'z-index');
  // auto 等非数值不写入（toNumber 会将其扭曲为 0），原声明保留在 rule.style 中透传
  if (zIndexRaw !== undefined && Number.isFinite(Number(zIndexRaw))) general.zIndex = toNumber(zIndexRaw);

  // --- size ---
  setLengthField(style, 'width', size, 'width', 'widthUnit');
  setLengthField(style, 'height', size, 'height', 'heightUnit');
  setLengthField(style, 'max-width', size, 'maxWidth', 'maxWidthUnit');
  setLengthField(style, 'min-width', size, 'minWidth', 'minWidthUnit');
  setLengthField(style, 'max-height', size, 'maxHeight', 'maxHeightUnit');
  setLengthField(style, 'min-height', size, 'minHeight', 'minHeightUnit');
  // margin/padding：浏览器已将简写展开为四边长手属性
  setLengthField(style, 'margin-top', size, 'marginTop', 'marginTopUnit');
  setLengthField(style, 'margin-right', size, 'marginRight', 'marginRightUnit');
  setLengthField(style, 'margin-bottom', size, 'marginBottom', 'marginBottomUnit');
  setLengthField(style, 'margin-left', size, 'marginLeft', 'marginLeftUnit');
  setLengthField(style, 'padding-top', size, 'paddingTop', 'paddingTopUnit', true);
  setLengthField(style, 'padding-right', size, 'paddingRight', 'paddingRightUnit', true);
  setLengthField(style, 'padding-bottom', size, 'paddingBottom', 'paddingBottomUnit', true);
  setLengthField(style, 'padding-left', size, 'paddingLeft', 'paddingLeftUnit', true);

  // --- font ---
  const fontFamilyRaw = get(style, 'font-family');
  if (fontFamilyRaw !== undefined) font.fontFamily = fontFamilyRaw;
  setLengthField(style, 'font-size', font, 'fontSize', 'fontSizeUnit', true);
  font.fontWeight = cssToFontWeight(get(style, 'font-weight'));
  font.fontStyle = enumValue<FontStyleEnum>(get(style, 'font-style'), FontStyleEnum);
  setLengthField(style, 'letter-spacing', font, 'letterSpacing', 'letterSpacingUnit');
  const colorRaw = get(style, 'color');
  if (colorRaw !== undefined) font.color = colorRaw;
  setLengthField(style, 'line-height', font, 'lineHeight', 'lineHeightUnit');
  setLengthField(style, 'text-indent', font, 'textIndent', 'textIndentUnit');
  font.textAlign = enumValue<TextAlignEnum>(get(style, 'text-align'), TextAlignEnum);
  font.textDecoration = enumValue<TextDecorationEnum>(get(style, 'text-decoration-line'), TextDecorationEnum);
  const textShadowRaw = get(style, 'text-shadow');
  if (textShadowRaw !== undefined && textShadowRaw !== 'none') {
    font.textShadows = splitTopLevel(textShadowRaw, ',').map(cssToTextShadowItem);
  }

  // --- visual ---
  visual.backgrounds = cssToBackgroundItems(style);
  // border：四边取值不一致时面板无法表达，整块跳过（原声明保留在 rule.style 中透传）；一致时取 top 代表
  if (areBorderSidesUniform(style, 'width')) {
    setLengthField(style, 'border-top-width', visual, 'borderWidth', 'borderWidthUnit', true);
  }
  if (areBorderSidesUniform(style, 'style')) {
    visual.borderStyle = enumValue<BorderStyleEnum>(get(style, 'border-top-style'), BorderStyleEnum);
  }
  if (areBorderSidesUniform(style, 'color')) {
    visual.borderColor = get(style, 'border-top-color');
  }
  // border-radius：四角单位独立，分别读取；单角不可表达时仅跳过该角，原声明保留在 rule.style 中透传
  setLengthField(style, 'border-top-left-radius', visual, 'borderRadiusTL', 'borderRadiusTLUnit', true);
  setLengthField(style, 'border-top-right-radius', visual, 'borderRadiusTR', 'borderRadiusTRUnit', true);
  setLengthField(style, 'border-bottom-right-radius', visual, 'borderRadiusBR', 'borderRadiusBRUnit', true);
  setLengthField(style, 'border-bottom-left-radius', visual, 'borderRadiusBL', 'borderRadiusBLUnit', true);
  setLengthField(style, 'outline-width', visual, 'outlineWidth', 'outlineWidthUnit', true);
  visual.outlineStyle = enumValue<BorderStyleEnum>(get(style, 'outline-style'), BorderStyleEnum);
  const outlineColorRaw = get(style, 'outline-color');
  if (outlineColorRaw !== undefined) visual.outlineColor = outlineColorRaw;
  setLengthField(style, 'outline-offset', visual, 'outlineOffset', 'outlineOffsetUnit', true);
  const opacityRaw = get(style, 'opacity');
  if (opacityRaw !== undefined) visual.opacity = toNumber(opacityRaw);
  const boxShadowRaw = get(style, 'box-shadow');
  if (boxShadowRaw !== undefined && boxShadowRaw !== 'none') {
    visual.boxShadows = splitTopLevel(boxShadowRaw, ',').map(cssToBoxShadowItem);
  }

  // --- flex ---
  flex.flexDirection = enumValue<FlexDirectionEnum>(get(style, 'flex-direction'), FlexDirectionEnum);
  flex.justifyContent = enumValue<JustifyContentEnum>(get(style, 'justify-content'), JustifyContentEnum);
  flex.alignItems = enumValue<AlignItemsEnum>(get(style, 'align-items'), AlignItemsEnum);
  const orderRaw = get(style, 'order');
  if (orderRaw !== undefined) flex.order = toNumber(orderRaw);
  const flexGrowRaw = get(style, 'flex-grow');
  if (flexGrowRaw !== undefined) flex.flexGrow = toNumber(flexGrowRaw);
  const flexShrinkRaw = get(style, 'flex-shrink');
  if (flexShrinkRaw !== undefined) flex.flexShrink = toNumber(flexShrinkRaw);
  setLengthField(style, 'flex-basis', flex, 'flexBasis', 'flexBasisUnit');
  flex.alignSelf = enumValue<AlignSelfEnum>(get(style, 'align-self'), AlignSelfEnum);

  return config;
}

/** 判断声明值是否带 !important 标记
 * @example isImportantDecl('10px !important') → true
 * @example isImportantDecl('10px') → false
 */
export function isImportantDecl(value?: string): boolean {
  if(!value){
    return false;
  }
  return /!\s*important\s*$/i.test(value);
}

/** 同一选择器下新声明是否覆盖旧声明（后声明覆盖前声明，旧声明为 !important 时例外） */
export function declarationWins(fresh: string, old?: string): boolean {
  return !old || isImportantDecl(fresh) || !isImportantDecl(old);
}

/** 
 * 合并声明，尊重优先级
 * @example [{margin:'0'}, {color:'red', margin:'5px'}] → {margin:'5px', color:'red'}
 * @example [{margin:'0 !important'}, {margin:'5px'}] → {margin:'0 !important'}
 */
export function mergeDeclarations(rules: CanvasStyleRule[]): Record<string, string> {
  const style: Record<string, string> = {};
  rules.forEach((rule) => {
    Object.entries(rule.style).forEach(([prop, value]) => {
      const old = style[prop];
      if (declarationWins(value, old)) {
        style[prop] = value;
      }
    });
  });
  return style;
}

/** 
 * 简写声明展开，值规范化
 * @example expandDeclaration('margin', '10px 20px') → { 'margin-top': '10px', 'margin-right': '20px', ... }
 */
function expandDeclaration(prop: string, value: string): Record<string, string> {
  const style = createBrowserStyle({ [prop]: value });
  const out: Record<string, string> = {};
  for (let i = 0; i < style.length; i++) {
    // 已为 kebab 键名
    const prop = style[i];
    out[prop] = get(style, prop)!;
  }
  return out;
}

/**
 * 从规则集合中删除指定长属性声明（rule.style 契约上只存 longhand，直接按键删除）
 * @returns 被删除的声明中是否存在 !important
 */
function removeLonghandsFromRules(rules: CanvasStyleRule[], longhands: string[]): boolean {
  let hadImportant = false;
  rules.forEach((rule) => {
    const style = rule.style;
    if (!style) return;
    longhands.forEach((prop) => {
      const value = style[prop];
      if (value === undefined) return;
      delete style[prop];
      if (isImportantDecl(value)) hadImportant = true;
    });
  });
  return hadImportant;
}

/**
 * 同步新旧styleConfig差异到style obj中
 * @example prev={color:'red'}，next={color:'blue'} → 含 color 的规则原位更新为 color:'blue'（无则写入最后一条同名规则）
 */
export function syncStyleConfigToRules(
  rules: CanvasStyleRule[],
  selector: string,
  prev: Record<string, string>,
  next: Record<string, string>,
) {
  const sameRules = rules.filter((r) => r.type === StyleRuleTypeEnum.EDITABLE && r.selector === selector);
  const lastRule = sameRules[sameRules.length - 1];
  if (!lastRule) return;

  // 本次删除的样式，从所有同名规则中抽离
  Object.keys(prev).forEach((key) => {
    if (key in next) return;
    removeLonghandsFromRules(sameRules, expandLonghands(key, prev[key]));
  });

  // 新增/修改的声明：已有声明的规则原地更新，否则写入一条
  Object.keys(next).forEach((camel) => {
    if (prev[camel] === next[camel]) return;
    const expanded = expandDeclaration(camelToKebab(camel), next[camel]);
    Object.entries(expanded).forEach(([prop, value]) => {
      const targetRule = sameRules.find((rule) => rule.style[prop] !== undefined);
      const writeRule = targetRule || lastRule;
      const keepImportant = targetRule ? isImportantDecl(targetRule.style[prop]) : false;
      writeRule.style[prop] = keepImportant ? `${value} !important` : value;
    });
  });
}
