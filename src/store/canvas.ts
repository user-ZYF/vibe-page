import { type CanvasButtonElement, type CanvasDivElement, type CanvasInnerElement, type CanvasImageElement, type CanvasInputElement, type CanvasLinkElement, type CanvasParagraphElement, type CanvasRadioElement, type CanvasCheckboxElement, type CanvasVideoElement, type CanvasAudioElement, type CanvasTextareaElement, type CanvasLabelElement, type CanvasFormElement, type CanvasSpanElement, type CanvasTextElement, type CanvasUnorderedListElement, type CanvasOrderedListElement, type CanvasListItemElement, type CanvasTableElement, type CanvasTableHeadElement, type CanvasTableBodyElement, type CanvasTableFootElement, type CanvasTableRowElement, type CanvasTableDataElement, type CanvasTableHeaderCellElement, type CanvasTableCaptionElement, type CanvasTableColGroupElement, type CanvasTableColElement, type CanvasHeaderElement, type CanvasFooterElement, type CanvasArticleElement, type CanvasSectionElement, type CanvasAsideElement, type CanvasHeadingElement, type CanvasGeneralElement, type CanvasRootElement, type CanvasInnerElementTypeEnum, type StyleConfig, type ClassListItem, type ClassRef, type CanvasStorageData, isParentElement } from "@/views/Canvas/types";
import { ButtonTypeEnum, CanvasElementLabelMap, CanvasElementTypeEnum, HeadingLevelEnum, LinkTargetEnum, SiderPanelEnum, FormMethodEnum } from "@/constants/home";
import { DefaultStyleConfigMap, defaultClassStyleConfig } from "@/constants/style";
import { defineStore } from "pinia";
import { cloneDeep, isEqual } from "lodash";
import { Positioner } from "@/views/Canvas/drag/Positioner";
import { parseCodeToCanvas } from "@/utils/code-parser";
import { cssToStyleConfig, styleConfigToCss, mergeDeclarations, syncStyleConfigToRules, declarationWins } from "@/utils/style-converter";
import { generateId } from "@/utils/id";
import { StyleRuleTypeEnum } from "@/constants/style";
import { GENERAL_FALLBACK_TAG_NAME } from "@/constants/html";
import type { CanvasStyleRule } from "@/views/Canvas/types";
import { findElementInTree, findParentIdInTree, forEachElementInTree } from "@/utils/tree-traversal";

/** 空画布数据：默认根元素 + 根元素的 #id 样式规则 */
export function createEmptyCanvasData(): CanvasStorageData {
  const rootId = generateId();
  return {
    root: {
      id: rootId,
      type: CanvasElementTypeEnum.ROOT,
      classes: [],
      children: [],
      alias: CanvasElementLabelMap[CanvasElementTypeEnum.ROOT],
    },
    styleRules: [
      {
        type: StyleRuleTypeEnum.EDITABLE,
        selector: `#${rootId}`,
        style: styleConfigToCss(DefaultStyleConfigMap[CanvasElementTypeEnum.ROOT], true),
      },
    ],
  };
}

