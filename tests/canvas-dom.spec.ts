import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createApp, ref, nextTick, type App as VueApp, type Ref } from 'vue';
import { createPinia } from 'pinia';
import Canvas from '@/views/Canvas/components/Canvas.vue';
import { useCanvasStore } from '@/store/canvas';
import { IS_PREVIEW_KEY, HIDDEN_KEYS, TOGGLE_SHOW_KEY } from '@/views/Canvas/constants';
import { registerDirectives } from '@/directives';
import { CanvasElementTypeEnum } from '@/constants/home';
import { CSS_NAME_REGEX } from '@/constants/style';
import { generateHtml } from '@/utils/code-generator';
import type {
  CanvasInnerElementTypeEnum,
  CanvasLinkElement,
  CanvasParagraphElement,
} from '@/views/Canvas/types';

/**
 * 画布 DOM 级测试
 *
 * 直接挂载真实的 Canvas.vue（含 Shadow DOM），通过派发真实 DOM 事件
 * 验证：选中、双击编辑、预览拦截、URL 清洗、文本转义、表单提交阻断等
 */

/** happy-dom 未实现 ResizeObserver（SelectedElementToolbar 依赖） */
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;

/** 预览模式开关（由测试控制，注入给整棵组件树） */
let isPreview: Ref<boolean>;
/** 应用实例 */
let app: VueApp;
/** 挂载宿主 */
let host: HTMLElement;
/** 画布 store */
let store: ReturnType<typeof useCanvasStore>;

/** 等待异步组件与 watcher 全部落地 */
async function flush() {
  await nextTick();
  await new Promise((r) => setTimeout(r, 0));
  await nextTick();
}

/** 获取画布 ShadowRoot */
function shadow(): ShadowRoot {
  const el = host.querySelector('.canvas-shadow-host');
  if (!el?.shadowRoot) throw new Error('shadow root 未创建');
  return el.shadowRoot;
}

/** 按元素 id 在 Shadow DOM 中查找 DOM 节点（异步组件可能尚未加载，自动重试） */
async function $(id: string): Promise<HTMLElement> {
  for (let i = 0; i < 50; i++) {
    const el = shadow().querySelector<HTMLElement>(`[data-canvas-id="${id}"]`);
    if (el) return el;
    await flush();
  }
  throw new Error(`元素未渲染: ${id}`);
}

/** 向画布/指定容器添加元素，返回元素 id */
function add(type: CanvasInnerElementTypeEnum, containerId?: string, index = 0): string {
  store.addElementToContainerAt(type, containerId ?? store.root.id, index);
  const container = containerId
    ? (store.getElementById(containerId) as { children: { id: string }[] })
    : store.root;
  return container.children[Math.min(index, container.children.length - 1)].id;
}

/** 派发鼠标事件 */
function mouse(el: HTMLElement, type: 'click' | 'dblclick') {
  el.dispatchEvent(new MouseEvent(type, { bubbles: true, composed: true, cancelable: true }));
}

beforeEach(async () => {
  document.body.innerHTML = '';
  localStorage.clear();
  isPreview = ref(false);
  app = createApp(Canvas);
  app.use(createPinia());
  app.provide(IS_PREVIEW_KEY, isPreview);
  /** 与 EditorHome 对齐的注入：隐藏元素列表及切换函数 */
  app.provide(HIDDEN_KEYS, ref<string[]>([]));
  app.provide(TOGGLE_SHOW_KEY, () => {});
  registerDirectives(app);
  host = document.createElement('div');
  document.body.appendChild(host);
  app.mount(host);
  store = useCanvasStore();
  await flush();
  /** 清除默认内容，保证每个用例画布干净 */
  store.clearAllElements();
  await flush();
});

afterEach(() => {
  app.unmount();
  host.remove();
});

describe('元素点击选中', () => {
  it('点击元素应选中', async () => {
    const id = add(CanvasElementTypeEnum.DIV);
    mouse(await $(id), 'click');
    expect(store.selectedElementId).toBe(id);
  });

  it('嵌套元素应选中最内层而非父级', async () => {
    const divId = add(CanvasElementTypeEnum.DIV);
    const pId = add(CanvasElementTypeEnum.PARAGRAPH, divId);
    mouse(await $(pId), 'click');
    expect(store.selectedElementId).toBe(pId);
  });

  it('预览模式下点击不选中', async () => {
    const id = add(CanvasElementTypeEnum.DIV);
    await flush();
    isPreview.value = true;
    await flush();
    mouse(await $(id), 'click');
    expect(store.selectedElementId).toBeNull();
  });
});

