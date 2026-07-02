<!-- ? 代码预览弹窗 -->
<template>
  <a-modal
    v-model:open="open"
    title="Code Preview"
    width="1000px"
    :footer="null"
    wrap-class-name="code-preview-modal"
    @cancel="handleClose"
  >
    <div class="code-preview-content">
      <div class="code-preview-panel">
        <div class="code-preview-panel-header">
          <span class="code-preview-panel-title">HTML</span>
          <a-button
            type="text"
            size="small"
            class="code-preview-panel-copy"
            @click="handleCopy(htmlCode)"
          >
            <template #icon><CopyOutlined /></template>
          </a-button>
        </div>
        <pre class="code-preview-panel-body"><code class="language-html" v-html="highlightedHtml"></code></pre>
      </div>
      <div class="code-preview-panel">
        <div class="code-preview-panel-header">
          <span class="code-preview-panel-title">CSS</span>
          <a-button
            type="text"
            size="small"
            class="code-preview-panel-copy"
            @click="handleCopy(cssCode)"
          >
            <template #icon><CopyOutlined /></template>
          </a-button>
        </div>
        <pre class="code-preview-panel-body"><code class="language-css" v-html="highlightedCss"></code></pre>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { message } from 'ant-design-vue'
import { CopyOutlined } from '@ant-design/icons-vue'
import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import 'highlight.js/styles/github.css'
import { useCodeGenerator } from '@/composables/useCodeGenerator'

defineOptions({
  name: 'CodePreviewModal',
})

hljs.registerLanguage('html', xml)
hljs.registerLanguage('css', css)

/** 弹窗开关 */
const open = defineModel<boolean>('open', { required: true })

const { htmlCode, cssCode } = useCodeGenerator()

/** 高亮后的 HTML 代码 */
const highlightedHtml = computed(() => hljs.highlight(htmlCode.value, { language: 'html' }).value)

/** 高亮后的 CSS 代码 */
const highlightedCss = computed(() => hljs.highlight(cssCode.value, { language: 'css' }).value)

/** 复制代码到剪贴板 */
async function handleCopy(code: string) {
  try {
    await navigator.clipboard.writeText(code)
    message.success('复制成功')
  } catch {
    message.error('复制失败')
  }
}

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
  border: 1px solid var(--app-color-border);
  border-radius: var(--app-border-radius);
  overflow: hidden;
}

.code-preview-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--app-color-bg-layout);
  border-bottom: 1px solid var(--app-color-border);
}

.code-preview-panel-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--app-color-text);
}

.code-preview-panel-copy {
  color: var(--app-color-text-tertiary);

  &:hover {
    color: var(--app-color-text);
  }
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
