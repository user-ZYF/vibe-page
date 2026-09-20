import { type CanvasButtonElement, type CanvasContainerElement, type CanvasInnerElement, type CanvasImageElement, type CanvasInputElement, type CanvasLinkElement, type CanvasParagraphElement, type CanvasRadioElement, type CanvasCheckboxElement, type CanvasVideoElement, type CanvasAudioElement, type CanvasTextareaElement, type CanvasLabelElement, type CanvasFormElement, type CanvasSpanElement, type CanvasTextElement, type CanvasUnorderedListElement, type CanvasOrderedListElement, type CanvasListItemElement, type CanvasTableElement, type CanvasTableHeadElement, type CanvasTableBodyElement, type CanvasTableFootElement, type CanvasTableRowElement, type CanvasTableDataElement, type CanvasTableHeaderCellElement, type CanvasTableCaptionElement, type CanvasTableColGroupElement, type CanvasTableColElement, type CanvasHeaderElement, type CanvasFooterElement, type CanvasArticleElement, type CanvasSectionElement, type CanvasAsideElement, type CanvasHeadingElement, type CanvasRootElement, type CanvasElement, type CanvasInnerElementTypeEnum, type StyleConfig, type ClassListItem, type ClassRef, type CanvasStorageData, isParentElement } from "@/views/Canvas/types";
import { ButtonTypeEnum, CanvasElementLabelMap, CanvasElementTypeEnum, HeadingLevelEnum, LinkTargetEnum, SiderPanelEnum, FormMethodEnum, TableScopeEnum } from "@/constants/home";
import { DefaultStyleConfigMap, defaultClassStyleConfig, DisplayStyleEnum, FlexDirectionEnum, JustifyContentEnum, AlignItemsEnum, UnitEnum, FontWeightEnum, TextAlignEnum, BackgroundTypeEnum, BorderStyleEnum, BorderCollapseEnum, TextDecorationEnum, FontStyleEnum, FontFamilyEnum, PositionStyleEnum, OverflowStyleEnum } from "@/constants/style";
import { defineStore } from "pinia";
import { cloneDeep, isEqual } from "lodash";
import { Positioner } from "@/views/Canvas/drag/Positioner";
import { parseCodeToCanvas } from "@/utils/code-parser";
import { cssToStyleConfig, styleConfigToCss, mergeDeclarations, syncStyleConfigToRules, declarationWins } from "@/utils/style-converter";
import { generateId } from "@/utils/id";
import { StyleRuleTypeEnum } from "@/constants/style";
import type { CanvasStyleRule } from "@/views/Canvas/types";
import { findElementInTree } from "@/views/Canvas/utils/treeTraversal";

/**
 * 画布数据的存储版本号
 * 开发阶段数据结构频繁变更，修改此版本号即可让所有用户的旧 LocalStorage 数据自动失效（清空并回退到默认内容）
 * 数据结构变更后只需递增此数字，无需编写迁移逻辑
 */
const CANVAS_DATA_VERSION = 12;

/** 画布数据的 LocalStorage key */
const CANVAS_DATA_STORAGE_KEY = 'vibe_page__canvas_data';

