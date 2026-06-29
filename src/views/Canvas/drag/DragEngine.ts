import { nodeRegistry } from "./NodeRegistry";
import { Positioner } from "./Positioner";
import { useDragStore } from "@/store/drag";
import { useCanvasStore } from "@/store/canvas";
import { CanvasInnerElementTypeEnum } from "../types";
import { DropPositionEnum } from "@/constants/home";


/**
 * DragEngine 事件协调中心
 * 管理所有拖拽事件的注册与清理
 */
class DragEngine {
  /** 落点位置计算器 */
  private positioner = new Positioner();

  /** 绑定「可拖拽」事件，返回解绑函数 */
  connectDraggable(el: HTMLElement, id: string): () => void {
    // 设置允许拖拽
    el.setAttribute("draggable", "true");

    const that = this;

    /** 拖拽开始 */
    function handleDragStart(e: DragEvent) {
      e.stopPropagation();
      const dragStore = useDragStore();
      dragStore.startDrag(id);
      
      const canvasStore = useCanvasStore();
      canvasStore.selectElement(null);
    }

    /** 拖拽结束 */
    function handleDragEnd(e: DragEvent) {
      e.stopPropagation();
      that.dropExisting();
    }

    el.addEventListener("dragstart", handleDragStart);
    el.addEventListener("dragend", handleDragEnd);

    return () => {
      el.removeAttribute("draggable");
      el.removeEventListener("dragstart", handleDragStart);
      el.removeEventListener("dragend", handleDragEnd);
    };
  }

  /** 绑定「可接收」事件，返回解绑函数 */
  connectDroppable(el: HTMLElement, id: string): () => void {
    const instance = this;

    /** 拖拽悬停 */
    function handleDragOver(e: DragEvent) {
      e.preventDefault();

      const dragStore = useDragStore();
      const canvasStore = useCanvasStore();

      if (!dragStore.isDragging) return;

      
      // /** 从事件目标元素触发，向上找注册过的画布元素 */
      const targetReg = nodeRegistry.getNodeFromElement(e.target as HTMLElement);
      const dropTargetId = targetReg ? targetReg.id : id;

      const indicator = instance.positioner.compute(
        dropTargetId,
        e.clientX,
        e.clientY,
        canvasStore.root,
        nodeRegistry,
        dragStore.draggingId
      );

      dragStore.setIndicator(indicator);
    }

    /** 拖拽离开画布区域 */
    function handleDragLeave(e: DragEvent) {
      e.stopPropagation();

      const dragStore = useDragStore();
      if (!dragStore.isDragging) return;

      const relatedTarget = e.relatedTarget as HTMLElement | null;
      if (relatedTarget && el.contains(relatedTarget)) return;

      dragStore.setIndicator(null);
    }

    el.addEventListener("dragover", handleDragOver);
    el.addEventListener("dragleave", handleDragLeave);

    return () => {
      el.removeEventListener("dragover", handleDragOver);
      el.removeEventListener("dragleave", handleDragLeave);
    };
  }

  /** 绑定「组件面板」新组件的拖出事件，返回解绑函数 */
  connectCreate(el: HTMLElement, type: CanvasInnerElementTypeEnum): () => void {
    // 设置允许拖拽
    el.setAttribute("draggable", "true");

    const instance = this;

    /** 拖拽开始 */
    function handleDragStart(e: DragEvent) {
      e.stopPropagation();
      const dragStore = useDragStore();
      const canvasStore = useCanvasStore();
      canvasStore.selectElement(null);
      dragStore.startNewDrag(type);
    };

    /** 拖拽结束 */
    function handleDragEnd(e: DragEvent) {
      e.stopPropagation();
      instance.dropNew();
    };

    el.addEventListener("dragstart", handleDragStart);
    el.addEventListener("dragend", handleDragEnd);

    return () => {
      el.removeAttribute("draggable");
      el.removeEventListener("dragstart", handleDragStart);
      el.removeEventListener("dragend", handleDragEnd);
    };
  }

  /** 执行已有元素落点逻辑 */
  private dropExisting(): void {
    const dragStore = useDragStore();
    const canvasStore = useCanvasStore();
    const { indicator, draggingId } = dragStore;

    if (indicator && !indicator.error && draggingId) {
      const insertIndex =
        indicator.index + (indicator.where === DropPositionEnum.AFTER ? 1 : 0);
      canvasStore.moveElement(draggingId, indicator.parentId, insertIndex);
      canvasStore.selectElement(draggingId);
    }

    this.cleanup();
  }

  /** 执行新组件落点逻辑 */
  private dropNew() {
    const dragStore = useDragStore();
    const canvasStore = useCanvasStore();
    const { indicator, dragNewType } = dragStore;

    if (indicator && !indicator.error && dragNewType !== null) {
      const insertIndex =
        indicator.index + (indicator.where === DropPositionEnum.AFTER ? 1 : 0);
        canvasStore.addElementToContainerAt(dragNewType, indicator.parentId, insertIndex);
    }

    this.cleanup();
  }

  /** 清理拖拽状态 */
  private cleanup() {
    const dragStore = useDragStore();

    dragStore.endDrag();
  }
}

/** 全局单例 */
export const dragEngine = new DragEngine();
