/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

declare module 'postcss/lib/tokenize' {
  /** 分词单元：[类型, 原文, 起始偏移?, 结束偏移?]（符号类 token 仅含起始偏移） */
  export type CssToken = [string, string, number?, number?]
  /** CSS 分词器 */
  export interface CssTokenizer {
    /** 读取下一个 token，结束时返回 undefined */
    nextToken(): CssToken | undefined
  }
  export default function tokenize(input: { css: string; error?: (...args: unknown[]) => unknown }): CssTokenizer
}
