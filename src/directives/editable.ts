import { type Directive, type Ref, nextTick } from 'vue';
import { useCanvasStore } from '@/store/canvas';

/** v-editable 指令参数 */
export interface EditableBinding {
  /** 元素 ID，用于选中元素 */
  id: string;
  /** 是否处于预览模式 */
  isPreview: boolean;
  /** 获取当前文本 */
  getText: () => string;
  /** 保存文本 */
  onSave: (text: string) => void;
  /** 文本为空时的回调（可选，如 Text 元素会删除自身） */
  onEmpty?: () => void;
}

/** 指令内部状态 */
interface EditableState {
  /** 是否正在编辑 */
  isEditing: boolean;
  /** 当前绑定参数 */
  binding: EditableBinding;
  /** 双击处理函数 */
  dblclickHandler: (e: MouseEvent) => void;
  /** 失焦处理函数 */
  blurHandler: () => void;
  /** 键盘事件处理函数 */
  keydownHandler: (e: KeyboardEvent) => void;
}

/** 存储各元素的可编辑状态 */
const editableStateMap = new WeakMap<HTMLElement, EditableState>();

/**
 * v-editable 自定义指令
 * 统一管理画布元素的双击编辑、失焦保存、Enter 退出等可编辑行为
 * 内置预览模式守卫，预览模式下双击不会进入编辑
 */
export const editable: Directive<HTMLElement, EditableBinding> = {
  mounted(el, binding) {
    const canvasStore = useCanvasStore();

    const state: EditableState = {
      isEditing: false,
      binding: binding.value,
      dblclickHandler: () => {
        const opts = state.binding;
        if (opts.isPreview) return;
        state.isEditing = true;
        el.setAttribute('contenteditable', 'true');
        canvasStore.selectElement(opts.id);
        nextTick(() => {
          el.focus();
          const range = document.createRange();
          range.selectNodeContents(el);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        });
      },
      blurHandler: () => {
        if (!state.isEditing) return;
        state.isEditing = false;
        el.setAttribute('contenteditable', 'false');
        const newText = el.innerText.trim();
        if (!newText && state.binding.onEmpty) {
          state.binding.onEmpty();
          return;
        }
        if (newText !== state.binding.getText()) {
          state.binding.onSave(newText);
        }
      },
      keydownHandler: (e: KeyboardEvent) => {
        /** 拦截所有能产生不受控内联格式化或样式修改的快捷键 */
        if (e.ctrlKey || e.metaKey) {
          const key = e.key.toLowerCase();
          /** 加粗 / 斜体 / 下划线 */
          if (key === 'b' || key === 'i' || key === 'u') {
            e.preventDefault();
            return;
          }
          if (e.shiftKey) {
            /** 删除线 / 文本对齐 */
            if (key === 's' || key === 'k' || key === 'l' || key === 'e' || key === 'r' || key === 'j') {
              e.preventDefault();
              return;
            }
          }
        }
        if (e.shiftKey) return;
        if (e.key === 'Enter') {
          e.preventDefault();
          el.blur();
        }
      },
    };

    editableStateMap.set(el, state);

    el.setAttribute('contenteditable', 'false');
    el.addEventListener('dblclick', state.dblclickHandler);
    el.addEventListener('blur', state.blurHandler);
    el.addEventListener('keydown', state.keydownHandler);
  },

  updated(el, binding) {
    const state = editableStateMap.get(el);
    if (state) {
      state.binding = binding.value;
      /** 非编辑状态下，强制同步 DOM 文本与数据，修复 contenteditable 导致的 VNode/DOM 不同步问题（如撤销/重做后 DOM 残留 <br>） */
      if (!state.isEditing) {
        const expectedText = state.binding.getText();
        if (el.innerText !== expectedText) {
          el.innerText = expectedText;
        }
      }
    }
  },

  unmounted(el) {
    const state = editableStateMap.get(el);
    if (!state) return;
    el.removeEventListener('dblclick', state.dblclickHandler);
    el.removeEventListener('blur', state.blurHandler);
    el.removeEventListener('keydown', state.keydownHandler);
    editableStateMap.delete(el);
  },
};