describe('双击文本编辑', () => {
  it('双击进入编辑态', async () => {
    const pId = add(CanvasElementTypeEnum.PARAGRAPH);
    const el = await $(pId);
    mouse(el, 'dblclick');
    expect(el.getAttribute('contenteditable')).toBe('true');
    expect(store.selectedElementId).toBe(pId);
  });

  it('预览模式下双击不进入编辑', async () => {
    const pId = add(CanvasElementTypeEnum.PARAGRAPH);
    await flush();
    isPreview.value = true;
    await flush();
    const el = await $(pId);
    mouse(el, 'dblclick');
    expect(el.getAttribute('contenteditable')).toBe('false');
  });

  it('失焦保存文本', async () => {
    const pId = add(CanvasElementTypeEnum.PARAGRAPH);
    const el = await $(pId);
    mouse(el, 'dblclick');
    el.innerText = '修改后的文本';
    el.dispatchEvent(new FocusEvent('blur'));
    expect((store.getElementById(pId) as CanvasParagraphElement).text).toBe('修改后的文本');
  });

  it('保存包含特殊字符的文本时，生成 HTML 应转义', async () => {
    const pId = add(CanvasElementTypeEnum.PARAGRAPH);
    const el = await $(pId);
    mouse(el, 'dblclick');
    el.innerText = '<script>alert(1)</script>';
    el.dispatchEvent(new FocusEvent('blur'));
    const html = generateHtml(store.root);
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>alert(1)</script>');
  });

  it('文本清空后失焦，Text 元素应删除自身', async () => {
    const divId = add(CanvasElementTypeEnum.DIV);
    const tId = add(CanvasElementTypeEnum.TEXT, divId);
    const el = await $(tId);
    mouse(el, 'dblclick');
    el.innerText = '   ';
    el.dispatchEvent(new FocusEvent('blur'));
    expect(store.getElementById(tId)).toBeNull();
  });

  it('Enter 应退出编辑（preventDefault + blur）', async () => {
    const pId = add(CanvasElementTypeEnum.PARAGRAPH);
    const el = await $(pId);
    mouse(el, 'dblclick');
    const e = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    el.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
  });

  it('编辑态下 Ctrl+B 等格式化快捷键应被拦截', async () => {
    const pId = add(CanvasElementTypeEnum.PARAGRAPH);
    const el = await $(pId);
    for (const key of ['b', 'i', 'u']) {
      const e = new KeyboardEvent('keydown', { key, ctrlKey: true, cancelable: true });
      el.dispatchEvent(e);
      expect(e.defaultPrevented).toBe(true);
    }
  });
});

describe('链接 URL 清洗', () => {
  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    'vbscript:msgbox(1)',
    'data:text/html,<script>alert(1)</script>',
    'data:image/svg+xml,<svg onload=alert(1)>',
    'data:image/png;base64,AAAA',
  ])('危险协议 %s 在预览模式下不渲染 href', async (href) => {
    const id = add(CanvasElementTypeEnum.LINK);
    (store.getElementById(id) as CanvasLinkElement).href = href;
    await flush();
    isPreview.value = true;
    await flush();
    expect((await $(id)).getAttribute('href')).toBeNull();
  });

  it('合法 URL 在预览模式下渲染 href，编辑模式下不渲染', async () => {
    const id = add(CanvasElementTypeEnum.LINK);
    (store.getElementById(id) as CanvasLinkElement).href = 'https://example.com';
    await flush();
    /** 编辑模式：href 不应存在（防止误跳转） */
    expect((await $(id)).getAttribute('href')).toBeNull();
    isPreview.value = true;
    await flush();
    expect((await $(id)).getAttribute('href')).toBe('https://example.com');
  });
});

describe('表单交互阻断', () => {
  it('编辑模式下 input 为 readonly，预览模式可编辑', async () => {
    const formId = add(CanvasElementTypeEnum.FORM);
    const inputId = add(CanvasElementTypeEnum.INPUT, formId);
    const input = await $(inputId);
    expect(input.hasAttribute('readonly')).toBe(true);
    isPreview.value = true;
    await flush();
    expect(input.hasAttribute('readonly')).toBe(false);
  });

  it('编辑模式下 form submit 被阻止，预览模式放行', async () => {
    const formId = add(CanvasElementTypeEnum.FORM);
    const form = await $(formId);
    const e1 = new Event('submit', { cancelable: true });
    form.dispatchEvent(e1);
    expect(e1.defaultPrevented).toBe(true);
    isPreview.value = true;
    await flush();
    const e2 = new Event('submit', { cancelable: true });
    form.dispatchEvent(e2);
    expect(e2.defaultPrevented).toBe(false);
  });
});

describe('删除与隐藏', () => {
  it('删除元素后 DOM 移除且选中态清空', async () => {
    const id = add(CanvasElementTypeEnum.DIV);
    await flush();
    store.selectElement(id);
    store.removeElement(id);
    await flush();
    expect(shadow().querySelector(`[data-canvas-id="${id}"]`)).toBeNull();
    expect(store.selectedElementId).toBeNull();
  });
});

describe('class / ID 名称合法性（与面板输入一致的规则）', () => {
  it.each(['my-class', '_header', 'a', 'foo-bar_baz123'])('合法名称: %s', (name) => {
    expect(CSS_NAME_REGEX.test(name)).toBe(true);
  });

  it.each(['123abc', '-abc', 'my class', 'my.class', '中文名', 'a$b', '.myclass'])(
    '非法名称: %s',
    (name) => {
      expect(CSS_NAME_REGEX.test(name)).toBe(false);
    }
  );

  it('renameElementId 应同步 #id 样式选择器与 label.for 引用', async () => {
    const inputId = add(CanvasElementTypeEnum.INPUT);
    const labelId = add(CanvasElementTypeEnum.LABEL);
    const label = store.getElementById(labelId) as { for?: string };
    label.for = inputId;
    /** generateElement 已自动创建 #inputId 规则 */
    expect(store.styleRules.some((r) => r.selector === `#${inputId}`)).toBe(true);
    store.renameElementId(inputId, 'renamed-id');
    expect(label.for).toBe('renamed-id');
    expect(store.styleRules.some((r) => r.selector === '#renamed-id')).toBe(true);
    expect(store.styleRules.some((r) => r.selector === `#${inputId}`)).toBe(false);
  });
});
