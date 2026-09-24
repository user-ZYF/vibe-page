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
            <iframe ref="parserPreviewRef" class="code-parser-preview" sandbox="allow-same-origin" title="代码解析预览"></iframe>
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
/** 代码解析 - 预览 iframe（sandbox 隔离：用户代码不可执行脚本、不可导航顶层页面，CSS 不影响宿主应用） */
const parserPreviewRef = ref<HTMLIFrameElement | null>(null);
/** 预览 iframe 内注入样式的 style 元素（惰性创建，随 iframe 文档生命周期存在） */
let parserStyleEl: HTMLStyleElement | null = null;

/** 解析并渲染当前输入的 HTML + CSS */
function renderParsedCode() {
  const doc = parserPreviewRef.value?.contentDocument;
  if (!doc?.body) return;
  parserError.value = '';
  try {
    // 惰性创建 style 元素，将用户 CSS 与宿主应用样式互相隔离
    if (!parserStyleEl) {
      parserStyleEl = doc.createElement('style');
      doc.head.appendChild(parserStyleEl);
      // iframe 文档仅有浏览器默认 margin，补齐与原预览容器一致的留白
      doc.body.style.margin = '0';
      doc.body.style.padding = '16px';
    }
    const elements = parseHtml(parserHtml.value);
    const rules = parseCss(parserCss.value);
    renderToContainer(doc.body, elements, rules, parserStyleEl);
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
  /** iframe 随宿主元素销毁，仅清理引用 */
  parserStyleEl = null;
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
    border: 1px dashed #d1d5db;
    border-radius: 6px;
    background: #fff;
    min-height: 400px;
  }

  &-error {
    margin: 0;
    font-size: 14px;
    color: #dc2626;
  }
}
</style>
