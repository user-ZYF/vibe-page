import { Component, defineAsyncComponent, h, defineComponent } from "vue";
import Root from "./components/canvas-element/Root.vue";
import { CanvasElementTypeEnum } from "@/constants/home.ts";

/** 异步组件加载失败时的回退组件 */
const AsyncErrorFallback = defineComponent({
  name: 'AsyncErrorFallback',
  render() {
    return h('div', { style: 'color: #ff4d4f; padding: 4px; font-size: 12px;' }, '组件加载失败');
  },
});

/** 创建带错误回退的异步组件 */
function lazy(loader: () => Promise<Component | { default: Component }>) {
  return defineAsyncComponent({
    loader,
    errorComponent: AsyncErrorFallback,
  });
}

const Container = lazy(() => import("./components/canvas-element/Container.vue"));
const Link = lazy(() => import("./components/canvas-element/Link.vue"));
const Image = lazy(() => import("./components/canvas-element/Image.vue"));
const Button = lazy(() => import("./components/canvas-element/Button.vue"));
const Paragraph = lazy(() => import("./components/canvas-element/Paragraph.vue"));
const Input = lazy(() => import("./components/canvas-element/Input.vue"));
const Textarea = lazy(() => import("./components/canvas-element/Textarea.vue"));
const Radio = lazy(() => import("./components/canvas-element/Radio.vue"));
const Checkbox = lazy(() => import("./components/canvas-element/Checkbox.vue"));
const Video = lazy(() => import("./components/canvas-element/Video.vue"));
const Audio = lazy(() => import("./components/canvas-element/Audio.vue"));
const Label = lazy(() => import("./components/canvas-element/Label.vue"));
const Form = lazy(() => import("./components/canvas-element/Form.vue"));
const Span = lazy(() => import("./components/canvas-element/Span.vue"));
const Text = lazy(() => import("./components/canvas-element/Text.vue"));
const UnorderedList = lazy(() => import("./components/canvas-element/UnorderedList.vue"));
const OrderedList = lazy(() => import("./components/canvas-element/OrderedList.vue"));
const ListItem = lazy(() => import("./components/canvas-element/ListItem.vue"));
const Table = lazy(() => import("./components/canvas-element/Table.vue"));
const TableHead = lazy(() => import("./components/canvas-element/TableHead.vue"));
const TableBody = lazy(() => import("./components/canvas-element/TableBody.vue"));
const TableFoot = lazy(() => import("./components/canvas-element/TableFoot.vue"));
const TableRow = lazy(() => import("./components/canvas-element/TableRow.vue"));
const TableData = lazy(() => import("./components/canvas-element/TableData.vue"));
const TableHeaderCell = lazy(() => import("./components/canvas-element/TableHeaderCell.vue"));
const TableCaption = lazy(() => import("./components/canvas-element/TableCaption.vue"));
const TableColGroup = lazy(() => import("./components/canvas-element/TableColGroup.vue"));
const TableCol = lazy(() => import("./components/canvas-element/TableCol.vue"));
const Header = lazy(() => import("./components/canvas-element/Header.vue"));
const Footer = lazy(() => import("./components/canvas-element/Footer.vue"));
const Article = lazy(() => import("./components/canvas-element/Article.vue"));
const Section = lazy(() => import("./components/canvas-element/Section.vue"));
const Aside = lazy(() => import("./components/canvas-element/Aside.vue"));
const Heading = lazy(() => import("./components/canvas-element/Heading.vue"));
import type { InjectionKey, Ref } from 'vue';
import { ValidResizeDirEnum } from "./types.ts";
import { ResizeDirEnum } from "@/constants/style.ts";

