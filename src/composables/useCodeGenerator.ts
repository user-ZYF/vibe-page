import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCanvasStore } from '@/store/canvas';
import { generateHtml, generateCss, generateCode } from '@/utils/code-generator';

/**
 * 响应式代码生成 composable
 * 监听画布元素变化，实时生成 HTML、CSS 和 JS 代码
 */
export function useCodeGenerator() {
  const canvasStore = useCanvasStore();
  const { root, styleRules } = storeToRefs(canvasStore);

  /** 生成的 HTML 代码 */
  const htmlCode = computed(() => generateHtml(root.value));

  /** 生成的 CSS 代码 */
  const cssCode = computed(() => generateCss(styleRules.value));

  /** 同时获取 HTML、CSS 和 JS */
  const fullCode = computed(() => generateCode(root.value, styleRules.value));

  return {
    htmlCode,
    cssCode,
    fullCode,
  };
}
