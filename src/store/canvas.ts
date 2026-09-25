import { type CanvasButtonElement, type CanvasDivElement, type CanvasInnerElement, type CanvasImageElement, type CanvasInputElement, type CanvasLinkElement, type CanvasParagraphElement, type CanvasRadioElement, type CanvasCheckboxElement, type CanvasVideoElement, type CanvasAudioElement, type CanvasTextareaElement, type CanvasLabelElement, type CanvasFormElement, type CanvasSpanElement, type CanvasTextElement, type CanvasUnorderedListElement, type CanvasOrderedListElement, type CanvasListItemElement, type CanvasTableElement, type CanvasTableHeadElement, type CanvasTableBodyElement, type CanvasTableFootElement, type CanvasTableRowElement, type CanvasTableDataElement, type CanvasTableHeaderCellElement, type CanvasTableCaptionElement, type CanvasTableColGroupElement, type CanvasTableColElement, type CanvasHeaderElement, type CanvasFooterElement, type CanvasArticleElement, type CanvasSectionElement, type CanvasAsideElement, type CanvasHeadingElement, type CanvasGeneralElement, type CanvasRootElement, type CanvasElement, type CanvasInnerElementTypeEnum, type StyleConfig, type ClassListItem, type ClassRef, type CanvasStorageData, isParentElement } from "@/views/Canvas/types";
import { ButtonTypeEnum, CanvasElementLabelMap, CanvasElementTypeEnum, HeadingLevelEnum, LinkTargetEnum, SiderPanelEnum, FormMethodEnum, TableScopeEnum } from "@/constants/home";
import { DefaultStyleConfigMap, defaultClassStyleConfig, DisplayStyleEnum, FlexDirectionEnum, JustifyContentEnum, AlignItemsEnum, UnitEnum, FontWeightEnum, TextAlignEnum, BackgroundTypeEnum, BackgroundSizeEnum, BackgroundPositionEnum, BackgroundRepeatEnum, BorderStyleEnum, BorderCollapseEnum, TextDecorationEnum, FontFamilyEnum, PositionStyleEnum, OverflowStyleEnum } from "@/constants/style";
import { defineStore } from "pinia";
import { cloneDeep, isEqual } from "lodash";
import { Positioner } from "@/views/Canvas/drag/Positioner";
import { parseCodeToCanvas } from "@/utils/code-parser";
import { cssToStyleConfig, styleConfigToCss, mergeDeclarations, syncStyleConfigToRules, declarationWins } from "@/utils/style-converter";
import { generateId } from "@/utils/id";
import { StyleRuleTypeEnum } from "@/constants/style";
import { GENERAL_FALLBACK_TAG_NAME } from "@/constants/html";
import type { CanvasStyleRule } from "@/views/Canvas/types";
import { findElementInTree } from "@/utils/tree-traversal";

/**
 * 画布数据的存储版本号
 * 开发阶段数据结构频繁变更，修改此版本号即可让所有用户的旧 LocalStorage 数据自动失效（清空并回退到默认内容）
 * 数据结构变更后只需递增此数字，无需编写迁移逻辑
 */
