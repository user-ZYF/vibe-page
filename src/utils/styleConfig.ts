import type { StyleConfig, BackgroundItem, TextShadowItem, BoxShadowItem } from '@/views/Home/types';
import { BackgroundTypeEnum, FlexContainerEnum } from '@/constants/style';

/** 将单个背景层转换为 CSS background 分量字符串 */
function convertBackgroundItem(item: BackgroundItem): string {
  if (item.type === BackgroundTypeEnum.COLOR) {
    return item.color;
  }
  if (item.type === BackgroundTypeEnum.GRADIENT) {
    return item.gradient;
  }
  if (item.type === BackgroundTypeEnum.IMAGE) {
    return `url("${item.imageUrl}") ${item.position} / ${item.size} ${item.repeat} ${item.attachment}`;
  }
  return '';
}

/** 将单个文字阴影项转换为 CSS text-shadow 分量字符串 */
function convertTextShadowItem(item: TextShadowItem): string {
  return `${item.x}${item.xUnit} ${item.y}${item.yUnit} ${item.blur}${item.blurUnit} ${item.color}`;
}

/** 将单个盒阴影项转换为 CSS box-shadow 分量字符串 */
function convertBoxShadowItem(item: BoxShadowItem): string {
  const inset = item.inset ? 'inset ' : '';
  return `${inset}${item.x}${item.xUnit} ${item.y}${item.yUnit} ${item.blur}${item.blurUnit} ${item.spread}${item.spreadUnit} ${item.color}`;
}

/**
 * 将画布元素的 styleConfig 转换为浏览器可识别的内联 CSS 样式对象
 */
