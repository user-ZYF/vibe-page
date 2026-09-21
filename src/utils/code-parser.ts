/**
 * 代码反向解析器
 * 将 HTML + CSS 代码字符串解析回画布元素树与全局 class 样式，与 `codeGenerator` 互为逆操作。
 * HTML 借助浏览器原生 DOMParser 解析，CSS 借助浏览器原生 CSSOM 解析（自动展开简写、处理嵌套 @media）。
 * 不支持的标签/选择器等静默跳过。
 */
import type {
  CanvasInnerElement,
  CanvasButtonElement,
  CanvasParagraphElement,
  CanvasImageElement,
  CanvasLinkElement,
  CanvasInputElement,
  CanvasTextareaElement,
  CanvasRadioElement,
  CanvasCheckboxElement,
  CanvasVideoElement,
  CanvasAudioElement,
  CanvasLabelElement,
  CanvasFormElement,
  CanvasSpanElement,
  CanvasTextElement,
  CanvasDivElement,
  CanvasTableDataElement,
  CanvasTableHeaderCellElement,
  CanvasTableColGroupElement,
  CanvasTableColElement,
  CanvasHeadingElement,
  CanvasGeneralElement
} from '@/views/Canvas/types'
import {
  CanvasElementTypeEnum,
  ButtonTypeEnum,
  FormMethodEnum,
  CanvasElementLabelMap,
  HeadingLevelEnum
} from '@/constants/home'
import {
  defaultClassStyleConfig,
  StyleRuleTypeEnum,
  CSS_NAME_REGEX,
} from '@/constants/style'
import { parseHtmlDocument, resolveSafeTagName, type ParsedElement } from '@/utils/html-parser'
import { BLOCKED_TAGS, TAG_TO_TYPE, LINK_TARGET_ATTR_MAP, SCOPE_ATTR_MAP } from '@/constants/html'
import { parseCss } from '@/utils/css-parser'
import { sanitizeUrl, sanitizeCssUrl, sanitizeAttributeValue } from '@/utils/sanitize'
import { generateId } from '@/utils/id'
import { styleConfigToCss, declarationWins, enumValue } from '@/utils/style-converter'
import { isParentElement, type CanvasStyleRule, type ElementClass } from '@/views/Canvas/types'

/** 根元素（body 标签）属性补丁 */
export interface ParsedRootPatch {
  /** 根元素 id（body 标签声明的 id；缺失、非法或与子元素冲突时回退为调用方传入的当前根 id） */
  id: string
  /** 根元素 class 列表 */
  classes: ElementClass[]
}

/** 代码解析结果 */
export interface ParsedCanvasData {
  /** 画布元素列表（根元素的子元素） */
  children: CanvasInnerElement[]
  /** 样式规则有序清单（按用户输入顺序，简单单层 class/id 规则可编辑，其他规则原样透传） */
  styleRules: CanvasStyleRule[]
  /** 根元素（body 标签）属性补丁；输入未携带 body 标签信息时为 null（根元素保持现状） */
  rootPatch: ParsedRootPatch | null
}

/** 简单选择器规则查找表：选择器文本（`.foo` 或 `#bar`）→ 同名选择器最后一条规则（rule.style 即合并后的全部声明） */
type SimpleRuleMap = Map<string, CanvasStyleRule>

/** 
 * 将 source 的声明按级联规则归并进 target
 * 新属性直接写入，同名属性由胜出者保留
 */
function mergeDeclarationMap(target: Record<string, string>, source: Record<string, string>) {
  Object.entries(source).forEach(([prop, fresh]) => {
    if (declarationWins(fresh, target[prop])) {
      target[prop] = fresh
    }
  })
}

/**
 * 优先级高的声明覆盖优先级低的声明（保证同名选择器中任一声明最多只出现一次）
 */
function dedupeDeclarations(
  selector: string,
  fresh: Record<string, string>,
  styleRules: CanvasStyleRule[]
) {
  for (const prev of styleRules) {
    if (prev.type !== StyleRuleTypeEnum.EDITABLE || prev.selector !== selector || !prev.style) continue
    for (const [prop, freshValue] of Object.entries(fresh)) {
      const oldValue = prev.style[prop]
      if (oldValue === undefined) continue
      if (declarationWins(freshValue, oldValue)) {
        // 旧声明被覆盖，删除旧规则中的声明
        delete prev.style[prop]
      } else {
        // !important 旧声明优先级更高，删除新规则中的声明
        delete fresh[prop]
      }
    }
  }
}

