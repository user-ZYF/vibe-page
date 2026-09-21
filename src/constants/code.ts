import type { LanguageSupport } from '@codemirror/language';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';

/** 代码块语言枚举 */
export enum CodeLanguageEnum {
  /** XML/HTML */
  XML = 1,
  /** CSS */
  CSS = 2,
}

/** 代码块语言到 CodeMirror 语言扩展的映射 */
export const CODE_LANGUAGE_MAP: Record<CodeLanguageEnum, () => LanguageSupport> = {
  [CodeLanguageEnum.XML]: html,
  [CodeLanguageEnum.CSS]: css,
};
