# 自研画布拖拽引擎设计方案

参考 Craft.js 架构，在保留现有嵌套数组数据结构的前提下，用原生 HTML5 Drag API 完全替换 vue-draggable-plus，实现精确占位线 + Connector 注册系统。

---

## 整体分层

```
DragEngine（事件协调，类比 DefaultEventHandlers）
  └── Positioner（落点计算，类比 Positioner + findPosition）
        └── Indicator（占位线渲染，类比 RenderEditorIndicator）
  └── dragStore（Pinia，管理拖拽状态）
  └── useDragConnector（Vue composable，替代 connect connector）
```

---

## 一、dragStore（Pinia）

**文件**：`src/store/drag.ts`

```ts
interface DragState {
  /** 正在被拖拽的元素 id（null = 未在拖拽） */
  draggingId: string | null;
  /** 当前拖拽来源类型 */
  dragSourceType: 'existing' | 'new' | null;
  /** 新组件类型（来自面板时） */
  dragNewType: CanvasElementTypeEnum | null;
  /** 当前计算出的落点 Indicator */
  indicator: DropIndicator | null;
}

interface DropIndicator {
  /** 目标父容器 id（null = 根画布） */
  parentId: string | null;
  /** 插入位置 index */
  index: number;
  /** before / after */
  where: 'before' | 'after';
  /** 占位线几何信息（供 CSS 定位） */
  rect: { top: number; left: number; width: number; height: number };
  /** 是否为非法落点 */
  error: boolean;
}

actions:
  - startDrag(id, type)      // 开始拖拽已有元素
  - startNewDrag(newType)    // 从面板拖入新组件
  - setIndicator(indicator)  // 更新占位线
  - endDrag()                // 清除所有拖拽状态
```

同时将 `isDragging` 从 `canvasStore` 迁移到 `dragStore`（`computed: isDragging = draggingId !== null`）。

---

## 二、类型定义

**文件**：`src/views/Canvas/drag/types.ts`

```ts
/** 单个子元素的几何维度（复用于 findDropPosition） */
interface NodeInfo {
  id: string;
  top: number;
  left: number;
  outerWidth: number;
  outerHeight: number;
  bottom: number;
  inFlow: boolean;  // 是否在文档流中（非 float/absolute）
}

/** 落点位置 */
interface DropPosition {
  parentId: string | null;
  index: number;
  where: 'before' | 'after';
}

/** DOM 节点注册信息 */
interface NodeRegistration {
  id: string;
  el: HTMLElement;
  isCanvas: boolean;  // 是否为可接收子元素的容器
}
```

---

## 三、NodeRegistry（DOM 注册表）

**文件**：`src/views/Canvas/drag/NodeRegistry.ts`

替代 Craft.js 中 `store.actions.setDOM(id, el)` 的功能。

```ts
class NodeRegistry {
  private map: Map<string, NodeRegistration>

  register(id: string, el: HTMLElement, isCanvas: boolean): void
  unregister(id: string): void
  get(id: string): NodeRegistration | undefined
  getAll(): NodeRegistration[]

  /** 根据 DOM 元素向上查找最近的注册节点 */
  getNodeFromElement(el: HTMLElement): NodeRegistration | undefined

  /** 获取最近的 isCanvas 祖先节点 */
  getCanvasAncestor(id: string, nodes: CanvasElement[]): string | null
}

/** 全局单例，通过 provide/inject 注入 */
export const nodeRegistry = new NodeRegistry()
```

---

## 四、Positioner（落点计算）

**文件**：`src/views/Canvas/drag/Positioner.ts`

```ts
class Positioner {
  static BORDER_OFFSET = 10

  compute(
    dropTargetId: string | null,
    x: number,
    y: number,
    elements: CanvasElement[],
    registry: NodeRegistry,
    draggingId: string | null
  ): DropIndicator | null

  private getCanvasAncestor(id: string | null, elements: CanvasElement[], registry: NodeRegistry): string | null

  private isNearBorder(el: HTMLElement, x: number, y: number): boolean

  private getChildNodeInfos(parentId: string | null, elements: CanvasElement[], registry: NodeRegistry): NodeInfo[]

  private canDrop(parentId: string | null, draggingId: string | null, elements: CanvasElement[]): boolean
}

/** findDropPosition —— 纯函数，根据子元素维度数组和鼠标坐标计算插入位置 */
function findDropPosition(dims: NodeInfo[], x: number, y: number): { index: number; where: 'before' | 'after' }
```

`findDropPosition` 逻辑（同 Craft.js / GrapesJS）：
- 正常流元素：以 `yCenter` 为分界，鼠标在上半 = before，下半 = after
- float 元素：以 `xCenter` 为分界

---

## 五、DragEngine（事件协调中心）

**文件**：`src/views/Canvas/drag/DragEngine.ts`

类比 Craft.js 的 `DefaultEventHandlers`，管理所有 drag 事件的注册与清理。

