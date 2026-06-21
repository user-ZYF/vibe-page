import { onMounted, onBeforeUnmount } from "vue";
import type { Ref } from "vue";
import { nodeRegistry } from "./NodeRegistry";
import { dragEngine } from "./DragEngine";

/**
 * 每个画布元素组件在 onMounted 调用，onUnmounted 清理
 * 类比 Craft.js 的 .connect() connector
 */
export function useDragConnector(
  el: Ref<HTMLElement | undefined>,
  id: string,
  options: { isCanvas?: boolean } = {}
) {
  let unbindDrag: (() => void) | null = null;

  onMounted(() => {
    if (!el.value) return;

    /** 1. 注册 DOM 到 registry */
    nodeRegistry.register(id, el.value, options.isCanvas ?? false);

    /** 2. 绑定可拖拽 */
    unbindDrag = dragEngine.connectDraggable(el.value, id);

    /** 3. 子容器不单独绑定 dragover：根画布通过冒泡统一处理，Positioner 用 e.target 找最近 canvas 祖先 */
  });

  onBeforeUnmount(() => {
    unbindDrag?.();
    nodeRegistry.unregister(id);
  });
}
