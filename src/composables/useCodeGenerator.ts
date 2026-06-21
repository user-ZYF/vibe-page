import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCanvasStore } from '@/store/canvas';
import { generateHtml, generateCss, generateJs, generateCode } from '@/utils/codeGenerator';

/**
 * 响应式代码生成 composable
 * 监听画布元素变化，实时生成 HTML、CSS 和 JS 代码
 */
export function useCodeGenerator() {
  const canvasStore = useCanvasStore();
  const { elements } = storeToRefs(canvasStore);

  /** 生成的 HTML 代码 */
  const htmlCode = computed(() => generateHtml(elements.value));

  /** 生成的 CSS 代码 */
  const cssCode = computed(() => generateCss(elements.value));

  /** 生成的 JS 代码 */
  const jsCode = computed(() => generateJs(elements.value));

  /** 同时获取 HTML、CSS 和 JS */
  const fullCode = computed(() => generateCode(elements.value));

  return {
    htmlCode,
    cssCode,
    jsCode,
    fullCode,
  };
}