/** 画布store */
export const useCanvasStore = defineStore("canvas", {
  state: () => {
    const empty = createEmptyCanvasData();
    return {
    /** 画布元素列表 */
    root: empty.root as CanvasRootElement,
    /** 选中的元素 */
    selectedElementId: null as string | null,
    /** 当前编辑的 class 名称（null 表示编辑元素自身样式） */
    activeClassName: null as string | null,
    /** 当前激活的 Sider 面板 */
    activePanel: SiderPanelEnum.COMPONENTS as SiderPanelEnum,
    /** 是否正在调整元素尺寸 */
    isResizing: false,
    /** 打开的取色面板数量（大于 0 期间挂起 styleRules 到编辑副本的回读重建，避免拖拽取色时重渲染卸载取色器 DOM） */
    colorPickerOpenCount: 0,
    /** 插入位置 */
    positioner: new Positioner(),
    /** 样式规则有序清单 */
    styleRules: empty.styleRules as CanvasStyleRule[],
    };
  },
  getters: {
    /** 取色面板是否打开（存在多个取色器实例时用计数避免互相清除标记） */
    isColorPickerOpen(state): boolean {
      return state.colorPickerOpenCount > 0;
    },
    /** 全局 class 列表（含引用元素 id 及启用状态），供全局 class 管理面板使用 */
    classList(state): ClassListItem[] {
      // 收集每个 class 被哪些元素引用
      const refsMap = new Map<string, ClassRef[]>();
      forEachElementInTree(state.root, (el) => {
        el.classes.forEach((c) => {
          const arr = refsMap.get(c.name) ?? [];
          arr.push({ id: el.id, enabled: c.enabled });
          refsMap.set(c.name, arr);
        });
      });
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
      // 递归收集所有元素引用的 class 名称（包含启用和禁用）与现存元素 id
      const usedClasses = new Set<string>();
      const existingIds = new Set<string>();
      forEachElementInTree(this.root, (el) => {
        el.classes.forEach((c) => usedClasses.add(c.name));
        existingIds.add(el.id);
      });
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
      forEachElementInTree(this.root, (el) => {
        const idx = el.classes.findIndex((c) => c.name === className);
        if (idx !== -1) {
          el.classes.splice(idx, 1);
        }
      });
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
    /** 重命名元素 id：迁移其 #id 规则选择器（避免规则失配导致样式丢失），并同步所有 label 元素的 for 引用（避免改名后悬空） */
    renameElementId(oldId: string, newId: string) {
      this.styleRules.forEach((rule) => {
        if (rule.type === StyleRuleTypeEnum.EDITABLE && rule.selector === `#${oldId}`) {
          rule.selector = `#${newId}`;
        }
      });
      forEachElementInTree(this.root, (el) => {
        if (el.type === CanvasElementTypeEnum.LABEL && (el as CanvasLabelElement).for === oldId) {
          (el as CanvasLabelElement).for = newId;
        }
      });
    },
    /** 获取指定id元素的父元素id（未找到或根元素返回 ''） */
    getParentElementId(id: string): string {
      return findParentIdInTree(this.root, id);
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
        case CanvasElementTypeEnum.FORM: {
          /** 表单自动创建基础字段骨架：单行输入、多行输入、单选组、多选组、提交按钮 */
          /** 单行输入框 */
          const input = this.generateElement(CanvasElementTypeEnum.INPUT) as CanvasInputElement;
          /** 单行输入框标签 */
          const inputLabel = this.generateElement(CanvasElementTypeEnum.LABEL) as CanvasLabelElement;
          inputLabel.text = '单行输入';
          inputLabel.for = input.id;
          /** 多行输入框 */
          const textarea = this.generateElement(CanvasElementTypeEnum.TEXTAREA) as CanvasTextareaElement;
          /** 多行输入框标签 */
          const textareaLabel = this.generateElement(CanvasElementTypeEnum.LABEL) as CanvasLabelElement;
          textareaLabel.text = '多行输入';
          textareaLabel.for = textarea.id;
          /** 单选组标题（无绑定控件，用纯文本而非 label） */
          const radioTitle = this.generateElement(CanvasElementTypeEnum.TEXT) as CanvasTextElement;
          radioTitle.text = '单选';
          /** 单选项一（组名拼接元素 id 保证唯一，避免与同表单内其他单选组串组） */
          const radio1 = this.generateElement(CanvasElementTypeEnum.RADIO) as CanvasRadioElement;
          radio1.name = `radio-group-${radio1.id}`;
          radio1.value = '选项一';
          /** 单选项一文本标签（for 绑定对应选项，点击文本即可选中） */
          const radio1Label = this.generateElement(CanvasElementTypeEnum.LABEL) as CanvasLabelElement;
          radio1Label.text = '选项一';
          radio1Label.for = radio1.id;
          /** 单选项二 */
          const radio2 = this.generateElement(CanvasElementTypeEnum.RADIO) as CanvasRadioElement;
          radio2.name = radio1.name;
          radio2.value = '选项二';
          /** 单选项二文本标签 */
          const radio2Label = this.generateElement(CanvasElementTypeEnum.LABEL) as CanvasLabelElement;
          radio2Label.text = '选项二';
          radio2Label.for = radio2.id;
          /** 多选组标题（无绑定控件，用纯文本而非 label） */
          const checkboxTitle = this.generateElement(CanvasElementTypeEnum.TEXT) as CanvasTextElement;
          checkboxTitle.text = '多选';
          /** 多选项一（组名拼接元素 id 保证唯一） */
          const checkbox1 = this.generateElement(CanvasElementTypeEnum.CHECKBOX) as CanvasCheckboxElement;
          checkbox1.name = `checkbox-group-${checkbox1.id}`;
          checkbox1.value = '选项一';
          /** 多选项一文本标签（for 绑定对应选项，点击文本即可选中） */
          const checkbox1Label = this.generateElement(CanvasElementTypeEnum.LABEL) as CanvasLabelElement;
          checkbox1Label.text = '选项一';
          checkbox1Label.for = checkbox1.id;
          /** 多选项二 */
          const checkbox2 = this.generateElement(CanvasElementTypeEnum.CHECKBOX) as CanvasCheckboxElement;
          checkbox2.name = checkbox1.name;
          checkbox2.value = '选项二';
          /** 多选项二文本标签 */
          const checkbox2Label = this.generateElement(CanvasElementTypeEnum.LABEL) as CanvasLabelElement;
          checkbox2Label.text = '选项二';
          checkbox2Label.for = checkbox2.id;
          /** 提交按钮 */
          const submit = this.generateElement(CanvasElementTypeEnum.BUTTON) as CanvasButtonElement;
          submit.text = '提交';
          submit.buttonType = ButtonTypeEnum.SUBMIT;
          /** 生成字段分组容器 */
          const group = (children: CanvasInnerElement[]): CanvasDivElement =>
            ({ ...this.generateElement(CanvasElementTypeEnum.DIV), children } as CanvasDivElement);
          return {
            ...elBase,
            action: '',
            method: FormMethodEnum.GET,
            children: [
              group([inputLabel, input]),
              group([textareaLabel, textarea]),
              group([radioTitle, radio1, radio1Label, radio2, radio2Label]),
              group([checkboxTitle, checkbox1, checkbox1Label, checkbox2, checkbox2Label]),
              submit,
            ],
          } as CanvasFormElement;
        }
        case CanvasElementTypeEnum.UNORDERED_LIST:
        case CanvasElementTypeEnum.ORDERED_LIST: {
          /** 列表自动创建三个列表项骨架，保证内部有可投放内容 */
          const items = [
            this.generateElement(CanvasElementTypeEnum.LIST_ITEM),
            this.generateElement(CanvasElementTypeEnum.LIST_ITEM),
            this.generateElement(CanvasElementTypeEnum.LIST_ITEM),
          ];
          return { ...elBase, children: items } as CanvasUnorderedListElement | CanvasOrderedListElement;
        }
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
        case CanvasElementTypeEnum.TABLE_CAPTION: {
          /** 标题文本默认展示「表格标题」 */
          const text = this.generateElement(CanvasElementTypeEnum.TEXT) as CanvasTextElement;
          text.text = '表格标题';
          return { ...elBase, children: [text] } as CanvasTableCaptionElement;
        }
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
      const container = findElementInTree(this.root, containerId);
      if (container && isParentElement(container)) {
        container.children.push(element);
      }
      this.mergeAdjacentTextElements();
    },
    /** 选中元素 */
    selectElement(id: string | null = null) {
      if (id && !findElementInTree(this.root, id)) return;
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
      /** 清理指向已删除元素的 label.for 悬空引用 */
      forEachElementInTree(this.root, (el) => {
        if (el.type === CanvasElementTypeEnum.LABEL) {
          const label = el as CanvasLabelElement;
          if (label.for && !findElementInTree(this.root, label.for)) {
            delete label.for;
          }
        }
      });
      /** 删除的元素或其子孙为当前选中元素时，清空选中态 */
      if(this.selectedElementId && !findElementInTree(this.root, this.selectedElementId)){
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
      const target = findElementInTree(this.root, id) as CanvasInnerElement | null;
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
      const targetParent = findElementInTree(this.root, targetParentId);
      if (targetParent && isParentElement(targetParent)) {
        const clampedIndex = Math.min(index, targetParent.children.length);
        targetParent.children.splice(clampedIndex, 0, target);
      }
      this.removeElement(tempId);
      this.mergeAdjacentTextElements();
    },
    /** 在指定容器的 index 位置添加元素 */
    addElementToContainerAt(type: CanvasInnerElementTypeEnum, containerId: string, index: number) {
      const element = this.generateElement(type);
      const container = findElementInTree(this.root, containerId);
      if (container && isParentElement(container)) {
        const clampedIndex = Math.min(index, container.children.length);
        container.children.splice(clampedIndex, 0, element);
      }
      this.mergeAdjacentTextElements();
    },
    /** 选中元素的父节点 */
    selectParentElement() {
      const parentId = this.selectedElementId
        ? findParentIdInTree(this.root, this.selectedElementId)
        : null;
      if (parentId) {
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

    /** 序列化当前画布数据 */
    getCanvasData(): CanvasStorageData {
      return {
        root: cloneDeep(this.root),
        styleRules: cloneDeep(this.styleRules),
      };
    },
    /** 应用一份画布数据到画布 */
    loadCanvasData(data: CanvasStorageData): void {
      if (data.root) {
        this.root = cloneDeep(data.root);
      }
      this.styleRules = data.styleRules ?? [];
      this.selectedElementId = null;
      this.cleanupUnreferencedStyleRules();
    },
    /**
     * 将 HTML + CSS 代码解析后应用到画布，替换当前内容
     * @returns 是否应用成功；解析失败时保留原画布不变
     */
    applyParsedCode(html: string, css: string): boolean {
      try {
        const { children, styleRules, rootPatch } = parseCodeToCanvas(html, css, this.root.id);
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
