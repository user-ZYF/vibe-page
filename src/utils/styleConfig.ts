import type { StyleConfig, BackgroundItem, TextShadowItem, BoxShadowItem } from '@/views/Canvas/types';
import { BackgroundTypeEnum } from '@/constants/style';

/** 判断值是否不为 null、undefined 和空字符串 */
function isNotEmptyish<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined && value !== '';
}

/** 将单个背景层转换为 CSS background 分量字符串 */
function convertBackgroundItem(item: BackgroundItem): string {
  if (item.type === BackgroundTypeEnum.COLOR) {
    return item.color || 'revert';
  }
  if (item.type === BackgroundTypeEnum.GRADIENT) {
    return item.gradient || 'revert';
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
  if (isNotEmptyish(general.float)) css['float'] = general.float;
  if (isNotEmptyish(general.display)) css['display'] = general.display;
  if (isNotEmptyish(general.position)) css['position'] = general.position;
  if (isNotEmptyish(general.top)) css['top'] = `${general.top}${general.topUnit}`;
  if (isNotEmptyish(general.right)) css['right'] = `${general.right}${general.rightUnit}`;
  if (isNotEmptyish(general.bottom)) css['bottom'] = `${general.bottom}${general.bottomUnit}`;
  if (isNotEmptyish(general.left)) css['left'] = `${general.left}${general.leftUnit}`;
  if (isNotEmptyish(general.overflow)) css['overflow'] = general.overflow;

  // --- size ---
  if (isNotEmptyish(size.width)) css['width'] = `${size.width}${size.widthUnit}`;
  if (isNotEmptyish(size.height)) css['height'] = `${size.height}${size.heightUnit}`;
  if (isNotEmptyish(size.maxWidth)) css['maxWidth'] = `${size.maxWidth}${size.maxWidthUnit}`;
  if (isNotEmptyish(size.minHeight)) css['minHeight'] = `${size.minHeight}${size.minHeightUnit}`;
  if (isNotEmptyish(size.marginTop)) css['marginTop'] = `${size.marginTop}${size.marginTopUnit}`;
  if (isNotEmptyish(size.marginRight)) css['marginRight'] = `${size.marginRight}${size.marginRightUnit}`;
  if (isNotEmptyish(size.marginBottom)) css['marginBottom'] = `${size.marginBottom}${size.marginBottomUnit}`;
  if (isNotEmptyish(size.marginLeft)) css['marginLeft'] = `${size.marginLeft}${size.marginLeftUnit}`;
  if (isNotEmptyish(size.paddingTop)) css['paddingTop'] = `${size.paddingTop}${size.paddingTopUnit}`;
  if (isNotEmptyish(size.paddingRight)) css['paddingRight'] = `${size.paddingRight}${size.paddingRightUnit}`;
  if (isNotEmptyish(size.paddingBottom)) css['paddingBottom'] = `${size.paddingBottom}${size.paddingBottomUnit}`;
  if (isNotEmptyish(size.paddingLeft)) css['paddingLeft'] = `${size.paddingLeft}${size.paddingLeftUnit}`;

  // --- font ---
  if (font.fontFamily) css['fontFamily'] = font.fontFamily;
  if (isNotEmptyish(font.fontSize)) css['fontSize'] = `${font.fontSize}${font.fontSizeUnit}`;
  if (isNotEmptyish(font.fontWeight)) css['fontWeight'] = String(font.fontWeight);
  if (isNotEmptyish(font.letterSpacing)) css['letterSpacing'] = font.letterSpacing === 'normal' ? 'normal' : `${font.letterSpacing}${font.letterSpacingUnit}`;
  if (isNotEmptyish(font.color)) css['color'] = font.color;
  if (isNotEmptyish(font.lineHeight)) css['lineHeight'] = font.lineHeight === 'normal' ? 'normal' : `${font.lineHeight}${font.lineHeightUnit}`;
  if (isNotEmptyish(font.textAlign)) css['textAlign'] = font.textAlign;
  if (isNotEmptyish(font.textDecoration)) css['textDecoration'] = font.textDecoration;
  if (isNotEmptyish(font.textShadows) && font.textShadows.length > 0) {
    css['textShadow'] = font.textShadows.map(convertTextShadowItem).join(', ');
  }

  // --- visual ---
  if (isNotEmptyish(visual.backgrounds) && visual.backgrounds.length > 0) {
    const colorBgs = visual.backgrounds.filter((b) => b.type === BackgroundTypeEnum.COLOR);
    const imageBgs = visual.backgrounds.filter((b) => b.type !== BackgroundTypeEnum.COLOR);
    if (colorBgs.length > 0) {
      css['backgroundColor'] = colorBgs[colorBgs.length - 1].color || 'revert';
    }
    if (imageBgs.length > 0) {
      css['backgroundImage'] = imageBgs.map(convertBackgroundItem).join(', ');
    }
  }
  if (isNotEmptyish(visual.borderWidth)) css['borderWidth'] = `${visual.borderWidth}${visual.borderWidthUnit}`;
  if (isNotEmptyish(visual.borderStyle)) css['borderStyle'] = visual.borderStyle;
  if (isNotEmptyish(visual.borderColor)) css['borderColor'] = visual.borderColor;
  if (
    isNotEmptyish(visual.borderRadiusTL) ||
    isNotEmptyish(visual.borderRadiusTR) ||
    isNotEmptyish(visual.borderRadiusBR) ||
    isNotEmptyish(visual.borderRadiusBL)
  ) {
    const tl = visual.borderRadiusTL ?? 0;
    const tr = visual.borderRadiusTR ?? 0;
    const br = visual.borderRadiusBR ?? 0;
    const bl = visual.borderRadiusBL ?? 0;
    css['borderRadius'] = `${tl}${visual.borderRadiusUnit} ${tr}${visual.borderRadiusUnit} ${br}${visual.borderRadiusUnit} ${bl}${visual.borderRadiusUnit}`;
  }
  if (isNotEmptyish(visual.opacity)) css['opacity'] = String(visual.opacity);
  if (isNotEmptyish(visual.boxShadows) && visual.boxShadows.length > 0) {
    css['boxShadow'] = visual.boxShadows.map(convertBoxShadowItem).join(', ');
  }

  // --- flex ---
  if (isNotEmptyish(flex.flexDirection)) css['flexDirection'] = flex.flexDirection;
  if (isNotEmptyish(flex.justifyContent)) css['justifyContent'] = flex.justifyContent;
  if (isNotEmptyish(flex.alignItems)) css['alignItems'] = flex.alignItems;
  if (isNotEmptyish(flex.order)) css['order'] = String(flex.order);
  if (isNotEmptyish(flex.flexGrow)) css['flexGrow'] = String(flex.flexGrow);
  if (isNotEmptyish(flex.flexShrink)) css['flexShrink'] = String(flex.flexShrink);
  if (isNotEmptyish(flex.flexBasis)) css['flexBasis'] = flex.flexBasis === 'auto' ? 'auto' : `${flex.flexBasis}${flex.flexBasisUnit}`;
  if (isNotEmptyish(flex.alignSelf)) css['alignSelf'] = flex.alignSelf;

  return css;
}
