<!-- ? 代码解析渲染示例 -->
<template>
  <div class="playground">
    <h1 class="playground-title">代码解析渲染</h1>

    <section class="playground-section">
      <h2 class="playground-section-title">HTML / CSS 代码解析渲染</h2>
      <div class="playground-section-body">
        <div class="code-parser">
          <div class="code-parser-input">
            <div class="code-parser-field">
              <label class="code-parser-label">HTML</label>
              <CodeBlock v-model="parserHtml" :language="CodeLanguageEnum.XML" />
            </div>
            <div class="code-parser-field">
              <label class="code-parser-label">CSS</label>
              <CodeBlock v-model="parserCss" :language="CodeLanguageEnum.CSS" />
            </div>
          </div>
          <div class="code-parser-output">
            <div class="code-parser-output-title">预览</div>
            <div ref="parserPreviewRef" class="code-parser-preview"></div>
          </div>
        </div>
        <p class="code-parser-error">{{ parserError }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { CODE_PARSER_SAMPLE_HTML, CODE_PARSER_SAMPLE_CSS } from '@/constants/playground';
import { CodeLanguageEnum } from '@/constants/code';
import { parseHtml } from '@/utils/html-parser';
import { parseCss } from '@/utils/css-parser';
import { renderToContainer } from './utils/code-renderer';
import CodeBlock from '@/components/CodeBlock.vue';

defineOptions({
  name: 'Playground',
});

/** 代码解析 - HTML 输入 */
const parserHtml = ref(CODE_PARSER_SAMPLE_HTML);
/** 代码解析 - CSS 输入 */
const parserCss = ref(CODE_PARSER_SAMPLE_CSS);
/** 代码解析 - 错误信息 */
const parserError = ref('');
/** 代码解析 - 预览容器 */
const parserPreviewRef = ref<HTMLElement | null>(null);
/** 代码解析 - 预览容器的 Shadow DOM 隔离环境（style 元素 + 渲染容器，用户 CSS 仅作用于预览内部） */
let parserShadowEnv: { styleEl: HTMLStyleElement; container: HTMLElement } | null = null;

/** 解析并渲染当前输入的 HTML + CSS */
function renderParsedCode() {
  const container = parserPreviewRef.value;
  if (!container) return;
  parserError.value = '';
  try {
    // 惰性创建 Shadow DOM，将用户 CSS 与应用全局样式互相隔离
    if (!parserShadowEnv) {
      const shadowRoot = container.attachShadow({ mode: 'open' });
      const styleEl = document.createElement('style');
      shadowRoot.appendChild(styleEl);
      const shadowContainer = document.createElement('div');
      shadowRoot.appendChild(shadowContainer);
      parserShadowEnv = { styleEl, container: shadowContainer };
    }
    const elements = parseHtml(parserHtml.value);
    const rules = parseCss(parserCss.value);
    renderToContainer(parserShadowEnv.container, elements, rules, parserShadowEnv.styleEl);
  } catch (err) {
    parserError.value = (err as Error).message || String(err);
  }
}

/** 防抖渲染（输入时避免频繁解析） */
const debouncedRender = useDebounceFn(renderParsedCode, 300);

onMounted(() => {
  renderParsedCode();
});

onBeforeUnmount(() => {
  /** Shadow DOM 随宿主元素销毁，仅清理引用 */
  parserShadowEnv = null;
});

watch([parserHtml, parserCss], () => {
  debouncedRender();
});
</script>

<style lang="less" scoped>
.playground {
  max-width: 1400px;
  height: 100%;
  margin: 0 auto;
  padding: 24px;
  overflow: auto;

  &-title {
    margin-bottom: 24px;
    font-size: 24px;
    font-weight: 600;
  }

  &-section {
    margin-bottom: 32px;

    &-title {
      margin-bottom: 12px;
      font-size: 18px;
      font-weight: 500;
    }

    &-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }
  }
}

.code-parser {
  display: flex;
  gap: 16px;
  width: 100%;
  align-items: stretch;

  &-input {
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex: 1;
    min-width: 0;
  }

  &-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &-label {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }

  &-output {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }

  &-output-title {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }

  &-preview {
    flex: 1;
    padding: 16px;
    border: 1px dashed #d1d5db;
    border-radius: 6px;
    background: #fff;
    overflow: auto;
    min-height: 400px;
  }

  &-error {
    margin: 0;
    font-size: 14px;
    color: #dc2626;
  }
}
</style>
