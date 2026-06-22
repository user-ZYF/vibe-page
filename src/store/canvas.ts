import { CanvasContainerElement, CanvasElement } from "@/views/Home/types";
import { ButtonTypeEnum, CanvasElementTypeEnum, SiderPanelEnum } from "@/constants/home";
import { DefaultStyleConfigMap } from "@/constants/style";
import { defineStore } from "pinia";
import { nanoid } from "nanoid";
import { cloneDeep } from "lodash";
import { Positioner } from "@/views/Home/drag/Positioner";

/** 画布store */
export const useCanvasStore = defineStore("canvas", {
  state: () => ({
    /** 画布元素列表 */
    elements: [] as CanvasElement[],
    /** 选中的元素 */
    selectedElementId: null as String | null,
    /** 当前激活的 Sider 面板 */
    activePanel: SiderPanelEnum.COMPONENTS as SiderPanelEnum,
    /** 是否正在拖拽元素 */
    isDragging: false,
    /** 插入位置 */
    positioner: new Positioner(),
  }),
  getters: {
    /** 当前选中的元素（递归查找多层级） */
    selectedElement: (state): CanvasElement | null => {
      const findInList = (list: CanvasElement[]): CanvasElement | null => {
        for (const el of list) {
          if (el.id === state.selectedElementId) return el;
          if (el.type === CanvasElementTypeEnum.CONTAINER) {
            const found = findInList((el as CanvasContainerElement).children);
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
        classes: [],
        interactions: [],
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
    selectElement(id: string | null = null) {
      this.selectedElementId = id;
      if(id && this.activePanel === SiderPanelEnum.COMPONENTS){
        this.activePanel = SiderPanelEnum.EDIT;
      }
    },
    /** 设置拖拽状态 */
    setDragging(val: boolean) {
      this.isDragging = val;
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
            if (el.type === CanvasElementTypeEnum.CONTAINER) {
              return { ...el, children: removeFromList((el as CanvasContainerElement).children) };
            }
            return el;
          });
      }
      this.elements = removeFromList(this.elements);
    },
    /** 复制元素（递归支持多层级，插入到原元素后面） */
    duplicateElement(id: string) {
      const duplicateInList = (list: CanvasElement[]): CanvasElement[] => {
        const result: CanvasElement[] = [];
        for (const el of list) {
          result.push(el);
          if (el.id === id) {
            const copy = cloneDeep(el);
            copy.id = nanoid();
            result.push(copy);
          } else if (el.type === CanvasElementTypeEnum.CONTAINER) {
            result[result.length - 1] = { ...el, children: duplicateInList((el as CanvasContainerElement).children) };
          }
        }
        return result;
      };
      this.elements = duplicateInList(this.elements);
    },
    /** 移动已有元素（支持跨容器），targetParentId = null 表示根层级 */
    moveElement(id: string, targetParentId: string | null, index: number) {
      /** 先找到并深克隆要移动的元素 */
      const findEl = (list: CanvasElement[]): CanvasElement | null => {
        for (const el of list) {
          if (el.id === id) return el;
          if (el.type === CanvasElementTypeEnum.CONTAINER) {
            const found = findEl((el as CanvasContainerElement).children);
            if (found) return found;
          }
        }
        return null;
      };

      const target = findEl(this.elements);
      if (!target) return;

      /** 从原位置移除 */
      const removeFromList = (list: CanvasElement[]): CanvasElement[] => {
        return list
          .filter((el) => el.id !== id)
          .map((el) => {
            if (el.type === CanvasElementTypeEnum.CONTAINER) {
              return { ...el, children: removeFromList((el as CanvasContainerElement).children) };
            }
            return el;
          });
      };
      this.elements = removeFromList(this.elements);

      /** 插入到目标位置 */
      if (targetParentId === null) {
        const clampedIndex = Math.min(index, this.elements.length);
        this.elements.splice(clampedIndex, 0, target);
      } else {
        const insertInList = (list: CanvasElement[]): CanvasElement[] => {
          return list.map((el) => {
            if (el.id === targetParentId && el.type === CanvasElementTypeEnum.CONTAINER) {
              const children = [...(el as CanvasContainerElement).children];
              const clampedIndex = Math.min(index, children.length);
              children.splice(clampedIndex, 0, target);
              return { ...el, children };
            }
            if (el.type === CanvasElementTypeEnum.CONTAINER) {
              return { ...el, children: insertInList((el as CanvasContainerElement).children) };
            }
            return el;
          });
        };
        this.elements = insertInList(this.elements);
      }
    },
    /** 在根层级指定 index 位置添加元素 */
    addElementAt(type: CanvasElementTypeEnum, index: number) {
      const element = this.generateElement(type);
      const clampedIndex = Math.min(index, this.elements.length);
      this.elements.splice(clampedIndex, 0, element);
    },
    /** 在指定容器的 index 位置添加元素 */
    addElementToContainerAt(type: CanvasElementTypeEnum, containerId: string, index: number) {
      const element = this.generateElement(type);
      const insertInList = (list: CanvasElement[]): CanvasElement[] => {
        return list.map((el) => {
          if (el.id === containerId && el.type === CanvasElementTypeEnum.CONTAINER) {
            const children = [...(el as CanvasContainerElement).children];
            const clampedIndex = Math.min(index, children.length);
            children.splice(clampedIndex, 0, element);
            return { ...el, children };
          }
          if (el.type === CanvasElementTypeEnum.CONTAINER) {
            return { ...el, children: insertInList((el as CanvasContainerElement).children) };
          }
          return el;
        });
      };
      this.elements = insertInList(this.elements);
    },
    /** 选中元素的父节点 */
    selectParentElement(id: string) {
      const findParentId = (list: CanvasElement[], parentId: string | null): { found: boolean; parentId: string | null } => {
        for (const el of list) {
          if (el.id === id) return { found: true, parentId };
          if (el.type === CanvasElementTypeEnum.CONTAINER) {
            const result = findParentId((el as CanvasContainerElement).children, el.id);
            if (result.found) return result;
          }
        }
        return { found: false, parentId: null };
      };
      const { found, parentId } = findParentId(this.elements, null);
      if (found && parentId) {
        this.selectElement(parentId);
      }
    },
  }
});