export function convertStyleConfig(styleConfig: StyleConfig): Record<string, string> {
  const { general, size, font, visual, flex } = styleConfig;
  const css: Record<string, string> = {};

  // --- general ---
  if (general.float !== undefined) css['float'] = general.float;
  if (general.display !== undefined) css['display'] = general.display;
  if (general.position !== undefined) css['position'] = general.position;
  if (general.top !== undefined && general.top !== '') css['top'] = `${general.top}${general.topUnit}`;
  if (general.right !== undefined && general.right !== '') css['right'] = `${general.right}${general.rightUnit}`;
  if (general.bottom !== undefined && general.bottom !== '') css['bottom'] = `${general.bottom}${general.bottomUnit}`;
  if (general.left !== undefined && general.left !== '') css['left'] = `${general.left}${general.leftUnit}`;

  // --- size ---
  if (size.width !== undefined && size.width !== '') css['width'] = `${size.width}${size.widthUnit}`;
  if (size.height !== undefined && size.height !== '') css['height'] = `${size.height}${size.heightUnit}`;
  if (size.maxWidth !== undefined && size.maxWidth !== '') css['maxWidth'] = `${size.maxWidth}${size.maxWidthUnit}`;
  if (size.minHeight !== undefined && size.minHeight !== '') css['minHeight'] = `${size.minHeight}${size.minHeightUnit}`;
  if (size.marginTop !== undefined) css['marginTop'] = `${size.marginTop}${size.marginTopUnit}`;
  if (size.marginRight !== undefined) css['marginRight'] = `${size.marginRight}${size.marginRightUnit}`;
  if (size.marginBottom !== undefined) css['marginBottom'] = `${size.marginBottom}${size.marginBottomUnit}`;
  if (size.marginLeft !== undefined) css['marginLeft'] = `${size.marginLeft}${size.marginLeftUnit}`;
  if (size.paddingTop !== undefined) css['paddingTop'] = `${size.paddingTop}${size.paddingTopUnit}`;
  if (size.paddingRight !== undefined) css['paddingRight'] = `${size.paddingRight}${size.paddingRightUnit}`;
  if (size.paddingBottom !== undefined) css['paddingBottom'] = `${size.paddingBottom}${size.paddingBottomUnit}`;
  if (size.paddingLeft !== undefined) css['paddingLeft'] = `${size.paddingLeft}${size.paddingLeftUnit}`;

  // --- font ---
  if (font.fontFamily) css['fontFamily'] = font.fontFamily;
  if (font.fontSize !== undefined) css['fontSize'] = `${font.fontSize}${font.fontSizeUnit}`;
  if (font.fontWeight !== undefined) css['fontWeight'] = String(font.fontWeight);
  if (font.letterSpacing !== undefined) css['letterSpacing'] = font.letterSpacing === 'normal' ? 'normal' : `${font.letterSpacing}${font.letterSpacingUnit}`;
  if (font.color !== undefined) css['color'] = font.color;
  if (font.lineHeight !== undefined) css['lineHeight'] = font.lineHeight === 'normal' ? 'normal' : `${font.lineHeight}${font.lineHeightUnit}`;
  if (font.textAlign !== undefined) css['textAlign'] = font.textAlign;
  if (font.textDecoration !== undefined) css['textDecoration'] = font.textDecoration;
  if (font.textShadows !== undefined && font.textShadows.length > 0) {
    css['textShadow'] = font.textShadows.map(convertTextShadowItem).join(', ');
  }

  // --- visual ---
  if (visual.backgrounds !== undefined && visual.backgrounds.length > 0) {
    const colorBgs = visual.backgrounds.filter((b) => b.type === BackgroundTypeEnum.COLOR);
    const imageBgs = visual.backgrounds.filter((b) => b.type !== BackgroundTypeEnum.COLOR);
    if (colorBgs.length > 0) {
      css['backgroundColor'] = colorBgs[colorBgs.length - 1].color;
    }
    if (imageBgs.length > 0) {
      css['backgroundImage'] = imageBgs.map(convertBackgroundItem).join(', ');
    }
  }
  if (visual.borderWidth !== undefined) css['borderWidth'] = `${visual.borderWidth}${visual.borderWidthUnit}`;
  if (visual.borderStyle !== undefined) css['borderStyle'] = visual.borderStyle;
  if (visual.borderColor !== undefined) css['borderColor'] = visual.borderColor;
  if (
    visual.borderRadiusTL !== undefined ||
    visual.borderRadiusTR !== undefined ||
    visual.borderRadiusBR !== undefined ||
    visual.borderRadiusBL !== undefined
  ) {
    const tl = visual.borderRadiusTL ?? 0;
    const tr = visual.borderRadiusTR ?? 0;
    const br = visual.borderRadiusBR ?? 0;
    const bl = visual.borderRadiusBL ?? 0;
    css['borderRadius'] = `${tl}${visual.borderRadiusUnit} ${tr}${visual.borderRadiusUnit} ${br}${visual.borderRadiusUnit} ${bl}${visual.borderRadiusUnit}`;
  }
  if (visual.opacity !== undefined) css['opacity'] = String(visual.opacity);
  if (visual.boxShadows !== undefined && visual.boxShadows.length > 0) {
    css['boxShadow'] = visual.boxShadows.map(convertBoxShadowItem).join(', ');
  }

  // --- flex ---
  if (flex.flexContainer === FlexContainerEnum.ENABLE) {
    css['display'] = 'flex';
    if (flex.flexDirection !== undefined) css['flexDirection'] = flex.flexDirection;
    if (flex.justifyContent !== undefined) css['justifyContent'] = flex.justifyContent;
    if (flex.alignItems !== undefined) css['alignItems'] = flex.alignItems;
  }
  if (flex.order !== undefined && flex.order !== null) css['order'] = String(flex.order);
  if (flex.flexGrow !== undefined) css['flexGrow'] = String(flex.flexGrow);
  if (flex.flexShrink !== undefined) css['flexShrink'] = String(flex.flexShrink);
  if (flex.flexBasis !== undefined) css['flexBasis'] = flex.flexBasis === 'auto' ? 'auto' : `${flex.flexBasis}${flex.flexBasisUnit}`;
  if (flex.alignSelf !== undefined) css['alignSelf'] = flex.alignSelf;

  return css;
}
