import { Component } from "vue";
import Container from "./components/canvas-element/Container.vue";
import Link from "./components/canvas-element/Link.vue";
import Image from "./components/canvas-element/Image.vue";
import Button from "./components/canvas-element/Button.vue";
import { CanvasElementTypeEnum } from "@/constants/home.ts";
import Paragraph from "./components/canvas-element/Paragraph.vue";
import Root from "./components/canvas-element/Root.vue";
import type { InjectionKey, Ref } from 'vue';
import { LayersDropTarget } from "./types.ts";

/** 组件映射 */
export const CanvasElementComponentMap: Record<CanvasElementTypeEnum, Component> = {
    [CanvasElementTypeEnum.CONTAINER]: Container,
    [CanvasElementTypeEnum.PARAGRAPH]: Paragraph,
    [CanvasElementTypeEnum.LINK]: Link,
    [CanvasElementTypeEnum.IMAGE]: Image,
    [CanvasElementTypeEnum.BUTTON]: Button,
    [CanvasElementTypeEnum.ROOT]: Root
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