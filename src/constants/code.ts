/** 代码块语言枚举 */
export enum CodeLanguageEnum {
  /** XML/HTML */
  XML = 1,
  /** CSS */
  CSS = 2,
}

/** 代码块语言到 highlight.js 语言名的映射 */
export const CODE_LANGUAGE_NAME_MAP: Record<CodeLanguageEnum, string> = {
  [CodeLanguageEnum.XML]: 'xml',
  [CodeLanguageEnum.CSS]: 'css',
};
