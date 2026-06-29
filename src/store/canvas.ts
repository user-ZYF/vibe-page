import { type CanvasButtonElement, type CanvasContainerElement, type CanvasInnerElement, type CanvasImageElement, type CanvasInputElement, type CanvasLinkElement, type CanvasParagraphElement, type CanvasRadioElement, type CanvasCheckboxElement, type CanvasVideoElement, type CanvasAudioElement, type CanvasTextareaElement, type CanvasLabelElement, type CanvasFormElement, type CanvasRootElement, type CanvasElement, type CanvasInnerElementTypeEnum, type StyleConfig, isParentElement } from "@/views/Canvas/types";
import { ButtonTypeEnum, CanvasElementLabelMap, CanvasElementTypeEnum, LinkTargetEnum, SiderPanelEnum, LINK_EXCLUDE_TYPES, FORM_EXCLUDE_TYPES, FormMethodEnum } from "@/constants/home";
import { DefaultStyleConfigMap, defaultClassStyleConfig, DisplayStyleEnum, FlexDirectionEnum, JustifyContentEnum, AlignItemsEnum, SizeUnitEnum, FontWeightEnum, TextAlignEnum, BackgroundTypeEnum } from "@/constants/style";
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
          return { ...elBase, href: '', target: LinkTargetEnum.SELF, children: [], exclude: [...LINK_EXCLUDE_TYPES] } as CanvasLinkElement;
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
        case CanvasElementTypeEnum.FORM:
          return { ...elBase, action: '', method: FormMethodEnum.GET, children: [], exclude: [...FORM_EXCLUDE_TYPES] } as CanvasFormElement;
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
        id: nanoid(),
        type: CanvasElementTypeEnum.CONTAINER,
        styleConfig,
        classes: [],
        classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.CONTAINER],
        children,
      });

      /** 创建段落元素 */
      const mkParagraph = (text: string, styleConfig: StyleConfig, alias?: string): CanvasParagraphElement => ({
        id: nanoid(),
        type: CanvasElementTypeEnum.PARAGRAPH,
        styleConfig,
        classes: [],
        classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.PARAGRAPH],
        text,
      });

      /** 创建按钮元素 */
      const mkButton = (text: string, styleConfig: StyleConfig, alias?: string): CanvasButtonElement => ({
        id: nanoid(),
        type: CanvasElementTypeEnum.BUTTON,
        styleConfig,
        classes: [],
        classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.BUTTON],
        text,
        buttonType: ButtonTypeEnum.BUTTON,
      });

      /** 创建链接元素 */
      const mkLink = (href: string, styleConfig: StyleConfig, children: CanvasInnerElement[] = [], alias?: string): CanvasLinkElement => ({
        id: nanoid(),
        type: CanvasElementTypeEnum.LINK,
        styleConfig,
        classes: [],
        classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.LINK],
        href,
        target: LinkTargetEnum.SELF,
        children,
        exclude: [...LINK_EXCLUDE_TYPES],
      });

      /** 创建输入框元素 */
      const mkInput = (placeholder: string, styleConfig: StyleConfig, alias?: string): CanvasInputElement => ({
        id: nanoid(),
        type: CanvasElementTypeEnum.INPUT,
        styleConfig,
        classes: [],
        classNames: [],
        alias: alias ?? CanvasElementLabelMap[CanvasElementTypeEnum.INPUT],
        placeholder,
        value: '',
        required: false,
      });

      /** ---- 导航栏 ---- */
      const navbar = mkContainer(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX },
          flex: { flexDirection: FlexDirectionEnum.ROW, justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.CENTER },
          size: {
            paddingTop: 12, paddingTopUnit: SizeUnitEnum.PX,
            paddingRight: 24, paddingRightUnit: SizeUnitEnum.PX,
            paddingBottom: 12, paddingBottomUnit: SizeUnitEnum.PX,
            paddingLeft: 24, paddingLeftUnit: SizeUnitEnum.PX,
            width: '100', widthUnit: SizeUnitEnum.PERCENT,
          },
          visual: {
            backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#ffffff' }],
            boxShadows: [],
            borderWidth: 1,
            borderStyle: 'solid' as never,
            borderColor: '#e8e8e8',
          },
        }),
        [
          mkParagraph('VibePage', mkStyle({
            font: { fontSize: 20, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a1a', textShadows: [] },
          }), 'logo'),
          mkContainer(
            mkStyle({
              general: { display: DisplayStyleEnum.FLEX },
              flex: { flexDirection: FlexDirectionEnum.ROW, alignItems: AlignItemsEnum.CENTER },
            }),
            [
              mkLink('#', mkStyle({ size: { marginRight: '24', marginRightUnit: SizeUnitEnum.PX } }), [
                mkParagraph('首页', mkStyle({ font: { color: '#333333', fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, textShadows: [] } })),
              ]),
              mkLink('#', mkStyle({ size: { marginRight: '24', marginRightUnit: SizeUnitEnum.PX } }), [
                mkParagraph('功能', mkStyle({ font: { color: '#333333', fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, textShadows: [] } })),
              ]),
              mkLink('#', mkStyle({}), [
                mkParagraph('关于', mkStyle({ font: { color: '#333333', fontSize: 14, fontSizeUnit: SizeUnitEnum.PX, textShadows: [] } })),
              ]),
            ],
            'nav-links',
          ),
        ],
        'navbar',
      );

      /** ---- Hero 区域 ---- */
      const hero = mkContainer(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX },
          flex: { flexDirection: FlexDirectionEnum.COLUMN, justifyContent: JustifyContentEnum.CENTER, alignItems: AlignItemsEnum.CENTER },
          size: {
            paddingTop: 64, paddingTopUnit: SizeUnitEnum.PX,
            paddingRight: 24, paddingRightUnit: SizeUnitEnum.PX,
            paddingBottom: 64, paddingBottomUnit: SizeUnitEnum.PX,
            paddingLeft: 24, paddingLeftUnit: SizeUnitEnum.PX,
            width: '100', widthUnit: SizeUnitEnum.PERCENT,
          },
          visual: {
            backgrounds: [{ type: BackgroundTypeEnum.COLOR, color: '#f5f7fa' }],
            boxShadows: [],
          },
        }),
        [
          mkParagraph('构建你的页面', mkStyle({
            font: { fontSize: 36, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a1a', textAlign: TextAlignEnum.CENTER, textShadows: [] },
            size: { marginBottom: '16', marginBottomUnit: SizeUnitEnum.PX },
          }), 'hero-title'),
          mkParagraph('可视化拖拽编辑器，所见即所得，轻松搭建专业页面', mkStyle({
            font: { fontSize: 16, fontSizeUnit: SizeUnitEnum.PX, color: '#666666', textAlign: TextAlignEnum.CENTER, textShadows: [] },
            size: { marginBottom: '32', marginBottomUnit: SizeUnitEnum.PX, maxWidth: '600', maxWidthUnit: SizeUnitEnum.PX },
          }), 'hero-desc'),
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
            },
          }), 'hero-cta'),
        ],
        'hero',
      );

      /** ---- 功能卡片区域 ---- */
      const mkFeatureCard = (title: string, desc: string, alias: string): CanvasContainerElement => {
        return mkContainer(
          mkStyle({
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
          }),
          [
            mkParagraph(title, mkStyle({
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

      const features = mkContainer(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX },
          flex: { flexDirection: FlexDirectionEnum.ROW, justifyContent: JustifyContentEnum.SPACE_BETWEEN, alignItems: AlignItemsEnum.FLEX_START },
          size: {
            paddingTop: 48, paddingTopUnit: SizeUnitEnum.PX,
            paddingRight: 24, paddingRightUnit: SizeUnitEnum.PX,
            paddingBottom: 48, paddingBottomUnit: SizeUnitEnum.PX,
            paddingLeft: 24, paddingLeftUnit: SizeUnitEnum.PX,
            width: '100', widthUnit: SizeUnitEnum.PERCENT,
          },
        }),
        [
          mkFeatureCard('拖拽编辑', '所见即所得的可视化编辑体验，无需编写代码即可搭建页面。', 'feature-1'),
          mkFeatureCard('组件丰富', '内置多种基础组件，容器、按钮、图片、表单等一应俱全。', 'feature-2'),
          mkFeatureCard('实时预览', '随时切换预览模式，查看最终页面效果，确保设计无误。', 'feature-3'),
        ],
        'features',
      );

      /** ---- 表单区域 ---- */
      const formSection = mkContainer(
        mkStyle({
          general: { display: DisplayStyleEnum.FLEX },
          flex: { flexDirection: FlexDirectionEnum.COLUMN, justifyContent: JustifyContentEnum.CENTER, alignItems: AlignItemsEnum.CENTER },
          size: {
            paddingTop: 48, paddingTopUnit: SizeUnitEnum.PX,
            paddingRight: 24, paddingRightUnit: SizeUnitEnum.PX,
            paddingBottom: 48, paddingBottomUnit: SizeUnitEnum.PX,
            paddingLeft: 24, paddingLeftUnit: SizeUnitEnum.PX,
            width: '100', widthUnit: SizeUnitEnum.PERCENT,
          },
        }),
        [
          mkParagraph('联系我们', mkStyle({
            font: { fontSize: 24, fontSizeUnit: SizeUnitEnum.PX, fontWeight: FontWeightEnum.BOLD, color: '#1a1a1a', textAlign: TextAlignEnum.CENTER, textShadows: [] },
            size: { marginBottom: '24', marginBottomUnit: SizeUnitEnum.PX },
          }), 'form-title'),
          mkInput('请输入你的邮箱', mkStyle({
            size: {
              width: '400', widthUnit: SizeUnitEnum.PX,
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
              borderWidth: 1, borderStyle: 'solid' as never, borderColor: '#d9d9d9',
            },
          }), 'form-email'),
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
            },
          }), 'form-submit'),
        ],
        'form-section',
      );

      this.root.children = [navbar, hero, features, formSection];
    },
  }
});
