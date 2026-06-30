import { type CanvasButtonElement, type CanvasContainerElement, type CanvasInnerElement, type CanvasImageElement, type CanvasInputElement, type CanvasLinkElement, type CanvasParagraphElement, type CanvasRadioElement, type CanvasCheckboxElement, type CanvasVideoElement, type CanvasAudioElement, type CanvasTextareaElement, type CanvasLabelElement, type CanvasFormElement, type CanvasSpanElement, type CanvasTextElement, type CanvasUnorderedListElement, type CanvasOrderedListElement, type CanvasListItemElement, type CanvasTableElement, type CanvasTableHeadElement, type CanvasTableBodyElement, type CanvasTableFootElement, type CanvasTableRowElement, type CanvasTableDataElement, type CanvasTableHeaderCellElement, type CanvasTableCaptionElement, type CanvasTableColGroupElement, type CanvasTableColElement, type CanvasHeaderElement, type CanvasFooterElement, type CanvasArticleElement, type CanvasSectionElement, type CanvasAsideElement, type CanvasHeading1Element, type CanvasHeading2Element, type CanvasHeading3Element, type CanvasHeading4Element, type CanvasHeading5Element, type CanvasHeading6Element, type CanvasRootElement, type CanvasElement, type CanvasInnerElementTypeEnum, type StyleConfig, isParentElement } from "@/views/Canvas/types";
import { ButtonTypeEnum, CanvasElementLabelMap, CanvasElementTypeEnum, LinkTargetEnum, SiderPanelEnum, LINK_DESCENDANT_EXCLUDE_TYPES, FORM_DESCENDANT_EXCLUDE_TYPES, SPAN_DESCENDANT_INCLUDE_TYPES, UL_DIRECT_INCLUDE_TYPES, OL_DIRECT_INCLUDE_TYPES, TABLE_DIRECT_INCLUDE_TYPES, THEAD_DIRECT_INCLUDE_TYPES, TBODY_DIRECT_INCLUDE_TYPES, TFOOT_DIRECT_INCLUDE_TYPES, TR_DIRECT_INCLUDE_TYPES, COLGROUP_DIRECT_INCLUDE_TYPES, FormMethodEnum, TableScopeEnum } from "@/constants/home";
import { DefaultStyleConfigMap, defaultClassStyleConfig, DisplayStyleEnum, FlexDirectionEnum, JustifyContentEnum, AlignItemsEnum, SizeUnitEnum, FontWeightEnum, TextAlignEnum, BackgroundTypeEnum, BorderStyleEnum, BorderCollapseEnum, TextDecorationEnum } from "@/constants/style";
import { defineStore } from "pinia";
import { nanoid } from "nanoid";
import { cloneDeep } from "lodash";
import { Positioner } from "@/views/Canvas/drag/Positioner";
import { convertStyleConfig } from "@/utils/styleConfig";
import { findElementInTree } from "@/views/Canvas/utils/treeTraversal";

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
      children: [],
      alias: CanvasElementLabelMap[CanvasElementTypeEnum.ROOT],
    } as CanvasRootElement,
    /** 选中的元素 */
    selectedElementId: null as string | null,
    /** 当前激活的 Sider 面板 */
    activePanel: SiderPanelEnum.COMPONENTS as SiderPanelEnum,
    /** 是否正在调整元素尺寸 */
    isResizing: false,
    /** 插入位置 */
    positioner: new Positioner(),
    /** 全局 class 样式配置映射 */
    classStyles: {} as Record<string, StyleConfig>,
  }),
  getters: {
    /** 全局class对应的最终样式 */
    convertClassStyles(state) {
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
    /** 清理未被任何元素锁定且样式内容为空的孤立 class 样式 */
    cleanupUnusedClassStyles() {
      /** 递归收集所有元素管理的 class 名称（包含启用和禁用） */
      const usedClasses = new Set<string>();
      const collect = (list: CanvasInnerElement[]) => {
        for (const el of list) {
          el.classNames.forEach((cls) => usedClasses.add(cls));
          if (isParentElement(el)) {
            collect(el.children);
          }
        }
      };
      collect(this.root.children);
      for (const className of Object.keys(this.classStyles)) {
        /** 未被任何元素锁定且样式内容为空则删除 */
        const isEmptyStyle = Object.keys(convertStyleConfig(this.classStyles[className])).length === 0;
        if (!usedClasses.has(className) && isEmptyStyle) {
          delete this.classStyles[className];
        }
      }
    },
    /** 获取指定id的元素 */
    getElementById (id: string): CanvasElement | null {
      return findElementInTree(this.root, id);
    },
    /** 获取指定id元素的父元素id */
    getParentElementId(id: string): string | null {
      const findParentId = (list: CanvasInnerElement[], parentId: string): string | null => {
        for (const el of list) {
          if (el.id === id) return parentId;
          if (isParentElement(el)) {
            const found = findParentId(el.children, el.id);
            if (found) return found;
          }
        }
        return null;
      };
      return findParentId(this.root.children, this.root.id);
    },
    /** 生成一个元素 */
    generateElement(type: CanvasInnerElementTypeEnum): CanvasInnerElement {
      const elBase = { 
        id: nanoid(),
        type,
        styleConfig: cloneDeep(DefaultStyleConfigMap[type as CanvasElementTypeEnum]),
        classes: [],
        classNames: [],
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
          return { ...elBase, href: '', target: LinkTargetEnum.SELF, children: [], descendantExclude: [...LINK_DESCENDANT_EXCLUDE_TYPES] } as CanvasLinkElement;
        case CanvasElementTypeEnum.CONTAINER:
          return { ...elBase, children: [] }  as CanvasContainerElement;
        case CanvasElementTypeEnum.INPUT:
          return { ...elBase, placeholder: '请输入内容', value: '', required: false } as CanvasInputElement;
        case CanvasElementTypeEnum.TEXTAREA:
          return { ...elBase, placeholder: '请输入内容', value: '', rows: 4, required: false } as CanvasTextareaElement;
        case CanvasElementTypeEnum.RADIO:
          return { ...elBase, name: '', value: '', checked: false, required: false } as CanvasRadioElement;
        case CanvasElementTypeEnum.CHECKBOX:
          return { ...elBase, name: '', value: '', checked: false, required: false } as CanvasCheckboxElement;
        case CanvasElementTypeEnum.VIDEO:
          return { ...elBase, src: '', controls: true } as CanvasVideoElement;
        case CanvasElementTypeEnum.AUDIO:
          return { ...elBase, src: '', controls: true } as CanvasAudioElement;
        case CanvasElementTypeEnum.LABEL:
          return { ...elBase, text: '标签', for: '' } as CanvasLabelElement;
        case CanvasElementTypeEnum.SPAN:
          return { ...elBase, children: [], descendantInclude: [...SPAN_DESCENDANT_INCLUDE_TYPES] } as CanvasSpanElement;
        case CanvasElementTypeEnum.TEXT:
          return { ...elBase, text: '文本' } as CanvasTextElement;
        case CanvasElementTypeEnum.FORM:
          return { ...elBase, action: '', method: FormMethodEnum.GET, children: [], descendantExclude: [...FORM_DESCENDANT_EXCLUDE_TYPES] } as CanvasFormElement;
        case CanvasElementTypeEnum.UNORDERED_LIST:
          return { ...elBase, children: [], directInclude: [...UL_DIRECT_INCLUDE_TYPES] } as CanvasUnorderedListElement;
        case CanvasElementTypeEnum.ORDERED_LIST:
          return { ...elBase, children: [], directInclude: [...OL_DIRECT_INCLUDE_TYPES] } as CanvasOrderedListElement;
        case CanvasElementTypeEnum.LIST_ITEM:
          return { ...elBase, children: [] } as CanvasListItemElement;
        case CanvasElementTypeEnum.TABLE:
          return { ...elBase, children: [], directInclude: [...TABLE_DIRECT_INCLUDE_TYPES] } as CanvasTableElement;
        case CanvasElementTypeEnum.TABLE_HEAD:
          return { ...elBase, children: [], directInclude: [...THEAD_DIRECT_INCLUDE_TYPES] } as CanvasTableHeadElement;
        case CanvasElementTypeEnum.TABLE_BODY:
          return { ...elBase, children: [], directInclude: [...TBODY_DIRECT_INCLUDE_TYPES] } as CanvasTableBodyElement;
        case CanvasElementTypeEnum.TABLE_FOOT:
          return { ...elBase, children: [], directInclude: [...TFOOT_DIRECT_INCLUDE_TYPES] } as CanvasTableFootElement;
        case CanvasElementTypeEnum.TABLE_ROW:
          return { ...elBase, children: [], directInclude: [...TR_DIRECT_INCLUDE_TYPES] } as CanvasTableRowElement;
        case CanvasElementTypeEnum.TABLE_DATA:
          return { ...elBase, colspan: 1, rowspan: 1, children: [] } as CanvasTableDataElement;
        case CanvasElementTypeEnum.TABLE_HEADER_CELL:
          return { ...elBase, colspan: 1, rowspan: 1, scope: TableScopeEnum.UNDEFINED, children: [] } as CanvasTableHeaderCellElement;
        case CanvasElementTypeEnum.TABLE_CAPTION:
          return { ...elBase, children: [] } as CanvasTableCaptionElement;
        case CanvasElementTypeEnum.TABLE_COL_GROUP:
          return { ...elBase, span: 1, children: [], directInclude: [...COLGROUP_DIRECT_INCLUDE_TYPES] } as CanvasTableColGroupElement;
        case CanvasElementTypeEnum.TABLE_COL:
          return { ...elBase, span: 1 } as CanvasTableColElement;
        case CanvasElementTypeEnum.HEADER:
          return { ...elBase, children: [] } as CanvasHeaderElement;
        case CanvasElementTypeEnum.FOOTER:
          return { ...elBase, children: [] } as CanvasFooterElement;
        case CanvasElementTypeEnum.ARTICLE:
          return { ...elBase, children: [] } as CanvasArticleElement;
        case CanvasElementTypeEnum.SECTION:
          return { ...elBase, children: [] } as CanvasSectionElement;
        case CanvasElementTypeEnum.ASIDE:
          return { ...elBase, children: [] } as CanvasAsideElement;
        case CanvasElementTypeEnum.HEADING_1:
          return { ...elBase, text: '一级标题' } as CanvasHeading1Element;
        case CanvasElementTypeEnum.HEADING_2:
          return { ...elBase, text: '二级标题' } as CanvasHeading2Element;
        case CanvasElementTypeEnum.HEADING_3:
          return { ...elBase, text: '三级标题' } as CanvasHeading3Element;
        case CanvasElementTypeEnum.HEADING_4:
          return { ...elBase, text: '四级标题' } as CanvasHeading4Element;
        case CanvasElementTypeEnum.HEADING_5:
          return { ...elBase, text: '五级标题' } as CanvasHeading5Element;
        case CanvasElementTypeEnum.HEADING_6:
          return { ...elBase, text: '六级标题' } as CanvasHeading6Element;
      }
    },
    /** 添加元素到指定容器 */
    addElementToContainer(type: CanvasInnerElementTypeEnum, containerId: string) {
      const element = this.generateElement(type);
      const findInList = (list: CanvasInnerElement[]): CanvasInnerElement | null => {
        for (const el of list) {
          if (el.id === containerId) return el;
          if (isParentElement(el)) {
            const found = findInList(el.children);
            if (found) return found;
          }
        }
        return null;
      };
      const container = findInList(this.root.children);
      if (container && isParentElement(container)) {
        container.children.push(element);
      }
      this.mergeAdjacentTextElements();
    },
    /** 选中元素 */
    selectElement(id: string | null = null) {
      if (id && !this.getElementById(id)) return;
      this.selectedElementId = id;
      if(id && this.activePanel === SiderPanelEnum.COMPONENTS){
        this.activePanel = SiderPanelEnum.EDIT;
      }
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
            if (isParentElement(el)) {
              return { ...el, children: removeFromList(el.children) };
            }
            return el;
          });
      }
      this.root.children = removeFromList(this.root.children);
      if(this.selectedElementId === id){
        this.selectElement(null);
      }
    },
    /** 清空所有元素（保留根元素） */
    clearAllElements() {
      this.root.children = [];
      if(this.selectedElementId !== this.root.id){
        this.selectElement(null);
      }
    },
    /** 复制元素（递归支持多层级，插入到原元素后面） */
    duplicateElement(id: string) {
      /** 复制出来的新元素 id */
      let duplicatedId: string | null = null;
      /** 递归为元素及其所有后代重新生成 id */
      const renewIds = (el: CanvasInnerElement): CanvasInnerElement => {
        const next = { ...el, id: nanoid() } as CanvasInnerElement;
        if (isParentElement(next)) {
          next.children = next.children.map(renewIds);
        }
        return next;
      };
      const duplicateInList = (list: CanvasInnerElement[]): CanvasInnerElement[] => {
        const result: CanvasInnerElement[] = [];
        for (const el of list) {
          result.push(el);
          if (el.id === id) {
            const duplicated = renewIds(cloneDeep(el));
            duplicatedId = duplicated.id;
            result.push(duplicated);
          } else if (isParentElement(el)) {
            result[result.length - 1] = { ...el, children: duplicateInList(el.children) };
          }
        }
        return result;
      };
      this.root.children = duplicateInList(this.root.children);
      if (duplicatedId) {
        this.selectElement(duplicatedId);
      }
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
          if (isParentElement(el)) {
            return { ...el, children: replaceWithTemp(el.children) };
          }
          return el;
        });
      };
      this.root.children = replaceWithTemp(this.root.children);

      // 先插入再删除，避免删除先前兄弟元素导致插入的相对位置发生改变
      if(targetParentId === this.root.id) {
        const clampedIndex = Math.min(index, this.root.children.length);
        this.root.children.splice(clampedIndex, 0, target);
      } else {
        /** 插入到目标位置 */
        const insertInList = (list: CanvasInnerElement[]): CanvasInnerElement[] => {
          return list.map((el) => {
            if (el.id === targetParentId && isParentElement(el)) {
              const children = [...el.children];
              const clampedIndex = Math.min(index, children.length);
              children.splice(clampedIndex, 0, target);
              return { ...el, children };
            }
            if (isParentElement(el)) {
              return { ...el, children: insertInList(el.children) };
            }
            return el;
          });
        };
        this.root.children = insertInList(this.root.children);
      }
      this.removeElement(tempId);
      this.mergeAdjacentTextElements();
    },
    /** 在指定容器的 index 位置添加元素 */
    addElementToContainerAt(type: CanvasInnerElementTypeEnum, containerId: string, index: number) {
      const element = this.generateElement(type);
      if(containerId === this.root.id){
        const clampedIndex = Math.min(index, this.root.children.length);
        this.root.children.splice(clampedIndex, 0, element);
        this.mergeAdjacentTextElements();
        return;
      }
      const insertInList = (list: CanvasInnerElement[]): CanvasInnerElement[] => {
        return list.map((el) => {
          if (el.id === containerId && isParentElement(el)) {
            const children = [...el.children];
            const clampedIndex = Math.min(index, children.length);
            children.splice(clampedIndex, 0, element);
            return { ...el, children };
          }
          if (isParentElement(el)) {
            return { ...el, children: insertInList(el.children) };
          }
          return el;
        });
      };
      this.root.children = insertInList(this.root.children);
      this.mergeAdjacentTextElements();
    },
    /** 选中元素的父节点 */
    selectParentElement() {
      const findParentId = (list: CanvasInnerElement[], parentId: string | null): { found: boolean; parentId: string | null } => {
        for (const el of list) {
          if (el.id === this.selectedElementId) return { found: true, parentId };
          if (isParentElement(el)) {
            const result = findParentId(el.children, el.id);
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
    /** 合并相邻的纯文本兄弟元素 */
    mergeAdjacentTextElements() {
      /** 合并后选中元素应映射到的 id */
      let mergedSelectedId: string | null = null;
      const mergeInList = (list: CanvasInnerElement[]): CanvasInnerElement[] => {
        const result: CanvasInnerElement[] = [];
        for (const el of list) {
          if (isParentElement(el)) {
            result.push({ ...el, children: mergeInList(el.children) });
            continue;
          }
          const prev = result[result.length - 1];
          if (prev && prev.type === CanvasElementTypeEnum.TEXT && el.type === CanvasElementTypeEnum.TEXT) {
            (prev as CanvasTextElement).text += (el as CanvasTextElement).text;
            if (el.id === this.selectedElementId) {
              mergedSelectedId = prev.id;
            }
          } else {
            result.push(el);
          }
        }
        return result;
      };
      this.root.children = mergeInList(this.root.children);
      if (mergedSelectedId) {
        this.selectElement(mergedSelectedId);
      }
    },
    /** 加载默认画布内容 */
    loadDefaultContent() {
      /** 创建基础样式配置 */
      const mkStyle = (overrides: Partial<StyleConfig> = {}): StyleConfig => ({
        general: {},
        size: {},
        font: { textShadows: [] },
        visual: { backgrounds: [], boxShadows: [] },
        flex: {},
        ...overrides,
      });

      /** 创建容器元素 */
      const mkContainer = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasContainerElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.CONTAINER, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.CONTAINER], children,
      });

      /** 创建段落元素 */
      const mkParagraph = (text: string, styleConfig: StyleConfig, alias?: string): CanvasParagraphElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.PARAGRAPH, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.PARAGRAPH], text,
      });

      /** 创建按钮元素 */
      const mkButton = (text: string, styleConfig: StyleConfig, alias?: string): CanvasButtonElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.BUTTON, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.BUTTON], text, buttonType: ButtonTypeEnum.BUTTON,
      });

      /** 创建链接元素 */
      const mkLink = (href: string, styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasLinkElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.LINK, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.LINK], href, target: LinkTargetEnum.SELF, children, descendantExclude: [...LINK_DESCENDANT_EXCLUDE_TYPES],
      });

      /** 创建输入框元素 */
      const mkInput = (placeholder: string, styleConfig: StyleConfig, alias?: string): CanvasInputElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.INPUT, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.INPUT], placeholder, value: '', required: false,
      });

      /** 创建图片元素 */
      const mkImage = (src: string, title: string, styleConfig: StyleConfig, alias?: string): CanvasImageElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.IMAGE, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.IMAGE], src, title,
      });

      /** 创建视频元素 */
      const mkVideo = (src: string, styleConfig: StyleConfig, alias?: string): CanvasVideoElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.VIDEO, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.VIDEO], src, controls: true,
      });

      /** 创建音频元素 */
      const mkAudio = (src: string, styleConfig: StyleConfig, alias?: string): CanvasAudioElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.AUDIO, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.AUDIO], src, controls: true,
      });

      /** 创建多行文本框元素 */
      const mkTextarea = (placeholder: string, styleConfig: StyleConfig, alias?: string): CanvasTextareaElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.TEXTAREA, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TEXTAREA], placeholder, value: '', rows: 4, required: false,
      });

      /** 创建单选框元素 */
      const mkRadio = (name: string, value: string, styleConfig: StyleConfig, alias?: string): CanvasRadioElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.RADIO, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.RADIO], name, value, checked: false, required: false,
      });

      /** 创建多选框元素 */
      const mkCheckbox = (name: string, value: string, styleConfig: StyleConfig, alias?: string): CanvasCheckboxElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.CHECKBOX, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.CHECKBOX], name, value, checked: false, required: false,
      });

      /** 创建标签元素 */
      const mkLabel = (text: string, forId: string, styleConfig: StyleConfig, alias?: string): CanvasLabelElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.LABEL, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.LABEL], text, for: forId,
      });

      /** 创建表单元素 */
      const mkForm = (action: string, method: FormMethodEnum, styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasFormElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.FORM, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.FORM], action, method, children, descendantExclude: [...FORM_DESCENDANT_EXCLUDE_TYPES],
      });

      /** 创建行内容器元素 */
      const mkSpan = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasSpanElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.SPAN, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.SPAN], children, descendantInclude: [...SPAN_DESCENDANT_INCLUDE_TYPES],
      });

      /** 创建纯文本元素 */
      const mkText = (text: string, styleConfig: StyleConfig, alias?: string): CanvasTextElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.TEXT, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TEXT], text,
      });

      /** 创建标题元素（h1-h6） */
      const mkHeading = (
        level: 1 | 2 | 3 | 4 | 5 | 6,
        text: string,
        styleConfig: StyleConfig,
        alias?: string,
      ): CanvasHeading1Element | CanvasHeading2Element | CanvasHeading3Element | CanvasHeading4Element | CanvasHeading5Element | CanvasHeading6Element => {
        const typeMap = {
          1: CanvasElementTypeEnum.HEADING_1, 2: CanvasElementTypeEnum.HEADING_2, 3: CanvasElementTypeEnum.HEADING_3,
          4: CanvasElementTypeEnum.HEADING_4, 5: CanvasElementTypeEnum.HEADING_5, 6: CanvasElementTypeEnum.HEADING_6,
        } as const;
        const type = typeMap[level];
        return {
          id: nanoid(), type, styleConfig, classes: [], classNames: [],
          alias: alias ?? CanvasElementLabelMap[type], text,
        } as CanvasHeading1Element | CanvasHeading2Element | CanvasHeading3Element | CanvasHeading4Element | CanvasHeading5Element | CanvasHeading6Element;
      };

      /** 创建无序列表元素 */
      const mkUnorderedList = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasUnorderedListElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.UNORDERED_LIST, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.UNORDERED_LIST], children, directInclude: [...UL_DIRECT_INCLUDE_TYPES],
      });

      /** 创建有序列表元素 */
      const mkOrderedList = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasOrderedListElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.ORDERED_LIST, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.ORDERED_LIST], children, directInclude: [...OL_DIRECT_INCLUDE_TYPES],
      });

      /** 创建列表项元素 */
      const mkListItem = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasListItemElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.LIST_ITEM, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.LIST_ITEM], children,
      });

      /** 创建表格元素 */
      const mkTable = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.TABLE, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE], children, directInclude: [...TABLE_DIRECT_INCLUDE_TYPES],
      });

      /** 创建表头元素 */
      const mkTableHead = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableHeadElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.TABLE_HEAD, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_HEAD], children, directInclude: [...THEAD_DIRECT_INCLUDE_TYPES],
      });

      /** 创建表体元素 */
      const mkTableBody = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableBodyElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.TABLE_BODY, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_BODY], children, directInclude: [...TBODY_DIRECT_INCLUDE_TYPES],
      });

      /** 创建表脚元素 */
      const mkTableFoot = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableFootElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.TABLE_FOOT, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_FOOT], children, directInclude: [...TFOOT_DIRECT_INCLUDE_TYPES],
      });

      /** 创建表格行元素 */
      const mkTableRow = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableRowElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.TABLE_ROW, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_ROW], children, directInclude: [...TR_DIRECT_INCLUDE_TYPES],
      });

      /** 创建表格单元格元素 */
      const mkTableData = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableDataElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.TABLE_DATA, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_DATA], colspan: 1, rowspan: 1, children,
      });

      /** 创建表头单元格元素 */
      const mkTableHeaderCell = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string, scope: TableScopeEnum = TableScopeEnum.UNDEFINED): CanvasTableHeaderCellElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.TABLE_HEADER_CELL, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_HEADER_CELL], colspan: 1, rowspan: 1, scope, children,
      });

      /** 创建表格标题元素 */
      const mkTableCaption = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableCaptionElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.TABLE_CAPTION, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_CAPTION], children,
      });

      /** 创建表格列组元素 */
      const mkTableColGroup = (span: number, styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableColGroupElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.TABLE_COL_GROUP, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_COL_GROUP], span, children, directInclude: [...COLGROUP_DIRECT_INCLUDE_TYPES],
      });

      /** 创建表格列元素 */
      const mkTableCol = (span: number, styleConfig: StyleConfig, alias?: string): CanvasTableColElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.TABLE_COL, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_COL], span,
      });

      /** 创建页头元素 */
      const mkHeader = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasHeaderElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.HEADER, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.HEADER], children,
      });

      /** 创建页脚元素 */
      const mkFooter = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasFooterElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.FOOTER, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.FOOTER], children,
      });

      /** 创建文章元素 */
      const mkArticle = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasArticleElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.ARTICLE, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.ARTICLE], children,
      });

      /** 创建章节元素 */
      const mkSection = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasSectionElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.SECTION, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.SECTION], children,
      });

      /** 创建侧边栏元素 */
      const mkAside = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasAsideElement => ({
        id: nanoid(), type: CanvasElementTypeEnum.ASIDE, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.ASIDE], children,
      });

      /** 通用文本样式 */
      const textSm = mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#666666', textShadows: [] } });

      /** 通用样式快捷方法 */
      const flexRow = (overrides: Partial<StyleConfig> = {}): StyleConfig => mkStyle({
        general: { display: DisplayStyleEnum.FLEX },
        flex: { flexDirection: FlexDirectionEnum.ROW, ...overrides.flex },
        ...overrides,
      });
      const flexCol = (overrides: Partial<StyleConfig> = {}): StyleConfig => mkStyle({
        general: { display: DisplayStyleEnum.FLEX },
        flex: { flexDirection: FlexDirectionEnum.COLUMN, ...overrides.flex },
        ...overrides,
      });
      const sectionPadding = {
        paddingTop: 48, paddingTopUnit: SizeUnitEnum.PX,
        paddingRight: 24, paddingRightUnit: SizeUnitEnum.PX,
        paddingBottom: 48, paddingBottomUnit: SizeUnitEnum.PX,
        paddingLeft: 24, paddingLeftUnit: SizeUnitEnum.PX,
        width: '100', widthUnit: SizeUnitEnum.PERCENT,
      };
      const cardStyle = mkStyle({
        general: { display: DisplayStyleEnum.FLEX },
        flex: { flexDirection: FlexDirectionEnum.COLUMN, alignItems: AlignItemsEnum.FLEX_START },
        size: {
          paddingTop: 24, paddingTopUnit: SizeUnitEnum.PX,
          paddingRight: 24, paddingRightUnit: SizeUnitEnum.PX,
          paddingBottom: 24, paddingBottomUnit: SizeUnitEnum.PX,
          paddingLeft: 24, paddingLeftUnit: SizeUnitEnum.PX,
          width: '30', widthUnit: SizeUnitEnum.PERCENT,
        },
        visual: {
          backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }],
          boxShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 2, yUnit: SizeUnitEnum.PX, blur: 8, blurUnit: SizeUnitEnum.PX, spread: 0, spreadUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.08)', inset: false }],
          borderRadiusTL: 8, borderRadiusTR: 8, borderRadiusBL: 8, borderRadiusBR: 8, borderRadiusUnit: SizeUnitEnum.PX,
        },
      });

      /** ---- 页头（header） ---- */
      const headerEl = mkHeader(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX },
          flex: { flexDirection: FlexDirectionEnum.ROW, justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.CENTER },
          size: { ...sectionPadding, paddingTop: 12, paddingBottom: 12 },
          visual: {
            backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }],
            boxShadows: [],
            borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#e8e8e8',
          },
        }),
        [
          mkSpan(mkStyle({
            font: { fontSize: 20, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a1a', textShadows: [] },
          }), [
            mkText('VibePage', mkStyle({ font: { fontSize: 20, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a1a', textShadows: [] } }), 'logo-text'),
          ], 'logo'),
          mkContainer(flexRow({ flex: { alignItems: AlignItemsEnum.CENTER } }), [
            mkLink('#', mkStyle({ size: { marginRight: '24', marginRightUnit: SizeUnitEnum.PX } }), [
              mkText('首页', textSm),
            ], 'nav-home'),
            mkLink('#', mkStyle({ size: { marginRight: '24', marginRightUnit: SizeUnitEnum.PX } }), [
              mkText('功能', textSm),
            ], 'nav-features'),
            mkLink('#', mkStyle({}), [
              mkText('关于', textSm),
            ], 'nav-about'),
          ], 'nav-links'),
        ],
        'site-header',
      );

      /** ---- Hero 区域（section + h1 + h2 + h3 + p + button + image + link） ---- */
      const hero = mkSection(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX },
          flex: { flexDirection: FlexDirectionEnum.COLUMN, justifyContent: JustifyContentEnum.CENTER, alignItems: AlignItemsEnum.CENTER },
          size: { ...sectionPadding, paddingTop: 64, paddingBottom: 64 },
          visual: {
            backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#f5f7fa' }],
            boxShadows: [],
          },
        }),
        [
          mkHeading(1, '构建你的页面', mkStyle({
            font: { fontSize: 36, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a1a', textAlign: TextAlignEnum.CENTER, textShadows: [] },
            size: { marginBottom: '16', marginBottomUnit: SizeUnitEnum.PX },
          }), 'hero-title'),
          mkHeading(2, '所见即所得的可视化编辑器', mkStyle({
            font: { fontSize: 28, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: '#333333', textAlign: TextAlignEnum.CENTER, textShadows: [] },
            size: { marginBottom: '12', marginBottomUnit: SizeUnitEnum.PX },
          }), 'hero-subtitle'),
          mkHeading(3, '轻松搭建专业页面', mkStyle({
            font: { fontSize: 20, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.MEDIUM, color: '#555555', textAlign: TextAlignEnum.CENTER, textShadows: [] },
            size: { marginBottom: '24', marginBottomUnit: SizeUnitEnum.PX },
          }), 'hero-h3'),
          mkParagraph('可视化拖拽编辑器，所见即所得，无需编写代码即可搭建页面。', mkStyle({
            font: { fontSize: 16, fontSizeUnit: SizeUnitEnum.PX, color: '#666666', textAlign: TextAlignEnum.CENTER, textShadows: [] },
            size: { marginBottom: '32', marginBottomUnit: SizeUnitEnum.PX, maxWidth: '600', maxWidthUnit: SizeUnitEnum.PX },
          }), 'hero-desc'),
          mkContainer(flexRow({ flex: { justifyContent: JustifyContentEnum.CENTER } }), [
            mkButton('开始使用', mkStyle({
              font: { fontSize: 16, fontSizeUnit: SizeUnitEnum.PX, color: '#ffffff', fontWeight: FontWeightEnum.MEDIUM, textShadows: [] },
              visual: {
                backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#1677ff' }],
                boxShadows: [],
                borderRadiusTL: 6, borderRadiusTR: 6, borderRadiusBL: 6, borderRadiusBR: 6, borderRadiusUnit: SizeUnitEnum.PX,
              },
              size: {
                paddingTop: 10, paddingTopUnit: SizeUnitEnum.PX,
                paddingRight: 32, paddingRightUnit: SizeUnitEnum.PX,
                paddingBottom: 10, paddingBottomUnit: SizeUnitEnum.PX,
                paddingLeft: 32, paddingLeftUnit: SizeUnitEnum.PX,
                marginRight: '16', marginRightUnit: SizeUnitEnum.PX,
              },
            }), 'hero-cta'),
            mkLink('#docs', mkStyle({
              general: { display: DisplayStyleEnum.INLINE_BLOCK },
              size: {
                paddingTop: 10, paddingTopUnit: SizeUnitEnum.PX,
                paddingRight: 32, paddingRightUnit: SizeUnitEnum.PX,
                paddingBottom: 10, paddingBottomUnit: SizeUnitEnum.PX,
                paddingLeft: 32, paddingLeftUnit: SizeUnitEnum.PX,
              },
              visual: {
                backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }],
                boxShadows: [],
                borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#1677ff',
                borderRadiusTL: 6, borderRadiusTR: 6, borderRadiusBL: 6, borderRadiusBR: 6, borderRadiusUnit: SizeUnitEnum.PX,
              },
              font: { fontSize: 16, fontSizeUnit: SizeUnitEnum.PX, color: '#1677ff', textShadows: [] },
            }), [
              mkText('查看文档', mkStyle({ font: { fontSize: 16, fontSizeUnit: SizeUnitEnum.PX, color: '#1677ff', textShadows: [] } })),
            ], 'hero-docs-link'),
          ], 'hero-actions'),
          mkImage('https://placeholder.com/800x400', 'Hero 示意图', mkStyle({
            size: {
              width: '800', widthUnit: SizeUnitEnum.PX,
              maxWidth: '100', maxWidthUnit: SizeUnitEnum.PERCENT,
              marginTop: '32', marginTopUnit: SizeUnitEnum.PX,
            },
            visual: {
              backgrounds: [],
              boxShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 4, yUnit: SizeUnitEnum.PX, blur: 16, blurUnit: SizeUnitEnum.PX, spread: 0, spreadUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.12)', inset: false }],
              borderRadiusTL: 8, borderRadiusTR: 8, borderRadiusBL: 8, borderRadiusBR: 8, borderRadiusUnit: SizeUnitEnum.PX,
            },
          }), 'hero-image'),
        ],
        'hero',
      );

      /** ---- 功能卡片区域（h4 + h5 + h6 + p + container） ---- */
      const mkFeatureCard = (title: string, desc: string, alias: string): CanvasContainerElement => {
        return mkContainer(
          cloneDeep(cardStyle),
          [
            mkHeading(4, title, mkStyle({
              font: { fontSize: 18, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: '#1a1a1a', textShadows: [] },
              size: { marginBottom: '12', marginBottomUnit: SizeUnitEnum.PX },
            })),
            mkParagraph(desc, mkStyle({
              font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#666666', lineHeight: '1.6', textShadows: [] },
            })),
          ],
          alias,
        );
      };

      const features = mkSection(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX },
          flex: { flexDirection: FlexDirectionEnum.COLUMN, alignItems: AlignItemsEnum.CENTER },
          size: sectionPadding,
        }),
        [
          mkHeading(3, '核心功能', mkStyle({
            font: { fontSize: 24, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a1a', textAlign: TextAlignEnum.CENTER, textShadows: [] },
            size: { marginBottom: '32', marginBottomUnit: SizeUnitEnum.PX },
          }), 'features-title'),
          mkContainer(
            flexRow({ flex: { justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.FLEX_START } }),
            [
              mkFeatureCard('拖拽编辑', '所见即所得的可视化编辑体验，无需编写代码即可搭建页面。', 'feature-1'),
              mkFeatureCard('组件丰富', '内置多种基础组件，容器、按钮、图片、表单等一应俱全。', 'feature-2'),
              mkFeatureCard('实时预览', '随时切换预览模式，查看最终页面效果，确保设计无误。', 'feature-3'),
            ],
            'feature-cards',
          ),
          mkContainer(flexRow({ flex: { justifyContent: JustifyContentEnum.SPACE_BETWEEN } }), [
            mkHeading(5, '五级标题示例', mkStyle({
              font: { fontSize: 16, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.MEDIUM, color: '#333333', textShadows: [] },
            }), 'h5-sample'),
            mkHeading(6, '六级标题示例', mkStyle({
              font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.NORMAL, color: '#666666', textShadows: [] },
            }), 'h6-sample'),
          ], 'heading-samples'),
        ],
        'features',
      );

      /** ---- 文章 + 侧边栏区域（article + section + aside + p + span + text） ---- */
      const articleSection = mkSection(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX },
          flex: { flexDirection: FlexDirectionEnum.ROW, justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.FLEX_START },
          size: sectionPadding,
        }),
        [
          mkArticle(
            mkStyle({
              size: { width: '65', widthUnit: SizeUnitEnum.PERCENT },
            }),
            [
              mkHeading(2, '关于 VibePage', mkStyle({
                font: { fontSize: 24, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a1a', textShadows: [] },
                size: { marginBottom: '16', marginBottomUnit: SizeUnitEnum.PX },
              }), 'article-title'),
              mkParagraph('VibePage 是一款可视化的页面搭建工具，支持拖拽编辑、实时预览，内置丰富的组件库，帮助用户快速构建专业页面。', mkStyle({
                font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', lineHeight: '1.8', textShadows: [] },
                size: { marginBottom: '16', marginBottomUnit: SizeUnitEnum.PX },
              }), 'article-p1'),
              mkParagraph('通过直观的编辑界面，你可以轻松调整元素的样式、布局和交互行为，无需任何编码经验。', mkStyle({
                font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', lineHeight: '1.8', textShadows: [] },
                size: { marginBottom: '16', marginBottomUnit: SizeUnitEnum.PX },
              }), 'article-p2'),
              mkSpan(mkStyle({
                font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#1677ff', fontWeight: FontWeightEnum.MEDIUM, textShadows: [] },
              }), [
                mkText('了解更多详情，请访问', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', textShadows: [] } })),
                mkLink('#detail', mkStyle({ size: { marginLeft: '4', marginLeftUnit: SizeUnitEnum.PX } }), [
                  mkText('详细文档', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#1677ff', textDecoration: TextDecorationEnum.UNDERLINE, textShadows: [] } })),
                ], 'article-link'),
              ], 'article-span'),
            ],
            'main-article',
          ),
          mkAside(
            mkStyle({
              size: { width: '30', widthUnit: SizeUnitEnum.PERCENT, paddingTop: 16, paddingTopUnit: SizeUnitEnum.PX, paddingRight: 16, paddingRightUnit: SizeUnitEnum.PX, paddingBottom: 16, paddingBottomUnit: SizeUnitEnum.PX, paddingLeft: 16, paddingLeftUnit: SizeUnitEnum.PX },
              visual: {
                backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#f5f7fa' }],
                boxShadows: [],
                borderRadiusTL: 8, borderRadiusTR: 8, borderRadiusBL: 8, borderRadiusBR: 8, borderRadiusUnit: SizeUnitEnum.PX,
                borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#e8e8e8',
              },
            }),
            [
              mkHeading(4, '侧边栏', mkStyle({
                font: { fontSize: 16, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: '#1a1a1a', textShadows: [] },
                size: { marginBottom: '12', marginBottomUnit: SizeUnitEnum.PX },
              }), 'aside-title'),
              mkParagraph('这里是侧边栏内容，可以放置相关信息、链接或广告。', mkStyle({
                font: { fontSize: 13, fontSizeUnit: SizeUnitEnum.PX, color: '#666666', lineHeight: '1.6', textShadows: [] },
              }), 'aside-desc'),
            ],
            'sidebar',
          ),
        ],
        'article-section',
      );

      /** ---- 表单区域（form + label + input + textarea + radio + checkbox + button） ---- */
      const formEl = mkForm('/submit', FormMethodEnum.POST, mkStyle({
        size: { width: '500', widthUnit: SizeUnitEnum.PX, maxWidth: '100', maxWidthUnit: SizeUnitEnum.PERCENT },
      }), [
        mkHeading(3, '联系我们', mkStyle({
          font: { fontSize: 24, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a1a', textAlign: TextAlignEnum.CENTER, textShadows: [] },
          size: { marginBottom: '24', marginBottomUnit: SizeUnitEnum.PX },
        }), 'form-title'),
        mkContainer(flexCol({}), [
          mkLabel('姓名', '', mkStyle({
            font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.MEDIUM, color: '#333333', textShadows: [] },
            size: { marginBottom: '6', marginBottomUnit: SizeUnitEnum.PX },
          }), 'label-name'),
          mkInput('请输入你的姓名', mkStyle({
            size: {
              width: '100', widthUnit: SizeUnitEnum.PERCENT,
              paddingTop: 10, paddingTopUnit: SizeUnitEnum.PX,
              paddingRight: 16, paddingRightUnit: SizeUnitEnum.PX,
              paddingBottom: 10, paddingBottomUnit: SizeUnitEnum.PX,
              paddingLeft: 16, paddingLeftUnit: SizeUnitEnum.PX,
              marginBottom: '16', marginBottomUnit: SizeUnitEnum.PX,
            },
            visual: {
              backgrounds: [],
              boxShadows: [],
              borderRadiusTL: 6, borderRadiusTR: 6, borderRadiusBL: 6, borderRadiusBR: 6, borderRadiusUnit: SizeUnitEnum.PX,
              borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#d9d9d9',
            },
          }), 'form-name'),
        ], 'form-name-group'),
        mkContainer(flexCol({}), [
          mkLabel('邮箱', '', mkStyle({
            font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.MEDIUM, color: '#333333', textShadows: [] },
            size: { marginBottom: '6', marginBottomUnit: SizeUnitEnum.PX },
          }), 'label-email'),
          mkInput('请输入你的邮箱', mkStyle({
            size: {
              width: '100', widthUnit: SizeUnitEnum.PERCENT,
              paddingTop: 10, paddingTopUnit: SizeUnitEnum.PX,
              paddingRight: 16, paddingRightUnit: SizeUnitEnum.PX,
              paddingBottom: 10, paddingBottomUnit: SizeUnitEnum.PX,
              paddingLeft: 16, paddingLeftUnit: SizeUnitEnum.PX,
              marginBottom: '16', marginBottomUnit: SizeUnitEnum.PX,
            },
            visual: {
              backgrounds: [],
              boxShadows: [],
              borderRadiusTL: 6, borderRadiusTR: 6, borderRadiusBL: 6, borderRadiusBR: 6, borderRadiusUnit: SizeUnitEnum.PX,
              borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#d9d9d9',
            },
          }), 'form-email'),
        ], 'form-email-group'),
        mkContainer(flexCol({}), [
          mkLabel('留言', '', mkStyle({
            font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.MEDIUM, color: '#333333', textShadows: [] },
            size: { marginBottom: '6', marginBottomUnit: SizeUnitEnum.PX },
          }), 'label-message'),
          mkTextarea('请输入留言内容', mkStyle({
            size: {
              width: '100', widthUnit: SizeUnitEnum.PERCENT,
              paddingTop: 10, paddingTopUnit: SizeUnitEnum.PX,
              paddingRight: 16, paddingRightUnit: SizeUnitEnum.PX,
              paddingBottom: 10, paddingBottomUnit: SizeUnitEnum.PX,
              paddingLeft: 16, paddingLeftUnit: SizeUnitEnum.PX,
              marginBottom: '16', marginBottomUnit: SizeUnitEnum.PX,
            },
            visual: {
              backgrounds: [],
              boxShadows: [],
              borderRadiusTL: 6, borderRadiusTR: 6, borderRadiusBL: 6, borderRadiusBR: 6, borderRadiusUnit: SizeUnitEnum.PX,
              borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#d9d9d9',
            },
          }), 'form-message'),
        ], 'form-message-group'),
        mkContainer(flexCol({}), [
          mkLabel('性别', '', mkStyle({
            font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.MEDIUM, color: '#333333', textShadows: [] },
            size: { marginBottom: '6', marginBottomUnit: SizeUnitEnum.PX },
          }), 'label-gender'),
          mkContainer(flexRow({ flex: { alignItems: AlignItemsEnum.CENTER } }), [
            mkRadio('gender', 'male', mkStyle({ size: { marginRight: '4', marginRightUnit: SizeUnitEnum.PX } }), 'radio-male'),
            mkLabel('男', '', mkStyle({
              font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', textShadows: [] },
              size: { marginRight: '16', marginRightUnit: SizeUnitEnum.PX },
            }), 'label-male'),
            mkRadio('gender', 'female', mkStyle({ size: { marginRight: '4', marginRightUnit: SizeUnitEnum.PX } }), 'radio-female'),
            mkLabel('女', '', mkStyle({
              font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', textShadows: [] },
            }), 'label-female'),
          ], 'radio-group'),
        ], 'form-gender-group'),
        mkContainer(flexCol({}), [
          mkLabel('兴趣爱好', '', mkStyle({
            font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.MEDIUM, color: '#333333', textShadows: [] },
            size: { marginBottom: '6', marginBottomUnit: SizeUnitEnum.PX },
          }), 'label-hobby'),
          mkContainer(flexRow({ flex: { alignItems: AlignItemsEnum.CENTER } }), [
            mkCheckbox('hobby', 'coding', mkStyle({ size: { marginRight: '4', marginRightUnit: SizeUnitEnum.PX } }), 'checkbox-coding'),
            mkLabel('编程', '', mkStyle({
              font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', textShadows: [] },
              size: { marginRight: '16', marginRightUnit: SizeUnitEnum.PX },
            }), 'label-coding'),
            mkCheckbox('hobby', 'design', mkStyle({ size: { marginRight: '4', marginRightUnit: SizeUnitEnum.PX } }), 'checkbox-design'),
            mkLabel('设计', '', mkStyle({
              font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', textShadows: [] },
            }), 'label-design'),
          ], 'checkbox-group'),
        ], 'form-hobby-group'),
        mkButton('提交', mkStyle({
          font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#ffffff', fontWeight: FontWeightEnum.NORMAL, textShadows: [] },
          visual: {
            backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#1677ff' }],
            boxShadows: [],
            borderRadiusTL: 6, borderRadiusTR: 6, borderRadiusBL: 6, borderRadiusBR: 6, borderRadiusUnit: SizeUnitEnum.PX,
          },
          size: {
            paddingTop: 10, paddingTopUnit: SizeUnitEnum.PX,
            paddingRight: 32, paddingRightUnit: SizeUnitEnum.PX,
            paddingBottom: 10, paddingBottomUnit: SizeUnitEnum.PX,
            paddingLeft: 32, paddingLeftUnit: SizeUnitEnum.PX,
            marginTop: '8', marginTopUnit: SizeUnitEnum.PX,
          },
        }), 'form-submit'),
      ], 'contact-form');

      const formSection = mkSection(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX },
          flex: { flexDirection: FlexDirectionEnum.COLUMN, justifyContent: JustifyContentEnum.CENTER, alignItems: AlignItemsEnum.CENTER },
          size: sectionPadding,
        }),
        [formEl],
        'form-section',
      );

      /** ---- 列表区域（ul + ol + li + p + link） ---- */
      const listSection = mkSection(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX },
          flex: { flexDirection: FlexDirectionEnum.ROW, justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.FLEX_START },
          size: sectionPadding,
        }),
        [
          mkContainer(mkStyle({ size: { width: '45', widthUnit: SizeUnitEnum.PERCENT } }), [
            mkHeading(3, '功能列表', mkStyle({
              font: { fontSize: 20, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a1a', textShadows: [] },
              size: { marginBottom: '16', marginBottomUnit: SizeUnitEnum.PX },
            }), 'ul-title'),
            mkUnorderedList(mkStyle({
              size: { paddingLeft: 20, paddingLeftUnit: SizeUnitEnum.PX },
            }), [
              mkListItem(mkStyle({ size: { marginBottom: '8', marginBottomUnit: SizeUnitEnum.PX } }), [
                mkText('拖拽式可视化编辑', textSm),
              ], 'ul-item-1'),
              mkListItem(mkStyle({ size: { marginBottom: '8', marginBottomUnit: SizeUnitEnum.PX } }), [
                mkText('丰富的组件库', textSm),
              ], 'ul-item-2'),
              mkListItem(mkStyle({ size: { marginBottom: '8', marginBottomUnit: SizeUnitEnum.PX } }), [
                mkText('实时预览与代码导出', textSm),
              ], 'ul-item-3'),
              mkListItem(mkStyle({}), [
                mkText('支持自定义样式与动画', textSm),
              ], 'ul-item-4'),
            ], 'feature-ul'),
          ], 'ul-group'),
          mkContainer(mkStyle({ size: { width: '45', widthUnit: SizeUnitEnum.PERCENT } }), [
            mkHeading(3, '使用步骤', mkStyle({
              font: { fontSize: 20, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a1a', textShadows: [] },
              size: { marginBottom: '16', marginBottomUnit: SizeUnitEnum.PX },
            }), 'ol-title'),
            mkOrderedList(mkStyle({
              size: { paddingLeft: 20, paddingLeftUnit: SizeUnitEnum.PX },
            }), [
              mkListItem(mkStyle({ size: { marginBottom: '8', marginBottomUnit: SizeUnitEnum.PX } }), [
                mkText('打开编辑器，选择组件', textSm),
              ], 'ol-item-1'),
              mkListItem(mkStyle({ size: { marginBottom: '8', marginBottomUnit: SizeUnitEnum.PX } }), [
                mkText('拖拽组件到画布', textSm),
              ], 'ol-item-2'),
              mkListItem(mkStyle({ size: { marginBottom: '8', marginBottomUnit: SizeUnitEnum.PX } }), [
                mkText('调整样式和属性', textSm),
              ], 'ol-item-3'),
              mkListItem(mkStyle({}), [
                mkText('预览并导出代码', textSm),
              ], 'ol-item-4'),
            ], 'steps-ol'),
          ], 'ol-group'),
        ],
        'list-section',
      );

      /** ---- 表格区域（table + caption + colgroup + col + thead + tbody + tfoot + tr + th + td） ---- */
      const tableSection = mkSection(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX },
          flex: { flexDirection: FlexDirectionEnum.COLUMN, alignItems: AlignItemsEnum.CENTER },
          size: sectionPadding,
        }),
        [
          mkHeading(3, '版本对比', mkStyle({
            font: { fontSize: 24, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a1a', textAlign: TextAlignEnum.CENTER, textShadows: [] },
            size: { marginBottom: '24', marginBottomUnit: SizeUnitEnum.PX },
          }), 'table-title'),
          mkTable(mkStyle({
            general: { borderCollapse: BorderCollapseEnum.COLLAPSE },
            visual: {
              backgrounds: [],
              boxShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 2, yUnit: SizeUnitEnum.PX, blur: 8, blurUnit: SizeUnitEnum.PX, spread: 0, spreadUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.08)', inset: false }],
              borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#e8e8e8',
              borderRadiusTL: 8, borderRadiusTR: 8, borderRadiusBL: 8, borderRadiusBR: 8, borderRadiusUnit: SizeUnitEnum.PX,
            },
          }), [
            mkTableCaption(mkStyle({
              font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.MEDIUM, color: '#666666', textShadows: [] },
              size: { marginBottom: '8', marginBottomUnit: SizeUnitEnum.PX },
            }), [
              mkText('VibePage 各版本功能对比表', textSm),
            ], 'table-caption'),
            mkTableColGroup(1, mkStyle({}), [
              mkTableCol(1, mkStyle({})),
              mkTableCol(1, mkStyle({})),
              mkTableCol(1, mkStyle({})),
            ], 'table-colgroup'),
            mkTableHead(mkStyle({
              visual: { backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#f5f7fa' }], boxShadows: [] },
            }), [
              mkTableRow(mkStyle({}), [
                mkTableHeaderCell(mkStyle({}), [
                  mkText('功能', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#333333', textShadows: [] } })),
                ], 'th-feature', TableScopeEnum.COL),
                mkTableHeaderCell(mkStyle({}), [
                  mkText('免费版', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#333333', textShadows: [] } })),
                ], 'th-free', TableScopeEnum.COL),
                mkTableHeaderCell(mkStyle({}), [
                  mkText('专业版', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#333333', textShadows: [] } })),
                ], 'th-pro', TableScopeEnum.COL),
              ], 'thead-tr'),
            ], 'table-thead'),
            mkTableBody(mkStyle({}), [
              mkTableRow(mkStyle({}), [
                mkTableData(mkStyle({ size: { paddingTop: 10, paddingTopUnit: SizeUnitEnum.PX, paddingRight: 16, paddingRightUnit: SizeUnitEnum.PX, paddingBottom: 10, paddingBottomUnit: SizeUnitEnum.PX, paddingLeft: 16, paddingLeftUnit: SizeUnitEnum.PX } }), [
                  mkText('拖拽编辑', textSm),
                ], 'td-1-1'),
                mkTableData(mkStyle({ size: { paddingTop: 10, paddingTopUnit: SizeUnitEnum.PX, paddingRight: 16, paddingRightUnit: SizeUnitEnum.PX, paddingBottom: 10, paddingBottomUnit: SizeUnitEnum.PX, paddingLeft: 16, paddingLeftUnit: SizeUnitEnum.PX } }), [
                  mkText('支持', textSm),
                ], 'td-1-2'),
                mkTableData(mkStyle({ size: { paddingTop: 10, paddingTopUnit: SizeUnitEnum.PX, paddingRight: 16, paddingRightUnit: SizeUnitEnum.PX, paddingBottom: 10, paddingBottomUnit: SizeUnitEnum.PX, paddingLeft: 16, paddingLeftUnit: SizeUnitEnum.PX } }), [
                  mkText('支持', textSm),
                ], 'td-1-3'),
              ], 'tbody-tr-1'),
              mkTableRow(mkStyle({}), [
                mkTableData(mkStyle({ size: { paddingTop: 10, paddingTopUnit: SizeUnitEnum.PX, paddingRight: 16, paddingRightUnit: SizeUnitEnum.PX, paddingBottom: 10, paddingBottomUnit: SizeUnitEnum.PX, paddingLeft: 16, paddingLeftUnit: SizeUnitEnum.PX } }), [
                  mkText('组件数量', textSm),
                ], 'td-2-1'),
                mkTableData(mkStyle({ size: { paddingTop: 10, paddingTopUnit: SizeUnitEnum.PX, paddingRight: 16, paddingRightUnit: SizeUnitEnum.PX, paddingBottom: 10, paddingBottomUnit: SizeUnitEnum.PX, paddingLeft: 16, paddingLeftUnit: SizeUnitEnum.PX } }), [
                  mkText('10+', textSm),
                ], 'td-2-2'),
                mkTableData(mkStyle({ size: { paddingTop: 10, paddingTopUnit: SizeUnitEnum.PX, paddingRight: 16, paddingRightUnit: SizeUnitEnum.PX, paddingBottom: 10, paddingBottomUnit: SizeUnitEnum.PX, paddingLeft: 16, paddingLeftUnit: SizeUnitEnum.PX } }), [
                  mkText('50+', textSm),
                ], 'td-2-3'),
              ], 'tbody-tr-2'),
              mkTableRow(mkStyle({}), [
                mkTableData(mkStyle({ size: { paddingTop: 10, paddingTopUnit: SizeUnitEnum.PX, paddingRight: 16, paddingRightUnit: SizeUnitEnum.PX, paddingBottom: 10, paddingBottomUnit: SizeUnitEnum.PX, paddingLeft: 16, paddingLeftUnit: SizeUnitEnum.PX } }), [
                  mkText('代码导出', textSm),
                ], 'td-3-1'),
                mkTableData(mkStyle({ size: { paddingTop: 10, paddingTopUnit: SizeUnitEnum.PX, paddingRight: 16, paddingRightUnit: SizeUnitEnum.PX, paddingBottom: 10, paddingBottomUnit: SizeUnitEnum.PX, paddingLeft: 16, paddingLeftUnit: SizeUnitEnum.PX } }), [
                  mkText('不支持', textSm),
                ], 'td-3-2'),
                mkTableData(mkStyle({ size: { paddingTop: 10, paddingTopUnit: SizeUnitEnum.PX, paddingRight: 16, paddingRightUnit: SizeUnitEnum.PX, paddingBottom: 10, paddingBottomUnit: SizeUnitEnum.PX, paddingLeft: 16, paddingLeftUnit: SizeUnitEnum.PX } }), [
                  mkText('支持', textSm),
                ], 'td-3-3'),
              ], 'tbody-tr-3'),
            ], 'table-tbody'),
            mkTableFoot(mkStyle({
              visual: { backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#fafafa' }], boxShadows: [] },
            }), [
              mkTableRow(mkStyle({}), [
                mkTableData(mkStyle({ size: { paddingTop: 10, paddingTopUnit: SizeUnitEnum.PX, paddingRight: 16, paddingRightUnit: SizeUnitEnum.PX, paddingBottom: 10, paddingBottomUnit: SizeUnitEnum.PX, paddingLeft: 16, paddingLeftUnit: SizeUnitEnum.PX } }), [
                  mkText('专业版提供更多高级功能与技术支持', mkStyle({ font: { fontSize: 13, fontSizeUnit: SizeUnitEnum.PX, color: '#999999', textAlign: TextAlignEnum.CENTER, textShadows: [] } })),
                ], 'td-foot'),
              ], 'tfoot-tr'),
            ], 'table-tfoot'),
          ], 'comparison-table'),
        ],
        'table-section',
      );

      /** ---- 媒体区域（video + audio + image） ---- */
      const mediaSection = mkSection(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX },
          flex: { flexDirection: FlexDirectionEnum.ROW, justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.FLEX_START },
          size: sectionPadding,
        }),
        [
          mkContainer(mkStyle({ size: { width: '45', widthUnit: SizeUnitEnum.PERCENT } }), [
            mkHeading(3, '视频展示', mkStyle({
              font: { fontSize: 18, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a1a', textShadows: [] },
              size: { marginBottom: '12', marginBottomUnit: SizeUnitEnum.PX },
            }), 'video-title'),
            mkVideo('https://example.com/demo.mp4', mkStyle({
              size: { width: '100', widthUnit: SizeUnitEnum.PERCENT },
              visual: { backgrounds: [], boxShadows: [], borderRadiusTL: 8, borderRadiusTR: 8, borderRadiusBL: 8, borderRadiusBR: 8, borderRadiusUnit: SizeUnitEnum.PX },
            }), 'demo-video'),
          ], 'video-group'),
          mkContainer(mkStyle({ size: { width: '45', widthUnit: SizeUnitEnum.PERCENT } }), [
            mkHeading(3, '音频示例', mkStyle({
              font: { fontSize: 18, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a1a', textShadows: [] },
              size: { marginBottom: '12', marginBottomUnit: SizeUnitEnum.PX },
            }), 'audio-title'),
            mkAudio('https://example.com/demo.mp3', mkStyle({
              size: { width: '100', widthUnit: SizeUnitEnum.PERCENT },
            }), 'demo-audio'),
            mkImage('https://placeholder.com/400x200', '音频配图', mkStyle({
              size: { width: '100', widthUnit: SizeUnitEnum.PERCENT, marginTop: '16', marginTopUnit: SizeUnitEnum.PX },
              visual: { backgrounds: [], boxShadows: [], borderRadiusTL: 8, borderRadiusTR: 8, borderRadiusBL: 8, borderRadiusBR: 8, borderRadiusUnit: SizeUnitEnum.PX },
            }), 'audio-image'),
          ], 'audio-group'),
        ],
        'media-section',
      );

      /** ---- 页脚（footer） ---- */
      const footerEl = mkFooter(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX },
          flex: { flexDirection: FlexDirectionEnum.ROW, justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.CENTER },
          size: { ...sectionPadding, paddingTop: 24, paddingBottom: 24 },
          visual: {
            backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#1a1a1a' }],
            boxShadows: [],
          },
        }),
        [
          mkParagraph('© 2024 VibePage. 保留所有权利。', mkStyle({
            font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#999999', textShadows: [] },
          }), 'footer-copyright'),
          mkContainer(flexRow({ flex: { alignItems: AlignItemsEnum.CENTER } }), [
            mkLink('#', mkStyle({ size: { marginRight: '16', marginRightUnit: SizeUnitEnum.PX } }), [
              mkText('隐私政策', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#999999', textShadows: [] } })),
            ], 'footer-link-1'),
            mkLink('#', mkStyle({ size: { marginRight: '16', marginRightUnit: SizeUnitEnum.PX } }), [
              mkText('服务条款', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#999999', textShadows: [] } })),
            ], 'footer-link-2'),
            mkLink('#', mkStyle({}), [
              mkText('联系我们', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#999999', textShadows: [] } })),
            ], 'footer-link-3'),
          ], 'footer-links'),
        ],
        'site-footer',
      );

      this.root.children = [headerEl, hero, features, articleSection, formSection, listSection, tableSection, mediaSection, footerEl];
    },
  }
});