/** 组件映射 */
export const CanvasElementComponentMap: Record<CanvasElementTypeEnum, Component> = {
    [CanvasElementTypeEnum.CONTAINER]: Container,
    [CanvasElementTypeEnum.PARAGRAPH]: Paragraph,
    [CanvasElementTypeEnum.LINK]: Link,
    [CanvasElementTypeEnum.IMAGE]: Image,
    [CanvasElementTypeEnum.BUTTON]: Button,
    [CanvasElementTypeEnum.ROOT]: Root,
    [CanvasElementTypeEnum.INPUT]: Input,
    [CanvasElementTypeEnum.TEXTAREA]: Textarea,
    [CanvasElementTypeEnum.RADIO]: Radio,
    [CanvasElementTypeEnum.CHECKBOX]: Checkbox,
    [CanvasElementTypeEnum.VIDEO]: Video,
    [CanvasElementTypeEnum.AUDIO]: Audio,
    [CanvasElementTypeEnum.LABEL]: Label,
    [CanvasElementTypeEnum.FORM]: Form,
    [CanvasElementTypeEnum.SPAN]: Span,
    [CanvasElementTypeEnum.TEXT]: Text,
    [CanvasElementTypeEnum.UNORDERED_LIST]: UnorderedList,
    [CanvasElementTypeEnum.ORDERED_LIST]: OrderedList,
    [CanvasElementTypeEnum.LIST_ITEM]: ListItem,
    [CanvasElementTypeEnum.TABLE]: Table,
    [CanvasElementTypeEnum.TABLE_HEAD]: TableHead,
    [CanvasElementTypeEnum.TABLE_BODY]: TableBody,
    [CanvasElementTypeEnum.TABLE_FOOT]: TableFoot,
    [CanvasElementTypeEnum.TABLE_ROW]: TableRow,
    [CanvasElementTypeEnum.TABLE_DATA]: TableData,
    [CanvasElementTypeEnum.TABLE_HEADER_CELL]: TableHeaderCell,
    [CanvasElementTypeEnum.TABLE_CAPTION]: TableCaption,
    [CanvasElementTypeEnum.TABLE_COL_GROUP]: TableColGroup,
    [CanvasElementTypeEnum.TABLE_COL]: TableCol,
    [CanvasElementTypeEnum.HEADER]: Header,
    [CanvasElementTypeEnum.FOOTER]: Footer,
    [CanvasElementTypeEnum.ARTICLE]: Article,
    [CanvasElementTypeEnum.SECTION]: Section,
    [CanvasElementTypeEnum.ASIDE]: Aside,
    [CanvasElementTypeEnum.HEADING]: Heading,
};

/** 隐藏的元素id列表 */
export const HIDDEN_KEYS: InjectionKey<Ref<string[]>> = Symbol('hiddenKeys');

/** 切换元素显示/隐藏 */
export const TOGGLE_SHOW_KEY: InjectionKey<(id: string) => void> = Symbol('toggleShow');

/** 是否处于预览模式 */
export const IS_PREVIEW_KEY: InjectionKey<Readonly<Ref<boolean>>> = Symbol('isPreview');

/** 调整尺寸方向列表 */
export const RESIZE_DIRS: ValidResizeDirEnum[] = [
  ResizeDirEnum.N,
  ResizeDirEnum.E,
  ResizeDirEnum.S,
  ResizeDirEnum.W,
  ResizeDirEnum.NE,
  ResizeDirEnum.NW,
  ResizeDirEnum.SE,
  ResizeDirEnum.SW,
];

/** 调整尺寸方向对应的 CSS class 后缀 */
export const RESIZE_DIR_CLASS_MAP: Record<ValidResizeDirEnum, string> = {
  [ResizeDirEnum.N]: 'n',
  [ResizeDirEnum.E]: 'e',
  [ResizeDirEnum.S]: 's',
  [ResizeDirEnum.W]: 'w',
  [ResizeDirEnum.NE]: 'ne',
  [ResizeDirEnum.NW]: 'nw',
  [ResizeDirEnum.SE]: 'se',
  [ResizeDirEnum.SW]: 'sw',
};

/** 当前选中元素是否有额外属性配置 */
export const EXTRA_CONFIG_TYPES = [
  CanvasElementTypeEnum.TABLE,
  CanvasElementTypeEnum.TABLE_DATA,
  CanvasElementTypeEnum.TABLE_HEADER_CELL,
  CanvasElementTypeEnum.TABLE_COL_GROUP,
];
