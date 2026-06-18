import { CanvasElement } from "@/views/Home/types";
import { CanvasElementTypeEnum } from "@/constants/home";
import { defineStore } from "pinia";
import { nanoid } from "nanoid";

/** 画布创建器store */
export const useCanvasCreatorStore = defineStore("canvasCreator", {
  state: () => ({
    /** 画布元素列表 */
    elements: [] as CanvasElement[],
  }),
  actions: {
    /** 添加元素 */
    addElement(type: CanvasElementTypeEnum) {
      const base = { id: nanoid(), type, style: {}, classes: [] };
      const defaultMap: Record<CanvasElementTypeEnum, CanvasElement> = {
        [CanvasElementTypeEnum.UNDEFINED]: { ...base, type: CanvasElementTypeEnum.UNDEFINED } as any,
        [CanvasElementTypeEnum.CONTAINER]: { ...base, type: CanvasElementTypeEnum.CONTAINER, children: [] },
        [CanvasElementTypeEnum.BUTTON]: { ...base, type: CanvasElementTypeEnum.BUTTON, text: '按钮', buttonType: 1 as any },
        [CanvasElementTypeEnum.PARAGRAPH]: { ...base, type: CanvasElementTypeEnum.PARAGRAPH, text: '段落文本' },
        [CanvasElementTypeEnum.IMAGE]: { ...base, type: CanvasElementTypeEnum.IMAGE, src: '', title: '' },
        [CanvasElementTypeEnum.LINK]: { ...base, type: CanvasElementTypeEnum.LINK, href: '', text: '超链接' },
      };
      this.elements.push(defaultMap[type]);
    },
    /** 删除元素 */
    removeElement(id: string){

    }
  }
});
