<!-- ? 代码编辑弹窗 -->
<template>
  <me-modal
    v-model:open="open"
    title="代码编辑"
    width="1200px"
    :footer="null"
    modal-class-name="code-edit-modal"
    @cancel="handleClose"
  >
    <div class="code-preview-content">
      <div class="code-preview-panel">
        <div class="code-preview-panel-header">
          <span class="code-preview-panel-title">HTML</span>
          <me-button
            class="code-preview-panel-copy"
            @click="handleCopy(htmlCode)"
          >
            <CopyOutlined />
          </me-button>
        </div>
        <div class="code-preview-panel-body">
          <CodeBlock v-model="htmlCode" :language="CodeLanguageEnum.XML" />
        </div>
      </div>
      <div class="code-preview-panel">
        <div class="code-preview-panel-header">
          <span class="code-preview-panel-title">CSS</span>
          <me-button
            class="code-preview-panel-copy"
            @click="handleCopy(cssCode)"
          >
            <CopyOutlined />
          </me-button>
        </div>
        <div class="code-preview-panel-body">
          <CodeBlock v-model="cssCode" :language="CodeLanguageEnum.CSS" />
        </div>
      </div>
    </div>
    <div class="code-preview-footer">
      <me-button type="primary" :disabled="!isCodeChanged" @click="handleUpdate">
        <SyncOutlined />
        更新
      </me-button>
      <me-button @click="handleExport">
        <DownloadOutlined />
        导出
      </me-button>
    </div>
  </me-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { CopyOutlined, DownloadOutlined, SyncOutlined } from '@ant-design/icons-vue'
import { MeButton, MeModal } from '@zyf_dsb/me-ui'
import CodeBlock from '@/components/CodeBlock.vue'
import { CodeLanguageEnum } from '@/constants/code'
import { useCodeGenerator } from '@/composables/useCodeGenerator'
import { useCanvasStore } from '@/store/canvas'

defineOptions({
  name: 'CodeEditModal',
})

/** 弹窗开关 */
const open = defineModel<boolean>('open', { required: true })

const canvasStore = useCanvasStore()
const { htmlCode: generatedHtml, cssCode: generatedCss } = useCodeGenerator()

/** HTML 代码（可编辑） */
const htmlCode = ref('')
/** CSS 代码（可编辑） */
const cssCode = ref('')

/** 编辑后的代码相对画布生成代码是否有改动 */
const isCodeChanged = computed(
  () => htmlCode.value !== generatedHtml.value || cssCode.value !== generatedCss.value
)

/** 弹窗打开时同步最新生成代码，作为编辑初始值 */
watch(open, (visible) => {
  if (visible) {
    htmlCode.value = generatedHtml.value
    cssCode.value = generatedCss.value
  }
})

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

/** 将编辑后的代码解析并应用到画布 */
function handleUpdate() {
  const applied = canvasStore.applyParsedCode(htmlCode.value, cssCode.value)
  if (applied) {
    message.success('已更新到画布')
    handleClose()
  } else {
    message.error('代码解析失败，请检查语法')
  }
}

/** 导出为完整 HTML 文档并触发下载 */
function handleExport() {
  // 生成的 HTML 根标签即为 <body>，直接作为文档的 body 使用，避免嵌套 body
  const doc = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>导出页面</title>
  <style>${cssCode.value}</style>
</head>
${htmlCode.value}
</html>`

  const blob = new Blob([doc], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `export-${Date.now()}.html`
  a.click()
  URL.revokeObjectURL(url)
  message.success('导出成功')
}
</script>

<style lang="less" scoped>
.code-preview-content {
  display: flex;
  gap: 16px;
  height: 680px;
}

.code-preview-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
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
  background: var(--app-color-bg-container);
  overflow: hidden;

  :deep(.code-block) {
    height: 100%;
  }
}
</style>
