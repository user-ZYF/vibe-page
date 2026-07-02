import { type CanvasButtonElement, type CanvasContainerElement, type CanvasInnerElement, type CanvasImageElement, type CanvasInputElement, type CanvasLinkElement, type CanvasParagraphElement, type CanvasRadioElement, type CanvasCheckboxElement, type CanvasVideoElement, type CanvasAudioElement, type CanvasTextareaElement, type CanvasLabelElement, type CanvasFormElement, type CanvasSpanElement, type CanvasTextElement, type CanvasUnorderedListElement, type CanvasOrderedListElement, type CanvasListItemElement, type CanvasTableElement, type CanvasTableHeadElement, type CanvasTableBodyElement, type CanvasTableFootElement, type CanvasTableRowElement, type CanvasTableDataElement, type CanvasTableHeaderCellElement, type CanvasTableCaptionElement, type CanvasTableColGroupElement, type CanvasTableColElement, type CanvasHeaderElement, type CanvasFooterElement, type CanvasArticleElement, type CanvasSectionElement, type CanvasAsideElement, type CanvasHeading1Element, type CanvasHeading2Element, type CanvasHeading3Element, type CanvasHeading4Element, type CanvasHeading5Element, type CanvasHeading6Element, type CanvasRootElement, type CanvasElement, type CanvasInnerElementTypeEnum, type StyleConfig, isParentElement } from "@/views/Canvas/types";
import { ButtonTypeEnum, CanvasElementLabelMap, CanvasElementTypeEnum, LinkTargetEnum, SiderPanelEnum, LINK_DESCENDANT_EXCLUDE_TYPES, FORM_DESCENDANT_EXCLUDE_TYPES, SPAN_DESCENDANT_INCLUDE_TYPES, UL_DIRECT_INCLUDE_TYPES, OL_DIRECT_INCLUDE_TYPES, TABLE_DIRECT_INCLUDE_TYPES, THEAD_DIRECT_INCLUDE_TYPES, TBODY_DIRECT_INCLUDE_TYPES, TFOOT_DIRECT_INCLUDE_TYPES, TR_DIRECT_INCLUDE_TYPES, COLGROUP_DIRECT_INCLUDE_TYPES, FormMethodEnum, TableScopeEnum } from "@/constants/home";
import { DefaultStyleConfigMap, defaultClassStyleConfig, DisplayStyleEnum, FlexDirectionEnum, JustifyContentEnum, AlignItemsEnum, SizeUnitEnum, FontWeightEnum, TextAlignEnum, BackgroundTypeEnum, BorderStyleEnum, BorderCollapseEnum, TextDecorationEnum, FontStyleEnum, FontFamilyEnum, PositionStyleEnum, OverflowStyleEnum } from "@/constants/style";
import { defineStore } from "pinia";
import { customAlphabet } from "nanoid";
import { cloneDeep } from "lodash";
import { Positioner } from "@/views/Canvas/drag/Positioner";
import { convertStyleConfig } from "@/utils/styleConfig";
import { findElementInTree } from "@/views/Canvas/utils/treeTraversal";

/** 生成以字母开头的元素 ID，确保符合 CSS_NAME_REGEX 校验规则 */
const nanoid18 = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_", 18);
const generateId = () => `vp-${nanoid18()}`;

