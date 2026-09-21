<!-- ? 代码块 -->
<template>
  <div ref="rootRef" class="code-block">
    <div ref="editorRef" class="code-block-editor"></div>
    <div
      v-show="vScrollVisible"
      class="code-block-bar"
      :class="{ 'is-dragging': draggingAxis === 'v' }"
      @wheel.passive="onBarWheel"
    >
      <div class="code-block-thumb" :style="vThumbStyle" @mousedown="onThumbDown($event, true)"></div>
    </div>
    <div
      v-show="hScrollVisible"
      class="code-block-bar code-block-bar-horizontal"
      :class="{ 'is-dragging': draggingAxis === 'h' }"
      @wheel.passive="onBarWheel"
    >
      <div class="code-block-thumb" :style="hThumbStyle" @mousedown="onThumbDown($event, false)"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, useTemplateRef, type PropType, type StyleValue } from 'vue';
import { storeToRefs } from 'pinia';
import { minimalSetup } from 'codemirror';
import { EditorState, Compartment, type Extension } from '@codemirror/state';
import { EditorView, keymap, placeholder as cmPlaceholder, lineNumbers, highlightActiveLineGutter } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { CodeLanguageEnum, CODE_LANGUAGE_MAP } from '@/constants/code';
import { useThemeStore } from '@/store/theme';

defineOptions({
  name: 'CodeBlock',
});

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

/** 双向绑定代码内容 */
const code = defineModel<string>({ default: '' });

const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);

/** 组件根元素 */
const rootRef = useTemplateRef<HTMLElement>('rootRef');
/** 编辑器挂载容器 */
const editorRef = useTemplateRef<HTMLElement>('editorRef');
/** CodeMirror 编辑器实例 */
let view: EditorView | null = null;
/** 滚动容器尺寸监听 */
let resizeObserver: ResizeObserver | null = null;
/** 最近一次由编辑器同步到 v-model 的文档内容，用于区分内部输入与外部写入 */
let lastEmittedDoc = '';

/** 滚动条与容器边缘的间距（对齐 me-scrollbar 的 2px） */
const BAR_GAP = 2;
/** 滑块最小尺寸 */
const THUMB_MIN = 20;

/** 垂直方向是否可滚动 */
const vScrollVisible = ref(false);
/** 水平方向是否可滚动 */
const hScrollVisible = ref(false);
/** 垂直滑块样式 */
const vThumbStyle = ref<StyleValue>();
/** 水平滑块样式 */
const hThumbStyle = ref<StyleValue>();
/** 正在拖拽的滚动轴（'v' 垂直 / 'h' 水平 / '' 未拖拽） */
const draggingAxis = ref('');

/** 语言 / 高亮主题 / 可编辑性等动态配置统一放入同一 Compartment，便于整体重配置 */
const configCompartment = new Compartment();

/** 生成当前生效的动态配置扩展 */
function configExtensions(): Extension[] {
  return [
    CODE_LANGUAGE_MAP[props.language](),
    isDark.value ? githubDark : githubLight,
    EditorView.editable.of(props.editable),
    EditorState.readOnly.of(!props.editable),
    props.placeholder ? cmPlaceholder(props.placeholder) : [],
    EditorView.lineWrapping,
  ];
}

/** 更新单轴滚动条滑块尺寸与位置 */
function updateAxis(scroller: HTMLElement, isVertical: boolean) {
  const client = isVertical ? scroller.clientHeight : scroller.clientWidth;
  const scroll = isVertical ? scroller.scrollHeight : scroller.scrollWidth;
  const position = isVertical ? scroller.scrollTop : scroller.scrollLeft;
  const visible = scroll > client + 1;
  if (isVertical) {
    vScrollVisible.value = visible;
  } else {
    hScrollVisible.value = visible;
  }
  if (!visible || !rootRef.value) return;
  const track = (isVertical ? rootRef.value.clientHeight : rootRef.value.clientWidth) - BAR_GAP * 2;
  const size = Math.max((track * client) / scroll, THUMB_MIN);
  const offset = ((track - size) * position) / (scroll - client);
  if (isVertical) {
    vThumbStyle.value = { height: `${size}px`, transform: `translateY(${offset}px)` };
  } else {
    hThumbStyle.value = { width: `${size}px`, transform: `translateX(${offset}px)` };
  }
}

/** 更新自定义滚动条 */
function updateScrollbar() {
  const scroller = view?.scrollDOM;
  if (!scroller) return;
  updateAxis(scroller, true);
  updateAxis(scroller, false);
}

