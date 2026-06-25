<!-- ? 代码预览弹窗 -->
<template>
  <a-modal
    v-model:open="open"
    title="Code Preview"
    width="1200px"
    :footer="null"
    wrap-class-name="code-preview-modal"
    @cancel="handleClose"
  >
    <div class="code-preview-content">
      <div class="code-preview-panel">
        <div class="code-preview-panel-header">
          <span class="code-preview-panel-title">HTML</span>
        </div>
        <pre class="code-preview-panel-body"><code class="language-html" v-html="highlightedHtml"></code></pre>
      </div>
      <div class="code-preview-panel">
        <div class="code-preview-panel-header">
          <span class="code-preview-panel-title">CSS</span>
        </div>
        <pre class="code-preview-panel-body"><code class="language-css" v-html="highlightedCss"></code></pre>
      </div>
      <div class="code-preview-panel">
        <div class="code-preview-panel-header">
          <span class="code-preview-panel-title">JS</span>
        </div>
        <pre class="code-preview-panel-body"><code class="language-javascript" v-html="highlightedJs"></code></pre>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/github.css'
import { useCodeGenerator } from '@/composables/useCodeGenerator'

defineOptions({
  name: 'CodePreviewModal',
})

hljs.registerLanguage('html', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('javascript', javascript)

/** 弹窗开关 */
const open = defineModel<boolean>('open', { required: true })

const { htmlCode, cssCode, jsCode } = useCodeGenerator()

/** 高亮后的 HTML 代码 */
const highlightedHtml = computed(() => hljs.highlight(htmlCode.value, { language: 'html' }).value)

/** 高亮后的 CSS 代码 */
const highlightedCss = computed(() => hljs.highlight(cssCode.value, { language: 'css' }).value)

/** 高亮后的 JS 代码 */
const highlightedJs = computed(() => {
  if (!jsCode.value) return '';
  return hljs.highlight(jsCode.value, { language: 'javascript' }).value;
})

/** 关闭弹窗 */
function handleClose() {
  open.value = false
}
</script>

<style lang="less" scoped>
.code-preview-content {
  display: flex;
  gap: 16px;
  height: 680px;
}

.code-preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.code-preview-panel-header {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
}

.code-preview-panel-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.code-preview-panel-body {
  flex: 1;
  margin: 0;
  padding: 16px;
  overflow: auto;
  font-size: 13px;
  line-height: 1.6;
  background: #ffffff;

  code {
    font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace;
  }
}
</style>