const CANVAS_DATA_VERSION = 16;

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
    setRawStyleDeclaration(selector: string, prop: string, value: string | undefined) {
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
          return { ...elBase, text: '按钮', buttonType: ButtonTypeEnum.BUTTON, disabled: false } as CanvasButtonElement;
        case CanvasElementTypeEnum.PARAGRAPH:
          return { ...elBase, text: '段落' } as CanvasParagraphElement;
        case CanvasElementTypeEnum.IMAGE:
          return { ...elBase, src: '', title: '图片' }  as CanvasImageElement;
        case CanvasElementTypeEnum.LINK:
          return { ...elBase, href: '', target: LinkTargetEnum.SELF, children: [] } as CanvasLinkElement;
        case CanvasElementTypeEnum.DIV:
          return { ...elBase, children: [] }  as CanvasDivElement;
        case CanvasElementTypeEnum.INPUT:
          return { ...elBase, placeholder: '请输入内容', value: '', required: false, disabled: false } as CanvasInputElement;
        case CanvasElementTypeEnum.TEXTAREA:
          return { ...elBase, placeholder: '请输入内容', value: '', required: false, disabled: false } as CanvasTextareaElement;
        case CanvasElementTypeEnum.RADIO:
          return { ...elBase, name: '', value: '', checked: false, required: false, disabled: false } as CanvasRadioElement;
        case CanvasElementTypeEnum.CHECKBOX:
          return { ...elBase, name: '', value: '', checked: false, required: false, disabled: false } as CanvasCheckboxElement;
        case CanvasElementTypeEnum.VIDEO:
          return { ...elBase, src: '', controls: true, autoplay: false, muted: false, loop: false } as CanvasVideoElement;
        case CanvasElementTypeEnum.AUDIO:
          return { ...elBase, src: '', controls: true, autoplay: false, muted: false, loop: false } as CanvasAudioElement;
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
        case CanvasElementTypeEnum.TABLE: {
          /** 表格行组/行无独立命中盒，各类型 generateElement 已自带骨架，此处组装完整表格 */
          const caption = this.generateElement(CanvasElementTypeEnum.TABLE_CAPTION) as CanvasTableCaptionElement;
          const colGroup = this.generateElement(CanvasElementTypeEnum.TABLE_COL_GROUP) as CanvasTableColGroupElement;
          const head = this.generateElement(CanvasElementTypeEnum.TABLE_HEAD) as CanvasTableHeadElement;
          const body = this.generateElement(CanvasElementTypeEnum.TABLE_BODY) as CanvasTableBodyElement;
          const foot = this.generateElement(CanvasElementTypeEnum.TABLE_FOOT) as CanvasTableFootElement;
          return { ...elBase, children: [caption, colGroup, head, body, foot] } as CanvasTableElement;
        }
        case CanvasElementTypeEnum.TABLE_HEAD:
        case CanvasElementTypeEnum.TABLE_BODY:
        case CanvasElementTypeEnum.TABLE_FOOT: {
          /** 行组无独立命中盒，自动创建一行单元格骨架，保证内部有可投放内容 */
          const isHead = type === CanvasElementTypeEnum.TABLE_HEAD;
          const row = this.generateElement(CanvasElementTypeEnum.TABLE_ROW) as CanvasTableRowElement;
          row.children = [
            this.generateElement(isHead ? CanvasElementTypeEnum.TABLE_HEADER_CELL : CanvasElementTypeEnum.TABLE_DATA),
            this.generateElement(isHead ? CanvasElementTypeEnum.TABLE_HEADER_CELL : CanvasElementTypeEnum.TABLE_DATA),
          ];
          return { ...elBase, children: [row] } as CanvasTableHeadElement | CanvasTableBodyElement | CanvasTableFootElement;
        }
        case CanvasElementTypeEnum.TABLE_ROW:
          /** 行无独立命中盒，自动创建两个单元格 */
          return { ...elBase, children: [
            this.generateElement(CanvasElementTypeEnum.TABLE_DATA),
            this.generateElement(CanvasElementTypeEnum.TABLE_DATA)
          ] } as CanvasTableRowElement;
        case CanvasElementTypeEnum.TABLE_DATA:
          return { ...elBase, children: [] } as CanvasTableDataElement;
        case CanvasElementTypeEnum.TABLE_HEADER_CELL:
          return { ...elBase, children: [] } as CanvasTableHeaderCellElement;
        case CanvasElementTypeEnum.TABLE_CAPTION:
          return { ...elBase, children: [
            this.generateElement(CanvasElementTypeEnum.TEXT),
          ] } as CanvasTableCaptionElement;
        case CanvasElementTypeEnum.TABLE_COL_GROUP:
          /** 列组无渲染盒，自动创建一个 col */
          return { ...elBase, children: [
            this.generateElement(CanvasElementTypeEnum.TABLE_COL),
            this.generateElement(CanvasElementTypeEnum.TABLE_COL),
          ] } as CanvasTableColGroupElement;
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
        case CanvasElementTypeEnum.GENERAL:
          return { ...elBase, tagName: GENERAL_FALLBACK_TAG_NAME, children: [] } as CanvasGeneralElement;
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
      /** 删除的元素或其子孙为当前选中元素时，清空选中态 */
      if(this.selectedElementId && !this.getElementById(this.selectedElementId)){
        this.selectElement(null);
      }

      // 清理失效样式规则（被删元素的 #id 规则及其独有的 class 样式）
      this.cleanupUnreferencedStyleRules();
    },
    /** 清空所有元素（保留根元素） */
    clearAllElements() {
      this.root.children = [];
      this.styleRules = [];
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
      const mkDiv = (styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasDivElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.DIV, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.DIV], children,
      });

      // 创建段落元素
      const mkParagraph = (text: string, styleConfig: StyleConfig, alias?: string): CanvasParagraphElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.PARAGRAPH, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.PARAGRAPH], text,
      });

      // 创建按钮元素
      const mkButton = (text: string, styleConfig: StyleConfig, alias?: string): CanvasButtonElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.BUTTON, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.BUTTON], text, buttonType: ButtonTypeEnum.BUTTON, disabled: false,
      });

      // 创建链接元素
      const mkLink = (href: string, styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasLinkElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.LINK, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.LINK], href, target: LinkTargetEnum.SELF, children,
      });

      // 创建输入框元素
      const mkInput = (placeholder: string, styleConfig: StyleConfig, alias?: string): CanvasInputElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.INPUT, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.INPUT], placeholder, value: '', required: false, disabled: false,
      });

      // 创建图片元素
      const mkImage = (src: string, title: string, styleConfig: StyleConfig, alias?: string): CanvasImageElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.IMAGE, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.IMAGE], src, title,
      });

      // 创建视频元素
      const mkVideo = (src: string, styleConfig: StyleConfig, alias?: string): CanvasVideoElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.VIDEO, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.VIDEO], src, controls: true, autoplay: false, muted: false, loop: false,
      });

      // 创建音频元素
      const mkAudio = (src: string, styleConfig: StyleConfig, alias?: string): CanvasAudioElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.AUDIO, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.AUDIO], src, controls: true, autoplay: false, muted: false, loop: false,
      });

      // 创建多行文本框元素
      const mkTextarea = (placeholder: string, styleConfig: StyleConfig, alias?: string): CanvasTextareaElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.TEXTAREA, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.TEXTAREA], placeholder, value: '', required: false, disabled: false,
      });

      // 创建单选框元素
      const mkRadio = (name: string, value: string, styleConfig: StyleConfig, alias?: string): CanvasRadioElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.RADIO, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.RADIO], name, value, checked: false, required: false, disabled: false,
      });

      // 创建多选框元素
      const mkCheckbox = (name: string, value: string, styleConfig: StyleConfig, alias?: string): CanvasCheckboxElement => ({
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.CHECKBOX, classes: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.CHECKBOX], name, value, checked: false, required: false, disabled: false,
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

      // 创建纯文本元素（文本节点无对应 DOM 元素，不创建样式规则，样式自父元素继承）
      const mkText = (text: string, alias?: string): CanvasTextElement => ({
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
        id: createElementId(styleConfig), type: CanvasElementTypeEnum.HEADING, classes: [],
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

      // ---- 设计变量（暖纸调 editorial：奶油纸底 + 墨色 + 赭石点缀，衬线西文标题） ----
      const INK = '#292524';
      const BODY_TEXT = '#57534e';
      const MUTED = '#a8a29e';
      const LINE = '#e7e5e0';
      const PAPER = '#faf7f2';
      const BAND = '#f3ede2';
      const ACCENT = '#9a3412';
      const INPUT_LINE = '#d6d0c7';
      /** 按钮、输入控件不继承根字体族，需单独声明 */
      const FONT_STACK = '"Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
      /** 衬线西文（眉题、价格等拉丁字符位置点缀） */
      const SERIF = `${FontFamilyEnum.GEORGIA}, "Times New Roman", serif`;

      /** 单边分割线：样式模型仅支持四边边框，用零模糊投影模拟发丝线 */
      const hairline = (y: number) => ({ x: 0, xUnit: UnitEnum.PX, y, yUnit: UnitEnum.PX, blur: 0, blurUnit: UnitEnum.PX, color: LINE, inset: false });
      /** 卡片投影 */
      const cardShadow = { x: 0, xUnit: UnitEnum.PX, y: 1, yUnit: UnitEnum.PX, blur: 2, blurUnit: UnitEnum.PX, color: 'rgba(41,37,36,0.06)', inset: false };
      /** 四角统一圆角 */
      const rounded = (px: number) => ({
        borderRadiusTL: px, borderRadiusTLUnit: UnitEnum.PX,
        borderRadiusTR: px, borderRadiusTRUnit: UnitEnum.PX,
        borderRadiusBL: px, borderRadiusBLUnit: UnitEnum.PX,
        borderRadiusBR: px, borderRadiusBRUnit: UnitEnum.PX,
      });
      /** 四边内边距（上右下左） */
      const pad = (t: number, r: number, b: number, l: number) => ({
        paddingTop: t, paddingTopUnit: UnitEnum.PX,
        paddingRight: r, paddingRightUnit: UnitEnum.PX,
        paddingBottom: b, paddingBottomUnit: UnitEnum.PX,
        paddingLeft: l, paddingLeftUnit: UnitEnum.PX,
      });
      /** 四边外边距（上下右左，覆盖浏览器默认的标题/段落外边距） */
      const m = (t: string, b: string, r = '0', l = '0') => ({
        marginTop: t, marginTopUnit: UnitEnum.PX,
        marginRight: r, marginRightUnit: UnitEnum.PX,
        marginBottom: b, marginBottomUnit: UnitEnum.PX,
        marginLeft: l, marginLeftUnit: UnitEnum.PX,
      });
      /** 字体配置简写（补齐必填的 textShadows） */
      const f = (font: Partial<StyleConfig['font']>): StyleConfig['font'] => ({ textShadows: [], ...font });
      /** 视觉配置简写（补齐必填的 backgrounds / boxShadows） */
      const v = (visual: Partial<StyleConfig['visual']>): StyleConfig['visual'] => ({ backgrounds: [], boxShadows: [], ...visual });

      /** 区块通用样式：纵向布局、子元素水平居中，默认纸色底 */
      const sectionStyle = (bg = PAPER): StyleConfig => mkStyle({
        general: { display: DisplayStyleEnum.FLEX },
        flex: { flexDirection: FlexDirectionEnum.COLUMN, alignItems: AlignItemsEnum.CENTER },
        size: { width: '100', widthUnit: UnitEnum.PERCENT, ...pad(72, 32, 72, 32) },
        visual: v({ backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: bg }] }),
      });

      /** 限宽容器：maxWidth 960 居中，row 时横向两端对齐 */
      const wrap = (children: CanvasInnerElement[], alias: string, row = false): CanvasDivElement =>
        mkDiv(mkStyle({
          general: { display: DisplayStyleEnum.FLEX },
          flex: row
            ? { flexDirection: FlexDirectionEnum.ROW, justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.FLEX_START }
            : { flexDirection: FlexDirectionEnum.COLUMN },
          size: { width: '100', widthUnit: UnitEnum.PERCENT, maxWidth: '960', maxWidthUnit: UnitEnum.PX },
        }), children, alias);

      /** 区块标题组（h2 + 可选描述段落；light 用于深色区块） */
      const sectionHead = (title: string, desc: string | null, alias: string, light = false): CanvasDivElement =>
        mkDiv(mkStyle({ size: m('0', '40') }), [
          mkHeading(HeadingLevelEnum.H2, title, mkStyle({
            font: f({ fontSize: 24, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: light ? PAPER : INK }),
            size: desc ? m('0', '8') : m('0', '0'),
          }), `${alias}-title`),
          ...(desc ? [mkParagraph(desc, mkStyle({
            font: f({ fontSize: 14, fontSizeUnit: UnitEnum.PX, color: light ? MUTED : BODY_TEXT }),
            size: m('0', '0'),
          }), `${alias}-desc`)] : []),
        ], `${alias}-head`);

      /** 卡片小标题（h4，衬线西文点缀） */
      const cardTitle = (text: string, alias: string, marginBottom = '16'): CanvasHeadingElement =>
        mkHeading(HeadingLevelEnum.H4, text, mkStyle({
          font: f({ fontFamily: SERIF, fontSize: 15, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: INK }),
          size: m('0', marginBottom),
        }), alias);

      /** 白底描边卡片 */
      const card = (children: CanvasInnerElement[], alias: string, widthPct: string): CanvasDivElement =>
        mkDiv(mkStyle({
          size: { width: widthPct, widthUnit: UnitEnum.PERCENT, ...pad(24, 24, 24, 24) },
          visual: v({ backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }], boxShadows: [cardShadow], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: LINE, ...rounded(10) }),
        }), children, alias);

      /** 实心主按钮（覆盖浏览器默认边框，手动指定字体族；bg/fg 可换色） */
      const primaryBtn = (size: StyleConfig['size'] = {}, bg = INK, fg = '#ffffff'): StyleConfig => mkStyle({
        font: f({ fontFamily: FONT_STACK, fontSize: 14, fontSizeUnit: UnitEnum.PX, color: fg, fontWeight: FontWeightEnum.MEDIUM }),
        visual: v({ backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: bg }], borderWidth: 0, ...rounded(6) }),
        size: { ...pad(10, 20, 10, 20), ...size },
      });

      /** 文字导航链接 */
      const textLink = (marginRight = '0', fontSize = 14): StyleConfig => mkStyle({
        font: f({ fontSize, fontSizeUnit: UnitEnum.PX, color: BODY_TEXT, textDecoration: TextDecorationEnum.NONE }),
        size: marginRight !== '0' ? m('0', '0', marginRight) : m('0', '0'),
      });

      // ---- 页头（header + div + span + text + link + button） ----
      const headerEl = mkHeader(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX },
          flex: { flexDirection: FlexDirectionEnum.ROW, justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.CENTER },
          size: { width: '100', widthUnit: UnitEnum.PERCENT, ...pad(18, 32, 18, 32) },
          visual: v({ backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: PAPER }], boxShadows: [hairline(1)] }),
        }),
        [
          mkDiv(flexRow({ flex: { alignItems: AlignItemsEnum.CENTER } }), [
            mkDiv(mkStyle({
              size: { width: '10', widthUnit: UnitEnum.PX, height: '10', heightUnit: UnitEnum.PX, ...m('0', '0', '10') },
              visual: v({ backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: ACCENT }], ...rounded(3) }),
            }), [], 'logo-mark'),
            mkSpan(mkStyle({ font: f({ fontSize: 15, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: INK }) }), [
              mkText('山下咖啡'),
            ], 'logo'),
          ], 'brand'),
          mkDiv(flexRow({ flex: { alignItems: AlignItemsEnum.CENTER } }), [
            mkLink('#', textLink('28'), [mkText('菜单')], 'nav-menu'),
            mkLink('#', textLink('28'), [mkText('位置')], 'nav-location'),
            mkLink('#', textLink('28'), [mkText('活动')], 'nav-events'),
            mkButton('在线点单', primaryBtn({ ...pad(8, 16, 8, 16) }), 'nav-cta'),
          ], 'nav'),
        ],
        'site-header',
      );

      // ---- Hero：实景照片底 + 深色遮罩 + 白色衬线标题（section + h6/h1 + p + button + link） ----
      const hero = mkSection(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX, position: PositionStyleEnum.RELATIVE, overflow: OverflowStyleEnum.HIDDEN },
          flex: { flexDirection: FlexDirectionEnum.COLUMN, justifyContent: JustifyContentEnum.CENTER, alignItems: AlignItemsEnum.CENTER },
          size: { width: '100', widthUnit: UnitEnum.PERCENT, minHeight: '540', minHeightUnit: UnitEnum.PX, ...pad(96, 32, 88, 32) },
          visual: v({
            backgrounds: [{
              type: BackgroundTypeEnum.IMAGE,
              imageUrl: 'https://picsum.photos/seed/shanxia-coffee/1600/900',
              size: BackgroundSizeEnum.COVER,
              position: BackgroundPositionEnum.CENTER,
              repeat: BackgroundRepeatEnum.NO_REPEAT,
            }],
          }),
        }),
        [
          // 深色遮罩层，保证前景文字可读
          mkDiv(mkStyle({
            general: { position: PositionStyleEnum.ABSOLUTE, top: '0', topUnit: UnitEnum.PX, right: '0', rightUnit: UnitEnum.PX, bottom: '0', bottomUnit: UnitEnum.PX, left: '0', leftUnit: UnitEnum.PX },
            visual: v({ backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: 'rgba(28,25,23,0.45)' }] }),
          }), [], 'hero-overlay'),
          mkDiv(mkStyle({
            general: { display: DisplayStyleEnum.FLEX, position: PositionStyleEnum.RELATIVE, zIndex: 1 },
            flex: { flexDirection: FlexDirectionEnum.COLUMN, alignItems: AlignItemsEnum.CENTER },
          }), [
            mkHeading(HeadingLevelEnum.H6, 'SHANXIA COFFEE', mkStyle({
              font: f({ fontFamily: SERIF, fontSize: 12, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: '#e7d9c8', letterSpacing: '3', letterSpacingUnit: UnitEnum.PX, textAlign: TextAlignEnum.CENTER }),
              size: m('0', '20'),
            }), 'hero-eyebrow'),
            mkHeading(HeadingLevelEnum.H1, '巷子里的小咖啡店', mkStyle({
              font: f({ fontSize: 46, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#ffffff', textAlign: TextAlignEnum.CENTER, lineHeight: '1.2' }),
              size: m('0', '16'),
            }), 'hero-title'),
            mkParagraph('现磨咖啡、手作甜点与十八个座位。每日 8:00–21:00 营业，周二店休。', mkStyle({
              font: f({ fontSize: 16, fontSizeUnit: UnitEnum.PX, color: '#e8e2d9', textAlign: TextAlignEnum.CENTER, lineHeight: '1.7' }),
              size: { maxWidth: '480', maxWidthUnit: UnitEnum.PX, ...m('0', '36') },
            }), 'hero-desc'),
            mkDiv(flexRow({ flex: { justifyContent: JustifyContentEnum.CENTER, alignItems: AlignItemsEnum.CENTER } }), [
              mkButton('查看菜单', primaryBtn({ ...pad(12, 28, 12, 28), ...m('0', '0', '12') }, ACCENT), 'hero-cta'),
              mkLink('#', mkStyle({
                general: { display: DisplayStyleEnum.INLINE_BLOCK },
                font: f({ fontSize: 14, fontSizeUnit: UnitEnum.PX, color: '#ffffff', fontWeight: FontWeightEnum.MEDIUM, textDecoration: TextDecorationEnum.NONE }),
                size: { ...pad(12, 28, 12, 28) },
                visual: v({ borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: 'rgba(255,255,255,0.6)', ...rounded(6) }),
              }), [mkText('门店位置')], 'hero-location'),
            ], 'hero-actions'),
          ], 'hero-content'),
        ],
        'hero',
      );

      // ---- 功能卡片（h2 + div 卡片 + h4 + p） ----
      const featureCard = (title: string, desc: string, alias: string): CanvasDivElement =>
        card([
          cardTitle(title, `${alias}-title`, '8'),
          mkParagraph(desc, mkStyle({
            font: f({ fontSize: 13, fontSizeUnit: UnitEnum.PX, color: BODY_TEXT, lineHeight: '1.6' }),
            size: m('0', '0'),
          }), `${alias}-desc`),
        ], alias, '32');

      const features = mkSection(
        sectionStyle(BAND),
        [
          wrap([
            sectionHead('本周推荐', '豆单与甜点每周更新。', 'features'),
            mkDiv(flexRow({ flex: { justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.STRETCH } }), [
              featureCard('耶加雪菲 · 水洗', '柑橘调性，茉莉花香，冰手冲表现更好。', 'feature-beans'),
              featureCard('黑糖拿铁', '自家熬的黑糖酱，默认半糖，可加浓。', 'feature-latte'),
              featureCard('栗子蒙布朗', '每日限量二十份，建议搭配美式。', 'feature-dessert'),
            ], 'feature-cards'),
          ], 'features-inner'),
        ],
        'features',
      );

      // ---- 文章 + 侧边栏（article + aside + h3/h5 + p + span + text + link） ----
      const asideLine = (text: string, alias: string, last = false): CanvasParagraphElement =>
        mkParagraph(text, mkStyle({
          font: f({ fontSize: 14, fontSizeUnit: UnitEnum.PX, color: last ? MUTED : BODY_TEXT }),
          size: last ? m('0', '0') : m('0', '10'),
        }), alias);

      const contentSection = mkSection(
        sectionStyle(),
        [
          wrap([
            mkArticle(mkStyle({ size: { width: '64', widthUnit: UnitEnum.PERCENT } }), [
              mkHeading(HeadingLevelEnum.H3, '关于山下', mkStyle({
                font: f({ fontSize: 20, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: INK }),
                size: m('0', '16'),
              }), 'article-title'),
              mkParagraph('山下咖啡开在老城青云巷，2021 年开业。十八个座位，一台烘豆机，豆子自烘，甜点当天做。', mkStyle({
                font: f({ fontSize: 15, fontSizeUnit: UnitEnum.PX, color: BODY_TEXT, lineHeight: '1.8' }),
                size: m('0', '16'),
              }), 'article-p1'),
              mkParagraph('店里只播放固定歌单，下午四点后灯光调暗。插座管够，久坐不会被赶。', mkStyle({
                font: f({ fontSize: 15, fontSizeUnit: UnitEnum.PX, color: BODY_TEXT, lineHeight: '1.8' }),
                size: m('0', '20'),
              }), 'article-p2'),
              mkSpan(mkStyle({ font: f({ fontSize: 14, fontSizeUnit: UnitEnum.PX, color: BODY_TEXT }) }), [
                mkText('外卖覆盖周边三公里，'),
                mkLink('#', mkStyle({
                  font: f({ fontSize: 14, fontSizeUnit: UnitEnum.PX, color: ACCENT, textDecoration: TextDecorationEnum.UNDERLINE }),
                }), [mkText('查看配送范围')], 'article-link'),
                mkText('。'),
              ], 'article-meta'),
            ], 'article'),
            mkAside(mkStyle({
              size: { width: '30', widthUnit: UnitEnum.PERCENT, ...pad(20, 24, 20, 24) },
              visual: v({ backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: BAND }], ...rounded(10) }),
            }), [
              mkHeading(HeadingLevelEnum.H5, '营业时间', mkStyle({
                font: f({ fontSize: 13, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: INK }),
                size: m('0', '16'),
              }), 'aside-title'),
              mkDiv(flexCol(), [
                asideLine('周一至周五 · 8:00–21:00', 'aside-weekday'),
                asideLine('周末 · 9:00–22:00', 'aside-weekend'),
                asideLine('周二店休', 'aside-closed', true),
              ], 'aside-hours'),
            ], 'sidebar'),
          ], 'content-inner', true),
        ],
        'content',
      );

      // ---- 列表（ul + ol + li + text） ----
      const listItem = (text: string, alias: string, last = false): CanvasListItemElement =>
        mkListItem(mkStyle({ size: last ? m('0', '0') : m('0', '8') }), [mkText(text)], alias);
      const listFont = f({ fontSize: 14, fontSizeUnit: UnitEnum.PX, color: BODY_TEXT, lineHeight: '1.7' });
      const listBase = { paddingLeft: 18, paddingLeftUnit: UnitEnum.PX, ...m('0', '0') };

      const listSection = mkSection(
        sectionStyle(BAND),
        [
          wrap([
            sectionHead('菜单速览', '本周常驻出品。', 'lists'),
            mkDiv(flexRow({ flex: { justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.STRETCH } }), [
              card([
                cardTitle('本周豆单', 'ul-card-title', '12'),
                mkUnorderedList(mkStyle({ font: listFont, size: listBase }), [
                  listItem('耶加雪菲 · 水洗', 'ul-item-1'),
                  listItem('哥伦比亚 · 日晒', 'ul-item-2'),
                  listItem('曼特宁 · 湿刨', 'ul-item-3'),
                  listItem('瑰夏 · 水洗（限量）', 'ul-item-4', true),
                ], 'beans-ul'),
              ], 'ul-card', '49'),
              card([
                cardTitle('点单建议', 'ol-card-title', '12'),
                mkOrderedList(mkStyle({ font: listFont, size: listBase }), [
                  listItem('先选豆子', 'ol-item-1'),
                  listItem('再选冷热', 'ol-item-2'),
                  listItem('甜点最后再加', 'ol-item-3'),
                  listItem('外带杯减两元', 'ol-item-4', true),
                ], 'steps-ol'),
              ], 'ol-card', '49'),
            ], 'list-cards'),
          ], 'lists-inner'),
        ],
        'lists',
      );

      // ---- 表格（table + caption + colgroup + col + thead + tbody + tfoot + tr + th + td） ----
      const cellPad = pad(10, 16, 10, 16);
      const cellBorder = { borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: LINE };
      const thCell = (text: string, alias: string): CanvasTableHeaderCellElement =>
        mkTableHeaderCell(mkStyle({
          size: cellPad,
          font: f({ fontSize: 13, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: INK, textAlign: TextAlignEnum.LEFT }),
          visual: v(cellBorder),
        }), [mkText(text)], alias, TableScopeEnum.COL);
      const tdCell = (text: string, alias: string, muted = false, serif = false): CanvasTableDataElement =>
        mkTableData(mkStyle({
          size: cellPad,
          font: f({ fontFamily: serif ? SERIF : undefined, fontSize: 14, fontSizeUnit: UnitEnum.PX, color: muted ? MUTED : BODY_TEXT }),
          visual: v(cellBorder),
        }), [mkText(text)], alias);

      const tableSection = mkSection(
        sectionStyle(),
        [
          wrap([
            sectionHead('价目表', '以下为堂食价格，外带杯减 ¥2。', 'table'),
            mkTable(mkStyle({
              general: { borderCollapse: BorderCollapseEnum.COLLAPSE },
              size: { width: '100', widthUnit: UnitEnum.PERCENT },
              visual: v({ backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }], boxShadows: [cardShadow], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: LINE }),
            }), [
              mkTableCaption(mkStyle({
                font: f({ fontSize: 13, fontSizeUnit: UnitEnum.PX, color: MUTED, textAlign: TextAlignEnum.LEFT }),
                size: { paddingBottom: 8, paddingBottomUnit: UnitEnum.PX },
              }), [mkText('常规饮品')], 'table-caption'),
              mkTableColGroup(1, mkStyle({}), [
                mkTableCol(1, mkStyle({ size: { width: '40', widthUnit: UnitEnum.PERCENT } })),
                mkTableCol(1, mkStyle({})),
                mkTableCol(1, mkStyle({})),
              ], 'table-colgroup'),
              mkTableHead(mkStyle({
                visual: v({ backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: BAND }] }),
              }), [
                mkTableRow(mkStyle({}), [
                  thCell('饮品', 'th-drink'),
                  thCell('规格', 'th-size'),
                  thCell('价格', 'th-price'),
                ], 'thead-tr'),
              ], 'table-thead'),
              mkTableBody(mkStyle({}), [
                mkTableRow(mkStyle({}), [
                  tdCell('美式', 'td-1-1'), tdCell('350ml', 'td-1-2'), tdCell('¥22', 'td-1-3', false, true),
                ], 'tbody-tr-1'),
                mkTableRow(mkStyle({}), [
                  tdCell('拿铁', 'td-2-1'), tdCell('350ml', 'td-2-2'), tdCell('¥26', 'td-2-3', false, true),
                ], 'tbody-tr-2'),
                mkTableRow(mkStyle({}), [
                  tdCell('手冲单品', 'td-3-1'), tdCell('200ml', 'td-3-2'), tdCell('¥38', 'td-3-3', false, true),
                ], 'tbody-tr-3'),
                mkTableRow(mkStyle({}), [
                  tdCell('Dirty', 'td-4-1'), tdCell('250ml', 'td-4-2'), tdCell('¥28', 'td-4-3', false, true),
                ], 'tbody-tr-4'),
              ], 'table-tbody'),
              mkTableFoot(mkStyle({
                visual: v({ backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: BAND }] }),
              }), [
                mkTableRow(mkStyle({}), [
                  { ...mkTableData(mkStyle({
                    size: cellPad,
                    font: f({ fontSize: 13, fontSizeUnit: UnitEnum.PX, color: MUTED }),
                    visual: v(cellBorder),
                  }), [mkText('甜点与季节饮品以吧台当日牌为准。')], 'td-foot'), colspan: 3 },
                ], 'tfoot-tr'),
              ], 'table-tfoot'),
            ], 'menu-table'),
          ], 'table-inner'),
        ],
        'table-section',
      );

      // ---- 表单（form + label + input + textarea + radio + checkbox + button） ----
      const fieldLabel = mkStyle({
        font: f({ fontSize: 13, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.MEDIUM, color: INK }),
        size: m('0', '6'),
      });
      const fieldInput = mkStyle({
        size: { width: '100', widthUnit: UnitEnum.PERCENT, ...pad(9, 12, 9, 12) },
        font: f({ fontFamily: FONT_STACK, fontSize: 14, fontSizeUnit: UnitEnum.PX, color: INK }),
        visual: v({ backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: INPUT_LINE, ...rounded(6) }),
      });
      const fieldGroup = flexCol({ size: m('0', '16') });
      const optionInput = mkStyle({ size: m('0', '0', '6') });
      const optionLabel = (marginRight = '0'): StyleConfig => mkStyle({
        font: f({ fontSize: 14, fontSizeUnit: UnitEnum.PX, color: BODY_TEXT }),
        size: marginRight !== '0' ? m('0', '0', marginRight) : m('0', '0'),
      });

      const nameInput = mkInput('怎么称呼你', fieldInput, 'field-name-input');
      const noteInput: CanvasTextareaElement = { ...mkTextarea('口味偏好或其他说明', fieldInput, 'field-note-input'), rows: 3 };
      const earlyRadio: CanvasRadioElement = { ...mkRadio('session', '14:00', optionInput, 'session-early'), checked: true };
      const lateRadio = mkRadio('session', '16:00', optionInput, 'session-late');
      const newsCheckbox = mkCheckbox('opts', 'beans', optionInput, 'opt-beans');

      const formEl = mkForm('', FormMethodEnum.GET, mkStyle({
        size: { width: '440', widthUnit: UnitEnum.PX, maxWidth: '100', maxWidthUnit: UnitEnum.PERCENT, ...pad(32, 32, 32, 32) },
        visual: v({ backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }], boxShadows: [cardShadow], borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: LINE, ...rounded(12) }),
      }), [
        mkHeading(HeadingLevelEnum.H4, '手冲体验课', mkStyle({
          font: f({ fontSize: 18, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: INK }),
          size: m('0', '4'),
        }), 'form-title'),
        mkParagraph('每周六下午两场，限额六位。', mkStyle({
          font: f({ fontSize: 13, fontSizeUnit: UnitEnum.PX, color: MUTED }),
          size: m('0', '24'),
        }), 'form-desc'),
        mkDiv(fieldGroup, [
          mkLabel('称呼', nameInput.id, fieldLabel, 'label-name'),
          nameInput,
        ], 'field-name'),
        mkDiv(fieldGroup, [
          mkLabel('备注', noteInput.id, fieldLabel, 'label-note'),
          noteInput,
        ], 'field-note'),
        mkDiv(fieldGroup, [
          mkLabel('场次', '', fieldLabel, 'label-session'),
          mkDiv(flexRow({ flex: { alignItems: AlignItemsEnum.CENTER } }), [
            earlyRadio,
            mkLabel('14:00', earlyRadio.id, optionLabel('20'), 'label-early'),
            lateRadio,
            mkLabel('16:00', lateRadio.id, optionLabel(), 'label-late'),
          ], 'session-row'),
        ], 'field-session'),
        mkDiv(flexRow({ flex: { alignItems: AlignItemsEnum.CENTER }, size: m('0', '20') }), [
          newsCheckbox,
          mkLabel('课后接收新豆单通知', newsCheckbox.id, optionLabel(), 'label-beans'),
        ], 'field-news'),
        mkButton('报名', primaryBtn({ width: '100', widthUnit: UnitEnum.PERCENT, ...pad(10, 16, 10, 16) }, ACCENT), 'form-submit'),
      ], 'class-form');

      const formSection = mkSection(
        sectionStyle(BAND),
        [formEl],
        'form-section',
      );

      // ---- 媒体（video + audio + image） ----
      const mediaCaption = mkStyle({
        font: f({ fontSize: 13, fontSizeUnit: UnitEnum.PX, color: MUTED }),
        size: m('8', '0'),
      });
      const mediaFrame = v({ borderWidth: 1, borderStyle: BorderStyleEnum.SOLID, borderColor: '#44403c', ...rounded(8) });

      // 深色区块：与浅色区块形成明暗节奏
      const mediaSection = mkSection(
        sectionStyle(INK),
        [
          wrap([
            sectionHead('门店影像', '吧台、座位与本周甜点。', 'media', true),
            mkDiv(flexRow({ flex: { justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.FLEX_START } }), [
              mkDiv(flexCol({ size: { width: '49', widthUnit: UnitEnum.PERCENT } }), [
                mkVideo('https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', mkStyle({
                  size: { width: '100', widthUnit: UnitEnum.PERCENT },
                  visual: mediaFrame,
                }), 'demo-video'),
                mkParagraph('店内日常', mediaCaption, 'video-caption'),
              ], 'media-video'),
              mkDiv(flexCol({ size: { width: '49', widthUnit: UnitEnum.PERCENT } }), [
                mkImage('https://picsum.photos/640/360', '吧台一角', mkStyle({
                  size: { width: '100', widthUnit: UnitEnum.PERCENT },
                  visual: mediaFrame,
                }), 'demo-image'),
                mkParagraph('吧台一角', mediaCaption, 'image-caption'),
                mkAudio('https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3', mkStyle({
                  size: { width: '100', widthUnit: UnitEnum.PERCENT, ...m('24', '0') },
                }), 'demo-audio'),
                mkParagraph('店内环境声', mediaCaption, 'audio-caption'),
              ], 'media-misc'),
            ], 'media-row'),
          ], 'media-inner'),
        ],
        'media-section',
      );

      // ---- 页脚 ----
      const footerEl = mkFooter(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX },
          flex: { flexDirection: FlexDirectionEnum.ROW, justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.CENTER },
          size: { width: '100', widthUnit: UnitEnum.PERCENT, ...pad(28, 32, 28, 32) },
          visual: v({ backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: PAPER }], boxShadows: [hairline(-1)] }),
        }),
        [
          mkDiv(flexCol(), [
            mkSpan(mkStyle({ font: f({ fontSize: 14, fontSizeUnit: UnitEnum.PX, fontWeight: FontWeightEnum.SEMI_BOLD, color: INK }) }), [
              mkText('山下咖啡'),
            ], 'footer-logo'),
            mkParagraph('© 2026 山下咖啡 · 老城青云巷 12 号', mkStyle({
              font: f({ fontSize: 13, fontSizeUnit: UnitEnum.PX, color: MUTED }),
              size: m('6', '0'),
            }), 'footer-copy'),
          ], 'footer-brand'),
          mkDiv(flexRow({ flex: { alignItems: AlignItemsEnum.CENTER } }), [
            mkLink('#', textLink('24', 13), [mkText('外卖合作')], 'footer-delivery'),
            mkLink('#', textLink('24', 13), [mkText('会员注册')], 'footer-member'),
            mkLink('#', textLink('0', 13), [mkText('联系我们')], 'footer-contact'),
          ], 'footer-links'),
        ],
        'site-footer',
      );

      // 根元素基础排版：纸色底、统一字体族、墨色与行高，子元素继承
      localStyleRules.unshift({
        type: StyleRuleTypeEnum.EDITABLE,
        selector: `#${this.root.id}`,
        style: styleConfigToCss(mkStyle({
          font: f({ fontFamily: FONT_STACK, fontSize: 14, fontSizeUnit: UnitEnum.PX, color: INK, lineHeight: '1.5' }),
          visual: v({ backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: PAPER }] }),
        }), true),
      });

      this.root.children = [headerEl, hero, features, contentSection, listSection, tableSection, formSection, mediaSection, footerEl];
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
        // 版本不匹配说明数据结构已变更，旧数据自动作废，避免带病加载损坏画布
        if (data.version !== CANVAS_DATA_VERSION) {
          this.clearCanvasStorage();
          return false;
        }

        this.root.children = data.children ?? [];
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
