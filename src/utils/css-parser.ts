/**
 * CSS 代码解析器
 * 创建临时 <style> 元素挂到 document.head，
 * 借助浏览器原生 CSSOM 解析 CSS，再读取 sheet.cssRules 转成与框架无关的规则对象。
 */

import type { ParsedCssRule } from "@/views/Canvas/types";


/**
 * 将 CSS 字符串解析为规则对象数组
 * @param input CSS 字符串
 * @returns 规则描述数组
 */
export function parseCss(input: string): ParsedCssRule[] {
  const el = document.createElement('style');
  el.textContent = input;
  // 必须先挂载到 head 才能拿到 sheet
  document.head.appendChild(el);
  const sheet = el.sheet;
  document.head.removeChild(el);
  if (!sheet) return [];
  return parseRuleList(sheet.cssRules);
}

/** 解析 CSSRule 列表 */
function parseRuleList(rules: CSSRuleList): ParsedCssRule[] {
  const result: ParsedCssRule[] = [];
  Array.from(rules).forEach((rule) => {
    if (rule instanceof CSSStyleRule) {
      // 处理顶级规则声明
      result.push({
        selector: rule.selectorText,
        style: parseStyleDeclarations(rule.style),
      });
    } else {
      // at-rule直接保存完整规则文本
      result.push({ selector: '', style: {}, atRuleCssText: rule.cssText });
    }
  });
  return result;
}

/** 解析样式声明为键值对对象 */
function parseStyleDeclarations(style: CSSStyleDeclaration): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < style.length; i++) {
    const prop = style[i];
    const value = style.getPropertyValue(prop);
    const important = style.getPropertyPriority(prop);
    result[prop] = important ? `${value} !${important}` : value;
  }
  return result;
}

/**
 * 将解析后的规则对象数组重新构建为 CSS 字符串
 * 用于把解析结果注入预览容器的 <style> 标签
 * @param rules 规则描述数组
 * @returns 重建后的 CSS 字符串
 */
export function buildCssString(rules: ParsedCssRule[]): string {
  return rules.map(buildRuleString).join('\n');
}

/** 构建单条规则字符串（atRuleCssText 规则已含完整文本，直接返回） */
export function buildRuleString(rule: ParsedCssRule): string {
  if (rule.atRuleCssText) return rule.atRuleCssText;
  const declarations = Object.entries(rule.style)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join('\n');
  return `${rule.selector} {\n${declarations}\n}`;
}
