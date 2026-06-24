import { defineStore } from "pinia";
import { DrapSourceTypeEnum } from "@/constants/home";
import type { DropIndicator } from "@/views/Home/drag/types";
import { CanvasInnerElementTypeEnum } from "@/views/Home/types";

/** 拖拽 store */
export const useDragStore = defineStore("drag", {
  state: () => ({
    /** 正在被拖拽的元素 id（null = 未在拖拽） */
    draggingId: null as string | null,
    /** 当前拖拽来源类型 */
    dragSourceType: null as DrapSourceTypeEnum | null,
    /** 新组件类型（来自面板时） */
    dragNewType: null as CanvasInnerElementTypeEnum | null,
    /** 当前计算出的落点 Indicator */
    indicator: null as DropIndicator | null,
  }),
  getters: {
    /** 是否正在拖拽 */
    isDragging: (state): boolean => state.draggingId !== null || state.dragSourceType === DrapSourceTypeEnum.NEW,
  },
  actions: {
    /** 开始拖拽已有元素 */
    startDrag(id: string) {
      this.draggingId = id;
      this.dragSourceType = DrapSourceTypeEnum.EXISTING;
      this.dragNewType = null;
    },
    /** 从面板拖入新组件 */
    startNewDrag(newType: CanvasInnerElementTypeEnum) {
      this.draggingId = null;
      this.dragSourceType = DrapSourceTypeEnum.NEW;
      this.dragNewType = newType;
    },
    /** 更新占位线 */
    setIndicator(indicator: DropIndicator | null) {
      this.indicator = indicator;
    },
    /** 清除所有拖拽状态 */
    endDrag() {
      this.draggingId = null;
      this.dragSourceType = null;
      this.dragNewType = null;
      this.indicator = null;
    },
  },
});
