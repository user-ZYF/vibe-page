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
  css['float'] = general.float;
  css['display'] = general.display;
  css['position'] = general.position;
  if (general.top !== '') css['top'] = `${general.top}${general.topUnit}`;
  if (general.right !== '') css['right'] = `${general.right}${general.rightUnit}`;
  if (general.bottom !== '') css['bottom'] = `${general.bottom}${general.bottomUnit}`;
  if (general.left !== '') css['left'] = `${general.left}${general.leftUnit}`;

  // --- size ---
  if (size.width !== '') css['width'] = `${size.width}${size.widthUnit}`;
  if (size.height !== '') css['height'] = `${size.height}${size.heightUnit}`;
  if (size.maxWidth !== '') css['maxWidth'] = `${size.maxWidth}${size.maxWidthUnit}`;
  if (size.minHeight !== '') css['minHeight'] = `${size.minHeight}${size.minHeightUnit}`;
  css['marginTop'] = `${size.marginTop}${size.marginTopUnit}`;
  css['marginRight'] = `${size.marginRight}${size.marginRightUnit}`;
  css['marginBottom'] = `${size.marginBottom}${size.marginBottomUnit}`;
  css['marginLeft'] = `${size.marginLeft}${size.marginLeftUnit}`;
  css['paddingTop'] = `${size.paddingTop}${size.paddingTopUnit}`;
  css['paddingRight'] = `${size.paddingRight}${size.paddingRightUnit}`;
  css['paddingBottom'] = `${size.paddingBottom}${size.paddingBottomUnit}`;
  css['paddingLeft'] = `${size.paddingLeft}${size.paddingLeftUnit}`;

  // --- font ---
  if (font.fontFamily) css['fontFamily'] = font.fontFamily;
  css['fontSize'] = `${font.fontSize}${font.fontSizeUnit}`;
  css['fontWeight'] = String(font.fontWeight);
  css['letterSpacing'] = font.letterSpacing === 'normal' ? 'normal' : `${font.letterSpacing}${font.letterSpacingUnit}`;
  css['color'] = font.color;
  css['lineHeight'] = font.lineHeight === 'normal' ? 'normal' : `${font.lineHeight}${font.lineHeightUnit}`;
  css['textAlign'] = font.textAlign;
  css['textDecoration'] = font.textDecoration;
  if (font.textShadows.length > 0) {
    css['textShadow'] = font.textShadows.map(convertTextShadowItem).join(', ');
  }

  // --- visual ---
  if (visual.backgrounds.length > 0) {
    const colorBgs = visual.backgrounds.filter((b) => b.type === BackgroundTypeEnum.COLOR);
    const imageBgs = visual.backgrounds.filter((b) => b.type !== BackgroundTypeEnum.COLOR);
    if (colorBgs.length > 0) {
      css['backgroundColor'] = colorBgs[colorBgs.length - 1].color;
    }
    if (imageBgs.length > 0) {
      css['backgroundImage'] = imageBgs.map(convertBackgroundItem).join(', ');
    }
  }
  css['borderWidth'] = `${visual.borderWidth}${visual.borderWidthUnit}`;
  css['borderStyle'] = visual.borderStyle;
  css['borderColor'] = visual.borderColor;
  css['borderRadius'] = `${visual.borderRadiusTL}${visual.borderRadiusUnit} ${visual.borderRadiusTR}${visual.borderRadiusUnit} ${visual.borderRadiusBR}${visual.borderRadiusUnit} ${visual.borderRadiusBL}${visual.borderRadiusUnit}`;
  css['opacity'] = String(visual.opacity);
  if (visual.boxShadows.length > 0) {
    css['boxShadow'] = visual.boxShadows.map(convertBoxShadowItem).join(', ');
  }

  // --- flex ---
  if (flex.flexContainer === FlexContainerEnum.ENABLE) {
    css['display'] = 'flex';
    css['flexDirection'] = flex.flexDirection;
    css['justifyContent'] = flex.justifyContent;
    css['alignItems'] = flex.alignItems;
  }
  if (flex.order !== null) css['order'] = String(flex.order);
  css['flexGrow'] = String(flex.flexGrow);
  css['flexShrink'] = String(flex.flexShrink);
  css['flexBasis'] = flex.flexBasis === 'auto' ? 'auto' : `${flex.flexBasis}${flex.flexBasisUnit}`;
  css['alignSelf'] = flex.alignSelf;

  return css;
}
