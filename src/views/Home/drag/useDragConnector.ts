import { onMounted, onBeforeUnmount, inject, ref, watch } from "vue";
import type { Ref } from "vue";
import { nodeRegistry } from "./NodeRegistry";
import { dragEngine } from "./DragEngine";
import { IS_PREVIEW_KEY } from "../contants";

/**
 * 每个画布元素组件在 onMounted 调用，onUnmounted 清理
 * 类比 Craft.js 的 .connect() connector
 */
export function useDragConnector(
  el: Ref<HTMLElement | undefined>,
  id: string,
  options: { isCanvas?: boolean } = {}
) {
  const isPreview = inject(IS_PREVIEW_KEY, ref(false));

  let unbindDrag: (() => void) | null = null;

  /** 绑定拖拽事件 */
  function bindDrag() {
    if (!el.value || unbindDrag) return;
    unbindDrag = dragEngine.connectDraggable(el.value, id);
  }

  /** 解绑拖拽事件 */
  function unbindDragFn() {
    unbindDrag?.();
    unbindDrag = null;
  }

  onMounted(() => {
    if (!el.value) return;

    /** 1. 注册 DOM 到 registry */
    nodeRegistry.register(id, el.value, options.isCanvas ?? false);

    /** 2. 非预览模式下绑定可拖拽 */
    if (!isPreview.value) {
      bindDrag();
    }
  });

  /** 预览模式切换时动态绑定/解绑 */
  watch(isPreview, (preview) => {
    if (preview) {
      unbindDragFn();
    } else {
      bindDrag();
    }
  });

  onBeforeUnmount(() => {
    unbindDragFn();
    nodeRegistry.unregister(id);
  });
}