/** 净化样式声明表中的 url() 地址（就地修改，不安全协议替换为空 url()） */
function sanitizeStyleMap(style: Record<string, string>) {
  Object.keys(style).forEach((prop) => {
    style[prop] = sanitizeCssUrl(style[prop])
  })
}

/** 将行内 style 声明合并进元素 #id 的最后一条规则 */
function mergeInlineStyleIntoIdRule(
  selector: string,
  inlineStyle: Record<string, string>,
  styleRules: CanvasStyleRule[],
  ruleMap: SimpleRuleMap
) {
  if (Object.keys(inlineStyle).length === 0) return
  sanitizeStyleMap(inlineStyle)
  const idRule = ruleMap.get(selector)
  if (idRule) {
    mergeDeclarationMap(idRule.style, inlineStyle)
  } else {
    const newRule: CanvasStyleRule = { type: StyleRuleTypeEnum.EDITABLE, selector, style: { ...inlineStyle } }
    styleRules.push(newRule)
    ruleMap.set(selector, newRule)
  }
}

/** 递归收集子树内所有文本节点的文本内容（剥离生成器缩进产生的首尾空白） */
function extractText(parsed: ParsedElement): string {
  if (parsed.isText) return parsed.textContent
  return parsed.children.map(extractText).join('').trim()
}

/** 解析 input 元素的 type 属性，区分单行/单选/多选 */
function resolveInputType(attributes: Record<string, string>): CanvasElementTypeEnum {
  const type = (attributes.type || '').toLowerCase()
  if (type === 'radio') return CanvasElementTypeEnum.RADIO
  if (type === 'checkbox') return CanvasElementTypeEnum.CHECKBOX
  return CanvasElementTypeEnum.INPUT
}

/** 解析标签对应的画布元素类型：input 按 type 属性区分三态，其余标签查映射表，未知标签返回 undefined */
function resolveElementType(parsed: ParsedElement): CanvasElementTypeEnum | undefined {
  if (parsed.tagName === 'input') return resolveInputType(parsed.attributes)
  return TAG_TO_TYPE[parsed.tagName]
}

/** 净化通用元素属性表 */
function sanitizeGeneralAttributes(attributes: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {}
  Object.entries(attributes).forEach(([name, value]) => {
    const safe = sanitizeAttributeValue(name, value)
    if (safe !== null) result[name] = safe
  })
  return result
}

/** 解析元素 id：合法且未被占用时保留原 id，否则使用回退值（默认生成新 id），并登记占用 */
function resolveElementId(rawId: string, usedIds: Set<string>, fallbackId?: string): string {
  const id = CSS_NAME_REGEX.test(rawId) && !usedIds.has(rawId) ? rawId : (fallbackId ?? generateId())
  usedIds.add(id)
  return id
}

/** class 名列表转换为元素 class 配置（默认全部启用） */
function buildClasses(classes: string[]): ElementClass[] {
  return classes.map((name) => ({ name, enabled: true }))
}

/** 生成元素基础属性 */
function buildBase(parsed: ParsedElement, type: CanvasElementTypeEnum, usedIds: Set<string>) {
  return {
    // id重复或不存在时，自动生成新id
    id: resolveElementId(parsed.id, usedIds),
    type,
    classes: buildClasses(parsed.classes),
    alias: CanvasElementLabelMap[type]
  }
}

