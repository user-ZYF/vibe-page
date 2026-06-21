<!-- ? 代码预览弹窗 -->
<template>
  <a-modal
    v-model:open="open"
    title="Code Preview"
    width="900px"
    :footer="null"
    wrap-class-name="code-preview-modal"
    @cancel="handleClose"
  >
    <div class="code-preview-content">
      <div class="code-preview-panel">
        <div class="code-preview-panel-header">
          <span class="code-preview-panel-title">HTML</span>
        </div>
        <pre class="code-preview-panel-body"><code class="language-html" v-html="highlightedHtml" /></pre>
      </div>
      <div class="code-preview-panel">
        <div class="code-preview-panel-header">
          <span class="code-preview-panel-title">CSS</span>
        </div>
        <pre class="code-preview-panel-body"><code class="language-css" v-html="highlightedCss" /></pre>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import 'highlight.js/styles/github.css'

defineOptions({
  name: 'CodePreviewModal',
})

hljs.registerLanguage('html', xml)
hljs.registerLanguage('css', css)

/** 弹窗开关 */
const open = defineModel<boolean>('open', { required: true })

/** 模拟 HTML 代码 */
const mockHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VibePage</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="header">
    <h1>Welcome to VibePage</h1>
    <nav>
      <a href="#">Home</a>
      <a href="#">About</a>
      <a href="#">Contact</a>
    </nav>
  </header>
  <main class="main-content">
    <section class="hero">
      <h2>Build Beautiful Pages</h2>
      <p>Create stunning web pages with our intuitive drag-and-drop editor.</p>
      <button class="btn-primary">Get Started</button>
    </section>
    <section class="features">
      <div class="feature-card">
        <h3>Drag & Drop</h3>
        <p>Intuitive visual editing experience</p>
      </div>
      <div class="feature-card">
        <h3>Responsive</h3>
        <p>Looks great on all devices</p>
      </div>
      <div class="feature-card">
        <h3>Fast Export</h3>
        <p>Export clean HTML & CSS instantly</p>
      </div>
    </section>
  </main>
  <footer class="footer">
    <p>&copy; 2024 VibePage. All rights reserved.</p>
  </footer>
</body>
</html>`

/** 模拟 CSS 代码 */
const mockCss = `/* Reset & Base */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1a1a2e;
  background-color: #f8f9fa;
  line-height: 1.6;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 48px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #6c63ff;
}

.header nav a {
  margin-left: 24px;
  text-decoration: none;
  color: #555;
  font-weight: 500;
  transition: color 0.2s ease;
}

.header nav a:hover {
  color: #6c63ff;
}

/* Hero */
.hero {
  text-align: center;
  padding: 80px 24px;
  background: linear-gradient(135deg, #6c63ff 0%, #48c6ef 100%);
  color: #ffffff;
}

.hero h2 {
  font-size: 40px;
  margin-bottom: 16px;
}

.hero p {
  font-size: 18px;
  margin-bottom: 32px;
  opacity: 0.9;
}

.btn-primary {
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  color: #6c63ff;
  background: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Features */
.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding: 64px 48px;
  max-width: 960px;
  margin: 0 auto;
}

.feature-card {
  padding: 32px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  text-align: center;
  transition: transform 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-card h3 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #1a1a2e;
}

.feature-card p {
  color: #666;
}

/* Footer */
.footer {
  text-align: center;
  padding: 24px;
  background: #1a1a2e;
  color: #aaa;
  font-size: 14px;
}`

/** 高亮后的 HTML 代码 */
const highlightedHtml = computed(() => hljs.highlight(mockHtml, { language: 'html' }).value)

/** 高亮后的 CSS 代码 */
const highlightedCss = computed(() => hljs.highlight(mockCss, { language: 'css' }).value)

/** 关闭弹窗 */
function handleClose() {
  open.value = false
}
</script>

<style lang="less" scoped>
.code-preview-content {
  display: flex;
  gap: 16px;
  height: 520px;
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
