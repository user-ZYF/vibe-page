import { CanvasButtonElement, CanvasContainerElement, CanvasInnerElement, CanvasImageElement, CanvasLinkElement, CanvasParagraphElement, CanvasRootElement, CanvasElement, CanvasInnerElementTypeEnum, StyleConfig } from "@/views/Canvas/types";
import { ButtonTypeEnum, CanvasElementLabelMap, CanvasElementTypeEnum, SiderPanelEnum } from "@/constants/home";
import { DefaultStyleConfigMap, defaultClassStyleConfig } from "@/constants/style";
import { defineStore } from "pinia";
import { nanoid } from "nanoid";
import { cloneDeep } from "lodash";
import { Positioner } from "@/views/Canvas/drag/Positioner";
import { convertStyleConfig } from "@/utils/styleConfig";

/** 画布store */
export const useCanvasStore = defineStore("canvas", {
  state: () => ({
    /** 画布元素列表 */
    root: { 
      id: nanoid(),
      type: CanvasElementTypeEnum.ROOT,
      styleConfig: cloneDeep(DefaultStyleConfigMap[CanvasElementTypeEnum.ROOT]),
      classes: [],
      classNames: [],
      interactions: [],
      children: [],
      alias: CanvasElementLabelMap[CanvasElementTypeEnum.ROOT],
    } as CanvasRootElement,
    /** 选中的元素 */
    selectedElementId: null as string | null,
    /** 当前激活的 Sider 面板 */
    activePanel: SiderPanelEnum.COMPONENTS as SiderPanelEnum,
    /** 是否正在拖拽元素 */
    isDragging: false,
    /** 是否正在调整元素尺寸 */
    isResizing: false,
    /** 插入位置 */
    positioner: new Positioner(),
    /** 全局 class 样式配置映射 */
    classStyles: {} as Record<string, StyleConfig>,
  }),
  getters: {
    /** 全局class对应的最终样式 */
    covertClassStyles(state) {
      const styles = {} as Record<string, Record<string, string>>;
      for(const key in state.classStyles){
        const value = state.classStyles[key];
        styles[key] = convertStyleConfig(value);
      }
      return styles;
    }
  },
  actions: {
    /** 获取指定 class 的样式配置，不存在则自动创建 */
    getOrCreateClassStyle(className: string): StyleConfig {
      if (!this.classStyles[className]) {
        this.classStyles[className] = cloneDeep(defaultClassStyleConfig);
      }
      return this.classStyles[className];
    },
    /** 更新指定 class 的样式配置 */
    updateClassStyle(className: string, styleConfig: StyleConfig) {
      this.classStyles[className] = styleConfig;
    },
    /** 删除指定 class 的样式配置 */
    removeClassStyle(className: string) {
      delete this.classStyles[className];
    },
    /** 获取指定id的元素 */
    getElementById (id: string): CanvasElement | null {
      if(id === this.root.id){
        return this.root;
      }
      const findInList = (list: CanvasInnerElement[]): CanvasInnerElement | null => {
        for (const el of list) {
          if (el.id === id) return el;
          if (el.type === CanvasElementTypeEnum.CONTAINER) {
            const found = findInList((el as CanvasContainerElement).children);
            if (found) return found;
          }
        }
        return null;
      };
      return findInList(this.root.children);
    },
    /** 生成一个元素 */
    generateElement(type: CanvasInnerElementTypeEnum): CanvasInnerElement {
      const elBase = { 
        id: nanoid(),
        type,
        styleConfig: cloneDeep(DefaultStyleConfigMap[type as CanvasElementTypeEnum]),
        classes: [],
        classNames: [],
        interactions: [],
        alias: CanvasElementLabelMap[type as CanvasElementTypeEnum],
      };
      switch(type){
        case CanvasElementTypeEnum.BUTTON:
          return { ...elBase, text: '按钮', buttonType: ButtonTypeEnum.BUTTON } as CanvasButtonElement;
        case CanvasElementTypeEnum.PARAGRAPH:
          return { ...elBase, text: '段落' } as CanvasParagraphElement;
        case CanvasElementTypeEnum.IMAGE:
          return { ...elBase, src: '', title: '图片' }  as CanvasImageElement;
        case CanvasElementTypeEnum.LINK:
          return { ...elBase, text: '链接', href: '' } as CanvasLinkElement;
        case CanvasElementTypeEnum.CONTAINER:
          return { ...elBase, children: [] }  as CanvasContainerElement;
      }
    },
    /** 添加元素到指定容器 */
    addElementToContainer(type: CanvasInnerElementTypeEnum, containerId: string) {
      const element = this.generateElement(type);
      const findInList = (list: CanvasInnerElement[]): CanvasInnerElement | null => {
        for (const el of list) {
          if (el.id === containerId) return el;
          if (el.type === CanvasElementTypeEnum.CONTAINER) {
            const found = findInList((el as CanvasContainerElement).children);
            if (found) return found;
          }
        }
        return null;
      };
      const container = findInList(this.root.children);
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
      const removeFromList = (list: CanvasInnerElement[]): CanvasInnerElement[] => {
        return list
          .filter((el) => el.id !== id)
          .map((el) => {
            if (el.type === CanvasElementTypeEnum.CONTAINER) {
              return { ...el, children: removeFromList((el as CanvasContainerElement).children) };
            }
            return el;
          });
      }
      this.root.children = removeFromList(this.root.children);
      if(this.selectedElementId === id){
        this.selectElement(null);
      }
    },
    /** 复制元素（递归支持多层级，插入到原元素后面） */
    duplicateElement(id: string) {
      /** 递归为元素及其所有后代重新生成 id */
      const renewIds = (el: CanvasInnerElement): CanvasInnerElement => {
        const next = { ...el, id: nanoid() };
        if (next.type === CanvasElementTypeEnum.CONTAINER) {
          (next as CanvasContainerElement).children = (el as CanvasContainerElement).children.map(renewIds);
        }
        return next;
      };
      const duplicateInList = (list: CanvasInnerElement[]): CanvasInnerElement[] => {
        const result: CanvasInnerElement[] = [];
        for (const el of list) {
          result.push(el);
          if (el.id === id) {
            result.push(renewIds(cloneDeep(el)));
          } else if (el.type === CanvasElementTypeEnum.CONTAINER) {
            result[result.length - 1] = { ...el, children: duplicateInList((el as CanvasContainerElement).children) };
          }
        }
        return result;
      };
      this.root.children = duplicateInList(this.root.children);
    },
    /** 移动已有元素（支持跨容器） */
    moveElement(id: string, targetParentId: string, index: number) {
      const target = this.getElementById(id) as CanvasInnerElement | null;
      if (!target) return;
      /** 使用临时 id 标记原始元素，避免修改响应式对象，通过 cloneDeep 后的副本持有临时 id */
      const tempId = nanoid();
      const tempTarget = cloneDeep(target);
      tempTarget.id = tempId;
      /** 用临时副本替换原始响应式元素，保留原始元素不变直到删除步骤 */
      const replaceWithTemp = (list: CanvasInnerElement[]): CanvasInnerElement[] => {
        return list.map((el) => {
          if (el.id === id) return tempTarget;
          if (el.type === CanvasElementTypeEnum.CONTAINER) {
            return { ...el, children: replaceWithTemp((el as CanvasContainerElement).children) };
          }
          return el;
        });
      };
      this.root.children = replaceWithTemp(this.root.children);

      // 先插入再删除，避免删除先前兄弟元素导致插入的相对位置发生改变
      if(targetParentId === this.root.id) {
        const clampedIndex = Math.min(index, this.root.children.length);
        this.root.children.splice(clampedIndex, 0, target);
      }else {
        /** 插入到目标位置 */
        const insertInList = (list: CanvasInnerElement[]): CanvasInnerElement[] => {
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
        this.root.children = insertInList(this.root.children);
      }
      /** 从原位置移除临时标记元素 */
      const removeFromList = (list: CanvasInnerElement[]): CanvasInnerElement[] => {
        return list
          .filter((el) => el.id !== tempId)
          .map((el) => {
            if (el.type === CanvasElementTypeEnum.CONTAINER) {
              return { ...el, children: removeFromList((el as CanvasContainerElement).children) };
            }
            return el;
          });
      };
      this.root.children = removeFromList(this.root.children);
     
    },
    /** 在指定容器的 index 位置添加元素 */
    addElementToContainerAt(type: CanvasInnerElementTypeEnum, containerId: string, index: number) {
      const element = this.generateElement(type);
      if(containerId === this.root.id){
        const clampedIndex = Math.min(index, this.root.children.length);
        this.root.children.splice(clampedIndex, 0, element);
        return;
      }
      const insertInList = (list: CanvasInnerElement[]): CanvasInnerElement[] => {
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
      this.root.children = insertInList(this.root.children);
    },
    /** 选中元素的父节点 */
    selectParentElement() {
      const findParentId = (list: CanvasInnerElement[], parentId: string | null): { found: boolean; parentId: string | null } => {
        for (const el of list) {
          if (el.id === this.selectedElementId) return { found: true, parentId };
          if (el.type === CanvasElementTypeEnum.CONTAINER) {
            const result = findParentId((el as CanvasContainerElement).children, el.id);
            if (result.found) return result;
          }
        }
        return { found: false, parentId: null };
      };
      const { found, parentId } = findParentId(this.root.children, this.root.id);
      if (found) {
        this.selectElement(parentId);
      }
    },
  }
});