/** 画布store */
export const useCanvasStore = defineStore("canvas", {
  state: () => {
    // 根元素 id（提前生成，用于在 styleRules 中初始化其 #id 规则）
    const rootId = generateId();
    return {
    /** 画布元素列表 */
    root: {
      id: rootId,
      type: CanvasElementTypeEnum.ROOT,
      classes: [],
      children: [],
      alias: CanvasElementLabelMap[CanvasElementTypeEnum.ROOT],
    } as CanvasRootElement,
    /** 选中的元素 */
    selectedElementId: null as string | null,
    /** 当前编辑的 class 名称（null 表示编辑元素自身样式） */
    activeClassName: null as string | null,
    /** 当前激活的 Sider 面板 */
    activePanel: SiderPanelEnum.COMPONENTS as SiderPanelEnum,
    /** 是否正在调整元素尺寸 */
    isResizing: false,
    /** 插入位置 */
    positioner: new Positioner(),
    /** 样式规则有序清单 */
    styleRules: [
      /** 根元素的 #id 规则 */
      {
        type: StyleRuleTypeEnum.EDITABLE,
        selector: `#${rootId}`,
        style: styleConfigToCss(DefaultStyleConfigMap[CanvasElementTypeEnum.ROOT], true),
      },
    ] as CanvasStyleRule[],
    };
  },
  getters: {
    /** 全局 class 列表（含引用元素 id 及启用状态），供全局 class 管理面板使用 */
    classList(state): ClassListItem[] {
      // 收集每个 class 被哪些元素引用
      const refsMap = new Map<string, ClassRef[]>();
      const collect = (list: CanvasInnerElement[]) => {
        for (const el of list) {
          el.classes.forEach((c) => {
            const arr = refsMap.get(c.name) ?? [];
            arr.push({ id: el.id, enabled: c.enabled });
            refsMap.set(c.name, arr);
          });
          if (isParentElement(el)) {
            collect(el.children);
          }
        }
      };
      collect(state.root.children);
      // 同名选择器可能存在多条规则，按 class 名去重
      const names = new Set(
        state.styleRules
          .filter((r) => r.type === StyleRuleTypeEnum.EDITABLE && r.selector.startsWith('.'))
          .map((r) => r.selector.slice(1))
      );
      return [...names].map((name) => ({
        name,
        refs: refsMap.get(name) ?? [],
      }));
    }
  },
  actions: {
    /** 获取指定选择器（.class 或 #id）的样式配置：同名全部 EDITABLE 规则声明的合并投影；无规则则创建。修改后调用 syncStyleConfig 写回规则 */
    getOrCreateStyleConfig(selector: string): StyleConfig {
      const rules = this.styleRules.filter((r) => r.type === StyleRuleTypeEnum.EDITABLE && r.selector === selector);
      if (rules.length === 0) {
        const rule = cloneDeep(defaultClassStyleConfig);
        this.styleRules.push({
          type: StyleRuleTypeEnum.EDITABLE,
          selector,
          style: styleConfigToCss(rule, true),
        });
        return rule;
      }
      return cssToStyleConfig(mergeDeclarations(rules));
    },
    /** 将编辑对象的修改按属性 diff 写回对应规则集*/
    syncStyle(selector: string, config: StyleConfig) {
      // 投影得到的 styleConfig 不含画布无法处理的声明，转回 css 后即为纯粹的可操作样式声明
      const prev = styleConfigToCss(this.getOrCreateStyleConfig(selector));
      const next = styleConfigToCss(config);
      if (isEqual(prev, next)) return;
      syncStyleConfigToRules(this.styleRules, selector, prev, next);
    },
    /** 清理失效样式规则：未被任何元素引用的可编辑规则，复合规则保留 */
    cleanupUnreferencedStyleRules() {
      // 递归收集所有元素引用的 class 名称（包含启用和禁用）与现存元素 id（含 root）
      const usedClasses = new Set<string>();
      const existingIds = new Set<string>([this.root.id]);
      const collect = (list: CanvasInnerElement[]) => {
        for (const el of list) {
          el.classes.forEach((c) => usedClasses.add(c.name));
          existingIds.add(el.id);
          if (isParentElement(el)) {
            collect(el.children);
          }
        }
      };
      collect(this.root.children);
      // 只清理 EDITABLE 类型
      this.styleRules = this.styleRules.filter((r) => {
        if (r.type !== StyleRuleTypeEnum.EDITABLE) return true;
        if (r.selector.startsWith('.')) return usedClasses.has(r.selector.slice(1));
        if (r.selector.startsWith('#')) return existingIds.has(r.selector.slice(1));
        return true;
      });
    },
    /** 从所有元素中移除指定 class，并从 styleRules 中删除其样式定义 */
    removeClassFromAllElements(className: string) {
      const remove = (list: CanvasInnerElement[]) => {
        for (const el of list) {
          const idx = el.classes.findIndex((c) => c.name === className);
          if (idx !== -1) {
            el.classes.splice(idx, 1);
          }
          if (isParentElement(el)) {
            remove(el.children);
          }
        }
      };
      remove(this.root.children);
      const selector = `.${className}`;
      this.styleRules = this.styleRules.filter(
        (r) => !(r.type === StyleRuleTypeEnum.EDITABLE && r.selector === selector)
      );
    },
    /** 读取指定选择器某属性的当前声明值（同一声明只保留在最终生效的规则中，顺序找首个含该声明的规则即可） */
    getRawStyleDeclaration(selector: string, prop: string): string | undefined {
      const rules = this.styleRules.filter((r) => r.selector === selector && r.type === StyleRuleTypeEnum.EDITABLE);
      const targetRule = rules.find((r) => r.style[prop]);
      if(targetRule){
        return targetRule.style[prop];
      }
      return undefined;
    },
    /** 直写指定选择器的声明（rule.style）：value 为 undefined 时从所有同名规则中删除该声明；已有声明写入其所在规则（原声明带 !important 则保留），无则写入最后一条同名规则（级联末尾生效） */
    setRawStyleDeclaration(selector: string, prop: string, value: string | undefined): void {
      const rules = this.styleRules.filter((r) => r.selector === selector && r.type === StyleRuleTypeEnum.EDITABLE);
      if (!value) {
        rules.forEach((r) => {
          if (r.style[prop]) {
            delete r.style[prop];
          }
        });
      } else {
        const targetRule = rules.find((r) => r.style[prop]) ?? rules[rules.length - 1];
        if (!targetRule) return;
        targetRule.style[prop] = declarationWins(value, targetRule.style[prop]) ? value : `${value} !important`;
      }
    },
    /** 重命名元素的 #id 规则选择器（元素 id 变更时同步迁移样式，避免规则失配导致样式丢失） */
    renameElementIdRules(oldId: string, newId: string) {
      this.styleRules.forEach((rule) => {
        if (rule.type === StyleRuleTypeEnum.EDITABLE && rule.selector === `#${oldId}`) {
          rule.selector = `#${newId}`;
        }
      });
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
    /** 生成一个元素（同时在 styleRules 中创建对应的 #id 规则） */
    generateElement(type: CanvasInnerElementTypeEnum): CanvasInnerElement {
      const id = generateId();
      // 在 styleRules 中创建元素的 #id 规则，携带元素类型默认样式
      this.styleRules.push({
        type: StyleRuleTypeEnum.EDITABLE,
        selector: `#${id}`,
        style: styleConfigToCss(DefaultStyleConfigMap[type as CanvasElementTypeEnum], true),
      });
      const elBase = {
        id,
        type,
        classes: [],
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
          return { ...elBase, href: '', target: LinkTargetEnum.SELF, children: [] } as CanvasLinkElement;
        case CanvasElementTypeEnum.CONTAINER:
          return { ...elBase, children: [] }  as CanvasContainerElement;
        case CanvasElementTypeEnum.INPUT:
          return { ...elBase, placeholder: '请输入内容', value: '', required: false } as CanvasInputElement;
        case CanvasElementTypeEnum.TEXTAREA:
          return { ...elBase, placeholder: '请输入内容', value: '', required: false } as CanvasTextareaElement;
        case CanvasElementTypeEnum.RADIO:
          return { ...elBase, name: '', value: '', checked: false, required: false } as CanvasRadioElement;
        case CanvasElementTypeEnum.CHECKBOX:
          return { ...elBase, name: '', value: '', checked: false, required: false } as CanvasCheckboxElement;
        case CanvasElementTypeEnum.VIDEO:
          return { ...elBase, src: '', controls: true } as CanvasVideoElement;
        case CanvasElementTypeEnum.AUDIO:
          return { ...elBase, src: '', controls: true } as CanvasAudioElement;
        case CanvasElementTypeEnum.LABEL:
          return { ...elBase, text: '标签' } as CanvasLabelElement;
        case CanvasElementTypeEnum.SPAN:
          return { ...elBase, children: [] } as CanvasSpanElement;
        case CanvasElementTypeEnum.TEXT:
          return { ...elBase, text: '文本' } as CanvasTextElement;
        case CanvasElementTypeEnum.FORM:
          return { ...elBase, action: '', method: FormMethodEnum.GET, children: [] } as CanvasFormElement;
        case CanvasElementTypeEnum.UNORDERED_LIST:
          return { ...elBase, children: [] } as CanvasUnorderedListElement;
        case CanvasElementTypeEnum.ORDERED_LIST:
          return { ...elBase, children: [] } as CanvasOrderedListElement;
        case CanvasElementTypeEnum.LIST_ITEM:
          return { ...elBase, children: [] } as CanvasListItemElement;
        case CanvasElementTypeEnum.TABLE:
          return { ...elBase, children: [] } as CanvasTableElement;
        case CanvasElementTypeEnum.TABLE_HEAD:
          return { ...elBase, children: [] } as CanvasTableHeadElement;
        case CanvasElementTypeEnum.TABLE_BODY:
          return { ...elBase, children: [] } as CanvasTableBodyElement;
        case CanvasElementTypeEnum.TABLE_FOOT:
          return { ...elBase, children: [] } as CanvasTableFootElement;
        case CanvasElementTypeEnum.TABLE_ROW:
          return { ...elBase, children: [] } as CanvasTableRowElement;
        case CanvasElementTypeEnum.TABLE_DATA:
          return { ...elBase, children: [] } as CanvasTableDataElement;
        case CanvasElementTypeEnum.TABLE_HEADER_CELL:
          return { ...elBase, children: [] } as CanvasTableHeaderCellElement;
        case CanvasElementTypeEnum.TABLE_CAPTION:
          return { ...elBase, children: [] } as CanvasTableCaptionElement;
        case CanvasElementTypeEnum.TABLE_COL_GROUP:
          return { ...elBase, children: [] } as CanvasTableColGroupElement;
        case CanvasElementTypeEnum.TABLE_COL:
          return { ...elBase } as CanvasTableColElement;
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
        case CanvasElementTypeEnum.HEADING:
          return { ...elBase, text: '标题', level: HeadingLevelEnum.H1 } as CanvasHeadingElement;
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

      // 清理失效样式规则（被删元素的 #id 规则及其独有的 class 样式）
      this.cleanupUnreferencedStyleRules();
    },
    /** 清空所有元素（保留根元素） */
    clearAllElements() {
      this.root.children = [];
      // 保留 root 的 #id 规则，移除其他所有规则
      this.styleRules = this.styleRules.filter((r) => r.selector === `#${this.root.id}`);
      if(this.selectedElementId !== this.root.id){
        this.selectElement(null);
      }
    },
    /** 复制元素（递归支持多层级，插入到原元素后面） */
    duplicateElement(id: string) {
      // 复制出来的新元素 id
      let duplicatedId: string | null = null;
      // 递归为所有元素生成随机id
      const renewIds = (el: CanvasInnerElement) => {
        const newId = generateId();
        // 源元素的同名 #id 规则可能有多条，合并为一条级联等效的新规则
        const sourceRules = this.styleRules.filter(
          (r) => r.type === StyleRuleTypeEnum.EDITABLE && r.selector === `#${el.id}`
        );
        if (sourceRules.length) {
          this.styleRules.push({
            type: StyleRuleTypeEnum.EDITABLE,
            selector: `#${newId}`,
            style: mergeDeclarations(sourceRules),
          });
        }
        el.id = newId;
        if (isParentElement(el)) {
          el.children.forEach(renewIds);
        }
      };
      // 在原元素下一位置插入复制的新元素
      const insertDuplicate = (list: CanvasInnerElement[]): boolean => {
        const index = list.findIndex((el) => el.id === id);
        if (index !== -1) {
          const duplicated = cloneDeep(list[index]);
          renewIds(duplicated);
          duplicatedId = duplicated.id;
          list.splice(index + 1, 0, duplicated);
          return true;
        }
        return list.some((el) => isParentElement(el) && insertDuplicate(el.children));
      };
      insertDuplicate(this.root.children);
      this.mergeAdjacentTextElements();
      if (duplicatedId) {
        this.selectElement(duplicatedId);
      }
    },
    /** 移动已有元素（支持跨容器） */
    moveElement(id: string, targetParentId: string, index: number) {
      const target = this.getElementById(id) as CanvasInnerElement | null;
      if (!target) return;
      // 使用临时 id 标记原始元素，避免修改响应式对象，通过 cloneDeep 后的副本持有临时 id
      const tempId = generateId();
      const tempTarget = cloneDeep(target);
      tempTarget.id = tempId;
      // 用临时副本替换原始响应式元素，保留原始元素不变直到删除步骤
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
        // 插入到目标位置
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
      // 合并后选中元素应映射到的 id
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
      // 合并掉的元素 id 已不存在，清理其遗留的 #id 规则
      this.cleanupUnreferencedStyleRules();
    },
    /** 加载默认画布内容 */
    loadDefaultContent() {
      // 本地收集 #id 规则，最终统一设置到 styleRules
      const localStyleRules: CanvasStyleRule[] = [];
      // 为新元素生成 id 并在 localStyleRules 中创建 #id EDITABLE 规则
      const createElementId = (styleConfig: StyleConfig): string => {
        const id = generateId();
        localStyleRules.push({
          type: StyleRuleTypeEnum.EDITABLE,
          selector: `#${id}`,
          style: styleConfigToCss(styleConfig, true),
        });
        return id;
      };

      // 创建基础样式配置
      const mkStyle = (overrides: Partial<StyleConfig> = {}): StyleConfig => ({
        general: {},
        size: {},
        font: { textShadows: [] },
        visual: { backgrounds: [], boxShadows: [] },
        flex: {},
        ...overrides,
      });

      // 创建容器元素
      const mkContainer = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasContainerElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.CONTAINER, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.CONTAINER], children,
      });

      // 创建段落元素
      const mkParagraph = (text: string, styleConfig: StyleConfig, alias?: string): CanvasParagraphElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.PARAGRAPH, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.PARAGRAPH], text,
      });

      // 创建按钮元素
      const mkButton = (text: string, styleConfig: StyleConfig, alias?: string): CanvasButtonElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.BUTTON, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.BUTTON], text, buttonType: ButtonTypeEnum.BUTTON,
      });

      // 创建链接元素
      const mkLink = (href: string, styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasLinkElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.LINK, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.LINK], href, target: LinkTargetEnum.SELF, children,
      });

      // 创建输入框元素
      const mkInput = (placeholder: string, styleConfig: StyleConfig, alias?: string): CanvasInputElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.INPUT, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.INPUT], placeholder, value: '', required: false,
      });

      // 创建图片元素
      const mkImage = (src: string, title: string, styleConfig: StyleConfig, alias?: string): CanvasImageElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.IMAGE, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.IMAGE], src, title,
      });

      // 创建视频元素
      const mkVideo = (src: string, styleConfig: StyleConfig, alias?: string): CanvasVideoElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.VIDEO, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.VIDEO], src, controls: true,
      });

      // 创建音频元素
      const mkAudio = (src: string, styleConfig: StyleConfig, alias?: string): CanvasAudioElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.AUDIO, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.AUDIO], src, controls: true,
      });

      // 创建多行文本框元素
      const mkTextarea = (placeholder: string, styleConfig: StyleConfig, alias?: string): CanvasTextareaElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.TEXTAREA, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TEXTAREA], placeholder, value: '', required: false,
      });

      // 创建单选框元素
      const mkRadio = (name: string, value: string, styleConfig: StyleConfig, alias?: string): CanvasRadioElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.RADIO, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.RADIO], name, value, checked: false, required: false,
      });

      // 创建多选框元素
      const mkCheckbox = (name: string, value: string, styleConfig: StyleConfig, alias?: string): CanvasCheckboxElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.CHECKBOX, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.CHECKBOX], name, value, checked: false, required: false,
      });

      // 创建标签元素
      const mkLabel = (text: string, forId: string, styleConfig: StyleConfig, alias?: string): CanvasLabelElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.LABEL, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.LABEL], text, for: forId,
      });

      // 创建表单元素
      const mkForm = (action: string, method: FormMethodEnum, styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasFormElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.FORM, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.FORM], action, method, children,
      });

      // 创建行内容器元素
      const mkSpan = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasSpanElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.SPAN, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.SPAN], children,
      });

      // 创建纯文本元素
      const mkText = (text: string, _styleConfig: StyleConfig, alias?: string): CanvasTextElement => ({
        id: generateId(), type: CanvasElementTypeEnum.TEXT, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TEXT], text,
      });

      // 创建标题元素（h1-h6，由 level 控制级别）
      const mkHeading = (
        level: HeadingLevelEnum,
        text: string,
        styleConfig: StyleConfig,
        alias?: string,
      ): CanvasHeadingElement => ({
        id: generateId(), type: CanvasElementTypeEnum.HEADING, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.HEADING], text, level,
      });

      // 创建无序列表元素
      const mkUnorderedList = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasUnorderedListElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.UNORDERED_LIST, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.UNORDERED_LIST], children,
      });

      // 创建有序列表元素
      const mkOrderedList = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasOrderedListElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.ORDERED_LIST, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.ORDERED_LIST], children,
      });

      // 创建列表项元素
      const mkListItem = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasListItemElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.LIST_ITEM, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.LIST_ITEM], children,
      });

      // 创建表格元素
      const mkTable = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.TABLE, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE], children,
      });

      // 创建表头元素
      const mkTableHead = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableHeadElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.TABLE_HEAD, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_HEAD], children,
      });

      // 创建表体元素
      const mkTableBody = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableBodyElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.TABLE_BODY, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_BODY], children,
      });

      // 创建表脚元素
      const mkTableFoot = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableFootElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.TABLE_FOOT, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_FOOT], children,
      });

      // 创建表格行元素
      const mkTableRow = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableRowElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.TABLE_ROW, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_ROW], children,
      });

      // 创建表格单元格元素
      const mkTableData = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableDataElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.TABLE_DATA, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_DATA], children,
      });

      // 创建表头单元格元素
      const mkTableHeaderCell = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string, scope?: TableScopeEnum): CanvasTableHeaderCellElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.TABLE_HEADER_CELL, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_HEADER_CELL], scope, children,
      });

      // 创建表格标题元素
      const mkTableCaption = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableCaptionElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.TABLE_CAPTION, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_CAPTION], children,
      });

      // 创建表格列组元素
      const mkTableColGroup = (span: number, styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasTableColGroupElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.TABLE_COL_GROUP, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_COL_GROUP], span, children,
      });

      // 创建表格列元素
      const mkTableCol = (span: number, styleConfig: StyleConfig, alias?: string): CanvasTableColElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.TABLE_COL, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TABLE_COL], span,
      });

      // 创建页头元素
      const mkHeader = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasHeaderElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.HEADER, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.HEADER], children,
      });

      // 创建页脚元素
      const mkFooter = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasFooterElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.FOOTER, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.FOOTER], children,
      });

      // 创建文章元素
      const mkArticle = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasArticleElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.ARTICLE, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.ARTICLE], children,
      });

      // 创建章节元素
      const mkSection = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasSectionElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.SECTION, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.SECTION], children,
      });

      // 创建侧边栏元素
      const mkAside = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasAsideElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.ASIDE, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.ASIDE], children,
      });

      // 通用样式快捷方法
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
        paddingTop: 64, paddingTopUnit: UnitEnum.PX,
        paddingRight: 32, paddingRightUnit: UnitEnum.PX,
        paddingBottom: 64, paddingBottomUnit: UnitEnum.PX,
        paddingLeft: 32, paddingLeftUnit: UnitEnum.PX,
        width: '100', widthUnit: UnitEnum.PERCENT,
      };

      // ---- 页头（header） ----
      const headerEl = mkHeader(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX, position: PositionStyleEnum.RELATIVE, zIndex: 100 },
          flex: { flexDirection: FlexDirectionEnum.ROW, justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.CENTER },
          size: {
            paddingTop: 16, paddingTopUnit: UnitEnum.PX,
            paddingRight: 32, paddingRightUnit: UnitEnum.PX,
            paddingBottom: 16, paddingBottomUnit: UnitEnum.PX,
            paddingLeft: 32, paddingLeftUnit: UnitEnum.PX,
            width: '100', widthUnit: UnitEnum.PERCENT,
          },
          visual: {
            backgrounds: [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }],
            boxShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 2, yUnit: UnitEnum.PX, blur: 12, blurUnit: UnitEnum.PX, spread: 0, spreadUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.15)', inset: false }],
          },
        }),
        [
          mkSpan(mkStyle({
            font: { fontSize: 24, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#ffffff', textShadows: [{ x: 1, xUnit: UnitEnum.PX, y: 1, yUnit: UnitEnum.PX, blur: 2, blurUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.3)' }] },
          }), [
            mkText('VibePage', mkStyle({ font: { fontSize: 24, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#ffffff', textShadows: [{ x: 1, xUnit: UnitEnum.PX, y: 1, yUnit: UnitEnum.PX, blur: 2, blurUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.3)' }] } }), 'logo-text'),
          ], 'logo'),
          mkContainer(flexRow({ flex: { alignItems: AlignItemsEnum.CENTER } }), [
            mkLink('#', mkStyle({ size: { marginRight: '24', marginRightUnit: UnitEnum.PX } }), [
              mkText('首页', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#ffffff', fontWeight: FontWeightEnum.MEDIUM, textShadows: [] } })),
            ], 'nav-home'),
            mkLink('#', mkStyle({ size: { marginRight: '24', marginRightUnit: UnitEnum.PX } }), [
              mkText('功能', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#a0c4ff', textShadows: [] } })),
            ], 'nav-features'),
            mkLink('#', mkStyle({ size: { marginRight: '24', marginRightUnit: UnitEnum.PX } }), [
              mkText('定价', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#a0c4ff', textShadows: [] } })),
            ], 'nav-pricing'),
            mkLink('#', mkStyle({ size: { marginRight: '24', marginRightUnit: UnitEnum.PX } }), [
              mkText('关于', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#a0c4ff', textShadows: [] } })),
            ], 'nav-about'),
            mkButton('开始使用', mkStyle({
              font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#ffffff', fontWeight: FontWeightEnum.SEMI_BOLD, textShadows: [] },
              visual: {
                backgrounds: [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'linear-gradient(135deg, #e94560 0%, #c23152 100%)' }],
                boxShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 2, yUnit: UnitEnum.PX, blur: 8, blurUnit: UnitEnum.PX, spread: 0, spreadUnit: UnitEnum.PX, color: 'rgba(233,69,96,0.4)', inset: false }],
                borderRadiusTL: 6, borderRadiusTR: 6, borderRadiusBL: 6, borderRadiusBR: 6, borderRadiusTLUnit: UnitEnum.PX, borderRadiusTRUnit: UnitEnum.PX, borderRadiusBLUnit: UnitEnum.PX, borderRadiusBRUnit: UnitEnum.PX,
              },
              size: {
                paddingTop: 8, paddingTopUnit: UnitEnum.PX,
                paddingRight: 20, paddingRightUnit: UnitEnum.PX,
                paddingBottom: 8, paddingBottomUnit: UnitEnum.PX,
                paddingLeft: 20, paddingLeftUnit: UnitEnum.PX,
              },
            }), 'header-cta'),
          ], 'nav-actions'),
        ],
        'site-header',
      );

      // ---- Hero 区域（section + h1~h6 + p + button + image + link） ----
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
          mkHeading(HeadingLevelEnum.H1, '打造你的专属页面', mkStyle({
            font: { fontSize: 42, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a2e', textAlign: TextAlignEnum.CENTER, textShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 2, yUnit: UnitEnum.PX, blur: 4, blurUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.1)' }], letterSpacing: '2', letterSpacingUnit: UnitEnum.PX },
            size: { marginBottom: '16', marginBottomUnit: UnitEnum.PX },
          }), 'hero-title'),
          mkHeading(HeadingLevelEnum.H2, '所见即所得 · 可视化编辑器', mkStyle({
            font: { fontSize: 30, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: '#0f3460', textAlign: TextAlignEnum.CENTER, fontStyle: FontStyleEnum.ITALIC, fontFamily: FontFamilyEnum.GEORGIA, textShadows: [] },
            size: { marginBottom: '12', marginBottomUnit: UnitEnum.PX },
          }), 'hero-subtitle'),
          mkHeading(HeadingLevelEnum.H3, '零代码 · 拖拽式 · 实时预览', mkStyle({
            font: { fontSize: 22, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.MEDIUM, color: '#16213e', textAlign: TextAlignEnum.CENTER, letterSpacing: '1', letterSpacingUnit: UnitEnum.PX, textShadows: [] },
            size: { marginBottom: '24', marginBottomUnit: UnitEnum.PX },
          }), 'hero-h3'),
          mkParagraph('VibePage 是一款面向所有人的可视化页面搭建工具，无论你是设计师、产品经理还是开发者，都能在这里快速构建专业级网页。拖拽组件、调整样式、实时预览，一切操作所见即所得。', mkStyle({
            font: { fontSize: 16, fontSizeUnit: UnitEnum.PX, color: '#555555', textAlign: TextAlignEnum.JUSTIFY, lineHeight: '1.8', textShadows: [] },
            size: { marginBottom: '32', marginBottomUnit: UnitEnum.PX, maxWidth: '640', maxWidthUnit: UnitEnum.PX },
          }), 'hero-desc'),
          mkContainer(flexRow({ flex: { justifyContent: JustifyContentEnum.CENTER } }), [
            mkButton('立即开始', mkStyle({
              font: { fontSize: 16, fontSizeUnit: UnitEnum.PX, color: '#ffffff', fontWeight: FontWeightEnum.SEMI_BOLD, textShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 1, yUnit: UnitEnum.PX, blur: 2, blurUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.2)' }] },
              visual: {
                backgrounds: [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)' }],
                boxShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 4, yUnit: UnitEnum.PX, blur: 12, blurUnit: UnitEnum.PX, spread: 0, spreadUnit: UnitEnum.PX, color: 'rgba(22,119,255,0.35)', inset: false }],
                borderRadiusTL: 8, borderRadiusTR: 8, borderRadiusBL: 8, borderRadiusBR: 8, borderRadiusTLUnit: UnitEnum.PX, borderRadiusTRUnit: UnitEnum.PX, borderRadiusBLUnit: UnitEnum.PX, borderRadiusBRUnit: UnitEnum.PX,
              },
              size: {
                paddingTop: 12, paddingTopUnit: UnitEnum.PX,
                paddingRight: 36, paddingRightUnit: UnitEnum.PX,
                paddingBottom: 12, paddingBottomUnit: UnitEnum.PX,
                paddingLeft: 36, paddingLeftUnit: UnitEnum.PX,
                marginRight: '16', marginRightUnit: UnitEnum.PX,
              },
            }), 'hero-cta-primary'),
            mkLink('#docs', mkStyle({
              general: { display: DisplayStyleEnum.INLINE_BLOCK },
              size: {
                paddingTop: 12, paddingTopUnit: UnitEnum.PX,
                paddingRight: 36, paddingRightUnit: UnitEnum.PX,
                paddingBottom: 12, paddingBottomUnit: UnitEnum.PX,
                paddingLeft: 36, paddingLeftUnit: UnitEnum.PX,
              },
              visual: {
                backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }],
                boxShadows: [],
                borderWidth: 2, borderStyle: BorderStyleEnum.DASHED, borderColor: '#1677ff',
                borderRadiusTL: 8, borderRadiusTR: 8, borderRadiusBL: 8, borderRadiusBR: 8, borderRadiusTLUnit: UnitEnum.PX, borderRadiusTRUnit: UnitEnum.PX, borderRadiusBLUnit: UnitEnum.PX, borderRadiusBRUnit: UnitEnum.PX,
              },
              font: { fontSize: 16, fontSizeUnit: UnitEnum.PX, color: '#1677ff', fontWeight: FontWeightEnum.MEDIUM, textShadows: [] },
            }), [
              mkText('查看文档', mkStyle({ font: { fontSize: 16, fontSizeUnit: UnitEnum.PX, color: '#1677ff', fontWeight: FontWeightEnum.MEDIUM, textShadows: [] } })),
            ], 'hero-docs-link'),
          ], 'hero-actions'),
          mkContainer(flexRow({ flex: { justifyContent: JustifyContentEnum.CENTER, alignItems: AlignItemsEnum.CENTER } }), [
            mkHeading(HeadingLevelEnum.H4, '拖拽设计', mkStyle({
              font: { fontSize: 18, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: '#1a1a2e', textDecoration: TextDecorationEnum.UNDERLINE, textShadows: [] },
              size: { marginRight: '24', marginRightUnit: UnitEnum.PX },
            }), 'hero-h4'),
            mkHeading(HeadingLevelEnum.H5, '限时免费', mkStyle({
              font: { fontSize: 16, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.MEDIUM, color: '#e94560', textDecoration: TextDecorationEnum.LINE_THROUGH, textShadows: [] },
              size: { marginRight: '24', marginRightUnit: UnitEnum.PX },
            }), 'hero-h5'),
            mkHeading(HeadingLevelEnum.H6, 'v2.0.1', mkStyle({
              font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.THIN, color: '#999999', textShadows: [] },
            }), 'hero-h6'),
          ], 'hero-meta'),
          mkImage('https://placeholder.com/800x400', 'Hero 示意图', mkStyle({
            size: {
              width: '800', widthUnit: UnitEnum.PX,
              maxWidth: '100', maxWidthUnit: UnitEnum.PERCENT,
              marginTop: '32', marginTopUnit: UnitEnum.PX,
            },
            visual: {
              backgrounds: [],
              boxShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 8, yUnit: UnitEnum.PX, blur: 32, blurUnit: UnitEnum.PX, spread: 0, spreadUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.12)', inset: false }],
              borderRadiusTL: 12, borderRadiusTR: 12, borderRadiusBL: 12, borderRadiusBR: 12, borderRadiusTLUnit: UnitEnum.PX, borderRadiusTRUnit: UnitEnum.PX, borderRadiusBLUnit: UnitEnum.PX, borderRadiusBRUnit: UnitEnum.PX,
              borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#e8e8e8',
            },
          }), 'hero-image'),
          mkLink('#more', mkStyle({
            general: { display: DisplayStyleEnum.INLINE_BLOCK },
            size: { marginTop: '20', marginTopUnit: UnitEnum.PX },
            font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#1677ff', textDecoration: TextDecorationEnum.UNDERLINE, textShadows: [] },
          }), [
            mkText('了解更多 →', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#1677ff', textDecoration: TextDecorationEnum.UNDERLINE, textShadows: [] } })),
          ], 'hero-more-link'),
        ],
        'hero',
      );

      // ---- 功能卡片区域（h3 + h4 + p + container + 不同边框样式） ----
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
              paddingTop: 28, paddingTopUnit: UnitEnum.PX,
              paddingRight: 28, paddingRightUnit: UnitEnum.PX,
              paddingBottom: 28, paddingBottomUnit: UnitEnum.PX,
              paddingLeft: 28, paddingLeftUnit: UnitEnum.PX,
              width: '30', widthUnit: UnitEnum.PERCENT,
            },
            visual: {
              backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: bgColor }],
              boxShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 4, yUnit: UnitEnum.PX, blur: 16, blurUnit: UnitEnum.PX, spread: 0, spreadUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.06)', inset: false }],
              borderWidth: 2, borderStyle, borderColor: accentColor,
              borderRadiusTL: 12, borderRadiusTR: 12, borderRadiusBL: 12, borderRadiusBR: 12, borderRadiusTLUnit: UnitEnum.PX, borderRadiusTRUnit: UnitEnum.PX, borderRadiusBLUnit: UnitEnum.PX, borderRadiusBRUnit: UnitEnum.PX,
            },
          }),
          [
            mkHeading(HeadingLevelEnum.H4, title, mkStyle({
              font: { fontSize: 18, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: accentColor, fontFamily, textShadows: [] },
              size: { marginBottom: '12', marginBottomUnit: UnitEnum.PX },
            })),
            mkParagraph(desc, mkStyle({
              font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#555555', lineHeight: '1.7', fontFamily, textShadows: [] },
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
          mkHeading(HeadingLevelEnum.H3, '核心功能', mkStyle({
            font: { fontSize: 28, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a2e', textAlign: TextAlignEnum.CENTER, textShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 2, yUnit: UnitEnum.PX, blur: 4, blurUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.08)' }] },
            size: { marginBottom: '12', marginBottomUnit: UnitEnum.PX },
          }), 'features-title'),
          mkParagraph('从拖拽编辑到代码导出，VibePage 提供一站式页面搭建体验', mkStyle({
            font: { fontSize: 16, fontSizeUnit: UnitEnum.PX, color: '#888888', textAlign: TextAlignEnum.CENTER, textShadows: [] },
            size: { marginBottom: '40', marginBottomUnit: UnitEnum.PX },
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
            mkHeading(HeadingLevelEnum.H5, '支持自定义样式', mkStyle({
              font: { fontSize: 16, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.MEDIUM, color: '#333333', textShadows: [] },
            }), 'h5-sample'),
            mkSpan(mkStyle({
              font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#1677ff', fontStyle: FontStyleEnum.ITALIC, textShadows: [] },
            }), [
              mkText('→ 查看全部功能', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#1677ff', fontStyle: FontStyleEnum.ITALIC, textShadows: [] } })),
            ], 'features-more'),
            mkHeading(HeadingLevelEnum.H6, 'v2.0.1', mkStyle({
              font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.LIGHT, color: '#999999', textShadows: [] },
            }), 'h6-sample'),
          ], 'heading-samples'),
        ],
        'features',
      );

      // ---- 文章 + 侧边栏区域（article + section + aside + p + span + text + link） ----
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
              size: { width: '62', widthUnit: UnitEnum.PERCENT },
              visual: {
                backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }],
                boxShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 2, yUnit: UnitEnum.PX, blur: 12, blurUnit: UnitEnum.PX, spread: 0, spreadUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.05)', inset: false }],
                borderRadiusTL: 12, borderRadiusTR: 12, borderRadiusBL: 12, borderRadiusBR: 12, borderRadiusTLUnit: UnitEnum.PX, borderRadiusTRUnit: UnitEnum.PX, borderRadiusBLUnit: UnitEnum.PX, borderRadiusBRUnit: UnitEnum.PX,
              },
            }),
            [
              mkHeading(HeadingLevelEnum.H2, '关于 VibePage', mkStyle({
                font: { fontSize: 26, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a2e', fontFamily: FontFamilyEnum.GEORGIA, textShadows: [] },
                size: { marginBottom: '16', marginBottomUnit: UnitEnum.PX },
              }), 'article-title'),
              mkParagraph('VibePage 是一款可视化的页面搭建工具，支持拖拽编辑、实时预览，内置丰富的组件库，帮助用户快速构建专业页面。无论是落地页、产品展示页还是个人博客，都能轻松应对。', mkStyle({
                font: { fontSize: 15, fontSizeUnit: UnitEnum.PX, color: '#333333', lineHeight: '1.8', textAlign: TextAlignEnum.JUSTIFY, textIndent: '32', textIndentUnit: UnitEnum.PX, textShadows: [] },
                size: { marginBottom: '16', marginBottomUnit: UnitEnum.PX },
              }), 'article-p1'),
              mkParagraph('通过直观的编辑界面，你可以轻松调整元素的样式、布局和交互行为，无需任何编码经验。所有修改实时生效，所见即所得。', mkStyle({
                font: { fontSize: 15, fontSizeUnit: UnitEnum.PX, color: '#333333', lineHeight: '1.8', textAlign: TextAlignEnum.JUSTIFY, textIndent: '32', textIndentUnit: UnitEnum.PX, textShadows: [] },
                size: { marginBottom: '16', marginBottomUnit: UnitEnum.PX },
              }), 'article-p2'),
              mkSpan(mkStyle({
                font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#1677ff', fontWeight: FontWeightEnum.SEMI_BOLD, fontStyle: FontStyleEnum.ITALIC, textShadows: [] },
              }), [
                mkText('了解更多详情，请访问', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#555555', textShadows: [] } })),
                mkLink('#detail', mkStyle({ size: { marginLeft: '4', marginLeftUnit: UnitEnum.PX } }), [
                  mkText('详细文档', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#1677ff', textDecoration: TextDecorationEnum.UNDERLINE, fontWeight: FontWeightEnum.SEMI_BOLD, textShadows: [] } })),
                ], 'article-link'),
              ], 'article-span'),
            ],
            'main-article',
          ),
          mkAside(
            mkStyle({
              size: { width: '32', widthUnit: UnitEnum.PERCENT, paddingTop: 24, paddingTopUnit: UnitEnum.PX, paddingRight: 24, paddingRightUnit: UnitEnum.PX, paddingBottom: 24, paddingBottomUnit: UnitEnum.PX, paddingLeft: 24, paddingLeftUnit: UnitEnum.PX },
              visual: {
                backgrounds: [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)' }],
                boxShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 4, yUnit: UnitEnum.PX, blur: 16, blurUnit: UnitEnum.PX, spread: 0, spreadUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.15)', inset: false }],
                borderRadiusTL: 12, borderRadiusTR: 12, borderRadiusBL: 12, borderRadiusBR: 12, borderRadiusTLUnit: UnitEnum.PX, borderRadiusTRUnit: UnitEnum.PX, borderRadiusBLUnit: UnitEnum.PX, borderRadiusBRUnit: UnitEnum.PX,
              },
            }),
            [
              mkHeading(HeadingLevelEnum.H4, '快速导航', mkStyle({
                font: { fontSize: 18, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#ffffff', textShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 1, yUnit: UnitEnum.PX, blur: 2, blurUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.3)' }] },
                size: { marginBottom: '16', marginBottomUnit: UnitEnum.PX },
              }), 'aside-title'),
              mkParagraph('在这里放置相关链接、最新动态或推荐内容。', mkStyle({
                font: { fontSize: 13, fontSizeUnit: UnitEnum.PX, color: '#a0c4ff', lineHeight: '1.7', textShadows: [] },
                size: { marginBottom: '12', marginBottomUnit: UnitEnum.PX },
              }), 'aside-desc'),
              mkContainer(flexCol({}), [
                mkLink('#intro', mkStyle({ size: { marginBottom: '8', marginBottomUnit: UnitEnum.PX } }), [
                  mkText('→ 产品介绍', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#a0c4ff', textDecoration: TextDecorationEnum.NONE, textShadows: [] } })),
                ], 'aside-link-1'),
                mkLink('#tutorial', mkStyle({ size: { marginBottom: '8', marginBottomUnit: UnitEnum.PX } }), [
                  mkText('→ 使用教程', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#a0c4ff', textDecoration: TextDecorationEnum.NONE, textShadows: [] } })),
                ], 'aside-link-2'),
                mkLink('#faq', mkStyle({}), [
                  mkText('→ 常见问题', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#a0c4ff', textDecoration: TextDecorationEnum.NONE, textShadows: [] } })),
                ], 'aside-link-3'),
              ], 'aside-links'),
            ],
            'sidebar',
          ),
        ],
        'article-section',
      );

      // ---- 表单区域（form + label + input + textarea + radio + checkbox + button） ----
      const inputStyle = mkStyle({
        size: {
          width: '100', widthUnit: UnitEnum.PERCENT,
          paddingTop: 12, paddingTopUnit: UnitEnum.PX,
          paddingRight: 16, paddingRightUnit: UnitEnum.PX,
          paddingBottom: 12, paddingBottomUnit: UnitEnum.PX,
          paddingLeft: 16, paddingLeftUnit: UnitEnum.PX,
          marginBottom: '16', marginBottomUnit: UnitEnum.PX,
        },
        visual: {
          backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#f9fafb' }],
          boxShadows: [],
          borderRadiusTL: 8, borderRadiusTR: 8, borderRadiusBL: 8, borderRadiusBR: 8, borderRadiusTLUnit: UnitEnum.PX, borderRadiusTRUnit: UnitEnum.PX, borderRadiusBLUnit: UnitEnum.PX, borderRadiusBRUnit: UnitEnum.PX,
          borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#d9d9d9',
        },
      });
      const labelStyle = mkStyle({
        font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: '#1a1a2e', letterSpacing: '0.5', letterSpacingUnit: UnitEnum.PX, textShadows: [] },
        size: { marginBottom: '8', marginBottomUnit: UnitEnum.PX },
      });

      const formEl = mkForm('/submit', FormMethodEnum.POST, mkStyle({
        size: { width: '560', widthUnit: UnitEnum.PX, maxWidth: '100', maxWidthUnit: UnitEnum.PERCENT },
        visual: {
          backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }],
          boxShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 8, yUnit: UnitEnum.PX, blur: 32, blurUnit: UnitEnum.PX, spread: 0, spreadUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.08)', inset: false }],
          borderRadiusTL: 16, borderRadiusTR: 16, borderRadiusBL: 16, borderRadiusBR: 16, borderRadiusTLUnit: UnitEnum.PX, borderRadiusTRUnit: UnitEnum.PX, borderRadiusBLUnit: UnitEnum.PX, borderRadiusBRUnit: UnitEnum.PX,
        },
      }), [
        mkHeading(HeadingLevelEnum.H3, '联系我们', mkStyle({
          font: { fontSize: 26, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a2e', textAlign: TextAlignEnum.CENTER, textShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 2, yUnit: UnitEnum.PX, blur: 4, blurUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.06)' }] },
          size: { marginBottom: '8', marginBottomUnit: UnitEnum.PX },
        }), 'form-title'),
        mkParagraph('有任何问题或建议？填写下方表单，我们会尽快回复你。', mkStyle({
          font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#888888', textAlign: TextAlignEnum.CENTER, textShadows: [] },
          size: { marginBottom: '24', marginBottomUnit: UnitEnum.PX },
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
            mkRadio('gender', 'male', mkStyle({ size: { marginRight: '6', marginRightUnit: UnitEnum.PX } }), 'radio-male'),
            mkLabel('男', '', mkStyle({
              font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#333333', textShadows: [] },
              size: { marginRight: '24', marginRightUnit: UnitEnum.PX },
            }), 'label-male'),
            mkRadio('gender', 'female', mkStyle({ size: { marginRight: '6', marginRightUnit: UnitEnum.PX } }), 'radio-female'),
            mkLabel('女', '', mkStyle({
              font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#333333', textShadows: [] },
            }), 'label-female'),
          ], 'radio-group'),
        ], 'form-gender-group'),
        mkContainer(flexCol({}), [
          mkLabel('兴趣爱好', '', cloneDeep(labelStyle), 'label-hobby'),
          mkContainer(flexRow({ flex: { alignItems: AlignItemsEnum.CENTER } }), [
            mkCheckbox('hobby', 'coding', mkStyle({ size: { marginRight: '6', marginRightUnit: UnitEnum.PX } }), 'checkbox-coding'),
            mkLabel('编程', '', mkStyle({
              font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#333333', textShadows: [] },
              size: { marginRight: '24', marginRightUnit: UnitEnum.PX },
            }), 'label-coding'),
            mkCheckbox('hobby', 'design', mkStyle({ size: { marginRight: '6', marginRightUnit: UnitEnum.PX } }), 'checkbox-design'),
            mkLabel('设计', '', mkStyle({
              font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#333333', textShadows: [] },
              size: { marginRight: '24', marginRightUnit: UnitEnum.PX },
            }), 'label-design'),
            mkCheckbox('hobby', 'writing', mkStyle({ size: { marginRight: '6', marginRightUnit: UnitEnum.PX } }), 'checkbox-writing'),
            mkLabel('写作', '', mkStyle({
              font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#333333', textShadows: [] },
            }), 'label-writing'),
          ], 'checkbox-group'),
        ], 'form-hobby-group'),
        mkButton('提交反馈', mkStyle({
          font: { fontSize: 16, fontSizeUnit: UnitEnum.PX, color: '#ffffff', fontWeight: FontWeightEnum.SEMI_BOLD, textShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 1, yUnit: UnitEnum.PX, blur: 2, blurUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.2)' }] },
          visual: {
            backgrounds: [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)' }],
            boxShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 4, yUnit: UnitEnum.PX, blur: 12, blurUnit: UnitEnum.PX, spread: 0, spreadUnit: UnitEnum.PX, color: 'rgba(22,119,255,0.3)', inset: false }],
            borderRadiusTL: 8, borderRadiusTR: 8, borderRadiusBL: 8, borderRadiusBR: 8, borderRadiusTLUnit: UnitEnum.PX, borderRadiusTRUnit: UnitEnum.PX, borderRadiusBLUnit: UnitEnum.PX, borderRadiusBRUnit: UnitEnum.PX,
          },
          size: {
            width: '100', widthUnit: UnitEnum.PERCENT,
            paddingTop: 14, paddingTopUnit: UnitEnum.PX,
            paddingRight: 32, paddingRightUnit: UnitEnum.PX,
            paddingBottom: 14, paddingBottomUnit: UnitEnum.PX,
            paddingLeft: 32, paddingLeftUnit: UnitEnum.PX,
            marginTop: '8', marginTopUnit: UnitEnum.PX,
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

      // ---- 列表区域（ul + ol + li + p + link + span） ----
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
            size: { width: '45', widthUnit: UnitEnum.PERCENT },
            visual: {
              backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#f9fafb' }],
              boxShadows: [],
              borderRadiusTL: 12, borderRadiusTR: 12, borderRadiusBL: 12, borderRadiusBR: 12, borderRadiusTLUnit: UnitEnum.PX, borderRadiusTRUnit: UnitEnum.PX, borderRadiusBLUnit: UnitEnum.PX, borderRadiusBRUnit: UnitEnum.PX,
              borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#e8e8e8',
            },
          }), [
            mkHeading(HeadingLevelEnum.H3, '功能列表', mkStyle({
              font: { fontSize: 20, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a2e', textShadows: [] },
              size: { marginBottom: '16', marginBottomUnit: UnitEnum.PX },
            }), 'ul-title'),
            mkUnorderedList(mkStyle({
              size: { paddingLeft: 24, paddingLeftUnit: UnitEnum.PX },
            }), [
              mkListItem(mkStyle({ size: { marginBottom: '10', marginBottomUnit: UnitEnum.PX } }), [
                mkText('拖拽式可视化编辑', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#333333', textShadows: [] } })),
              ], 'ul-item-1'),
              mkListItem(mkStyle({ size: { marginBottom: '10', marginBottomUnit: UnitEnum.PX } }), [
                mkText('丰富的组件库', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#333333', textShadows: [] } })),
              ], 'ul-item-2'),
              mkListItem(mkStyle({ size: { marginBottom: '10', marginBottomUnit: UnitEnum.PX } }), [
                mkText('实时预览与代码导出', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#333333', textShadows: [] } })),
              ], 'ul-item-3'),
              mkListItem(mkStyle({ size: { marginBottom: '10', marginBottomUnit: UnitEnum.PX } }), [
                mkText('支持自定义样式与动画', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#333333', textShadows: [] } })),
              ], 'ul-item-4'),
              mkListItem(mkStyle({}), [
                mkSpan(mkStyle({
                  font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#1677ff', fontStyle: FontStyleEnum.ITALIC, textShadows: [] },
                }), [
                  mkText('→ 查看完整功能列表', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#1677ff', fontStyle: FontStyleEnum.ITALIC, textShadows: [] } })),
                ], 'ul-more-span'),
              ], 'ul-item-5'),
            ], 'feature-ul'),
          ], 'ul-group'),
          mkContainer(mkStyle({
            size: { width: '45', widthUnit: UnitEnum.PERCENT },
            visual: {
              backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#f0f7ff' }],
              boxShadows: [],
              borderRadiusTL: 12, borderRadiusTR: 12, borderRadiusBL: 12, borderRadiusBR: 12, borderRadiusTLUnit: UnitEnum.PX, borderRadiusTRUnit: UnitEnum.PX, borderRadiusBLUnit: UnitEnum.PX, borderRadiusBRUnit: UnitEnum.PX,
              borderWidth: 1, borderStyle: BorderStyleEnum.DASHED, borderColor: '#1677ff',
            },
          }), [
            mkHeading(HeadingLevelEnum.H3, '使用步骤', mkStyle({
              font: { fontSize: 20, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#0f3460', fontFamily: FontFamilyEnum.GEORGIA, textShadows: [] },
              size: { marginBottom: '16', marginBottomUnit: UnitEnum.PX },
            }), 'ol-title'),
            mkOrderedList(mkStyle({
              size: { paddingLeft: 24, paddingLeftUnit: UnitEnum.PX },
            }), [
              mkListItem(mkStyle({ size: { marginBottom: '10', marginBottomUnit: UnitEnum.PX } }), [
                mkText('打开编辑器，选择组件', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#333333', textShadows: [] } })),
              ], 'ol-item-1'),
              mkListItem(mkStyle({ size: { marginBottom: '10', marginBottomUnit: UnitEnum.PX } }), [
                mkText('拖拽组件到画布', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#333333', textShadows: [] } })),
              ], 'ol-item-2'),
              mkListItem(mkStyle({ size: { marginBottom: '10', marginBottomUnit: UnitEnum.PX } }), [
                mkText('调整样式和属性', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#333333', textShadows: [] } })),
              ], 'ol-item-3'),
              mkListItem(mkStyle({}), [
                mkText('预览并导出代码', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#333333', fontWeight: FontWeightEnum.SEMI_BOLD, textShadows: [] } })),
              ], 'ol-item-4'),
            ], 'steps-ol'),
          ], 'ol-group'),
        ],
        'list-section',
      );

      // ---- 表格区域（table + caption + colgroup + col + thead + tbody + tfoot + tr + th + td） ----
      const tdPadding = {
        paddingTop: 12, paddingTopUnit: UnitEnum.PX,
        paddingRight: 20, paddingRightUnit: UnitEnum.PX,
        paddingBottom: 12, paddingBottomUnit: UnitEnum.PX,
        paddingLeft: 20, paddingLeftUnit: UnitEnum.PX,
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
          mkHeading(HeadingLevelEnum.H3, '版本对比', mkStyle({
            font: { fontSize: 26, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a2e', textAlign: TextAlignEnum.CENTER, textShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 2, yUnit: UnitEnum.PX, blur: 4, blurUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.06)' }] },
            size: { marginBottom: '8', marginBottomUnit: UnitEnum.PX },
          }), 'table-title'),
          mkParagraph('选择最适合你的方案', mkStyle({
            font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#888888', textAlign: TextAlignEnum.CENTER, textShadows: [] },
            size: { marginBottom: '24', marginBottomUnit: UnitEnum.PX },
          }), 'table-subtitle'),
          mkTable(mkStyle({
            general: { borderCollapse: BorderCollapseEnum.COLLAPSE },
            visual: {
              backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }],
              boxShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 4, yUnit: UnitEnum.PX, blur: 16, blurUnit: UnitEnum.PX, spread: 0, spreadUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.08)', inset: false }],
              borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#e8e8e8',
              borderRadiusTL: 12, borderRadiusTR: 12, borderRadiusBL: 12, borderRadiusBR: 12, borderRadiusTLUnit: UnitEnum.PX, borderRadiusTRUnit: UnitEnum.PX, borderRadiusBLUnit: UnitEnum.PX, borderRadiusBRUnit: UnitEnum.PX,
            },
          }), [
            mkTableCaption(mkStyle({
              font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: '#666666', fontStyle: FontStyleEnum.ITALIC, textShadows: [] },
              size: { marginBottom: '12', marginBottomUnit: UnitEnum.PX },
            }), [
              mkText('VibePage 各版本功能对比表', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: '#666666', fontStyle: FontStyleEnum.ITALIC, textShadows: [] } })),
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
                  mkText('功能', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#ffffff', textShadows: [] } })),
                ], 'th-feature', TableScopeEnum.COL),
                mkTableHeaderCell(mkStyle({ size: tdPadding }), [
                  mkText('免费版', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#a0c4ff', textShadows: [] } })),
                ], 'th-free', TableScopeEnum.COL),
                mkTableHeaderCell(mkStyle({ size: tdPadding }), [
                  mkText('专业版', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#a0c4ff', textShadows: [] } })),
                ], 'th-pro', TableScopeEnum.COL),
              ], 'thead-tr'),
            ], 'table-thead'),
            mkTableBody(mkStyle({}), [
              mkTableRow(mkStyle({ visual: { backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }], boxShadows: [] } }), [
                mkTableData(mkStyle({ size: tdPadding, visual: { backgrounds: [], boxShadows: [], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#f0f0f0' } }), [
                  mkText('拖拽编辑', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#333333', fontWeight: FontWeightEnum.MEDIUM, textShadows: [] } })),
                ], 'td-1-1'),
                mkTableData(mkStyle({ size: tdPadding, visual: { backgrounds: [], boxShadows: [], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#f0f0f0' } }), [
                  mkText('✓ 支持', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#52c41a', fontWeight: FontWeightEnum.SEMI_BOLD, textShadows: [] } })),
                ], 'td-1-2'),
                mkTableData(mkStyle({ size: tdPadding, visual: { backgrounds: [], boxShadows: [], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#f0f0f0' } }), [
                  mkText('✓ 支持', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#52c41a', fontWeight: FontWeightEnum.SEMI_BOLD, textShadows: [] } })),
                ], 'td-1-3'),
              ], 'tbody-tr-1'),
              mkTableRow(mkStyle({ visual: { backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#f9fafb' }], boxShadows: [] } }), [
                mkTableData(mkStyle({ size: tdPadding, visual: { backgrounds: [], boxShadows: [], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#f0f0f0' } }), [
                  mkText('组件数量', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#333333', fontWeight: FontWeightEnum.MEDIUM, textShadows: [] } })),
                ], 'td-2-1'),
                mkTableData(mkStyle({ size: tdPadding, visual: { backgrounds: [], boxShadows: [], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#f0f0f0' } }), [
                  mkText('10+', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#666666', textShadows: [] } })),
                ], 'td-2-2'),
                mkTableData(mkStyle({ size: tdPadding, visual: { backgrounds: [], boxShadows: [], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#f0f0f0' } }), [
                  mkText('50+', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#1677ff', fontWeight: FontWeightEnum.BOLD, textShadows: [] } })),
                ], 'td-2-3'),
              ], 'tbody-tr-2'),
              mkTableRow(mkStyle({ visual: { backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }], boxShadows: [] } }), [
                mkTableData(mkStyle({ size: tdPadding, visual: { backgrounds: [], boxShadows: [], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#f0f0f0' } }), [
                  mkText('代码导出', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#333333', fontWeight: FontWeightEnum.MEDIUM, textShadows: [] } })),
                ], 'td-3-1'),
                mkTableData(mkStyle({ size: tdPadding, visual: { backgrounds: [], boxShadows: [], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#f0f0f0' } }), [
                  mkText('✗ 不支持', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#999999', textShadows: [] } })),
                ], 'td-3-2'),
                mkTableData(mkStyle({ size: tdPadding, visual: { backgrounds: [], boxShadows: [], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#f0f0f0' } }), [
                  mkText('✓ 支持', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#52c41a', fontWeight: FontWeightEnum.SEMI_BOLD, textShadows: [] } })),
                ], 'td-3-3'),
              ], 'tbody-tr-3'),
            ], 'table-tbody'),
            mkTableFoot(mkStyle({
              visual: { backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#f0f4ff' }], boxShadows: [] },
            }), [
              mkTableRow(mkStyle({}), [
                mkTableData(mkStyle({ size: tdPadding }), [
                  mkText('专业版提供更多高级功能与技术支持', mkStyle({ font: { fontSize: 13, fontSizeUnit: UnitEnum.PX, color: '#0f3460', textAlign: TextAlignEnum.CENTER, fontStyle: FontStyleEnum.ITALIC, fontWeight: FontWeightEnum.MEDIUM, textShadows: [] } })),
                ], 'td-foot'),
              ], 'tfoot-tr'),
            ], 'table-tfoot'),
          ], 'comparison-table'),
        ],
        'table-section',
      );

      // ---- 媒体区域（video + audio + image） ----
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
          mkContainer(mkStyle({ size: { width: '45', widthUnit: UnitEnum.PERCENT } }), [
            mkHeading(HeadingLevelEnum.H3, '视频展示', mkStyle({
              font: { fontSize: 20, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#ffffff', textShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 1, yUnit: UnitEnum.PX, blur: 2, blurUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.3)' }] },
              size: { marginBottom: '12', marginBottomUnit: UnitEnum.PX },
            }), 'video-title'),
            mkVideo('https://example.com/demo.mp4', mkStyle({
              size: { width: '100', widthUnit: UnitEnum.PERCENT },
              visual: {
                backgrounds: [],
                boxShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 4, yUnit: UnitEnum.PX, blur: 16, blurUnit: UnitEnum.PX, spread: 0, spreadUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.3)', inset: false }],
                borderRadiusTL: 12, borderRadiusTR: 12, borderRadiusBL: 12, borderRadiusBR: 12, borderRadiusTLUnit: UnitEnum.PX, borderRadiusTRUnit: UnitEnum.PX, borderRadiusBLUnit: UnitEnum.PX, borderRadiusBRUnit: UnitEnum.PX,
                borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#333333',
              },
            }), 'demo-video'),
          ], 'video-group'),
          mkContainer(mkStyle({ size: { width: '45', widthUnit: UnitEnum.PERCENT } }), [
            mkHeading(HeadingLevelEnum.H3, '音频示例', mkStyle({
              font: { fontSize: 20, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#ffffff', textShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 1, yUnit: UnitEnum.PX, blur: 2, blurUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.3)' }] },
              size: { marginBottom: '12', marginBottomUnit: UnitEnum.PX },
            }), 'audio-title'),
            mkAudio('https://example.com/demo.mp3', mkStyle({
              size: { width: '100', widthUnit: UnitEnum.PERCENT },
            }), 'demo-audio'),
            mkImage('https://placeholder.com/400x200', '音频配图', mkStyle({
              size: { width: '100', widthUnit: UnitEnum.PERCENT, marginTop: '16', marginTopUnit: UnitEnum.PX },
              visual: {
                backgrounds: [],
                boxShadows: [{ x: 0, xUnit: UnitEnum.PX, y: 4, yUnit: UnitEnum.PX, blur: 16, blurUnit: UnitEnum.PX, spread: 0, spreadUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.3)', inset: false }],
                borderRadiusTL: 12, borderRadiusTR: 12, borderRadiusBL: 12, borderRadiusBR: 12, borderRadiusTLUnit: UnitEnum.PX, borderRadiusTRUnit: UnitEnum.PX, borderRadiusBLUnit: UnitEnum.PX, borderRadiusBRUnit: UnitEnum.PX,
                borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#333333',
              },
            }), 'audio-image'),
          ], 'audio-group'),
        ],
        'media-section',
      );

      // ---- 页脚（footer） ----
      const footerEl = mkFooter(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX },
          flex: { flexDirection: FlexDirectionEnum.ROW, justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.CENTER },
          size: {
            paddingTop: 32, paddingTopUnit: UnitEnum.PX,
            paddingRight: 32, paddingRightUnit: UnitEnum.PX,
            paddingBottom: 32, paddingBottomUnit: UnitEnum.PX,
            paddingLeft: 32, paddingLeftUnit: UnitEnum.PX,
            width: '100', widthUnit: UnitEnum.PERCENT,
          },
          visual: {
            backgrounds: [{ type: BackgroundTypeEnum.GRADIENT, gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }],
            boxShadows: [{ x: 0, xUnit: UnitEnum.PX, y: -2, yUnit: UnitEnum.PX, blur: 12, blurUnit: UnitEnum.PX, spread: 0, spreadUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.15)', inset: false }],
          },
        }),
        [
          mkContainer(flexCol({}), [
            mkSpan(mkStyle({
              font: { fontSize: 20, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#ffffff', textShadows: [{ x: 1, xUnit: UnitEnum.PX, y: 1, yUnit: UnitEnum.PX, blur: 2, blurUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.3)' }] },
            }), [
              mkText('VibePage', mkStyle({ font: { fontSize: 20, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#ffffff', textShadows: [{ x: 1, xUnit: UnitEnum.PX, y: 1, yUnit: UnitEnum.PX, blur: 2, blurUnit: UnitEnum.PX, color: 'rgba(0,0,0,0.3)' }] } })),
            ], 'footer-logo'),
            mkParagraph('© 2024 VibePage. 保留所有权利。', mkStyle({
              font: { fontSize: 13, fontSizeUnit: UnitEnum.PX, color: '#888888', textShadows: [] },
              size: { marginTop: '8', marginTopUnit: UnitEnum.PX },
            }), 'footer-copyright'),
          ], 'footer-brand'),
          mkContainer(flexRow({ flex: { alignItems: AlignItemsEnum.CENTER } }), [
            mkLink('#', mkStyle({ size: { marginRight: '20', marginRightUnit: UnitEnum.PX } }), [
              mkText('隐私政策', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#a0c4ff', textDecoration: TextDecorationEnum.NONE, textShadows: [] } })),
            ], 'footer-link-1'),
            mkLink('#', mkStyle({ size: { marginRight: '20', marginRightUnit: UnitEnum.PX } }), [
              mkText('服务条款', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#a0c4ff', textDecoration: TextDecorationEnum.NONE, textShadows: [] } })),
            ], 'footer-link-2'),
            mkLink('#', mkStyle({}), [
              mkText('联系我们', mkStyle({ font: { fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#a0c4ff', textDecoration: TextDecorationEnum.NONE, textShadows: [] } })),
            ], 'footer-link-3'),
          ], 'footer-links'),
        ],
        'site-footer',
      );

      this.root.children = [headerEl, hero, features, articleSection, formSection, listSection, tableSection, mediaSection, footerEl];
      this.styleRules = localStyleRules;
    },
    /** 将画布数据保存到 LocalStorage */
    saveCanvasToStorage() {
      try {
        const data: CanvasStorageData = {
          version: CANVAS_DATA_VERSION,
          children: this.root.children,
          styleRules: this.styleRules,
        };
        localStorage.setItem(CANVAS_DATA_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('[VibePage] 保存画布数据到 LocalStorage 失败:', error);
      }
    },
    /** 从 LocalStorage 加载画布数据，成功返回 true */
    loadCanvasFromStorage(): boolean {
      try {
        const raw = localStorage.getItem(CANVAS_DATA_STORAGE_KEY);
        if (!raw) return false;
        const data = JSON.parse(raw) as CanvasStorageData;
        // 版本不匹配或数据结构异常则自动删除本地存储
        if (data.version !== CANVAS_DATA_VERSION || !data.children || !Array.isArray(data.children)) {
          this.clearCanvasStorage();
          return false;
        }

        this.root.children = data.children;
        this.styleRules = data.styleRules ?? [];
        this.selectedElementId = null;
        this.cleanupUnreferencedStyleRules();
        return true;
      } catch (error) {
        console.error('[VibePage] 从 LocalStorage 加载画布数据失败:', error);
        this.clearCanvasStorage();
        return false;
      }
    },
    /** 清除 LocalStorage 中的画布数据 */
    clearCanvasStorage() {
      localStorage.removeItem(CANVAS_DATA_STORAGE_KEY);
    },
    /**
     * 将 HTML + CSS 代码解析后应用到画布，替换当前内容
     * @returns 是否应用成功；解析失败时保留原画布不变
     */
    applyParsedCode(html: string, css: string): boolean {
      try {
        const { children, styleRules, rootPatch } = parseCodeToCanvas(html, css, this.root.id);
        // HTML 非空但未解析出任何可识别元素时视为解析失败，避免静默清空画布
        if (html.trim() !== '' && children.length === 0 && rootPatch === null) {
          throw new Error('HTML 中未解析出任何可识别的元素');
        }
        this.root.children = children;
        this.styleRules = styleRules;
        // 应用 body 标签声明的根元素属性（id 变更会使 CSS 中同名 #id 规则生效，旧规则因失去引用被清理）
        if (rootPatch) {
          this.root.id = rootPatch.id;
          this.root.classes = rootPatch.classes;
        }
        this.selectedElementId = null;
        this.cleanupUnreferencedStyleRules();
        return true;
      } catch (error) {
        console.error('[VibePage] 解析代码应用到画布失败:', error);
        return false;
      }
    },
  }
});