```ts
class DragEngine {
  private positioner: Positioner
  private registry: NodeRegistry
  private store: ReturnType<typeof useCanvasStore>
  private dragStore: ReturnType<typeof useDragStore>

  /** 绑定「可拖拽已有元素」的事件 */
  connectDraggable(el: HTMLElement, id: string): () => void
    // dragstart: dragStore.startDrag(id)
    //            createShadow(e, el)
    //            el.setAttribute('draggable', 'true')
    // dragend:   dropExisting() → canvasStore.moveElement(...)
    //            dragStore.endDrag()

  /** 绑定「可接收放置」容器的事件 */
  connectDroppable(el: HTMLElement, id: string | null): () => void
    // dragover:  indicator = positioner.compute(id, e.clientX, e.clientY, ...)
    //            dragStore.setIndicator(indicator)
    // dragenter: e.preventDefault()

  /** 绑定「组件面板」新组件的拖出事件 */
  connectCreate(el: HTMLElement, type: CanvasElementTypeEnum): () => void
    // dragstart: dragStore.startNewDrag(type)
    //            createShadow(e, el)
    // dragend:   dropNew() → canvasStore.addElement / addElementToContainer
    //            dragStore.endDrag()

  private dropExisting(): void   // 读取 dragStore.indicator，执行 moveElement
  private dropNew(): void        // 读取 dragStore.indicator，执行 addElement
}

/** 全局单例 */
export const dragEngine = new DragEngine()
```

---

## 六、createShadow（拖影）

**文件**：`src/views/Canvas/drag/createShadow.ts`（直接参考 Craft.js 实现）

```ts
function createShadow(e: DragEvent, el: HTMLElement): HTMLElement
  // 克隆 el，position: absolute, left: -100%, top: -100%
  // e.dataTransfer.setDragImage(shadow, 0, 0)
  // 返回 shadow 供 dragend 时移除
```

---

## 七、useDragConnector（Vue Composable）

**文件**：`src/views/Canvas/drag/useDragConnector.ts`

每个画布元素组件在 `onMounted` 调用，`onUnmounted` 清理，类比 Craft.js 的 `.connect()` connector。

```ts
function useDragConnector(
  el: Ref<HTMLElement | undefined>,
  id: string,
  options: { isCanvas?: boolean }
) {
  onMounted(() => {
    // 1. 注册 DOM 到 registry
    nodeRegistry.register(id, el.value!, options.isCanvas ?? false)
    // 2. 绑定可拖拽
    const unbindDrag = dragEngine.connectDraggable(el.value!, id)
    // 3. 若为容器，绑定可放置
    const unbindDrop = options.isCanvas
      ? dragEngine.connectDroppable(el.value!, id)
      : () => {}

    onUnmounted(() => {
      unbindDrag()
      unbindDrop()
      nodeRegistry.unregister(id)
    })
  })
}
```

**根画布**的 `Canvas.vue` 也调用 `connectDroppable(el, null)`（`null` 代表根层级）。

---

## 八、DropIndicatorOverlay（占位线组件）

**文件**：`src/views/Canvas/components/DropIndicatorOverlay.vue`

```vue
<!-- position: fixed，通过 dragStore.indicator 的 rect 定位 -->
<template>
  <div v-if="indicator" class="drop-indicator" :style="indicatorStyle" />
</template>
```

渲染规则（同 Craft.js `movePlaceholder`）：
- 水平排列（非 inFlow）：竖线，`width: 2px, height: elHeight`
- 垂直排列（inFlow）：横线，`height: 2px, width: elWidth`

---

## 九、canvasStore 新增 action

**文件**：`src/store/canvas.ts`（补充）

```ts
/** 移动已有元素（跨容器） */
moveElement(
  id: string,
  targetParentId: string | null,
  index: number
): void
// 实现：先从原位置 remove，再插入到 targetParentId 的 children[index]
// targetParentId = null 表示插入根 elements
```

---

## 十、改造步骤（实施顺序）

1. **新增** `src/store/drag.ts`（DragState + actions）
2. **新增** `src/views/Canvas/drag/types.ts`（类型定义）
3. **新增** `src/views/Canvas/drag/NodeRegistry.ts`
4. **新增** `src/views/Canvas/drag/createShadow.ts`
5. **新增** `src/views/Canvas/drag/Positioner.ts`（含 `findDropPosition`）
6. **新增** `src/views/Canvas/drag/DragEngine.ts`
7. **新增** `src/views/Canvas/drag/useDragConnector.ts`
8. **新增** `src/views/Canvas/components/DropIndicatorOverlay.vue`
9. **改造** `src/store/canvas.ts`：添加 `moveElement` action
10. **改造** `Canvas.vue`：移除 `useDraggable`，调用 `connectDroppable(null)` + 渲染 `DropIndicatorOverlay`
11. **改造** 每个画布元素组件（`Container.vue` / `Button.vue` 等）：移除 `useDraggable`，调用 `useDragConnector`
12. **改造** `ComponentsPanel.vue`：移除 `VueDraggable`，调用 `connectCreate`
13. 移除 `vue-draggable-plus` 依赖，删除 `CANVAS_DRAG_GROUP` / `PANEL_DRAG_GROUP`

---

## 关键设计决策

| 决策点 | 选择 | 原因 |
|---|---|---|
| 数据结构 | 保留嵌套数组 | 与现有 store 兼容，减少改动范围 |
| 拖拽 API | 原生 HTML5 drag | 与 Craft.js 一致，有 setDragImage |
| DOM 注册 | 全局 NodeRegistry 单例 | 避免 provide/inject 层层传递 |
| 落点计算 | Positioner 独立类 | 可单元测试，与 Vue 解耦 |
| 占位线渲染 | `position: fixed` Vue 组件 | 不污染 DOM 树，Pinia 驱动重渲染 |
| 事件清理 | composable onUnmounted 自动解绑 | 防止内存泄漏 |
