import { CanvasContainerElement, CanvasElement } from "@/views/Home/types";
import { ButtonTypeEnum, CanvasElementTypeEnum, SiderPanelEnum } from "@/constants/home";
import { DefaultStyleConfigMap } from "@/constants/style";
import { defineStore } from "pinia";
import { nanoid } from "nanoid";
import { cloneDeep } from "lodash";

/** 画布store */
export const useCanvasStore = defineStore("canvas", {
  state: () => ({
    /** 画布元素列表 */
    elements: [] as CanvasElement[],
    /** 选中的元素 */
    selectedElementId: "",
    /** 当前激活的 Sider 面板 */
    activePanel: SiderPanelEnum.EDIT as SiderPanelEnum,
  }),
  getters: {
    /** 当前选中的元素（递归查找多层级） */
    selectedElement: (state): CanvasElement | null => {
      const findInList = (list: CanvasElement[]): CanvasElement | null => {
        for (const el of list) {
          if (el.id === state.selectedElementId) return el;
          if ('children' in el) {
            const found = findInList(el.children);
            if (found) return found;
          }
        }
        return null;
      };
      return findInList(state.elements);
    },
  },
  actions: {
    /** 生成一个元素 */
    generateElement(type: CanvasElementTypeEnum) {
      const base = { 
        id: nanoid(), 
        type,
        styleConfig: cloneDeep(DefaultStyleConfigMap[type]),
        classes: []
      };
      switch(type){
        case CanvasElementTypeEnum.BUTTON:
          return { ...base, text: '按钮', buttonType: ButtonTypeEnum.BUTTON };
        case CanvasElementTypeEnum.PARAGRAPH:
          return { ...base, text: '段落' };
        case CanvasElementTypeEnum.IMAGE:
          return { ...base, src: '', title: '图片' };
        case CanvasElementTypeEnum.LINK:
          return { ...base, text: '链接' };
        case CanvasElementTypeEnum.CONTAINER:
          return { ...base, children: [] };
      }
    },
    /** 添加元素 */
    addElement(type: CanvasElementTypeEnum) {
      const element = this.generateElement(type);
      this.elements.push(element);
    },
    /** 添加元素到指定容器 */
    addElementToContainer(type: CanvasElementTypeEnum, containerId: string) {
      const element = this.generateElement(type);
      const findInList = (list: CanvasElement[]): CanvasElement | null => {
        for (const el of list) {
          if (el.id === containerId) return el;
          if (el.type === CanvasElementTypeEnum.CONTAINER) {
            const found = findInList((el as CanvasContainerElement).children);
            if (found) return found;
          }
        }
        return null;
      };
      const container = findInList(this.elements);
      if (container && container.type === CanvasElementTypeEnum.CONTAINER) {
        (container as CanvasContainerElement).children.push(element);
      }
    },
    /** 选中元素 */
    selectElement(id: string) {
      this.selectedElementId = id;
      this.activePanel = SiderPanelEnum.EDIT;
    },
    /** 切换 Sider 面板 */
    switchPanel(panel: SiderPanelEnum) {
      this.activePanel = panel;
    },
    /** 删除元素（递归支持多层级） */
    removeElement(id: string) {
      const removeFromList = (list: CanvasElement[]): CanvasElement[] => {
        return list
          .filter((el) => el.id !== id)
          .map((el) => {
            if ('children' in el) {
              return { ...el, children: removeFromList(el.children) };
            }
            return el;
          });
      }
      this.elements = removeFromList(this.elements);
    }
  }
});