/** 画布store */
export const useCanvasStore = defineStore("canvas", {
  state: () => ({
    /** 画布元素列表 */
    root: { 
      id: generateId(),
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
        id: generateId(),
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
        const next = { ...el, id: generateId() } as CanvasInnerElement;
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
      const tempId = generateId();
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
        id: generateId(), type: CanvasElementTypeEnum.CONTAINER, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.CONTAINER], children,
      });

      /** 创建段落元素 */
      const mkParagraph = (text: string, styleConfig: StyleConfig, alias?: string): CanvasParagraphElement => ({
        id: generateId(), type: CanvasElementTypeEnum.PARAGRAPH, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.PARAGRAPH], text,
      });

      /** 创建按钮元素 */
      const mkButton = (text: string, styleConfig: StyleConfig, alias?: string): CanvasButtonElement => ({
        id: generateId(), type: CanvasElementTypeEnum.BUTTON, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.BUTTON], text, buttonType: ButtonTypeEnum.BUTTON,
      });

      /** 创建链接元素 */
      const mkLink = (href: string, styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasLinkElement => ({
        id: generateId(), type: CanvasElementTypeEnum.LINK, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.LINK], href, target: LinkTargetEnum.SELF, children, descendantExclude: [...LINK_DESCENDANT_EXCLUDE_TYPES],
      });

      /** 创建输入框元素 */
      const mkInput = (placeholder: string, styleConfig: StyleConfig, alias?: string): CanvasInputElement => ({
        id: generateId(), type: CanvasElementTypeEnum.INPUT, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.INPUT], placeholder, value: '', required: false,
      });

      /** 创建图片元素 */
      const mkImage = (src: string, title: string, styleConfig: StyleConfig, alias?: string): CanvasImageElement => ({
        id: generateId(), type: CanvasElementTypeEnum.IMAGE, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.IMAGE], src, title,
      });

      /** 创建视频元素 */
      const mkVideo = (src: string, styleConfig: StyleConfig, alias?: string): CanvasVideoElement => ({
        id: generateId(), type: CanvasElementTypeEnum.VIDEO, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.VIDEO], src, controls: true,
      });

      /** 创建音频元素 */
      const mkAudio = (src: string, styleConfig: StyleConfig, alias?: string): CanvasAudioElement => ({
        id: generateId(), type: CanvasElementTypeEnum.AUDIO, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.AUDIO], src, controls: true,
      });

      /** 创建多行文本框元素 */
      const mkTextarea = (placeholder: string, styleConfig: StyleConfig, alias?: string): CanvasTextareaElement => ({
        id: generateId(), type: CanvasElementTypeEnum.TEXTAREA, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TEXTAREA], placeholder, value: '', rows: 4, required: false,
      });

      /** 创建单选框元素 */
      const mkRadio = (name: string, value: string, styleConfig: StyleConfig, alias?: string): CanvasRadioElement => ({
        id: generateId(), type: CanvasElementTypeEnum.RADIO, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.RADIO], name, value, checked: false, required: false,
      });

      /** 创建多选框元素 */
      const mkCheckbox = (name: string, value: string, styleConfig: StyleConfig, alias?: string): CanvasCheckboxElement => ({
        id: generateId(), type: CanvasElementTypeEnum.CHECKBOX, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.CHECKBOX], name, value, checked: false, required: false,
      });

      /** 创建标签元素 */
      const mkLabel = (text: string, forId: string, styleConfig: StyleConfig, alias?: string): CanvasLabelElement => ({
        id: generateId(), type: CanvasElementTypeEnum.LABEL, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.LABEL], text, for: forId,
      });

      /** 创建表单元素 */
      const mkForm = (action: string, method: FormMethodEnum, styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasFormElement => ({
        id: generateId(), type: CanvasElementTypeEnum.FORM, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.FORM], action, method, children, descendantExclude: [...FORM_DESCENDANT_EXCLUDE_TYPES],
      });

      /** 创建行内容器元素 */
      const mkSpan = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasSpanElement => ({
        id: generateId(), type: CanvasElementTypeEnum.SPAN, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.SPAN], children, descendantInclude: [...SPAN_DESCENDANT_INCLUDE_TYPES],
      });

      /** 创建纯文本元素 */
      const mkText = (text: string, styleConfig: StyleConfig, alias?: string): CanvasTextElement => ({
        id: generateId(), type: CanvasElementTypeEnum.TEXT, styleConfig, classes: [], classNames: [],
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
          id: generateId(), type, styleConfig, classes: [], classNames: [],
          alias: alias ?? CanvasElementLabelMap[type], text,
        } as CanvasHeading1Element | CanvasHeading2Element | CanvasHeading3Element | CanvasHeading4Element | CanvasHeading5Element | CanvasHeading6Element;
      };

      /** 创建无序列表元素 */
      const mkUnorderedList = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasUnorderedListElement => ({
        id: generateId(), type: CanvasElementTypeEnum.UNORDERED_LIST, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.UNORDERED_LIST], children, directInclude: [...UL_DIRECT_INCLUDE_TYPES],
      });

      /** 创建有序列表元素 */
      const mkOrderedList = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasOrderedListElement => ({
        id: generateId(), type: CanvasElementTypeEnum.ORDERED_LIST, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.ORDERED_LIST], children, directInclude: [...OL_DIRECT_INCLUDE_TYPES],
      });

      /** 创建列表项元素 */
      const mkListItem = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasListItemElement => ({
        id: generateId(), type: CanvasElementTypeEnum.LIST_ITEM, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.LIST_ITEM], children,
      });

      /** 创建表格元素 */
      const mkTable = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableElement => ({
        id: generateId(), type: CanvasElementTypeEnum.TABLE, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE], children, directInclude: [...TABLE_DIRECT_INCLUDE_TYPES],
      });

      /** 创建表头元素 */
      const mkTableHead = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableHeadElement => ({
        id: generateId(), type: CanvasElementTypeEnum.TABLE_HEAD, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_HEAD], children, directInclude: [...THEAD_DIRECT_INCLUDE_TYPES],
      });

      /** 创建表体元素 */
      const mkTableBody = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableBodyElement => ({
        id: generateId(), type: CanvasElementTypeEnum.TABLE_BODY, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_BODY], children, directInclude: [...TBODY_DIRECT_INCLUDE_TYPES],
      });

      /** 创建表脚元素 */
      const mkTableFoot = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableFootElement => ({
        id: generateId(), type: CanvasElementTypeEnum.TABLE_FOOT, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_FOOT], children, directInclude: [...TFOOT_DIRECT_INCLUDE_TYPES],
      });

      /** 创建表格行元素 */
      const mkTableRow = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableRowElement => ({
        id: generateId(), type: CanvasElementTypeEnum.TABLE_ROW, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_ROW], children, directInclude: [...TR_DIRECT_INCLUDE_TYPES],
      });

      /** 创建表格单元格元素 */
      const mkTableData = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableDataElement => ({
        id: generateId(), type: CanvasElementTypeEnum.TABLE_DATA, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_DATA], colspan: 1, rowspan: 1, children,
      });

      /** 创建表头单元格元素 */
      const mkTableHeaderCell = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string, scope: TableScopeEnum = TableScopeEnum.UNDEFINED): CanvasTableHeaderCellElement => ({
        id: generateId(), type: CanvasElementTypeEnum.TABLE_HEADER_CELL, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_HEADER_CELL], colspan: 1, rowspan: 1, scope, children,
      });

      /** 创建表格标题元素 */
      const mkTableCaption = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableCaptionElement => ({
        id: generateId(), type: CanvasElementTypeEnum.TABLE_CAPTION, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_CAPTION], children,
      });

      /** 创建表格列组元素 */
      const mkTableColGroup = (span: number, styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableColGroupElement => ({
        id: generateId(), type: CanvasElementTypeEnum.TABLE_COL_GROUP, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_COL_GROUP], span, children, directInclude: [...COLGROUP_DIRECT_INCLUDE_TYPES],
      });

      /** 创建表格列元素 */
      const mkTableCol = (span: number, styleConfig: StyleConfig, alias?: string): CanvasTableColElement => ({
        id: generateId(), type: CanvasElementTypeEnum.TABLE_COL, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_COL], span,
      });

      /** 创建页头元素 */
      const mkHeader = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasHeaderElement => ({
        id: generateId(), type: CanvasElementTypeEnum.HEADER, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.HEADER], children,
      });

      /** 创建页脚元素 */
      const mkFooter = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasFooterElement => ({
        id: generateId(), type: CanvasElementTypeEnum.FOOTER, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.FOOTER], children,
      });

      /** 创建文章元素 */
      const mkArticle = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasArticleElement => ({
        id: generateId(), type: CanvasElementTypeEnum.ARTICLE, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.ARTICLE], children,
      });

      /** 创建章节元素 */
      const mkSection = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasSectionElement => ({
        id: generateId(), type: CanvasElementTypeEnum.SECTION, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.SECTION], children,
      });

      /** 创建侧边栏元素 */
      const mkAside = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasAsideElement => ({
        id: generateId(), type: CanvasElementTypeEnum.ASIDE, styleConfig, classes: [], classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.ASIDE], children,
      });

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
        paddingTop: 64, paddingTopUnit: SizeUnitEnum.PX,
        paddingRight: 32, paddingRightUnit: SizeUnitEnum.PX,
        paddingBottom: 64, paddingBottomUnit: SizeUnitEnum.PX,
        paddingLeft: 32, paddingLeftUnit: SizeUnitEnum.PX,
        width: '100', widthUnit: SizeUnitEnum.PERCENT,
      };

      /** ---- 页头（header） ---- */
      const headerEl = mkHeader(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX, position: PositionStyleEnum.RELATIVE, zIndex: 100 },
          flex: { flexDirection: FlexDirectionEnum.ROW, justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.CENTER },
          size: {
            paddingTop: 16, paddingTopUnit: SizeUnitEnum.PX,
            paddingRight: 32, paddingRightUnit: SizeUnitEnum.PX,
            paddingBottom: 16, paddingBottomUnit: SizeUnitEnum.PX,
            paddingLeft: 32, paddingLeftUnit: SizeUnitEnum.PX,
            width: '100', widthUnit: SizeUnitEnum.PERCENT,
          },
          visual: {
            backgrounds: [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }],
            boxShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 2, yUnit: SizeUnitEnum.PX, blur: 12, blurUnit: SizeUnitEnum.PX, spread: 0, spreadUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.15)', inset: false }],
          },
        }),
        [
          mkSpan(mkStyle({
            font: { fontSize: 24, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#ffffff', textShadows: [{ x: 1, xUnit: SizeUnitEnum.PX, y: 1, yUnit: SizeUnitEnum.PX, blur: 2, blurUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.3)' }] },
          }), [
            mkText('VibePage', mkStyle({ font: { fontSize: 24, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#ffffff', textShadows: [{ x: 1, xUnit: SizeUnitEnum.PX, y: 1, yUnit: SizeUnitEnum.PX, blur: 2, blurUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.3)' }] } }), 'logo-text'),
          ], 'logo'),
          mkContainer(flexRow({ flex: { alignItems: AlignItemsEnum.CENTER } }), [
            mkLink('#', mkStyle({ size: { marginRight: '24', marginRightUnit: SizeUnitEnum.PX } }), [
              mkText('首页', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#ffffff', fontWeight: FontWeightEnum.MEDIUM, textShadows: [] } })),
            ], 'nav-home'),
            mkLink('#', mkStyle({ size: { marginRight: '24', marginRightUnit: SizeUnitEnum.PX } }), [
              mkText('功能', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#a0c4ff', textShadows: [] } })),
            ], 'nav-features'),
            mkLink('#', mkStyle({ size: { marginRight: '24', marginRightUnit: SizeUnitEnum.PX } }), [
              mkText('定价', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#a0c4ff', textShadows: [] } })),
            ], 'nav-pricing'),
            mkLink('#', mkStyle({ size: { marginRight: '24', marginRightUnit: SizeUnitEnum.PX } }), [
              mkText('关于', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#a0c4ff', textShadows: [] } })),
            ], 'nav-about'),
            mkButton('开始使用', mkStyle({
              font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#ffffff', fontWeight: FontWeightEnum.SEMI_BOLD, textShadows: [] },
              visual: {
                backgrounds: [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'linear-gradient(135deg, #e94560 0%, #c23152 100%)' }],
                boxShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 2, yUnit: SizeUnitEnum.PX, blur: 8, blurUnit: SizeUnitEnum.PX, spread: 0, spreadUnit: SizeUnitEnum.PX, color: 'rgba(233,69,96,0.4)', inset: false }],
                borderRadiusTL: 6, borderRadiusTR: 6, borderRadiusBL: 6, borderRadiusBR: 6, borderRadiusUnit: SizeUnitEnum.PX,
              },
              size: {
                paddingTop: 8, paddingTopUnit: SizeUnitEnum.PX,
                paddingRight: 20, paddingRightUnit: SizeUnitEnum.PX,
                paddingBottom: 8, paddingBottomUnit: SizeUnitEnum.PX,
                paddingLeft: 20, paddingLeftUnit: SizeUnitEnum.PX,
              },
            }), 'header-cta'),
          ], 'nav-actions'),
        ],
        'site-header',
      );

      /** ---- Hero 区域（section + h1~h6 + p + button + image + link） ---- */
      const hero = mkSection(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX, overflow: OverflowStyleEnum.HIDDEN },
          flex: { flexDirection: FlexDirectionEnum.COLUMN, justifyContent: JustifyContentEnum.CENTER, alignItems: AlignItemsEnum.CENTER },
          size: { ...sectionPadding, paddingTop: 80, paddingBottom: 80 },
          visual: {
            backgrounds: [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'linear-gradient(180deg, #f0f4ff 0%, #e8eaf6 50%, #f5f7fa 100%)' }],
            boxShadows: [],
          },
        }),
        [
          mkHeading(1, '打造你的专属页面', mkStyle({
            font: { fontSize: 42, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a2e', textAlign: TextAlignEnum.CENTER, textShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 2, yUnit: SizeUnitEnum.PX, blur: 4, blurUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.1)' }], letterSpacing: '2', letterSpacingUnit: SizeUnitEnum.PX },
            size: { marginBottom: '16', marginBottomUnit: SizeUnitEnum.PX },
          }), 'hero-title'),
          mkHeading(2, '所见即所得 · 可视化编辑器', mkStyle({
            font: { fontSize: 30, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: '#0f3460', textAlign: TextAlignEnum.CENTER, fontStyle: FontStyleEnum.ITALIC, fontFamily: FontFamilyEnum.GEORGIA, textShadows: [] },
            size: { marginBottom: '12', marginBottomUnit: SizeUnitEnum.PX },
          }), 'hero-subtitle'),
          mkHeading(3, '零代码 · 拖拽式 · 实时预览', mkStyle({
            font: { fontSize: 22, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.MEDIUM, color: '#16213e', textAlign: TextAlignEnum.CENTER, letterSpacing: '1', letterSpacingUnit: SizeUnitEnum.PX, textShadows: [] },
            size: { marginBottom: '24', marginBottomUnit: SizeUnitEnum.PX },
          }), 'hero-h3'),
          mkParagraph('VibePage 是一款面向所有人的可视化页面搭建工具，无论你是设计师、产品经理还是开发者，都能在这里快速构建专业级网页。拖拽组件、调整样式、实时预览，一切操作所见即所得。', mkStyle({
            font: { fontSize: 16, fontSizeUnit: SizeUnitEnum.PX, color: '#555555', textAlign: TextAlignEnum.JUSTIFY, lineHeight: '1.8', textShadows: [] },
            size: { marginBottom: '32', marginBottomUnit: SizeUnitEnum.PX, maxWidth: '640', maxWidthUnit: SizeUnitEnum.PX },
          }), 'hero-desc'),
          mkContainer(flexRow({ flex: { justifyContent: JustifyContentEnum.CENTER } }), [
            mkButton('立即开始', mkStyle({
              font: { fontSize: 16, fontSizeUnit: SizeUnitEnum.PX, color: '#ffffff', fontWeight: FontWeightEnum.SEMI_BOLD, textShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 1, yUnit: SizeUnitEnum.PX, blur: 2, blurUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.2)' }] },
              visual: {
                backgrounds: [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)' }],
                boxShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 4, yUnit: SizeUnitEnum.PX, blur: 12, blurUnit: SizeUnitEnum.PX, spread: 0, spreadUnit: SizeUnitEnum.PX, color: 'rgba(22,119,255,0.35)', inset: false }],
                borderRadiusTL: 8, borderRadiusTR: 8, borderRadiusBL: 8, borderRadiusBR: 8, borderRadiusUnit: SizeUnitEnum.PX,
              },
              size: {
                paddingTop: 12, paddingTopUnit: SizeUnitEnum.PX,
                paddingRight: 36, paddingRightUnit: SizeUnitEnum.PX,
                paddingBottom: 12, paddingBottomUnit: SizeUnitEnum.PX,
                paddingLeft: 36, paddingLeftUnit: SizeUnitEnum.PX,
                marginRight: '16', marginRightUnit: SizeUnitEnum.PX,
              },
            }), 'hero-cta-primary'),
            mkLink('#docs', mkStyle({
              general: { display: DisplayStyleEnum.INLINE_BLOCK },
              size: {
                paddingTop: 12, paddingTopUnit: SizeUnitEnum.PX,
                paddingRight: 36, paddingRightUnit: SizeUnitEnum.PX,
                paddingBottom: 12, paddingBottomUnit: SizeUnitEnum.PX,
                paddingLeft: 36, paddingLeftUnit: SizeUnitEnum.PX,
              },
              visual: {
                backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }],
                boxShadows: [],
                borderWidth: 2, borderStyle: BorderStyleEnum.DASHED, borderColor: '#1677ff',
                borderRadiusTL: 8, borderRadiusTR: 8, borderRadiusBL: 8, borderRadiusBR: 8, borderRadiusUnit: SizeUnitEnum.PX,
              },
              font: { fontSize: 16, fontSizeUnit: SizeUnitEnum.PX, color: '#1677ff', fontWeight: FontWeightEnum.MEDIUM, textShadows: [] },
            }), [
              mkText('查看文档', mkStyle({ font: { fontSize: 16, fontSizeUnit: SizeUnitEnum.PX, color: '#1677ff', fontWeight: FontWeightEnum.MEDIUM, textShadows: [] } })),
            ], 'hero-docs-link'),
          ], 'hero-actions'),
          mkContainer(flexRow({ flex: { justifyContent: JustifyContentEnum.CENTER, alignItems: AlignItemsEnum.CENTER } }), [
            mkHeading(4, '拖拽设计', mkStyle({
              font: { fontSize: 18, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: '#1a1a2e', textDecoration: TextDecorationEnum.UNDERLINE, textShadows: [] },
              size: { marginRight: '24', marginRightUnit: SizeUnitEnum.PX },
            }), 'hero-h4'),
            mkHeading(5, '限时免费', mkStyle({
              font: { fontSize: 16, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.MEDIUM, color: '#e94560', textDecoration: TextDecorationEnum.LINE_THROUGH, textShadows: [] },
              size: { marginRight: '24', marginRightUnit: SizeUnitEnum.PX },
            }), 'hero-h5'),
            mkHeading(6, 'v2.0.1', mkStyle({
              font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.THIN, color: '#999999', textShadows: [] },
            }), 'hero-h6'),
          ], 'hero-meta'),
          mkImage('https://placeholder.com/800x400', 'Hero 示意图', mkStyle({
            size: {
              width: '800', widthUnit: SizeUnitEnum.PX,
              maxWidth: '100', maxWidthUnit: SizeUnitEnum.PERCENT,
              marginTop: '32', marginTopUnit: SizeUnitEnum.PX,
            },
            visual: {
              backgrounds: [],
              boxShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 8, yUnit: SizeUnitEnum.PX, blur: 32, blurUnit: SizeUnitEnum.PX, spread: 0, spreadUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.12)', inset: false }],
              borderRadiusTL: 12, borderRadiusTR: 12, borderRadiusBL: 12, borderRadiusBR: 12, borderRadiusUnit: SizeUnitEnum.PX,
              borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#e8e8e8',
            },
          }), 'hero-image'),
          mkLink('#more', mkStyle({
            general: { display: DisplayStyleEnum.INLINE_BLOCK },
            size: { marginTop: '20', marginTopUnit: SizeUnitEnum.PX },
            font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#1677ff', textDecoration: TextDecorationEnum.UNDERLINE, textShadows: [] },
          }), [
            mkText('了解更多 →', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#1677ff', textDecoration: TextDecorationEnum.UNDERLINE, textShadows: [] } })),
          ], 'hero-more-link'),
        ],
        'hero',
      );

      /** ---- 功能卡片区域（h3 + h4 + p + container + 不同边框样式） ---- */
      const mkFeatureCard = (
        title: string,
        desc: string,
        alias: string,
        borderStyle: BorderStyleEnum,
        bgColor: string,
        accentColor: string,
        fontFamily?: string,
      ): CanvasContainerElement => {
        return mkContainer(
          mkStyle({
            general: { display: DisplayStyleEnum.FLEX },
            flex: { flexDirection: FlexDirectionEnum.COLUMN, alignItems: AlignItemsEnum.FLEX_START },
            size: {
              paddingTop: 28, paddingTopUnit: SizeUnitEnum.PX,
              paddingRight: 28, paddingRightUnit: SizeUnitEnum.PX,
              paddingBottom: 28, paddingBottomUnit: SizeUnitEnum.PX,
              paddingLeft: 28, paddingLeftUnit: SizeUnitEnum.PX,
              width: '30', widthUnit: SizeUnitEnum.PERCENT,
            },
            visual: {
              backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: bgColor }],
              boxShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 4, yUnit: SizeUnitEnum.PX, blur: 16, blurUnit: SizeUnitEnum.PX, spread: 0, spreadUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.06)', inset: false }],
              borderWidth: 2, borderStyle, borderColor: accentColor,
              borderRadiusTL: 12, borderRadiusTR: 12, borderRadiusBL: 12, borderRadiusBR: 12, borderRadiusUnit: SizeUnitEnum.PX,
            },
          }),
          [
            mkHeading(4, title, mkStyle({
              font: { fontSize: 18, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: accentColor, fontFamily, textShadows: [] },
              size: { marginBottom: '12', marginBottomUnit: SizeUnitEnum.PX },
            })),
            mkParagraph(desc, mkStyle({
              font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#555555', lineHeight: '1.7', fontFamily, textShadows: [] },
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
          visual: {
            backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }],
            boxShadows: [],
          },
        }),
        [
          mkHeading(3, '核心功能', mkStyle({
            font: { fontSize: 28, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a2e', textAlign: TextAlignEnum.CENTER, textShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 2, yUnit: SizeUnitEnum.PX, blur: 4, blurUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.08)' }] },
            size: { marginBottom: '12', marginBottomUnit: SizeUnitEnum.PX },
          }), 'features-title'),
          mkParagraph('从拖拽编辑到代码导出，VibePage 提供一站式页面搭建体验', mkStyle({
            font: { fontSize: 16, fontSizeUnit: SizeUnitEnum.PX, color: '#888888', textAlign: TextAlignEnum.CENTER, textShadows: [] },
            size: { marginBottom: '40', marginBottomUnit: SizeUnitEnum.PX },
          }), 'features-subtitle'),
          mkContainer(
            flexRow({ flex: { justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.FLEX_START } }),
            [
              mkFeatureCard('拖拽编辑', '所见即所得的可视化编辑体验，只需拖拽即可完成页面布局，零门槛上手。', 'feature-1', BorderStyleEnum.SOLID, '#ffffff', '#1677ff'),
              mkFeatureCard('组件丰富', '内置 30+ 基础组件，涵盖容器、表单、媒体、表格等，满足各种页面需求。', 'feature-2', BorderStyleEnum.DASHED, '#f0f7ff', '#52c41a', FontFamilyEnum.GEORGIA),
              mkFeatureCard('实时预览', '随时切换预览模式，所见即所得，确保设计效果与最终呈现完全一致。', 'feature-3', BorderStyleEnum.DOTTED, '#fff9f0', '#fa8c16', FontFamilyEnum.VERDANA),
            ],
            'feature-cards',
          ),
          mkContainer(flexRow({ flex: { justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.CENTER } }), [
            mkHeading(5, '支持自定义样式', mkStyle({
              font: { fontSize: 16, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.MEDIUM, color: '#333333', textShadows: [] },
            }), 'h5-sample'),
            mkSpan(mkStyle({
              font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#1677ff', fontStyle: FontStyleEnum.ITALIC, textShadows: [] },
            }), [
              mkText('→ 查看全部功能', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#1677ff', fontStyle: FontStyleEnum.ITALIC, textShadows: [] } })),
            ], 'features-more'),
            mkHeading(6, 'v2.0.1', mkStyle({
              font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.LIGHT, color: '#999999', textShadows: [] },
            }), 'h6-sample'),
          ], 'heading-samples'),
        ],
        'features',
      );

      /** ---- 文章 + 侧边栏区域（article + section + aside + p + span + text + link） ---- */
      const articleSection = mkSection(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX },
          flex: { flexDirection: FlexDirectionEnum.ROW, justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.FLEX_START },
          size: sectionPadding,
          visual: {
            backgrounds: [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'linear-gradient(180deg, #fafbff 0%, #f0f4ff 100%)' }],
            boxShadows: [],
          },
        }),
        [
          mkArticle(
            mkStyle({
              size: { width: '62', widthUnit: SizeUnitEnum.PERCENT },
              visual: {
                backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }],
                boxShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 2, yUnit: SizeUnitEnum.PX, blur: 12, blurUnit: SizeUnitEnum.PX, spread: 0, spreadUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.05)', inset: false }],
                borderRadiusTL: 12, borderRadiusTR: 12, borderRadiusBL: 12, borderRadiusBR: 12, borderRadiusUnit: SizeUnitEnum.PX,
              },
            }),
            [
              mkHeading(2, '关于 VibePage', mkStyle({
                font: { fontSize: 26, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a2e', fontFamily: FontFamilyEnum.GEORGIA, textShadows: [] },
                size: { marginBottom: '16', marginBottomUnit: SizeUnitEnum.PX },
              }), 'article-title'),
              mkParagraph('VibePage 是一款可视化的页面搭建工具，支持拖拽编辑、实时预览，内置丰富的组件库，帮助用户快速构建专业页面。无论是落地页、产品展示页还是个人博客，都能轻松应对。', mkStyle({
                font: { fontSize: 15, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', lineHeight: '1.8', textAlign: TextAlignEnum.JUSTIFY, textIndent: '32', textIndentUnit: SizeUnitEnum.PX, textShadows: [] },
                size: { marginBottom: '16', marginBottomUnit: SizeUnitEnum.PX },
              }), 'article-p1'),
              mkParagraph('通过直观的编辑界面，你可以轻松调整元素的样式、布局和交互行为，无需任何编码经验。所有修改实时生效，所见即所得。', mkStyle({
                font: { fontSize: 15, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', lineHeight: '1.8', textAlign: TextAlignEnum.JUSTIFY, textIndent: '32', textIndentUnit: SizeUnitEnum.PX, textShadows: [] },
                size: { marginBottom: '16', marginBottomUnit: SizeUnitEnum.PX },
              }), 'article-p2'),
              mkSpan(mkStyle({
                font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#1677ff', fontWeight: FontWeightEnum.SEMI_BOLD, fontStyle: FontStyleEnum.ITALIC, textShadows: [] },
              }), [
                mkText('了解更多详情，请访问', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#555555', textShadows: [] } })),
                mkLink('#detail', mkStyle({ size: { marginLeft: '4', marginLeftUnit: SizeUnitEnum.PX } }), [
                  mkText('详细文档', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#1677ff', textDecoration: TextDecorationEnum.UNDERLINE, fontWeight: FontWeightEnum.SEMI_BOLD, textShadows: [] } })),
                ], 'article-link'),
              ], 'article-span'),
            ],
            'main-article',
          ),
          mkAside(
            mkStyle({
              size: { width: '32', widthUnit: SizeUnitEnum.PERCENT, paddingTop: 24, paddingTopUnit: SizeUnitEnum.PX, paddingRight: 24, paddingRightUnit: SizeUnitEnum.PX, paddingBottom: 24, paddingBottomUnit: SizeUnitEnum.PX, paddingLeft: 24, paddingLeftUnit: SizeUnitEnum.PX },
              visual: {
                backgrounds: [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)' }],
                boxShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 4, yUnit: SizeUnitEnum.PX, blur: 16, blurUnit: SizeUnitEnum.PX, spread: 0, spreadUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.15)', inset: false }],
                borderRadiusTL: 12, borderRadiusTR: 12, borderRadiusBL: 12, borderRadiusBR: 12, borderRadiusUnit: SizeUnitEnum.PX,
              },
            }),
            [
              mkHeading(4, '快速导航', mkStyle({
                font: { fontSize: 18, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#ffffff', textShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 1, yUnit: SizeUnitEnum.PX, blur: 2, blurUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.3)' }] },
                size: { marginBottom: '16', marginBottomUnit: SizeUnitEnum.PX },
              }), 'aside-title'),
              mkParagraph('在这里放置相关链接、最新动态或推荐内容。', mkStyle({
                font: { fontSize: 13, fontSizeUnit: SizeUnitEnum.PX, color: '#a0c4ff', lineHeight: '1.7', textShadows: [] },
                size: { marginBottom: '12', marginBottomUnit: SizeUnitEnum.PX },
              }), 'aside-desc'),
              mkContainer(flexCol({}), [
                mkLink('#intro', mkStyle({ size: { marginBottom: '8', marginBottomUnit: SizeUnitEnum.PX } }), [
                  mkText('→ 产品介绍', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#a0c4ff', textDecoration: TextDecorationEnum.NONE, textShadows: [] } })),
                ], 'aside-link-1'),
                mkLink('#tutorial', mkStyle({ size: { marginBottom: '8', marginBottomUnit: SizeUnitEnum.PX } }), [
                  mkText('→ 使用教程', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#a0c4ff', textDecoration: TextDecorationEnum.NONE, textShadows: [] } })),
                ], 'aside-link-2'),
                mkLink('#faq', mkStyle({}), [
                  mkText('→ 常见问题', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#a0c4ff', textDecoration: TextDecorationEnum.NONE, textShadows: [] } })),
                ], 'aside-link-3'),
              ], 'aside-links'),
            ],
            'sidebar',
          ),
        ],
        'article-section',
      );

      /** ---- 表单区域（form + label + input + textarea + radio + checkbox + button） ---- */
      const inputStyle = mkStyle({
        size: {
          width: '100', widthUnit: SizeUnitEnum.PERCENT,
          paddingTop: 12, paddingTopUnit: SizeUnitEnum.PX,
          paddingRight: 16, paddingRightUnit: SizeUnitEnum.PX,
          paddingBottom: 12, paddingBottomUnit: SizeUnitEnum.PX,
          paddingLeft: 16, paddingLeftUnit: SizeUnitEnum.PX,
          marginBottom: '16', marginBottomUnit: SizeUnitEnum.PX,
        },
        visual: {
          backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#f9fafb' }],
          boxShadows: [],
          borderRadiusTL: 8, borderRadiusTR: 8, borderRadiusBL: 8, borderRadiusBR: 8, borderRadiusUnit: SizeUnitEnum.PX,
          borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#d9d9d9',
        },
      });
      const labelStyle = mkStyle({
        font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: '#1a1a2e', letterSpacing: '0.5', letterSpacingUnit: SizeUnitEnum.PX, textShadows: [] },
        size: { marginBottom: '8', marginBottomUnit: SizeUnitEnum.PX },
      });

      const formEl = mkForm('/submit', FormMethodEnum.POST, mkStyle({
        size: { width: '560', widthUnit: SizeUnitEnum.PX, maxWidth: '100', maxWidthUnit: SizeUnitEnum.PERCENT },
        visual: {
          backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }],
          boxShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 8, yUnit: SizeUnitEnum.PX, blur: 32, blurUnit: SizeUnitEnum.PX, spread: 0, spreadUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.08)', inset: false }],
          borderRadiusTL: 16, borderRadiusTR: 16, borderRadiusBL: 16, borderRadiusBR: 16, borderRadiusUnit: SizeUnitEnum.PX,
        },
      }), [
        mkHeading(3, '联系我们', mkStyle({
          font: { fontSize: 26, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a2e', textAlign: TextAlignEnum.CENTER, textShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 2, yUnit: SizeUnitEnum.PX, blur: 4, blurUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.06)' }] },
          size: { marginBottom: '8', marginBottomUnit: SizeUnitEnum.PX },
        }), 'form-title'),
        mkParagraph('有任何问题或建议？填写下方表单，我们会尽快回复你。', mkStyle({
          font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#888888', textAlign: TextAlignEnum.CENTER, textShadows: [] },
          size: { marginBottom: '24', marginBottomUnit: SizeUnitEnum.PX },
        }), 'form-subtitle'),
        mkContainer(flexCol({}), [
          mkLabel('姓名', '', cloneDeep(labelStyle), 'label-name'),
          mkInput('请输入你的姓名', cloneDeep(inputStyle), 'form-name'),
        ], 'form-name-group'),
        mkContainer(flexCol({}), [
          mkLabel('邮箱', '', cloneDeep(labelStyle), 'label-email'),
          mkInput('请输入你的邮箱', cloneDeep(inputStyle), 'form-email'),
        ], 'form-email-group'),
        mkContainer(flexCol({}), [
          mkLabel('留言', '', cloneDeep(labelStyle), 'label-message'),
          mkTextarea('请输入留言内容，我们会认真阅读每一条反馈...', cloneDeep(inputStyle), 'form-message'),
        ], 'form-message-group'),
        mkContainer(flexCol({}), [
          mkLabel('性别', '', cloneDeep(labelStyle), 'label-gender'),
          mkContainer(flexRow({ flex: { alignItems: AlignItemsEnum.CENTER } }), [
            mkRadio('gender', 'male', mkStyle({ size: { marginRight: '6', marginRightUnit: SizeUnitEnum.PX } }), 'radio-male'),
            mkLabel('男', '', mkStyle({
              font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', textShadows: [] },
              size: { marginRight: '24', marginRightUnit: SizeUnitEnum.PX },
            }), 'label-male'),
            mkRadio('gender', 'female', mkStyle({ size: { marginRight: '6', marginRightUnit: SizeUnitEnum.PX } }), 'radio-female'),
            mkLabel('女', '', mkStyle({
              font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', textShadows: [] },
            }), 'label-female'),
          ], 'radio-group'),
        ], 'form-gender-group'),
        mkContainer(flexCol({}), [
          mkLabel('兴趣爱好', '', cloneDeep(labelStyle), 'label-hobby'),
          mkContainer(flexRow({ flex: { alignItems: AlignItemsEnum.CENTER } }), [
            mkCheckbox('hobby', 'coding', mkStyle({ size: { marginRight: '6', marginRightUnit: SizeUnitEnum.PX } }), 'checkbox-coding'),
            mkLabel('编程', '', mkStyle({
              font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', textShadows: [] },
              size: { marginRight: '24', marginRightUnit: SizeUnitEnum.PX },
            }), 'label-coding'),
            mkCheckbox('hobby', 'design', mkStyle({ size: { marginRight: '6', marginRightUnit: SizeUnitEnum.PX } }), 'checkbox-design'),
            mkLabel('设计', '', mkStyle({
              font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', textShadows: [] },
              size: { marginRight: '24', marginRightUnit: SizeUnitEnum.PX },
            }), 'label-design'),
            mkCheckbox('hobby', 'writing', mkStyle({ size: { marginRight: '6', marginRightUnit: SizeUnitEnum.PX } }), 'checkbox-writing'),
            mkLabel('写作', '', mkStyle({
              font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', textShadows: [] },
            }), 'label-writing'),
          ], 'checkbox-group'),
        ], 'form-hobby-group'),
        mkButton('提交反馈', mkStyle({
          font: { fontSize: 16, fontSizeUnit: SizeUnitEnum.PX, color: '#ffffff', fontWeight: FontWeightEnum.SEMI_BOLD, textShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 1, yUnit: SizeUnitEnum.PX, blur: 2, blurUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.2)' }] },
          visual: {
            backgrounds: [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)' }],
            boxShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 4, yUnit: SizeUnitEnum.PX, blur: 12, blurUnit: SizeUnitEnum.PX, spread: 0, spreadUnit: SizeUnitEnum.PX, color: 'rgba(22,119,255,0.3)', inset: false }],
            borderRadiusTL: 8, borderRadiusTR: 8, borderRadiusBL: 8, borderRadiusBR: 8, borderRadiusUnit: SizeUnitEnum.PX,
          },
          size: {
            width: '100', widthUnit: SizeUnitEnum.PERCENT,
            paddingTop: 14, paddingTopUnit: SizeUnitEnum.PX,
            paddingRight: 32, paddingRightUnit: SizeUnitEnum.PX,
            paddingBottom: 14, paddingBottomUnit: SizeUnitEnum.PX,
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
          visual: {
            backgrounds: [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'linear-gradient(180deg, #f0f4ff 0%, #e8eaf6 100%)' }],
            boxShadows: [],
          },
        }),
        [formEl],
        'form-section',
      );

      /** ---- 列表区域（ul + ol + li + p + link + span） ---- */
      const listSection = mkSection(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX },
          flex: { flexDirection: FlexDirectionEnum.ROW, justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.FLEX_START },
          size: sectionPadding,
          visual: {
            backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }],
            boxShadows: [],
          },
        }),
        [
          mkContainer(mkStyle({
            size: { width: '45', widthUnit: SizeUnitEnum.PERCENT },
            visual: {
              backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#f9fafb' }],
              boxShadows: [],
              borderRadiusTL: 12, borderRadiusTR: 12, borderRadiusBL: 12, borderRadiusBR: 12, borderRadiusUnit: SizeUnitEnum.PX,
              borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#e8e8e8',
            },
          }), [
            mkHeading(3, '功能列表', mkStyle({
              font: { fontSize: 20, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a2e', textShadows: [] },
              size: { marginBottom: '16', marginBottomUnit: SizeUnitEnum.PX },
            }), 'ul-title'),
            mkUnorderedList(mkStyle({
              size: { paddingLeft: 24, paddingLeftUnit: SizeUnitEnum.PX },
            }), [
              mkListItem(mkStyle({ size: { marginBottom: '10', marginBottomUnit: SizeUnitEnum.PX } }), [
                mkText('拖拽式可视化编辑', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', textShadows: [] } })),
              ], 'ul-item-1'),
              mkListItem(mkStyle({ size: { marginBottom: '10', marginBottomUnit: SizeUnitEnum.PX } }), [
                mkText('丰富的组件库', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', textShadows: [] } })),
              ], 'ul-item-2'),
              mkListItem(mkStyle({ size: { marginBottom: '10', marginBottomUnit: SizeUnitEnum.PX } }), [
                mkText('实时预览与代码导出', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', textShadows: [] } })),
              ], 'ul-item-3'),
              mkListItem(mkStyle({ size: { marginBottom: '10', marginBottomUnit: SizeUnitEnum.PX } }), [
                mkText('支持自定义样式与动画', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', textShadows: [] } })),
              ], 'ul-item-4'),
              mkListItem(mkStyle({}), [
                mkSpan(mkStyle({
                  font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#1677ff', fontStyle: FontStyleEnum.ITALIC, textShadows: [] },
                }), [
                  mkText('→ 查看完整功能列表', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#1677ff', fontStyle: FontStyleEnum.ITALIC, textShadows: [] } })),
                ], 'ul-more-span'),
              ], 'ul-item-5'),
            ], 'feature-ul'),
          ], 'ul-group'),
          mkContainer(mkStyle({
            size: { width: '45', widthUnit: SizeUnitEnum.PERCENT },
            visual: {
              backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#f0f7ff' }],
              boxShadows: [],
              borderRadiusTL: 12, borderRadiusTR: 12, borderRadiusBL: 12, borderRadiusBR: 12, borderRadiusUnit: SizeUnitEnum.PX,
              borderWidth: 1, borderStyle: BorderStyleEnum.DASHED, borderColor: '#1677ff',
            },
          }), [
            mkHeading(3, '使用步骤', mkStyle({
              font: { fontSize: 20, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#0f3460', fontFamily: FontFamilyEnum.GEORGIA, textShadows: [] },
              size: { marginBottom: '16', marginBottomUnit: SizeUnitEnum.PX },
            }), 'ol-title'),
            mkOrderedList(mkStyle({
              size: { paddingLeft: 24, paddingLeftUnit: SizeUnitEnum.PX },
            }), [
              mkListItem(mkStyle({ size: { marginBottom: '10', marginBottomUnit: SizeUnitEnum.PX } }), [
                mkText('打开编辑器，选择组件', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', textShadows: [] } })),
              ], 'ol-item-1'),
              mkListItem(mkStyle({ size: { marginBottom: '10', marginBottomUnit: SizeUnitEnum.PX } }), [
                mkText('拖拽组件到画布', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', textShadows: [] } })),
              ], 'ol-item-2'),
              mkListItem(mkStyle({ size: { marginBottom: '10', marginBottomUnit: SizeUnitEnum.PX } }), [
                mkText('调整样式和属性', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', textShadows: [] } })),
              ], 'ol-item-3'),
              mkListItem(mkStyle({}), [
                mkText('预览并导出代码', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', fontWeight: FontWeightEnum.SEMI_BOLD, textShadows: [] } })),
              ], 'ol-item-4'),
            ], 'steps-ol'),
          ], 'ol-group'),
        ],
        'list-section',
      );

      /** ---- 表格区域（table + caption + colgroup + col + thead + tbody + tfoot + tr + th + td） ---- */
      const tdPadding = {
        paddingTop: 12, paddingTopUnit: SizeUnitEnum.PX,
        paddingRight: 20, paddingRightUnit: SizeUnitEnum.PX,
        paddingBottom: 12, paddingBottomUnit: SizeUnitEnum.PX,
        paddingLeft: 20, paddingLeftUnit: SizeUnitEnum.PX,
      };
      const tableSection = mkSection(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX },
          flex: { flexDirection: FlexDirectionEnum.COLUMN, alignItems: AlignItemsEnum.CENTER },
          size: sectionPadding,
          visual: {
            backgrounds: [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'linear-gradient(180deg, #fafbff 0%, #f0f4ff 100%)' }],
            boxShadows: [],
          },
        }),
        [
          mkHeading(3, '版本对比', mkStyle({
            font: { fontSize: 26, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a2e', textAlign: TextAlignEnum.CENTER, textShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 2, yUnit: SizeUnitEnum.PX, blur: 4, blurUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.06)' }] },
            size: { marginBottom: '8', marginBottomUnit: SizeUnitEnum.PX },
          }), 'table-title'),
          mkParagraph('选择最适合你的方案', mkStyle({
            font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#888888', textAlign: TextAlignEnum.CENTER, textShadows: [] },
            size: { marginBottom: '24', marginBottomUnit: SizeUnitEnum.PX },
          }), 'table-subtitle'),
          mkTable(mkStyle({
            general: { borderCollapse: BorderCollapseEnum.COLLAPSE },
            visual: {
              backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }],
              boxShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 4, yUnit: SizeUnitEnum.PX, blur: 16, blurUnit: SizeUnitEnum.PX, spread: 0, spreadUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.08)', inset: false }],
              borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#e8e8e8',
              borderRadiusTL: 12, borderRadiusTR: 12, borderRadiusBL: 12, borderRadiusBR: 12, borderRadiusUnit: SizeUnitEnum.PX,
            },
          }), [
            mkTableCaption(mkStyle({
              font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: '#666666', fontStyle: FontStyleEnum.ITALIC, textShadows: [] },
              size: { marginBottom: '12', marginBottomUnit: SizeUnitEnum.PX },
            }), [
              mkText('VibePage 各版本功能对比表', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: '#666666', fontStyle: FontStyleEnum.ITALIC, textShadows: [] } })),
            ], 'table-caption'),
            mkTableColGroup(1, mkStyle({}), [
              mkTableCol(1, mkStyle({})),
              mkTableCol(1, mkStyle({})),
              mkTableCol(1, mkStyle({})),
            ], 'table-colgroup'),
            mkTableHead(mkStyle({
              visual: { backgrounds: [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)' }], boxShadows: [] },
            }), [
              mkTableRow(mkStyle({}), [
                mkTableHeaderCell(mkStyle({ size: tdPadding }), [
                  mkText('功能', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#ffffff', textShadows: [] } })),
                ], 'th-feature', TableScopeEnum.COL),
                mkTableHeaderCell(mkStyle({ size: tdPadding }), [
                  mkText('免费版', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#a0c4ff', textShadows: [] } })),
                ], 'th-free', TableScopeEnum.COL),
                mkTableHeaderCell(mkStyle({ size: tdPadding }), [
                  mkText('专业版', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#a0c4ff', textShadows: [] } })),
                ], 'th-pro', TableScopeEnum.COL),
              ], 'thead-tr'),
            ], 'table-thead'),
            mkTableBody(mkStyle({}), [
              mkTableRow(mkStyle({ visual: { backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }], boxShadows: [] } }), [
                mkTableData(mkStyle({ size: tdPadding, visual: { backgrounds: [], boxShadows: [], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#f0f0f0' } }), [
                  mkText('拖拽编辑', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', fontWeight: FontWeightEnum.MEDIUM, textShadows: [] } })),
                ], 'td-1-1'),
                mkTableData(mkStyle({ size: tdPadding, visual: { backgrounds: [], boxShadows: [], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#f0f0f0' } }), [
                  mkText('✓ 支持', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#52c41a', fontWeight: FontWeightEnum.SEMI_BOLD, textShadows: [] } })),
                ], 'td-1-2'),
                mkTableData(mkStyle({ size: tdPadding, visual: { backgrounds: [], boxShadows: [], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#f0f0f0' } }), [
                  mkText('✓ 支持', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#52c41a', fontWeight: FontWeightEnum.SEMI_BOLD, textShadows: [] } })),
                ], 'td-1-3'),
              ], 'tbody-tr-1'),
              mkTableRow(mkStyle({ visual: { backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#f9fafb' }], boxShadows: [] } }), [
                mkTableData(mkStyle({ size: tdPadding, visual: { backgrounds: [], boxShadows: [], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#f0f0f0' } }), [
                  mkText('组件数量', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', fontWeight: FontWeightEnum.MEDIUM, textShadows: [] } })),
                ], 'td-2-1'),
                mkTableData(mkStyle({ size: tdPadding, visual: { backgrounds: [], boxShadows: [], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#f0f0f0' } }), [
                  mkText('10+', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#666666', textShadows: [] } })),
                ], 'td-2-2'),
                mkTableData(mkStyle({ size: tdPadding, visual: { backgrounds: [], boxShadows: [], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#f0f0f0' } }), [
                  mkText('50+', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#1677ff', fontWeight: FontWeightEnum.BOLD, textShadows: [] } })),
                ], 'td-2-3'),
              ], 'tbody-tr-2'),
              mkTableRow(mkStyle({ visual: { backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }], boxShadows: [] } }), [
                mkTableData(mkStyle({ size: tdPadding, visual: { backgrounds: [], boxShadows: [], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#f0f0f0' } }), [
                  mkText('代码导出', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#333333', fontWeight: FontWeightEnum.MEDIUM, textShadows: [] } })),
                ], 'td-3-1'),
                mkTableData(mkStyle({ size: tdPadding, visual: { backgrounds: [], boxShadows: [], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#f0f0f0' } }), [
                  mkText('✗ 不支持', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#999999', textShadows: [] } })),
                ], 'td-3-2'),
                mkTableData(mkStyle({ size: tdPadding, visual: { backgrounds: [], boxShadows: [], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#f0f0f0' } }), [
                  mkText('✓ 支持', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#52c41a', fontWeight: FontWeightEnum.SEMI_BOLD, textShadows: [] } })),
                ], 'td-3-3'),
              ], 'tbody-tr-3'),
            ], 'table-tbody'),
            mkTableFoot(mkStyle({
              visual: { backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#f0f4ff' }], boxShadows: [] },
            }), [
              mkTableRow(mkStyle({}), [
                mkTableData(mkStyle({ size: tdPadding }), [
                  mkText('专业版提供更多高级功能与技术支持', mkStyle({ font: { fontSize: 13, fontSizeUnit: SizeUnitEnum.PX, color: '#0f3460', textAlign: TextAlignEnum.CENTER, fontStyle: FontStyleEnum.ITALIC, fontWeight: FontWeightEnum.MEDIUM, textShadows: [] } })),
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
          visual: {
            backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#1a1a2e' }],
            boxShadows: [],
          },
        }),
        [
          mkContainer(mkStyle({ size: { width: '45', widthUnit: SizeUnitEnum.PERCENT } }), [
            mkHeading(3, '视频展示', mkStyle({
              font: { fontSize: 20, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#ffffff', textShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 1, yUnit: SizeUnitEnum.PX, blur: 2, blurUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.3)' }] },
              size: { marginBottom: '12', marginBottomUnit: SizeUnitEnum.PX },
            }), 'video-title'),
            mkVideo('https://example.com/demo.mp4', mkStyle({
              size: { width: '100', widthUnit: SizeUnitEnum.PERCENT },
              visual: {
                backgrounds: [],
                boxShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 4, yUnit: SizeUnitEnum.PX, blur: 16, blurUnit: SizeUnitEnum.PX, spread: 0, spreadUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.3)', inset: false }],
                borderRadiusTL: 12, borderRadiusTR: 12, borderRadiusBL: 12, borderRadiusBR: 12, borderRadiusUnit: SizeUnitEnum.PX,
                borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#333333',
              },
            }), 'demo-video'),
          ], 'video-group'),
          mkContainer(mkStyle({ size: { width: '45', widthUnit: SizeUnitEnum.PERCENT } }), [
            mkHeading(3, '音频示例', mkStyle({
              font: { fontSize: 20, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#ffffff', textShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 1, yUnit: SizeUnitEnum.PX, blur: 2, blurUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.3)' }] },
              size: { marginBottom: '12', marginBottomUnit: SizeUnitEnum.PX },
            }), 'audio-title'),
            mkAudio('https://example.com/demo.mp3', mkStyle({
              size: { width: '100', widthUnit: SizeUnitEnum.PERCENT },
            }), 'demo-audio'),
            mkImage('https://placeholder.com/400x200', '音频配图', mkStyle({
              size: { width: '100', widthUnit: SizeUnitEnum.PERCENT, marginTop: '16', marginTopUnit: SizeUnitEnum.PX },
              visual: {
                backgrounds: [],
                boxShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: 4, yUnit: SizeUnitEnum.PX, blur: 16, blurUnit: SizeUnitEnum.PX, spread: 0, spreadUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.3)', inset: false }],
                borderRadiusTL: 12, borderRadiusTR: 12, borderRadiusBL: 12, borderRadiusBR: 12, borderRadiusUnit: SizeUnitEnum.PX,
                borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#333333',
              },
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
          size: {
            paddingTop: 32, paddingTopUnit: SizeUnitEnum.PX,
            paddingRight: 32, paddingRightUnit: SizeUnitEnum.PX,
            paddingBottom: 32, paddingBottomUnit: SizeUnitEnum.PX,
            paddingLeft: 32, paddingLeftUnit: SizeUnitEnum.PX,
            width: '100', widthUnit: SizeUnitEnum.PERCENT,
          },
          visual: {
            backgrounds: [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }],
            boxShadows: [{ x: 0, xUnit: SizeUnitEnum.PX, y: -2, yUnit: SizeUnitEnum.PX, blur: 12, blurUnit: SizeUnitEnum.PX, spread: 0, spreadUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.15)', inset: false }],
          },
        }),
        [
          mkContainer(flexCol({}), [
            mkSpan(mkStyle({
              font: { fontSize: 20, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#ffffff', textShadows: [{ x: 1, xUnit: SizeUnitEnum.PX, y: 1, yUnit: SizeUnitEnum.PX, blur: 2, blurUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.3)' }] },
            }), [
              mkText('VibePage', mkStyle({ font: { fontSize: 20, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#ffffff', textShadows: [{ x: 1, xUnit: SizeUnitEnum.PX, y: 1, yUnit: SizeUnitEnum.PX, blur: 2, blurUnit: SizeUnitEnum.PX, color: 'rgba(0,0,0,0.3)' }] } })),
            ], 'footer-logo'),
            mkParagraph('© 2024 VibePage. 保留所有权利。', mkStyle({
              font: { fontSize: 13, fontSizeUnit: SizeUnitEnum.PX, color: '#888888', textShadows: [] },
              size: { marginTop: '8', marginTopUnit: SizeUnitEnum.PX },
            }), 'footer-copyright'),
          ], 'footer-brand'),
          mkContainer(flexRow({ flex: { alignItems: AlignItemsEnum.CENTER } }), [
            mkLink('#', mkStyle({ size: { marginRight: '20', marginRightUnit: SizeUnitEnum.PX } }), [
              mkText('隐私政策', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#a0c4ff', textDecoration: TextDecorationEnum.NONE, textShadows: [] } })),
            ], 'footer-link-1'),
            mkLink('#', mkStyle({ size: { marginRight: '20', marginRightUnit: SizeUnitEnum.PX } }), [
              mkText('服务条款', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#a0c4ff', textDecoration: TextDecorationEnum.NONE, textShadows: [] } })),
            ], 'footer-link-2'),
            mkLink('#', mkStyle({}), [
              mkText('联系我们', mkStyle({ font: { fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, color: '#a0c4ff', textDecoration: TextDecorationEnum.NONE, textShadows: [] } })),
            ], 'footer-link-3'),
          ], 'footer-links'),
        ],
        'site-footer',
      );

      this.root.children = [headerEl, hero, features, articleSection, formSection, listSection, tableSection, mediaSection, footerEl];
    },
  }
});
