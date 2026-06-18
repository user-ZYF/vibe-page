import { Component } from "vue";
import Container from "./components/canvas-element/Container.vue";
import Link from "./components/canvas-element/Link.vue";
import Image from "./components/canvas-element/Image.vue";
import Button from "./components/canvas-element/Button.vue";
import { CanvasElementTypeEnum } from "@/constants/home.ts";
import Paragraph from "./components/canvas-element/Paragraph.vue";

/** 组件映射 */
export const CanvasElementComponentMap: Record<CanvasElementTypeEnum, Component | null> = {
    [CanvasElementTypeEnum.UNDEFINED]: null,
    [CanvasElementTypeEnum.CONTAINER]: Container,
    [CanvasElementTypeEnum.PARAGRAPH]: Paragraph,
    [CanvasElementTypeEnum.LINK]: Link,
    [CanvasElementTypeEnum.IMAGE]: Image,
    [CanvasElementTypeEnum.BUTTON]: Button
};