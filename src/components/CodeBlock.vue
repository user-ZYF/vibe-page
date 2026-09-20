<!-- ? 代码块：textarea + highlight.js 覆盖层，支持只读 / 可编辑 -->
<template>
  <div class="code-block" :class="{ 'is-readonly': !editable }">
    <me-scrollbar class="code-block-scroll">
      <div class="code-block-inner">
        <pre class="code-block-layer"><code ref="codeRef" :class="`language-${languageName}`"></code></pre>
        <textarea
          v-if="editable"
          ref="textareaRef"
          v-model="code"
          class="code-block-editor"
          :placeholder="placeholder"
          :spellcheck="false"
          @keydown="onKeydown"
        ></textarea>
      </div>
    </me-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, type PropType } from 'vue';
import hljs from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import { MeScrollbar } from '@zyf_dsb/me-ui';
import { CodeLanguageEnum, CODE_LANGUAGE_NAME_MAP } from '@/constants/code';

hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);

const props = defineProps({
  /** 语言 */
  language: {
    type: Number as PropType<CodeLanguageEnum>,
    default: CodeLanguageEnum.XML,
  },
  /** 占位提示 */
  placeholder: {
    type: String,
    default: '',
  },
  /** 是否支持编辑 */
  editable: {
    type: Boolean,
    default: true,
  },
});

/** highlight.js 语言名 */
const languageName = computed(() => CODE_LANGUAGE_NAME_MAP[props.language]);

/** 双向绑定代码内容 */
const code = defineModel<string>({ default: '' });

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const codeRef = ref<HTMLElement | null>(null);

/** 执行高亮：将代码写入 code 元素并触发 highlight.js 着色 */
function highlight() {
  if (!codeRef.value) return;
  const value = code.value;
  // 末尾补一个换行，避免最后一行无换行时高度比 textarea 短，导致滚动不同步
  const text = value.endsWith('\n') ? value : value + '\n';
  codeRef.value.innerHTML = hljs.highlight(text, { language: languageName.value }).value;
}

/** 缩进字符串 */
const INDENT = '  ';

/** 键盘事件处理：Tab 插入缩进 / Shift+Tab 减少缩进 / 多行选区整体缩进 */
function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Tab') return;
  e.preventDefault();
  const ta = textareaRef.value;
  if (!ta) return;
  const { selectionStart: start, selectionEnd: end, value } = ta;
  const shift = e.shiftKey;

  // 无选区：单点插入 / 删除缩进
  if (start === end) {
    if (shift) {
      // Shift+Tab：删除光标前的缩进
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const linePrefix = value.slice(lineStart, start);
      const trimmed = linePrefix.replace(/^( {1,2})/, '');
      if (trimmed !== linePrefix) {
        const removed = linePrefix.length - trimmed.length;
        code.value = value.slice(0, lineStart) + trimmed + value.slice(start);
        nextTick(() => textareaRef.value?.setSelectionRange(start - removed, start - removed));
      }
    } else {
      // Tab：插入缩进
      code.value = value.slice(0, start) + INDENT + value.slice(end);
      nextTick(() => textareaRef.value?.setSelectionRange(start + INDENT.length, start + INDENT.length));
    }
    return;
  }

  // 有选区：对选区涉及的每一行进行缩进 / 反向缩进
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const selected = value.slice(lineStart, end);
  const lines = selected.split('\n');

  if (shift) {
    // Shift+Tab：每行行首移除最多 2 个空格
    let totalRemoved = 0;
    const newLines = lines.map((line) => {
      const trimmed = line.replace(/^( {1,2})/, '');
      totalRemoved += line.length - trimmed.length;
      return trimmed;
    });
    const newSelected = newLines.join('\n');
    code.value = value.slice(0, lineStart) + newSelected + value.slice(end);
    nextTick(() => {
      if (!textareaRef.value) return;
      textareaRef.value.setSelectionRange(lineStart, lineStart + newSelected.length);
    });
  } else {
    // Tab：每行行首插入缩进
    const newLines = lines.map((line) => INDENT + line);
    const newSelected = newLines.join('\n');
    const added = newLines.length * INDENT.length;
    code.value = value.slice(0, lineStart) + newSelected + value.slice(end);
    nextTick(() => {
      if (!textareaRef.value) return;
      textareaRef.value.setSelectionRange(lineStart, lineStart + newSelected.length);
    });
  }
}

watch(code, () => {
  nextTick(() => {
    highlight();
  });
});

onMounted(() => {
  highlight();
});
</script>

<style lang="less" scoped>
.code-block {
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;

  &-scroll {
    height: 100%;

    // me-scrollbar 的 wrap 默认无明确高度，需显式设为 100%，子元素的百分比高度才能生效
    :deep(.me-scrollbar__wrap) {
      height: 100%;
    }

    // 让滚动视图成为 flex 容器，内部内容区可垂直撑满
    :deep(.me-scrollbar__view) {
      display: flex;
      min-height: 100%;
    }
  }

  // 滚动容器内的内容区：宽度填满视图，内容自动换行
  &-inner {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1 0 auto;
    width: 100%;
    min-height: 100%;
  }

  &-layer,
  &-editor {
    margin: 0;
    padding: 12px 14px;
    border: 1px solid transparent;
    border-radius: 6px;
    box-sizing: border-box;
    font-family: 'Fira Code', Consolas, Monaco, monospace;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: break-word;
    tab-size: 2;
  }

  // 高亮覆盖层（底层，撑开内容区高度 / 宽度）
  &-layer {
    flex: 1 0 auto;
    min-height: 100%;
    background: var(--app-color-bg-container);
    color: var(--app-color-text);
    overflow: visible;

    code {
      background: transparent;
      padding: 0;
      font-family: inherit;
    }
  }

  // textarea（上层，文字透明、光标可见）
  &-editor {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    resize: none;
    overflow: hidden;
    background: transparent;
    color: transparent;
    caret-color: var(--app-color-primary);
    outline: none;
    border-color: var(--app-color-border);

    &::placeholder {
      color: var(--app-color-text-tertiary);
    }

    &::selection {
      background: rgba(22, 119, 255, 0.25);
    }
  }

  // 只读模式：高亮层显示文字
  &.is-readonly .code-block-layer {
    color: var(--app-color-text);
  }
}
</style>

<!-- highlight.js 主题微调（全局） -->
<style lang="less">
.code-block-layer code .hljs {
  background: transparent;
  padding: 0;
}
</style>
