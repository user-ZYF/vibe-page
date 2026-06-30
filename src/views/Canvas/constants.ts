import { Component } from "vue";
import Container from "./components/canvas-element/Container.vue";
import Link from "./components/canvas-element/Link.vue";
import Image from "./components/canvas-element/Image.vue";
import Button from "./components/canvas-element/Button.vue";
import { CanvasElementTypeEnum } from "@/constants/home.ts";
import Paragraph from "./components/canvas-element/Paragraph.vue";
import Root from "./components/canvas-element/Root.vue";
import Input from "./components/canvas-element/Input.vue";
import Textarea from "./components/canvas-element/Textarea.vue";
import Radio from "./components/canvas-element/Radio.vue";
import Checkbox from "./components/canvas-element/Checkbox.vue";
import Video from "./components/canvas-element/Video.vue";
import Audio from "./components/canvas-element/Audio.vue";
import Label from "./components/canvas-element/Label.vue";
import Form from "./components/canvas-element/Form.vue";
import Span from "./components/canvas-element/Span.vue";
import Text from "./components/canvas-element/Text.vue";
import UnorderedList from "./components/canvas-element/UnorderedList.vue";
import OrderedList from "./components/canvas-element/OrderedList.vue";
import ListItem from "./components/canvas-element/ListItem.vue";
import Table from "./components/canvas-element/Table.vue";
import TableHead from "./components/canvas-element/TableHead.vue";
import TableBody from "./components/canvas-element/TableBody.vue";
import TableFoot from "./components/canvas-element/TableFoot.vue";
import TableRow from "./components/canvas-element/TableRow.vue";
import TableData from "./components/canvas-element/TableData.vue";
import TableHeaderCell from "./components/canvas-element/TableHeaderCell.vue";
import TableCaption from "./components/canvas-element/TableCaption.vue";
import TableColGroup from "./components/canvas-element/TableColGroup.vue";
import TableCol from "./components/canvas-element/TableCol.vue";
import Header from "./components/canvas-element/Header.vue";
import Footer from "./components/canvas-element/Footer.vue";
import Article from "./components/canvas-element/Article.vue";
import Section from "./components/canvas-element/Section.vue";
import Aside from "./components/canvas-element/Aside.vue";
import Heading1 from "./components/canvas-element/Heading1.vue";
import Heading2 from "./components/canvas-element/Heading2.vue";
import Heading3 from "./components/canvas-element/Heading3.vue";
import Heading4 from "./components/canvas-element/Heading4.vue";
import Heading5 from "./components/canvas-element/Heading5.vue";
import Heading6 from "./components/canvas-element/Heading6.vue";
import type { InjectionKey, Ref } from 'vue';
import { LayersDropTarget, ValidResizeDirEnum } from "./types.ts";
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
    [CanvasElementTypeEnum.HEADING_1]: Heading1,
    [CanvasElementTypeEnum.HEADING_2]: Heading2,
    [CanvasElementTypeEnum.HEADING_3]: Heading3,
    [CanvasElementTypeEnum.HEADING_4]: Heading4,
    [CanvasElementTypeEnum.HEADING_5]: Heading5,
    [CanvasElementTypeEnum.HEADING_6]: Heading6,
};

/** 展开的元素id列表 */
export const EXPANDED_KEYS: InjectionKey<Ref<string[]>> = Symbol('expandedKeys');

/** 切换容器展开/收起 */
export const TOGGLE_EXPAND_KEY: InjectionKey<(id: string) => void> = Symbol('toggleExpand');

/** 展开元素 */
export const EXPAND_CONTAINER_KEY: InjectionKey<(id: string) => void> = Symbol('expandContainer');

/** 拖拽中的元素id */
export const DRAGGING_ID_KEY: InjectionKey<Ref<string | null>> = Symbol('draggingId');

/** 落点元素id */
export const DROP_TARGET_KEY: InjectionKey<Ref<LayersDropTarget | null>> = Symbol('dropTarget');

/** 设置拖拽中的元素id */
export const SET_DRAGGING_ID_KEY: InjectionKey<(id: string | null) => void> = Symbol('setDraggingId');

/** 设置落点元素id */
export const SET_DROP_TARGET_KEY: InjectionKey<(target: LayersDropTarget | null) => void> = Symbol('setDropTarget');

/** 执行移动 */
export const EXECUTE_MOVE_KEY: InjectionKey<() => void> = Symbol('executeMove');

/** 隐藏的元素id列表 */
export const HIDDEN_KEYS: InjectionKey<Ref<string[]>> = Symbol('hiddenKeys');

/** 切换元素显示/隐藏 */
export const TOGGLE_SHOW_KEY: InjectionKey<(id: string) => void> = Symbol('toggleShow');

/** 是否处于预览模式 */
export const IS_PREVIEW_KEY: InjectionKey<Readonly<Ref<boolean>>> = Symbol('isPreview');

/** 边缘检测阈值（px） */
export const EDGE_THRESHOLD = 8;

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