/** 解析单个 ParsedElement 为画布元素 */
function buildElement(
  parsed: ParsedElement,
  usedIds: Set<string>,
  styleRules: CanvasStyleRule[],
  ruleMap: SimpleRuleMap
): CanvasInnerElement | null {
  // 纯文本节点（无 HTML 标签，不需要 #id 规则）
  if (parsed.isText) {
    const base = buildBase(parsed, CanvasElementTypeEnum.TEXT, usedIds)
    return { ...base, text: parsed.textContent.trim() } as CanvasTextElement
  }

  const type = resolveElementType(parsed)

  if (type === undefined) {
    // style元素的内容会视为css代码的一部分，元素本身不进入画布
    if (parsed.tagName === 'style') return null
    if (BLOCKED_TAGS.has(parsed.tagName)) return null
    const base = buildBase(parsed, CanvasElementTypeEnum.GENERAL, usedIds)
    // 行内样式转移（与已知元素一致，合并进 #id 规则）
    mergeInlineStyleIntoIdRule(`#${base.id}`, parsed.style, styleRules, ruleMap)
    return {
      ...base,
      alias: parsed.tagName,
      tagName: resolveSafeTagName(parsed.tagName),
      attributes: sanitizeGeneralAttributes(parsed.attributes),
      children: buildChildren(parsed.children, usedIds, styleRules, ruleMap)
    } as CanvasGeneralElement
  }

  const base = buildBase(parsed, type, usedIds)
  const attrs = parsed.attributes

  // 行内样式转移
  mergeInlineStyleIntoIdRule(`#${base.id}`, parsed.style, styleRules, ruleMap)

  switch (type) {
    case CanvasElementTypeEnum.DIV: {
      const el = {
        ...base,
        children: buildChildren(parsed.children, usedIds, styleRules, ruleMap)
      } as CanvasDivElement
      return el
    }
    case CanvasElementTypeEnum.BUTTON: {
      const buttonType = Object.values(ButtonTypeEnum).includes(attrs.type as ButtonTypeEnum)
        ? (attrs.type as ButtonTypeEnum)
        : ButtonTypeEnum.BUTTON
      return { ...base, text: extractText(parsed), buttonType, disabled: 'disabled' in attrs } as CanvasButtonElement
    }
    case CanvasElementTypeEnum.PARAGRAPH:
      return { ...base, text: extractText(parsed) } as CanvasParagraphElement
    case CanvasElementTypeEnum.IMAGE:
      return { ...base, src: sanitizeUrl(attrs.src ?? ''), title: attrs.alt ?? '' } as CanvasImageElement
    case CanvasElementTypeEnum.LINK: {
      const el = {
        ...base,
        href: sanitizeUrl(attrs.href ?? ''),
        children: buildChildren(parsed.children, usedIds, styleRules, ruleMap)
      } as CanvasLinkElement
      const target = attrs.target ? LINK_TARGET_ATTR_MAP[attrs.target] : undefined
      if (target) el.target = target
      return el
    }
    case CanvasElementTypeEnum.INPUT:
      return {
        ...base,
        placeholder: attrs.placeholder ?? '',
        value: attrs.value ?? '',
        required: 'required' in attrs,
        disabled: 'disabled' in attrs
      } as CanvasInputElement
    case CanvasElementTypeEnum.TEXTAREA:
      return {
        ...base,
        placeholder: attrs.placeholder ?? '',
        value: extractText(parsed),
        rows: Number(attrs.rows) || undefined,
        required: 'required' in attrs,
        disabled: 'disabled' in attrs
      } as CanvasTextareaElement
    case CanvasElementTypeEnum.RADIO:
      return {
        ...base,
        name: attrs.name ?? '',
        value: attrs.value ?? '',
        checked: 'checked' in attrs,
        required: 'required' in attrs,
        disabled: 'disabled' in attrs
      } as CanvasRadioElement
    case CanvasElementTypeEnum.CHECKBOX:
      return {
        ...base,
        name: attrs.name ?? '',
        value: attrs.value ?? '',
        checked: 'checked' in attrs,
        required: 'required' in attrs,
        disabled: 'disabled' in attrs
      } as CanvasCheckboxElement
    case CanvasElementTypeEnum.VIDEO:
      return { ...base, src: sanitizeUrl(attrs.src ?? ''), controls: 'controls' in attrs } as CanvasVideoElement
    case CanvasElementTypeEnum.AUDIO:
      return { ...base, src: sanitizeUrl(attrs.src ?? ''), controls: 'controls' in attrs } as CanvasAudioElement
    case CanvasElementTypeEnum.LABEL:
      return { ...base, text: extractText(parsed), for: attrs.for } as CanvasLabelElement
    case CanvasElementTypeEnum.FORM: {
      const method = enumValue(attrs.method, FormMethodEnum) ?? FormMethodEnum.GET;
      const el = {
        ...base,
        action: sanitizeUrl(attrs.action ?? ''),
        method,
        children: buildChildren(parsed.children, usedIds, styleRules, ruleMap)
      } as CanvasFormElement
      return el
    }
    case CanvasElementTypeEnum.SPAN: {
      const el = {
        ...base,
        children: buildChildren(parsed.children, usedIds, styleRules, ruleMap)
      } as CanvasSpanElement
      return el
    }
    case CanvasElementTypeEnum.UNORDERED_LIST:
    case CanvasElementTypeEnum.ORDERED_LIST:
    case CanvasElementTypeEnum.LIST_ITEM:
    case CanvasElementTypeEnum.TABLE:
    case CanvasElementTypeEnum.TABLE_HEAD:
    case CanvasElementTypeEnum.TABLE_BODY:
    case CanvasElementTypeEnum.TABLE_FOOT:
    case CanvasElementTypeEnum.TABLE_ROW:
    case CanvasElementTypeEnum.TABLE_CAPTION:
    case CanvasElementTypeEnum.HEADER:
    case CanvasElementTypeEnum.FOOTER:
    case CanvasElementTypeEnum.ARTICLE:
    case CanvasElementTypeEnum.SECTION:
    case CanvasElementTypeEnum.ASIDE: {
      const el = {
        ...base,
        children: buildChildren(parsed.children, usedIds, styleRules, ruleMap)
      } as CanvasInnerElement
      return el
    }
    case CanvasElementTypeEnum.TABLE_DATA:
      return {
        ...base,
        colspan: Number(attrs.colspan) || undefined,
        rowspan: Number(attrs.rowspan) || undefined,
        children: buildChildren(parsed.children, usedIds, styleRules, ruleMap)
      } as CanvasTableDataElement
    case CanvasElementTypeEnum.TABLE_HEADER_CELL: {
      const el = {
        ...base,
        colspan: Number(attrs.colspan) || undefined,
        rowspan: Number(attrs.rowspan) || undefined,
        scope: SCOPE_ATTR_MAP[attrs.scope],
        children: buildChildren(parsed.children, usedIds, styleRules, ruleMap)
      } as CanvasTableHeaderCellElement
      return el
    }
    case CanvasElementTypeEnum.TABLE_COL_GROUP:
      return {
        ...base,
        span: Number(attrs.span) || undefined,
        children: buildChildren(parsed.children, usedIds, styleRules, ruleMap)
      } as CanvasTableColGroupElement
    case CanvasElementTypeEnum.TABLE_COL:
      return { ...base, span: Number(attrs.span) || undefined } as CanvasTableColElement
    case CanvasElementTypeEnum.HEADING:
      return {
        ...base,
        text: extractText(parsed),
        level: Number(parsed.tagName.slice(1)) as HeadingLevelEnum
      } as CanvasHeadingElement
    default:
      return null
  }
}

