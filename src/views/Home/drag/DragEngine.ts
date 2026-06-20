import { nodeRegistry } from "./NodeRegistry";
import { Positioner } from "./Positioner";
import { createShadow } from "./createShadow";
import { useDragStore } from "@/store/drag";
import { useCanvasStore } from "@/store/canvas";
import type { CanvasElementTypeEnum } from "@/constants/home";


/**
 * DragEngine 事件协调中心（类比 Craft.js DefaultEventHandlers）
 * 管理所有 drag 事件的注册与清理
 */
class DragEngine {
  private positioner = new Positioner();

  /** 当前拖拽产生的幽灵元素 */
  private draggedShadow: HTMLElement | null = null;

  /** 绑定「可拖拽已有元素」的事件，返回解绑函数 */
  connectDraggable(el: HTMLElement, id: string): () => void {
    el.setAttribute("draggable", "true");

    const onDragStart = (e: DragEvent) => {
      e.stopPropagation();
      const dragStore = useDragStore();
      dragStore.startDrag(id);
      this.draggedShadow = createShadow(e, el);
      document.addEventListener("dragover", this.preventDefaultHandler, false);
    };

    const onDragEnd = (e: DragEvent) => {
      e.stopPropagation();
      document.removeEventListener("dragover", this.preventDefaultHandler, false);
      this.dropExisting();
    };

    el.addEventListener("dragstart", onDragStart);
    el.addEventListener("dragend", onDragEnd);

    return () => {
      el.removeAttribute("draggable");
      el.removeEventListener("dragstart", onDragStart);
      el.removeEventListener("dragend", onDragEnd);
    };
  }

  /** 绑定「可接收放置」容器的事件，返回解绑函数 */
  connectDroppable(el: HTMLElement, id: string | null): () => void {
    const onDragOver = (e: DragEvent) => {
      e.preventDefault();

      const dragStore = useDragStore();
      const canvasStore = useCanvasStore();

      if (!dragStore.isDragging) return;

      /** 用事件实际目标找最近的注册节点，让 Positioner 从真实 hover 节点开始向上找 canvas 祖先 */
      const targetReg = nodeRegistry.getNodeFromElement(e.target as HTMLElement);
      const dropTargetId = targetReg ? targetReg.id : id;

      const indicator = this.positioner.compute(
        dropTargetId,
        e.clientX,
        e.clientY,
        canvasStore.elements,
        nodeRegistry,
        dragStore.draggingId
      );

      dragStore.setIndicator(indicator);
    };

    const onDragEnter = (e: DragEvent) => {
      e.preventDefault();
    };

    el.addEventListener("dragover", onDragOver);
    el.addEventListener("dragenter", onDragEnter);

    return () => {
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("dragenter", onDragEnter);
    };
  }

  /** 绑定「组件面板」新组件的拖出事件，返回解绑函数 */
  connectCreate(el: HTMLElement, type: CanvasElementTypeEnum): () => void {
    // 设置允许拖拽
    el.setAttribute("draggable", "true");

    const onDragStart = (e: DragEvent) => {
      e.stopPropagation();
      const dragStore = useDragStore();
      dragStore.startNewDrag(type);
      this.draggedShadow = createShadow(e, el);
      document.addEventListener("dragover", this.preventDefaultHandler, false);
    };

    const onDragEnd = (e: DragEvent) => {
      e.stopPropagation();
      document.removeEventListener("dragover", this.preventDefaultHandler, false);
      this.dropNew();
    };

    el.addEventListener("dragstart", onDragStart);
    el.addEventListener("dragend", onDragEnd);

    return () => {
      el.removeAttribute("draggable");
      el.removeEventListener("dragstart", onDragStart);
      el.removeEventListener("dragend", onDragEnd);
    };
  }

  /** 执行已有元素落点逻辑 */
  private dropExisting(): void {
    const dragStore = useDragStore();
    const canvasStore = useCanvasStore();
    const { indicator, draggingId } = dragStore;

    if (indicator && !indicator.error && draggingId) {
      const insertIndex =
        indicator.index + (indicator.where === "after" ? 1 : 0);
      canvasStore.moveElement(draggingId, indicator.parentId, insertIndex);
    }

    this.cleanup();
  }

  /** 执行新组件落点逻辑 */
  private dropNew(): void {
    const dragStore = useDragStore();
    const canvasStore = useCanvasStore();
    const { indicator, dragNewType } = dragStore;

    if (indicator && !indicator.error && dragNewType !== null) {
      const insertIndex =
        indicator.index + (indicator.where === "after" ? 1 : 0);

      if (indicator.parentId === null) {
        canvasStore.addElementAt(dragNewType, insertIndex);
      } else {
        canvasStore.addElementToContainerAt(dragNewType, indicator.parentId, insertIndex);
      }
    }

    this.cleanup();
  }

  /** 清理拖拽状态 */
  private cleanup(): void {
    const dragStore = useDragStore();

    if (this.draggedShadow) {
      this.draggedShadow.parentNode?.removeChild(this.draggedShadow);
      this.draggedShadow = null;
    }

    dragStore.endDrag();
  }

  /** 阻止默认行为，使 dragend 能立即触发 */
  private preventDefaultHandler = (e: DragEvent) => {
    e.preventDefault();
  };
}

/** 全局单例 */
export const dragEngine = new DragEngine();