/** 滑块拖拽：按轨道比例映射为编辑器滚动位置 */
function onThumbDown(e: MouseEvent, isVertical: boolean) {
  const scroller = view?.scrollDOM;
  const root = rootRef.value;
  if (!scroller || !root) return;
  e.preventDefault();
  draggingAxis.value = isVertical ? 'v' : 'h';
  const startPointer = isVertical ? e.clientY : e.clientX;
  const startScroll = isVertical ? scroller.scrollTop : scroller.scrollLeft;
  const track = (isVertical ? root.clientHeight : root.clientWidth) - BAR_GAP * 2;
  const client = isVertical ? scroller.clientHeight : scroller.clientWidth;
  const scroll = isVertical ? scroller.scrollHeight : scroller.scrollWidth;
  const thumbSize = Math.max((track * client) / scroll, THUMB_MIN);
  const scale = (scroll - client) / Math.max(track - thumbSize, 1);

  const onMove = (ev: MouseEvent) => {
    const delta = (isVertical ? ev.clientY : ev.clientX) - startPointer;
    if (isVertical) {
      scroller.scrollTop = startScroll + delta * scale;
    } else {
      scroller.scrollLeft = startScroll + delta * scale;
    }
  };
  const onUp = () => {
    draggingAxis.value = '';
    document.removeEventListener('mousemove', onMove);
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp, { once: true });
}

/** 滚动条区域滚轮事件转发到编辑器滚动容器 */
function onBarWheel(e: WheelEvent) {
  const scroller = view?.scrollDOM;
  if (!scroller) return;
  scroller.scrollTop += e.deltaY;
  scroller.scrollLeft += e.deltaX;
}

onMounted(() => {
  if (!editorRef.value) return;
  view = new EditorView({
    parent: editorRef.value,
    state: EditorState.create({
      doc: code.value,
      extensions: [
        minimalSetup,
        lineNumbers(),
        highlightActiveLineGutter(),
        keymap.of([indentWithTab]),
        configCompartment.of(configExtensions()),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            lastEmittedDoc = update.state.doc.toString();
            code.value = lastEmittedDoc;
          }
          if (update.docChanged || update.geometryChanged || update.viewportChanged) {
            updateScrollbar();
          }
        }),
      ],
    }),
  });
  lastEmittedDoc = code.value;
  view.scrollDOM.addEventListener('scroll', updateScrollbar, { passive: true });
  resizeObserver = new ResizeObserver(updateScrollbar);
  resizeObserver.observe(view.scrollDOM);
  updateScrollbar();
});

/** 外部写入 v-model（如弹窗打开时注入生成代码）时同步到编辑器文档 */
watch(code, (value) => {
  if (!view || value === lastEmittedDoc) return;
  const currentDoc = view.state.doc.toString();
  lastEmittedDoc = value;
  if (value !== currentDoc) {
    view.dispatch({
      changes: { from: 0, to: currentDoc.length, insert: value },
    });
  }
});

/** 语言 / 主题 / 可编辑性变化时重配置编辑器 */
watch(
  [() => props.language, isDark, () => props.editable, () => props.placeholder],
  () => {
    view?.dispatch({
      effects: configCompartment.reconfigure(configExtensions()),
    });
  }
);

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  view?.destroy();
  view = null;
});
</script>

<style lang="less" scoped>
.code-block {
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;

  &-editor {
    height: 100%;
  }

  // 自定义滚动条轨道（复刻 me-scrollbar 样式）
  &-bar {
    position: absolute;
    z-index: 1;
    top: 2px;
    right: 2px;
    bottom: 2px;
    width: 6px;
    border-radius: 4px;
    overflow: hidden;
    opacity: 0;
    transition: opacity 0.3s ease;

    &-horizontal {
      top: auto;
      right: 2px;
      bottom: 2px;
      left: 2px;
      width: auto;
      height: 6px;
    }
  }

  &:hover &-bar,
  &-bar:hover,
  &-bar.is-dragging {
    opacity: 1;
  }

  // 自定义滚动条滑块
  &-thumb {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background-color: color-mix(in srgb, var(--me-color-info) 30%, transparent);
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: color-mix(in srgb, var(--me-color-info) 50%, transparent);
    }
  }

  :deep(.cm-editor) {
    height: 100%;
    border: 1px solid var(--app-color-border);
    border-radius: 6px;
    box-sizing: border-box;
    background-color: var(--app-color-bg-container);
    color: var(--app-color-text);
    font-size: 14px;

    &.cm-focused {
      outline: none;
      border-color: var(--app-color-primary);
    }
  }

  :deep(.cm-scroller) {
    font-family: 'Fira Code', Consolas, Monaco, monospace;
    line-height: 1.6;
    overflow: auto;
    // 隐藏原生滚动条，由自定义滚动条接管
    scrollbar-width: none;

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
  }

  :deep(.cm-gutters) {
    background-color: var(--app-color-bg-container);
    color: var(--app-color-text-tertiary);
    border-right: 1px solid var(--app-color-border);
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
  }

  :deep(.cm-activeLineGutter) {
    background-color: transparent;
    color: var(--app-color-text);
  }

  :deep(.cm-content) {
    padding: 12px 14px;
  }

  :deep(.cm-cursor),
  :deep(.cm-dropCursor) {
    border-left-color: var(--app-color-primary);
  }

  :deep(.cm-selectionBackground),
  :deep(.cm-editor.cm-focused .cm-selectionBackground) {
    background-color: rgba(22, 119, 255, 0.25);
  }

  :deep(.cm-placeholder) {
    color: var(--app-color-text-tertiary);
  }
}
</style>