/** 递归构建子元素列表 */
function buildChildren(
  children: ParsedElement[],
  usedIds: Set<string>,
  styleRules: CanvasStyleRule[],
  ruleMap: SimpleRuleMap
): CanvasInnerElement[] {
  return children
    .map((child) => buildElement(child, usedIds, styleRules, ruleMap))
    .filter((el) => el !== null)
}

/** 收集所有元素引用的 class 名 */
function collectUsedClasses(elements: CanvasInnerElement[], used: Set<string>) {
  elements.forEach((el) => {
    el.classes.forEach((c) => used.add(c.name))
    if (isParentElement(el)) collectUsedClasses(el.children, used)
  })
}

/** 是否为简单class/id选择器 */
function isSimpleSelector(selector: string) {
  return /^([.#])([_a-zA-Z][_a-zA-Z0-9-]*)$/.test(selector);
}

/** 解析 body 标签属性为根元素补丁；body 未声明任何属性时返回 null（根元素保持现状） */
function buildRootPatch(
  body: ParsedElement,
  usedIds: Set<string>,
  styleRules: CanvasStyleRule[],
  ruleMap: SimpleRuleMap,
  fallbackId?: string
): ParsedRootPatch | null {
  const rawId = body.id
  const hasBodyInfo = Boolean(rawId) || body.classes.length > 0 || Object.keys(body.style).length > 0
  if (!hasBodyInfo) return null
  // body id 合法且不与子元素冲突时采用，否则回退到当前根 id，保证样式规则引用稳定
  const id = resolveElementId(rawId, usedIds, fallbackId)
  // 行内样式合并进根元素 #id 规则（与其他元素行为一致）
  mergeInlineStyleIntoIdRule(`#${id}`, body.style, styleRules, ruleMap)
  return { id, classes: buildClasses(body.classes) }
}

/**
 * 将 HTML + CSS 代码解析为画布数据
 * @param html HTML 字符串
 * @param css CSS 字符串
 * @param rootId 当前画布根元素 id，作为 body 标签未声明合法 id 时的回退值
 * @returns 画布元素列表、全局样式规则与根元素属性补丁
 */
export function parseCodeToCanvas(html: string, css: string, rootId?: string): ParsedCanvasData {
  // 样式规则清单：按 CSS 输入顺序排列
  const styleRules: CanvasStyleRule[] = []
  // 保存选择器的最后一次规则定义，用于解析html时注入元素的行内style声明
  const ruleMap: SimpleRuleMap = new Map()

  // 将一段 CSS 文本并入样式规则清单（style 元素内嵌样式与用户输入 CSS 共用同一管线）
  function pushCssRules(cssText: string) {
    parseCss(cssText).forEach(({ selector, style, atRuleCssText }) => {
      if (atRuleCssText) {
        styleRules.push({ type: StyleRuleTypeEnum.AT_RULE, selector: '', style: {}, atRuleCssText: sanitizeCssUrl(atRuleCssText) })
        return;
      }
      // 声明中的 url() 地址经协议校验，防止 javascript:/file: 等危险协议进入画布样式
      sanitizeStyleMap(style)
      if (isSimpleSelector(selector)) {
        // 声明覆盖
        dedupeDeclarations(selector, style, styleRules)
        const rule: CanvasStyleRule = { type: StyleRuleTypeEnum.EDITABLE, selector, style: { ...style } }
        styleRules.push(rule)
        ruleMap.set(selector, rule)
        return
      }
      // 保存样式字符串
      styleRules.push({ type: StyleRuleTypeEnum.RAW, selector, style })
    })
  }

  // 解析 HTML 并构建元素树（buildElement 会合并行内 style 到最后一条同名 #id 规则，或为新元素创建 #id 规则）
  const { body, children: parsedElements, styleBlocks } = parseHtmlDocument(html)

  // style 元素内嵌样式并入 CSS 输出，排在用户输入 CSS 之前（用户 CSS 位于其下方，级联胜出）
  styleBlocks.forEach(({ css: blockCss, media }) => {
    // media 属性剔除会破坏 @media 语法结构的字符，防止 CSS 注入逃逸
    const mediaText = media.replace(/[{};]/g, '').trim()
    pushCssRules(mediaText ? `@media ${mediaText} {\n${blockCss}\n}` : blockCss)
  })
  pushCssRules(css)
  const usedIds = new Set<string>()
  const children = buildChildren(parsedElements, usedIds, styleRules, ruleMap)

  // body 标签属性映射到根元素补丁（行内样式同样合并进根元素 #id 规则）
  const rootPatch = buildRootPatch(body, usedIds, styleRules, ruleMap, rootId)

  // 为被引用但无 CSS 规则的 class 补充空白样式配置，避免引用丢失
  const definedClassNames = new Set(
    styleRules
      .filter((r) => r.type === StyleRuleTypeEnum.EDITABLE && r.selector.startsWith('.'))
      .map((r) => r.selector.slice(1))
  )
  const usedClasses = new Set<string>()
  collectUsedClasses(children, usedClasses)
  rootPatch?.classes.forEach((c) => usedClasses.add(c.name))
  usedClasses.forEach((cls) => {
    if (!definedClassNames.has(cls) && CSS_NAME_REGEX.test(cls)) {
      styleRules.push({
        type: StyleRuleTypeEnum.EDITABLE,
        selector: `.${cls}`,
        style: styleConfigToCss(defaultClassStyleConfig, true)
      })
    }
  })

  return { children, styleRules, rootPatch }
}
