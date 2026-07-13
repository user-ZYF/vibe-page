# VibePage 项目优化规划

将项目优化分为 9 大类共 54 个优化项，涵盖构建配置、依赖瘦身、组件懒加载、响应式性能、代码结构重组、工程化建设、数据结构精简、数据缓存与渲染优化、拖拽与渲染细节优化和资源与内存优化，每个优化项提供详细实施步骤。

---

## 一、构建优化

### 1. Ant Design Vue 按需引入

**目标**：将全量引入改为按需引入，预计减少打包体积 50%+。

**当前问题**：`src/main.ts:7` 全量注册 `app.use(AntDesignVue)`，打包包含所有 antd 组件。

**步骤**：
1. 安装 `unplugin-vue-components` 和 `unplugin-auto-import`：
   ```bash
   pnpm add -D unplugin-vue-components unplugin-auto-import
   ```
2. 在 `vite.config.ts` 中添加插件配置：
   ```ts
   import AutoImport from 'unplugin-auto-import/vite'
   import Components from 'unplugin-vue-components/vite'
   import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
   
   plugins: [
     vue(),
     AutoImport({ resolvers: [AntDesignVueResolver()] }),
     Components({ resolvers: [AntDesignVueResolver(importStyle: 'less')] }),
   ]
   ```
3. 移除 `src/main.ts` 中的全量引入：
   ```ts
   // 删除：import AntDesignVue from 'ant-design-vue'
   // 删除：app.use(AntDesignVue)
   ```
4. 确认 `reset.css` 仍需手动引入（`import 'ant-design-vue/dist/reset.css'` 保留）
5. 检查所有组件中是否存在手动 `import { message, Modal } from 'ant-design-vue'` 的用法，这些需要保留或改为 `unplugin-auto-import` 自动导入
6. 运行 `pnpm dev` 验证所有页面功能正常
7. 运行 `pnpm build` 对比前后打包体积

### 2. Vite 构建配置增强

**目标**：优化 chunk 分割和构建目标，提升缓存利用率和加载性能。

**当前问题**：`vite.config.ts` 无任何 `build` 配置项。

**步骤**：
1. 在 `vite.config.ts` 中添加 `build` 配置：
   ```ts
   build: {
     target: 'es2020',
     rollupOptions: {
       output: {
         manualChunks: {
           'antd-vue': ['ant-design-vue'],
           'highlight': ['highlight.js'],
           'lodash': ['lodash'],
           'vendor': ['vue', 'vue-router', 'pinia', '@vueuse/core'],
         },
       },
     },
   },
   ```
2. 根据实际打包分析结果调整 `manualChunks` 分组
3. 验证构建产物 chunk 分布是否合理

### 3. 添加 gzip/brotli 压缩

**目标**：生成预压缩文件，减少传输体积 60-70%。

**步骤**：
1. 安装压缩插件：
   ```bash
   pnpm add -D vite-plugin-compression
   ```
2. 在 `vite.config.ts` 中添加：
   ```ts
   import compression from 'vite-plugin-compression'
   
   plugins: [
     // ...existing plugins
     compression({ algorithm: 'gzip', ext: '.gz', threshold: 10240 }),
     compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 10240 }),
   ]
   ```
3. 部署环境需配置 nginx/CDN 支持 `.gz` / `.br` 文件响应

### 4. 添加打包分析工具

**目标**：可视化分析打包产物，持续监控体积。

**步骤**：
1. 安装：
   ```bash
   pnpm add -D rollup-plugin-visualizer
   ```
2. 在 `vite.config.ts` 中添加：
   ```ts
   import { visualizer } from 'rollup-plugin-visualizer'
   
   plugins: [
     visualizer({ open: false, filename: 'dist/stats.html', gzipSize: true, brotliSize: true }),
   ]
   ```
3. 在 `package.json` 中添加分析脚本：
   ```json
   "analyze": "vite build --mode analyze"
   ```
4. 运行 `pnpm build` 后打开 `dist/stats.html` 查看分析报告

---

## 二、依赖优化

### 5. lodash 按需引入

**目标**：支持 tree-shaking，减少 lodash 打包体积。

**当前问题**：3 个文件使用 `import { cloneDeep } from 'lodash'`，引入整个 lodash：
- `src/store/canvas.ts:6`
- `src/composables/useCanvasHistory.ts:2`
- `src/constants/style.ts:3`

**步骤**：
1. 安装 `lodash-es`：
   ```bash
   pnpm add lodash-es
   pnpm add -D @types/lodash-es
   ```
2. 全局替换导入语句：
   ```ts
   // 替换前
   import { cloneDeep } from 'lodash'
   // 替换后
   import { cloneDeep } from 'lodash-es'
   ```
3. 检查 `@types/lodash` 是否仍被其他代码使用，若无则可移除
4. 验证 `cloneDeep` 功能正常（特别是 `loadDefaultContent` 中的深层复制）

### 6. 评估 lodash 替换为原生方案

**目标**：完全移除 lodash 依赖，减少 bundle 体积。

**前提条件**：确认项目中 `cloneDeep` 的使用场景仅涉及纯数据对象（无 Date、RegExp、Function 等）。

**步骤**：
1. 全局搜索 `cloneDeep` 调用点，确认传入参数均为纯 JSON-like 数据
2. 将 `cloneDeep` 替换为 `structuredClone`：
   ```ts
   // 替换前
   import { cloneDeep } from 'lodash-es'
   const copy = cloneDeep(obj)
   // 替换后
   const copy = structuredClone(obj)
   ```
3. 移除 lodash / lodash-es / @types/lodash / @types/lodash-es 依赖
4. 运行全功能测试验证

---

## 三、组件懒加载

### 7. 画布元素组件懒加载

**目标**：40 个画布元素组件按需加载，减少首屏 chunk 体积。

**当前问题**：`src/views/Canvas/constants.ts:2-42` 静态导入了全部 40 个组件。

**步骤**：
1. 修改 `src/views/Canvas/constants.ts`，将静态导入改为 `defineAsyncComponent`：
   ```ts
   import { defineAsyncComponent } from 'vue'
   
   export const CanvasElementComponentMap: Record<CanvasElementTypeEnum, Component> = {
     [CanvasElementTypeEnum.CONTAINER]: defineAsyncComponent(() => import('./components/canvas-element/Container.vue')),
     [CanvasElementTypeEnum.PARAGRAPH]: defineAsyncComponent(() => import('./components/canvas-element/Paragraph.vue')),
     // ... 其余 38 个组件同理
   }
   ```
2. 对于高频使用的容器类组件（Container、Root、Text），可考虑保持静态导入
3. 可添加加载 fallback（可选）：
   ```ts
   defineAsyncComponent({
     loader: () => import('./components/canvas-element/Container.vue'),
     loadingComponent: LoadingSpinner,
   })
   ```
4. 验证画布拖拽、渲染功能正常

### 8. Playground 路由懒加载

**目标**：Playground 页面按需加载。

**当前问题**：`src/router/index.ts:4` 静态导入 Playground 组件。

**步骤**：
1. 修改 `src/router/index.ts`：
   ```ts
   // 替换前
   import Playground from '@/views/playground/index.vue'
   // 替换后（删除 import，改为路由级懒加载）
   {
     path: '/playground',
     name: 'playground',
     component: () => import('@/views/playground/index.vue')
   }
   ```

---

## 四、响应式性能优化

### 9. 深度 watch 优化

**目标**：消除对画布整棵树的 `deep: true` 监听，提升大画布时交互性能。

**当前问题**：3 处 `deep: true` watch：

- `src/views/Canvas/components/Canvas.vue:59-65`：监听整个画布树变化用于历史记录
- `src/views/Canvas/components/SelectedElementToolbar.vue:248-256`：监听选中元素变化更新工具栏位置
- `src/views/Canvas/components/style-panel/SettingConfig.vue:245-256`：监听 model 变化同步临时文本

**步骤**：

**Canvas.vue 历史记录 watch**：
1. 在 `useCanvasStore` 的 action 中（如 `addElementToContainer`、`moveElement`、`removeElement`、`duplicateElement` 等）操作完成后，通过事件或回调显式触发 `debouncedRecord`
2. 移除 `Canvas.vue:59-65` 的 `watch(..., { deep: true })`
3. 具体方案：在 store 中添加 `onHistoryRecord` 回调注册机制，或在 `Canvas.vue` 中使用 `watch` 监听 `root.children.length`（浅层）+ store action 显式调用

**SelectedElementToolbar.vue 工具栏位置 watch**：
1. 将 `deep: true` 改为监听具体属性：
   ```ts
   watch(
     [() => selectedElement.value?.styleConfig, () => selectedElement.value?.classes, () => isDragging.value],
     () => { ... },
   )
   ```
2. 或使用 `watchEffect` + 手动指定依赖

**SettingConfig.vue 文本同步 watch**：
1. 将 `deep: true` 改为精确监听具体文本属性：
   ```ts
   watch(
     () => [model.value?.type, getModelText(model.value)],
     () => { ... },
   )
   ```
2. 定义 `getModelText` 辅助函数根据元素类型提取文本

### 10. `convertClassStyles` getter 缓存优化

**目标**：避免 N 个元素 × M 个 class 的重复 `convertStyleConfig` 调用。

**当前问题**：
- `src/store/canvas.ts:41-48`：`convertClassStyles` 是 Pinia getter，每次访问都重新计算所有 class 样式
- `src/composables/useElementStyle.ts:25`：每个元素的 `computed` 都访问 `canvasStore.convertClassStyles`

**步骤**：
1. 将 `convertClassStyles` 从 getter 改为 store 外部的 `computed`：
   ```ts
   // 在 store 外部或 composables 中
   import { computed } from 'vue'
   
   export function useConvertClassStyles() {
     const canvasStore = useCanvasStore()
     return computed(() => {
       const styles = {} as Record<string, Record<string, string>>
       for (const key in canvasStore.classStyles) {
         styles[key] = convertStyleConfig(canvasStore.classStyles[key])
       }
       return styles
     })
   }
   ```
2. 在 `useElementStyle.ts` 中使用该 computed，利用 Vue computed 缓存机制，只有 `classStyles` 变化时才重新计算
3. 或者更简单方案：在 store 中将 `convertClassStyles` 改为 `computed` 并通过 `storeToRefs` 获取（确保缓存生效）

### 11. `markRaw` 包装非响应式对象

**目标**：避免 Pinia 对非响应式逻辑对象做深度代理。

**当前问题**：`src/store/canvas.ts:35` 中 `positioner: new Positioner()` 被 Pinia 深度代理。

**步骤**：
1. 在 `src/store/canvas.ts` 中导入 `markRaw`：
   ```ts
   import { markRaw } from 'vue'
   ```
2. 包装 Positioner 实例：
   ```ts
   positioner: markRaw(new Positioner()),
   ```
3. 检查 store 中是否有其他非响应式对象（如 Map、Set、class 实例），同样用 `markRaw` 包装

### 12. 递归组件添加 `v-memo`

**目标**：避免未变更子树的重新 patch，提升大画布渲染性能。

**当前问题**：`Root.vue:4` 和 `Container.vue:4` 递归渲染子元素时无 `v-memo`。

**步骤**：
1. 在 `Root.vue` 模板中添加 `v-memo`：
   ```vue
   <component
     :is="CanvasElementComponentMap[child.type]"
     v-for="(child, index) in data.children"
     :key="child.id"
     v-model:data="data.children[index]"
     v-memo="[child]"
   />
   ```
2. 在 `Container.vue` 模板中同样添加 `v-memo`
3. 在其他有 `v-for` 渲染子元素的递归组件中（如 `Link.vue`、`Span.vue`、`Form.vue` 等可嵌套组件）也添加
4. 验证拖拽、编辑、删除等操作后渲染正常

---

## 五、代码结构优化

### 13. 拆分 canvas store

**目标**：将 1364 行的 `canvas.ts` 拆分为多个模块，提升可维护性。

**当前问题**：`src/store/canvas.ts` 包含状态定义、30+ 种元素生成逻辑、默认内容加载、树操作等。

**步骤**：
1. 创建 `src/views/Canvas/utils/elementFactory.ts`：
   - 将 `generateElement` 函数（`canvas.ts:98-187`）提取为独立纯函数
   - 将 `generateId`、`nanoid18` 也移入
2. 创建 `src/views/Canvas/utils/treeOperations.ts`：
   - 将 `removeElement`、`moveElement`、`duplicateElement`、`mergeAdjacentTextElements`、`addElementToContainer`、`addElementToContainerAt` 中的核心逻辑提取为纯函数
   - 接收 `root` 参数，返回操作后的新 `root`
3. 创建 `src/views/Canvas/utils/defaultContent.ts`：
   - 将 `loadDefaultContent`（`canvas.ts:391-612+`）及其 20+ 个 `mk*` 工厂函数提取
4. 重构 `canvas.ts` store：
   - state 保持不变
   - actions 调用提取出的纯函数
   - 保持 store API 不变，确保调用方无需修改
5. 验证所有功能正常

### 14. `loadDefaultContent` 提取为独立文件

**目标**：进一步拆分 `loadDefaultContent`，该函数本身数百行。

**注**：此项与 #13 的步骤 3 重合，可合并执行。

**步骤**：
1. 创建 `src/views/Canvas/utils/defaultContent.ts`
2. 将所有 `mk*` 工厂函数（`mkContainer`、`mkParagraph`、`mkButton`、`mkLink` 等 20+ 个）移入
3. 将 `loadDefaultContent` 的具体实现移入，导出为 `createDefaultContent()` 函数
4. store 中的 `loadDefaultContent` action 改为调用 `this.root.children = createDefaultContent()`

---

## 六、数据结构优化

### 17. Heading 元素合并为统一接口

**目标**：消除 6 个完全相同的 Heading 接口定义，减少重复代码和 switch-case 分支。

**当前问题**：`src/views/Canvas/types.ts:649-695` 定义了 `CanvasHeading1Element` ~ `CanvasHeading6Element` 共 6 个接口，结构完全一致，仅 `type` 字段枚举值不同。`generateElement` 的 switch 中也有 6 个仅返回值不同的分支。`CanvasInnerElement` 联合类型包含 6 个 Heading 成员。

**步骤**：
1. 在 `src/views/Canvas/types.ts` 中将 6 个 Heading 接口合并为 1 个：
   ```ts
   /** 画布标题元素（h1-h6） */
   export interface CanvasHeadingElement extends CanvasElementBase {
     /** 元素类型 */
     type: CanvasElementTypeEnum.HEADING_1 | CanvasElementTypeEnum.HEADING_2 | CanvasElementTypeEnum.HEADING_3 | CanvasElementTypeEnum.HEADING_4 | CanvasElementTypeEnum.HEADING_5 | CanvasElementTypeEnum.HEADING_6;
     /** 标题级别 */
     level: 1 | 2 | 3 | 4 | 5 | 6;
     /** 标题文本 */
     text: string;
   }
   ```
2. 删除 `CanvasHeading1Element` ~ `CanvasHeading6Element` 的 6 个独立接口
3. 更新 `CanvasInnerElement` 联合类型：将 6 个 Heading 成员替换为 `CanvasHeadingElement`
4. 更新 `src/store/canvas.ts` 中 `generateElement` 的 switch-case：将 6 个 Heading 分支合并为 1 个：
   ```ts
   case CanvasElementTypeEnum.HEADING_1:
   case CanvasElementTypeEnum.HEADING_2:
   case CanvasElementTypeEnum.HEADING_3:
   case CanvasElementTypeEnum.HEADING_4:
   case CanvasElementTypeEnum.HEADING_5:
   case CanvasElementTypeEnum.HEADING_6: {
     const level = type - CanvasElementTypeEnum.HEADING_1 + 1 as 1|2|3|4|5|6;
     return { ...elBase, level, text: `${['一','二','三','四','五','六'][level-1]}级标题` } as CanvasHeadingElement;
   }
   ```
5. 更新 `loadDefaultContent` 中的 `mkHeading` 返回类型为 `CanvasHeadingElement`
6. 更新 `SettingConfig.vue` 中对 Heading 类型的判断逻辑
7. 运行 `pnpm type:check` 确认类型正确
8. 验证画布中 h1-h6 元素的创建、编辑、代码生成功能正常

### 18. Default Style Config 精简重复定义

**目标**：消除约 25 个完全等于 `DefaultGeneralStyleConfig` 的无意义常量定义，减少 ~200 行重复代码。

**当前问题**：`src/constants/style.ts:646-960` 定义了约 40 个 `Default*StyleConfig` 常量，其中约 25 个（如 `DefaultButtonStyleConfig`、`DefaultParagraphStyleConfig`、`DefaultImageStyleConfig` 等）完全等于 `cloneDeep(DefaultGeneralStyleConfig)`，没有任何样式覆盖。只有 Container、Link、Span、Form、Table、TableData、TableHeaderCell 等少数几个有实际样式覆盖。

**步骤**：
1. 在 `src/constants/style.ts` 中定义 override 合并辅助函数：
   ```ts
   import { merge } from 'lodash-es' // 或使用 structuredClone + 手动合并
   
   /** 基于 GeneralStyleConfig 合并覆盖项，生成元素专属默认样式 */
   function mergeStyleConfig(overrides: DeepPartial<StyleConfig>): StyleConfig {
     return merge(cloneDeep(DefaultGeneralStyleConfig), overrides)
   }
   ```
2. 将有覆盖的常量改用 `mergeStyleConfig`：
   ```ts
   export const DefaultContainerStyleConfig = mergeStyleConfig({
     size: { minHeight: '100', minHeightUnit: SizeUnitEnum.PX, paddingTop: 8, paddingTopUnit: SizeUnitEnum.PX, ... },
   })
   ```
3. 将无覆盖的常量直接在 `DefaultStyleConfigMap` 中使用 `cloneDeep(DefaultGeneralStyleConfig)`，删除独立的常量定义：
   ```ts
   export const DefaultStyleConfigMap: Record<CanvasElementTypeEnum, StyleConfig> = {
     [CanvasElementTypeEnum.BUTTON]: cloneDeep(DefaultGeneralStyleConfig),
     [CanvasElementTypeEnum.CONTAINER]: DefaultContainerStyleConfig,
     [CanvasElementTypeEnum.PARAGRAPH]: cloneDeep(DefaultGeneralStyleConfig),
     // ...
   }
   ```
4. 删除约 25 个无覆盖的独立常量（`DefaultButtonStyleConfig`、`DefaultParagraphStyleConfig`、`DefaultImageStyleConfig` 等）
5. 保留有覆盖的常量（`DefaultContainerStyleConfig`、`DefaultLinkStyleConfig`、`DefaultSpanStyleConfig`、`DefaultFormStyleConfig`、`DefaultTableStyleConfig`、`DefaultTableDataStyleConfig`、`DefaultTableHeaderCellStyleConfig` 等）
6. 运行 `pnpm type:check` 和 `pnpm dev` 验证样式正常

### 19. `isParentElement` 用 Set 重构

**目标**：提升 `isParentElement` 函数可维护性，新增父元素类型时只需加到 Set 中。

**当前问题**：`src/views/Canvas/types.ts:715-717` 用 20+ 个 `||` 条件判断元素是否为父元素，可读性差且新增类型时容易遗漏。

**步骤**：
1. 在 `src/views/Canvas/types.ts` 中定义父元素类型集合：
   ```ts
   /** 可包含子元素的画布元素类型集合 */
   const PARENT_ELEMENT_TYPES = new Set<CanvasElementTypeEnum>([
     CanvasElementTypeEnum.CONTAINER,
     CanvasElementTypeEnum.LINK,
     CanvasElementTypeEnum.FORM,
     CanvasElementTypeEnum.SPAN,
     CanvasElementTypeEnum.UNORDERED_LIST,
     CanvasElementTypeEnum.ORDERED_LIST,
     CanvasElementTypeEnum.LIST_ITEM,
     CanvasElementTypeEnum.TABLE,
     CanvasElementTypeEnum.TABLE_HEAD,
     CanvasElementTypeEnum.TABLE_BODY,
     CanvasElementTypeEnum.TABLE_FOOT,
     CanvasElementTypeEnum.TABLE_ROW,
     CanvasElementTypeEnum.TABLE_DATA,
     CanvasElementTypeEnum.TABLE_HEADER_CELL,
     CanvasElementTypeEnum.TABLE_CAPTION,
     CanvasElementTypeEnum.TABLE_COL_GROUP,
     CanvasElementTypeEnum.HEADER,
     CanvasElementTypeEnum.FOOTER,
     CanvasElementTypeEnum.ARTICLE,
     CanvasElementTypeEnum.SECTION,
     CanvasElementTypeEnum.ASIDE,
   ])
   ```
2. 重写 `isParentElement` 函数：
   ```ts
   export function isParentElement(el: CanvasInnerElement): el is CanvasParentElement {
     return PARENT_ELEMENT_TYPES.has(el.type)
   }
   ```
3. 运行 `pnpm type:check` 确认类型推断正常
4. 验证拖拽、元素嵌套等功能正常

### 20. Heading 组件合并为统一组件

**目标**：消除 6 个完全相同的 Heading Vue 组件，减少重复代码和维护成本。

**当前问题**：`src/views/Canvas/components/canvas-element/Heading1.vue` ~ `Heading6.vue` 共 6 个组件，模板和逻辑完全一致，仅 `<h1>` ~ `<h6>` 标签和类型不同。`CanvasElementComponentMap` 也需注册 6 个映射。

**步骤**：
1. 创建 `src/views/Canvas/components/canvas-element/Heading.vue`：
   ```vue
   <!-- ? 标题元素（h1-h6） -->
   <template>
     <component :is="tag" ref="headingEl" :id="data.id" :data-canvas-id="data.id" :class="data.classes" :style="style" v-editable="{ id: data.id, isPreview, getText: () => data.text, onSave: (v: string) => data.text = v }" @click.stop="handleSelect">{{ data.text }}</component>
   </template>
   ```
2. 在 script 中根据 `data.level` 动态计算 tag：
   ```ts
   const tag = computed(() => `h${data.value.level}`)
   ```
3. 更新 `src/views/Canvas/constants.ts` 中的 `CanvasElementComponentMap`：
   ```ts
   [CanvasElementTypeEnum.HEADING_1]: Heading,
   [CanvasElementTypeEnum.HEADING_2]: Heading,
   // ... HEADING_6 均映射到 Heading
   ```
4. 删除 `Heading1.vue` ~ `Heading6.vue` 共 6 个文件
5. 验证 h1-h6 元素的画布渲染、编辑、代码生成功能正常

### 21. `generateElement` 配置表化

**目标**：将 30+ 个 switch-case 分支替换为配置表驱动，提升可维护性。

**当前问题**：`src/store/canvas.ts:98-187` 的 `generateElement` 函数有 30+ 个 case 分支，每个分支手动构造元素对象，新增元素类型时需修改此函数。

**步骤**：
1. 在 `src/views/Canvas/utils/elementFactory.ts` 中定义元素生成配置表：
   ```ts
   interface ElementGenConfig {
     /** 默认文本内容（若有） */
     defaultText?: string
     /** 默认属性 */
     defaultProps?: Record<string, unknown>
     /** 约束配置 */
     constraints?: { directInclude?: ...; descendantExclude?: ...; descendantInclude?: ... }
     /** 是否为容器 */
     isContainer?: boolean
   }
   
   const ELEMENT_GEN_CONFIG: Record<CanvasInnerElementTypeEnum, ElementGenConfig> = {
     [CanvasElementTypeEnum.BUTTON]: { defaultText: '按钮', defaultProps: { buttonType: ButtonTypeEnum.BUTTON } },
     [CanvasElementTypeEnum.CONTAINER]: { isContainer: true },
     [CanvasElementTypeEnum.LINK]: { isContainer: true, defaultProps: { href: '', target: LinkTargetEnum.SELF }, constraints: { descendantExclude: [...LINK_DESCENDANT_EXCLUDE_TYPES] } },
     // ... 其余元素
   }
   ```
2. 实现 `generateElement` 纯函数，从配置表读取并构造元素对象
3. Heading 元素特殊处理：根据 type 计算 level（配合 #17 的 Heading 合并）
4. store 中的 `generateElement` action 改为调用纯函数
5. 运行 `pnpm type:check` 和功能验证

---

## 七、数据缓存与渲染优化

### 22. 元素 ID 索引缓存

**目标**：将 `getElementById`、`getParentElementId` 等树遍历查找从 O(n) 优化为 O(1)。

**当前问题**：`src/store/canvas.ts:80-96` 的 `getElementById` 和 `getParentElementId` 每次调用都递归遍历整棵树。在拖拽 `handleDragOver`（`LayersPanelItem.vue:263`）中频繁调用 `canvasStore.getElementById`，大画布时性能瓶颈明显。

**步骤**：

1. 在 `src/views/Canvas/utils/treeTraversal.ts` 中新增索引构建函数：
   ```ts
   /** 构建 id → element 索引和 id → parentId 索引 */
   export function buildElementIndex(root: CanvasRootElement): {
     elementMap: Map<string, CanvasElement>
     parentMap: Map<string, string>
   }
   ```
2. 在 `canvas.ts` store 中添加索引状态并维护：
   ```ts
   /** 元素索引缓存（非响应式，markRaw 包装） */
   _elementIndex: markRaw({ elementMap: new Map(), parentMap: new Map() }),
   ```
3. 在每次树变更 action（`addElementToContainer`、`removeElement`、`moveElement`、`duplicateElement`、`loadDefaultContent` 等）执行后重建索引
4. `getElementById` 和 `getParentElementId` 改为从索引读取
5. 验证拖拽、选中、删除等功能正常

### 23. 代码生成结果缓存

**目标**：避免代码预览面板每次打开都重新生成 HTML/CSS。

**当前问题**：`src/composables/useCodeGenerator.ts:15-21` 的 `htmlCode`、`cssCode`、`fullCode` 三个 computed 都递归遍历整棵树。代码预览 Modal 每次打开时触发计算，大画布下有明显延迟。

**步骤**：

1. 评估当前 computed 是否已足够：computed 有缓存机制，只有 `root` 或 `classStyles` 变化时才重新计算
2. 如果预览 Modal 频繁打开关闭导致重复计算，考虑将 `useCodeGenerator` 的结果提升到 store 或父组件级别，避免每次 Modal 挂载时重新创建 computed
3. 可选：对 `generateHtml` 和 `generateCss` 添加输入指纹缓存（`root` 引用不变时直接返回缓存结果）
4. 验证代码预览功能正常

### 24. `useElementStyle` 缓存优化

**目标**：减少 `convertStyleConfig` 的重复调用，利用缓存避免相同输入的重复计算。

**当前问题**：`src/composables/useElementStyle.ts:32` 中每个元素的 `computed` 都调用 `convertStyleConfig(data.value.styleConfig)`。当 N 个元素引用同一个 class 时，`convertClassStyles` getter（#10 已优化）会缓存 class 的转换结果，但元素自身的 `styleConfig` 转换仍是每次重新计算。

**步骤**：
1. 在 `src/utils/styleConfig.ts` 中添加 `convertStyleConfigMemoized` 函数，使用 `WeakMap<StyleConfig, Record<string, string>>` 缓存：
   ```ts
   const styleCache = new WeakMap<StyleConfig, Record<string, string>>()
   
   export function convertStyleConfigMemoized(config: StyleConfig): Record<string, string> {
     const cached = styleCache.get(config)
     if (cached) return cached
     const result = convertStyleConfig(config)
     styleCache.set(config, result)
     return result
   }
   ```
2. 在 `useElementStyle.ts` 中将 `convertStyleConfig` 替换为 `convertStyleConfigMemoized`
3. 在 `codeGenerator.ts` 的 `collectCssRules` 中也使用 memoized 版本
4. 验证样式渲染和代码生成结果一致

### 25. LayersPanel 递归组件 `v-memo`

**目标**：避免层级面板中未变更项的重新渲染。

**当前问题**：`src/views/Canvas/components/LayersPanelItem.vue:76-84` 递归渲染子元素时无 `v-memo`，任何树变更都会导致整个层级面板重新 patch。

**步骤**：
1. 在 `LayersPanelItem.vue` 的子元素 `v-for` 上添加 `v-memo`：
   ```vue
   <LayerItem
     v-for="(child, childIndex) in children"
     :key="child.id"
     :element="child"
     :depth="depth + 1"
     :index="childIndex"
     :parent-id="element.id"
     :ancestor-ids="[...ancestorIds, element.id]"
     v-memo="[child, selectedElementId, expandedKeys, hiddenKeys, draggingId, dropTarget]"
   />
   ```
2. 注意 `v-memo` 依赖数组需包含所有可能影响子项渲染的响应式状态
3. 验证层级面板的选中、展开/折叠、拖拽功能正常

### 26. `removeElement` 不可变更新优化

**目标**：减少 `removeElement` 等树操作中不必要的对象拷贝。

**当前问题**：`src/store/canvas.ts:220-235` 的 `removeElement` 使用 `.filter().map()` 创建新数组和新对象，即使大多数元素未变更也会被复制。`moveElement`、`addElementToContainerAt` 等也有类似模式。

**步骤**：
1. 优化 `removeElement`：仅在找到目标元素的层级创建新数组，未变更层级保持引用不变：
   ```ts
   removeElement(id: string) {
     const removeFromList = (list: CanvasInnerElement[]): CanvasInnerElement[] => {
       if (!list.some(el => el.id === id || (isParentElement(el) && el.children.some(c => c.id === id)))) {
         return list // 未变更，保持引用
       }
       return list.filter(el => el.id !== id).map(el =>
         isParentElement(el) ? { ...el, children: removeFromList(el.children) } : el
       )
     }
     this.root.children = removeFromList(this.root.children)
   }
   ```
2. 类似优化 `moveElement`、`duplicateElement`、`addElementToContainerAt` 中的递归遍历
3. 这与 `v-memo` 配合效果最佳：未变更的子树引用不变，`v-memo` 跳过 patch
4. 验证树操作功能正常

---

## 八、拖拽与渲染细节优化

### 29. Positioner 拖拽过程中重复树遍历

**目标**：消除拖拽 `dragover` 事件中 5 次以上的重复树遍历，大幅提升拖拽性能。

**当前问题**：`src/views/Canvas/drag/Positioner.ts` 的 `compute` 方法在每次 `dragover` 事件中触发 4-5 次独立的树遍历：
- `getCanvasAncestor` → 递归调用 `findParentId`（第 151-163 行）
- `isNearBorder` 判断后再次调用 `findParentId`（第 104 行）
- `getDirectChildren` → 又一次树遍历（第 108 行 → 第 279-296 行）
- `isDescendantOrSelf` → 两次树遍历（第 116 行 → 第 299-331 行）
- `findElementInTree`（第 122 行）→ 再一次遍历

大画布拖拽时，每次 `dragover`（频率约 60fps）都执行 5+ 次完整树遍历。

**步骤**：
1. 配合 #22 的 ID 索引缓存，将 `findParentId` 改为从 `parentMap` 读取
2. `getDirectChildren` 改为从 `elementMap` 读取父元素后直接返回 `children`
3. `isDescendantOrSelf` 改为从 `parentMap` 逐级向上查找，无需两次递归遍历
4. `findElementInTree` 改为从 `elementMap` 直接读取
5. 验证拖拽落点计算功能正常

### 30. `loadDefaultContent` 提取为独立模块

**目标**：将近 1000 行的内联元素创建代码从 store 中提取，恢复 store 的单一职责。

**当前问题**：`src/store/canvas.ts:380-1364` 的 `loadDefaultContent` action 内联了近 1000 行的元素创建代码，包含 20+ 个 `mkXxx` 工厂函数和完整的默认页面结构定义。导致 store 文件高达 1364 行。

**步骤**：
1. 将所有 `mkXxx` 工厂函数提取到 `src/views/Canvas/utils/elementFactory.ts`（与 #21 配合）
2. 将默认页面结构定义提取到 `src/views/Canvas/templates/defaultContent.ts`
3. `loadDefaultContent` 仅调用 `defaultContent.ts` 的导出函数
4. store 文件应缩减至 ~300 行
5. 验证默认内容加载功能正常

### 31. `MarginPaddingIndicator` 过量 `v-bind` 反应式 CSS

**目标**：消除 16+ 个 `v-bind` 反应式 CSS 变量，改用统一的 `:style` 对象。

**当前问题**：`src/views/Canvas/components/MarginPaddingIndicator.vue:191-317` 使用了 16+ 个 `v-bind` 绑定 CSS 属性（`elRect.marginTop`、`elRect.marginBottom` 等），每个 `v-bind` 都会创建一个独立的反应式 CSS 自定义属性。当 `elRect` 变化时（鼠标移入/滚动/resize），16+ 个 CSS 变量同时更新，触发大量样式重算。

**步骤**：
1. 将 `v-bind` 替换为 `:style` 绑定对象，通过 computed 统一计算
2. 将 margin/padding/border 的尺寸数据合并为几个 `style` 对象，减少反应式依赖数量
3. 验证边距指示器的显示和定位正常

### 32. `SettingConfig` 的 `formElementOptions` 递归遍历优化

**目标**：避免每次元素属性变更都触发整棵树的表单元素收集。

**当前问题**：`src/views/Canvas/components/style-panel/SettingConfig.vue:332-349` 的 `formElementOptions` computed 递归遍历整棵画布树收集表单元素。它依赖 `canvasStore.root`，任何元素属性变更（如修改文本、样式）都会触发重新计算，即使树结构未变。

**步骤**：
1. 将表单元素收集逻辑提升到 store 级别，作为 getter
2. 使用 `computed` + 浅层依赖（仅依赖 `root.children` 的结构引用），配合 #26 的不可变更新，确保仅结构变更时才重算
3. 或在 #22 的索引基础上维护一个 `formElementIds` 列表
4. 验证 Label 元素的关联表单选项功能正常

### 33. `LayersPanelItem` 的 `watch(selectedElementId)` 重复触发

**目标**：将 N 个子组件 watcher 合并为 1 个父组件 watcher。

**当前问题**：`src/views/Canvas/components/LayersPanelItem.vue:357-365` 每个 `LayersPanelItem` 实例都注册了 `watch(selectedElementId, ...)`。当画布有 N 个元素时，每次选中元素切换会触发 N 个 watcher，每个 watcher 都执行逻辑判断。大画布下（100+ 元素），这是显著的性能浪费。

**步骤**：
1. 将选中元素的祖先展开逻辑移到 `LayersPanel.vue` 父组件
2. 在父组件中通过 `getElementById` + `getParentElementId` 一次性计算选中元素的所有祖先 id，批量调用 `expandContainer`
3. 删除 `LayersPanelItem` 中的 `watch(selectedElementId)`
4. 验证选中元素时层级面板自动展开祖先功能正常

### 34. `LayersPanelItem` 的 `ancestorIds` 数组每次渲染重建

**目标**：避免模板内联数组创建破坏 `v-memo` 效果。

**当前问题**：`src/views/Canvas/components/LayersPanelItem.vue:83` 的 `:ancestor-ids="[...ancestorIds, element.id]"` 在模板中每次渲染都创建新数组，即使 `ancestorIds` 和 `element.id` 未变。新数组引用导致子组件的 `ancestorIds` prop 永远变化，破坏 `v-memo` 效果。

**步骤**：
1. 将 `ancestorIds` 改为 `computed`，避免模板内联数组创建
2. 或使用 `v-memo` 时将 `ancestorIds` 排除在依赖外（因为祖先 id 列表在运行时不变）
3. 配合 #25 的 `v-memo` 优化
4. 验证层级面板拖拽和选中功能正常

### 35. `NodeRegistry.getCanvasAncestor` 与 `Positioner.findParentId` 逻辑重复

**目标**：消除两处重复的树遍历逻辑，统一使用公共工具函数。

**当前问题**：`src/views/Canvas/drag/NodeRegistry.ts:45-76` 的 `getCanvasAncestor` 内部定义了 `findParentId` 递归遍历函数，与 `src/views/Canvas/drag/Positioner.ts:166-179` 的 `findParentId` 完全相同的逻辑，两处独立维护。

**步骤**：
1. 统一使用 `src/views/Canvas/utils/treeTraversal.ts` 中的公共遍历函数
2. 或配合 #22 的索引缓存，两者都改为从 `parentMap` 读取
3. 删除 `NodeRegistry.getCanvasAncestor` 中的内联 `findParentId`
4. 验证拖拽落点计算功能正常

### 36. `codeGenerator` 的 `buildAttributes` 和 `getElementContent` 配置表化

**目标**：将代码生成中的 40+ 个 switch-case 分支替换为配置表驱动。

**当前问题**：`src/utils/codeGenerator.ts:111-265` 的 `buildAttributes`（30+ 个 case）和 `getElementContent`（10+ 个 case）都使用大型 switch-case，与 #21 中 `generateElement` 的问题相同。新增元素类型时需同时修改三处 switch-case。

**步骤**：

1. 定义 `AttributeConfig` 配置表，声明每种元素类型的属性生成逻辑
2. `buildAttributes` 改为从配置表读取并生成属性字符串
3. `getElementContent` 同理，将文本类元素的 `text` 字段映射为配置
4. 与 #21 的 `elementFactory.ts` 配合，形成统一的元素配置体系
5. 验证代码生成功能正常

### 37. `DragEngine.handleDragOver` 每次事件调用 `getElementById`

**目标**：消除拖拽过程中 60fps 的 `getElementById` 树遍历调用。

**当前问题**：`src/views/Canvas/drag/DragEngine.ts:64` 的 `handleDragOver` 在每次 `dragover` 事件中调用 `canvasStore.getElementById(dragStore.draggingId)`，频率约 60fps。每次调用都触发完整树遍历。

**步骤**：
1. 配合 #22 的 ID 索引缓存，将 `getElementById` 改为 O(1) 查找
2. 或在拖拽开始时（`startDrag`）缓存被拖拽元素的引用到 `dragStore`，拖拽结束后清除
3. 验证拖拽功能正常

### 38. `loadDefaultContent` 中 `cloneDeep` 滥用

**目标**：用轻量拷贝替代 `cloneDeep` 处理简单对象。

**当前问题**：`src/store/canvas.ts:998-1007` 的 `loadDefaultContent` 中对 `labelStyle`、`inputStyle` 等简单对象使用 `cloneDeep`。这些对象是函数内刚创建的纯数据对象，没有循环引用，使用 `structuredClone` 或展开运算符即可，`cloneDeep` 引入了 lodash 深拷贝的额外开销。

**步骤**：
1. 将 `cloneDeep(inputStyle)` 替换为 `{ ...inputStyle, general: { ...inputStyle.general }, size: { ...inputStyle.size }, visual: { ...inputStyle.visual } }` 或 `structuredClone`
2. 同理处理 `cloneDeep(labelStyle)`
3. 评估其他 `cloneDeep` 使用场景，简单对象改用轻量方案
4. 验证默认内容加载功能正常

---

## 九、资源与内存优化

### 39. `SelectedElementToolbar` 的 `v-bind` 反应式 CSS

**目标**：消除 6 个 `v-bind` 反应式 CSS 变量，改用 `:style` 对象。

**当前问题**：`src/views/Canvas/components/SelectedElementToolbar.vue:299-311` 使用了 6 个 `v-bind` 绑定 CSS 属性（`elRect.marginTop`、`elRect.marginLeft`、`elRect.marginRight`、`elRect.marginBottom`、`toolbarTop`、`toolbarRight`）。每次 `elRect` 变化时触发 6 个 CSS 变量更新。

**步骤**：
1. 将 `v-bind` 替换为 `:style` computed 对象
2. 将 margin 和 toolbar 偏移数据合并为几个 style 对象
3. 验证工具栏定位正常

### 40. `vue-draggable-plus` 未使用依赖

**目标**：移除未使用的 `vue-draggable-plus` 依赖，减少安装时间和 bundle 体积。

**当前问题**：`package.json:23` 列出 `vue-draggable-plus` 依赖，但项目中完全未使用（拖拽功能已由原生 HTML5 Drag API + `DragEngine.ts` 实现）。

**步骤**：
1. 运行 `pnpm remove vue-draggable-plus`
2. 全局搜索确认无任何文件引用 `vue-draggable-plus`
3. 验证拖拽功能正常

### 41. `App.vue` 同时导入两套 highlight.js 主题 CSS

**目标**：按需加载 highlight.js 主题 CSS，减少 bundle 体积。

**当前问题**：`src/App.vue:15-16` 以 `?raw` 方式同时导入 `githubLightCss` 和 `githubDarkCss`，两套 CSS 字符串同时打包进 bundle。但同一时刻只有一套生效。

**步骤**：
1. 改为动态导入：
   ```ts
   watch(isDark, async (dark) => {
     const css = dark
       ? (await import('highlight.js/styles/github-dark.css?raw')).default
       : (await import('highlight.js/styles/github.css?raw')).default;
     highlightCss.value = css;
   }, { immediate: true });
   ```
2. 验证主题切换时代码高亮样式正确更新

### 42. `useElementVisibility` 模块级 `originalDisplayMap` 内存泄漏

**目标**：修复元素删除后 `originalDisplayMap` 中的残留条目。

**当前问题**：`src/composables/useElementVisibility.ts:7` 的 `originalDisplayMap` 是模块级 `Map`，元素被隐藏后删除时，其 `display` 原始值仍保留在 Map 中，永远不会被清理。

**步骤**：
1. 在 `onBeforeUnmount` 中添加 `originalDisplayMap.delete(elementId)` 清理逻辑
2. 验证元素隐藏/显示/删除流程正常

### 43. `useElementStyle` 遍历全部 classStyles

**目标**：将 O(N×M) 的 class 样式合并优化为 O(N×K)，K 为元素实际引用的 class 数量。

**当前问题**：`src/composables/useElementStyle.ts:25` 的 `Object.entries(canvasStore.convertClassStyles)` 遍历所有 class 样式（M 个），对每个元素都执行完整遍历。元素自身只引用少数几个 class，但仍需遍历全部。

**步骤**：
1. 改为仅遍历元素自身的 `classes` 数组：
   ```ts
   for (const className of data.value.classes) {
     const classCss = canvasStore.convertClassStyles[className];
     if (classCss) Object.assign(merged, classCss);
   }
   ```
2. 注意：需确保 `convertClassStyles` 中包含所有已启用 class 的条目
3. 验证样式合并结果一致

### 44. `Positioner.getChildNodeInfos` 冗余 `getComputedStyle` 调用

**目标**：消除拖拽过程中 N 次重复的父元素 `getComputedStyle` 调用。

**当前问题**：`src/views/Canvas/drag/Positioner.ts:206-208` 对每个子元素都调用 `getComputedStyle(reg.el)` 和 `getComputedStyle(parentEl)`。`getComputedStyle` 是昂贵的同步操作，父元素样式对所有子元素相同却重复获取 N 次。

**步骤**：
1. 将 `getComputedStyle(parentEl)` 提取到循环外，仅调用一次
2. 验证拖拽落点计算功能正常

### 45. `useDragConnector` 每个元素创建 `isPreview` watcher

**目标**：将 N 个 `isPreview` watcher 合并为 1 个全局 watcher。

**当前问题**：`src/views/Canvas/drag/useDragConnector.ts:42-48` 每个画布元素组件调用 `useDragConnector`，内部创建 `watch(isPreview, ...)`。N 个元素 = N 个 watcher 监听同一个 `isPreview` ref。

**步骤**：
1. 将预览模式切换的绑定/解绑逻辑集中到一个全局 watcher（如在 `DragEngine` 中）
2. 通过遍历 `nodeRegistry.getAll()` 批量绑定/解绑拖拽事件
3. 删除 `useDragConnector` 中的 `watch(isPreview)`
4. 验证预览模式切换时拖拽事件正确绑定/解绑

### 46. `moveElement` 使用 `cloneDeep` 创建临时副本

**目标**：用浅拷贝替代 `cloneDeep` 创建临时元素副本。

**当前问题**：`src/store/canvas.ts:280` 的 `const tempTarget = cloneDeep(target)` 深拷贝整个元素（含所有子元素）仅用于临时 id 替换。深拷贝大子树开销显著。

**步骤**：
1. 使用浅拷贝 + 递归 id 替换替代 `cloneDeep`
2. 或重构 `moveElement` 逻辑避免临时副本（先记录位置再删除再插入，注意索引偏移）
3. 验证元素移动功能正常

### 47. `LayersPanelItem.handleDragOver` 重复调用 `isSubtreeAllowed`

**目标**：缓存 `isSubtreeAllowed` 结果，避免拖拽过程中 60fps 的重复递归遍历。

**当前问题**：`src/views/Canvas/components/LayersPanelItem.vue:283,300,316,343` 单次 `handleDragOver` 中最多调用 4 次 `isSubtreeAllowed`，每次递归遍历拖拽元素的整个子树。

**步骤**：
1. 在 `handleDragStart` 时缓存拖拽元素的类型约束信息
2. 或在 `LayersPanel.vue` 父组件中计算一次 `isSubtreeAllowed` 结果，通过 `provide` 共享
3. 验证层级面板拖拽功能正常

### 48. `Sider.vue` 静态导入并常驻挂载三个面板

**目标**：减少非活跃面板的资源占用。

**当前问题**：`src/views/Canvas/components/Sider.vue:44-46,58-60` 的 `StylePanel`、`LayersPanel`、`ComponentsPanel` 通过静态 import + `v-show` 常驻挂载。即使用户只在 EDIT 面板操作，`ComponentsPanel` 中的 30+ 个拖拽连接器仍然活跃，`LayersPanel` 的递归组件树仍然渲染。

**步骤**：
1. 对 `ComponentsPanel` 和 `LayersPanel` 使用 `defineAsyncComponent` 懒加载
2. 或将 `v-show` 改为 `v-if` + `KeepAlive` 包裹，切换时挂载/卸载但保留内部状态
3. 验证面板切换功能正常

### 49. `playground` 路由静态导入

**目标**：将 playground 页面改为动态导入，减少首屏 bundle 体积。

**当前问题**：`src/router/index.ts:4` 的 `import Playground from '@/views/playground/index.vue'` 静态导入，将 playground 页面打包进主 bundle。

**步骤**：
1. 改为 `component: () => import('@/views/playground/index.vue')` 动态导入
2. 验证路由跳转功能正常

### 50. `MarginPaddingIndicator` `mouseover` 事件过度触发

**目标**：减少 `mouseover` 事件的过度触发和随之的 `getComputedStyle` 调用。

**当前问题**：`src/views/Canvas/components/MarginPaddingIndicator.vue:154` 监听画布根元素的 `mouseover`。由于 `mouseover` 事件会冒泡，鼠标在画布内移动时每个子元素都会触发一次。每次触发都设置 `currentTarget.value`，触发 watch 和 `updateBox`（含 `getComputedStyle`）。

**步骤**：
1. 在 `handleMouseOver` 中检查 `event.target` 是否有 `data-canvas-id` 属性，无则跳过
2. 或对 `handleMouseOver` 添加节流（`throttle` 50ms）
3. 验证边距指示器显示正常

### 51. `ComponentsPanel` 的 `CanvasElementIconMap` 定义为组件内局部常量

**目标**：将 `CanvasElementIconMap` 移至全局常量文件统一管理。

**当前问题**：`src/views/Canvas/components/ComponentsPanel.vue:72-113` 的 `CanvasElementIconMap` 是 40+ 行的静态映射表，定义在 `<script setup>` 内部，每次组件实例创建时都会重新创建该对象。

**步骤**：
1. 将 `CanvasElementIconMap` 移至 `src/constants/home.ts` 或 `src/views/Canvas/constants.ts` 中导出
2. 在 `ComponentsPanel.vue` 中改为 import 引用
3. 验证组件面板图标显示正常

---

### 52. `constants/style.ts` 模块级 30+ 次 `cloneDeep` 调用

**目标**：消除模块加载时 30+ 次不必要的 `cloneDeep` 调用，减少启动开销。

**当前问题**：`src/constants/style.ts:646-964` 在模块加载时执行 30+ 次 `cloneDeep(DefaultGeneralStyleConfig)` 来创建各元素的默认样式配置。其中约 15 个配置完全无覆盖（如 `DefaultButtonStyleConfig`、`DefaultImageStyleConfig`、`DefaultRootStyleConfig` 等），仅是 `...cloneDeep(DefaultGeneralStyleConfig)`。这些配置仅作为模板被 `generateElement` 中的 `cloneDeep` 读取，从不被直接修改，无需独立深拷贝。

**步骤**：
1. 无覆盖的默认配置直接引用 `DefaultGeneralStyleConfig`（或浅拷贝）
2. 有覆盖的配置使用 `structuredClone` 或手动展开替代 `cloneDeep`
3. 与 #18 配合，合并相同的默认配置
4. 验证元素创建功能正常

### 53. `mergeAdjacentTextElements` 全树遍历

**目标**：将全树遍历优化为仅检查受影响容器的直接子元素。

**当前问题**：`src/store/canvas.ts:362-388` 的 `mergeAdjacentTextElements` 在每次 `addElementToContainer`、`addElementToContainerAt`、`moveElement` 后被调用，每次都递归遍历整棵树。实际上只需检查新增/移动元素所在容器的直接子元素列表即可。

**步骤**：
1. 将 `mergeAdjacentTextElements` 改为接受 `containerId` 参数，仅合并指定容器的直接子元素
2. 各调用处传入目标容器 id
3. 验证文本元素合并功能正常

### 54. 画布元素树深度响应式开销

**目标**：评估并实施元素树浅响应式方案，消除大画布下数百个不必要的 reactive proxy。

**当前问题**：`src/store/canvas.ts:19-27` 的 `root` 作为 Pinia state，整个元素树被 Vue 深度代理（deep reactive）。大画布下（100+ 元素），每个元素对象、`styleConfig` 子对象、`children` 数组都被包装为 reactive proxy，产生数百个代理对象。每次树变更都触发深层依赖追踪。

**步骤**：
1. 评估将 `root` 改为 `shallowRef` 的可行性
2. 若可行，所有树变更需通过 store action 整体替换 `root` 引用（而非直接修改属性）
3. 组件中 `v-model:data` 的直接修改模式需调整为 action 调用
4. 此项为架构级重构，建议在 #13（拆分 canvas store）和 #26（不可变更新）完成后评估
5. 验证全部画布交互功能正常

---

## 十、工程化优化

### 27. 添加单元测试

**目标**：为核心工具函数和 composables 添加单元测试。

**步骤**：
1. 安装测试框架：
   ```bash
   pnpm add -D vitest @vue/test-utils jsdom @vitest/coverage-v8
   ```
2. 在 `vite.config.ts` 中添加 test 配置：
   ```ts
   test: {
     environment: 'jsdom',
     globals: true,
     coverage: { provider: 'v8', reporter: ['text', 'html'] },
   }
   ```
3. 在 `package.json` 中添加测试脚本：
   ```json
   "test": "vitest",
   "test:coverage": "vitest run --coverage"
   ```
4. 创建测试目录 `tests/`
5. 编写优先级最高的测试文件：
   - `tests/utils/styleConfig.spec.ts`：测试 `convertStyleConfig` 各种样式组合
   - `tests/composables/useCanvasHistory.spec.ts`：测试撤销/重做边界情况
   - `tests/utils/treeTraversal.spec.ts`：测试 `findElementInTree` 深层嵌套查找
   - `tests/utils/elementFactory.spec.ts`：测试 `generateElement` 各元素类型生成
6. 运行 `pnpm test` 确保全部通过

### 28. TypeScript 严格性增强

**目标**：增强类型检查，提前发现潜在问题。

**当前问题**：`tsconfig.json` 已开启 `strict: true`，但缺少多个增强项。

**步骤**：
1. 在 `tsconfig.json` 的 `compilerOptions` 中添加：
   ```json
   "noUnusedLocals": true,
   "noUnusedParameters": true,
   "noImplicitReturns": true,
   "noFallthroughCasesInSwitch": true,
   "forceConsistentCasingInFileNames": true
   ```
2. 运行 `pnpm type:check` 检查新增的类型错误
3. 逐一修复报告的类型问题：
   - 删除未使用的局部变量和导入
   - 为 switch case 添加 break/return（特别是 `generateElement` 的 30+ case）
   - 确保所有函数路径有返回值
4. 再次运行 `pnpm type:check` 确认零错误

---

## 实施优先级

| 阶段 | 优化项 | 预期收益 | 风险 |
|------|--------|----------|------|
| **P0** | #1 Ant Design 按需引入 | 打包体积减少 50%+ | 中（需验证组件兼容性） |
| **P0** | #5 lodash 按需引入 | 打包体积减少 | 低 |
| **P0** | #7 画布元素组件懒加载 | 首屏加载速度提升 | 低 |
| **P1** | #9 深度 watch 优化 | 大画布交互性能提升 | 中（需验证历史记录触发） |
| **P1** | #10 convertClassStyles 缓存 | 元素多时渲染性能提升 | 低 |
| **P1** | #2 Vite 构建配置增强 | 缓存利用率提升 | 低 |
| **P1** | #17 Heading 元素合并 | 减少 5 个接口 + 5 个 switch-case | 低 |
| **P1** | #18 Default Style Config 精简 | 减少 ~200 行重复代码 | 低 |
| **P1** | #20 Heading 组件合并 | 减少 5 个 Vue 组件文件 | 低 |
| **P1** | #24 useElementStyle 缓存 | 减少 convertStyleConfig 重复调用 | 低 |
| **P2** | #11 markRaw Positioner | 避免不必要代理开销 | 低 |
| **P2** | #12 v-memo 递归组件 | 减少不必要 re-render | 中（需验证拖拽渲染） |
| **P2** | #13 拆分 canvas store | 可维护性提升 | 中（重构范围大） |
| **P2** | #19 isParentElement 用 Set | 可维护性提升 | 极低 |
| **P2** | #21 generateElement 配置表化 | 消除 30+ switch-case | 低 |
| **P2** | #22 元素 ID 索引缓存 | 查找 O(n) → O(1) | 中（需维护索引一致性） |
| **P2** | #25 LayersPanel v-memo | 层级面板渲染优化 | 中（需验证依赖完整性） |
| **P2** | #26 removeElement 不可变更新 | 减少对象拷贝 | 中（需验证引用一致性） |
| **P2** | #28 TS 严格性增强 | 类型安全提升 | 低 |
| **P3** | #3 压缩插件 | 传输体积减少 | 低 |
| **P3** | #4 打包分析工具 | 持续监控 | 低 |
| **P3** | #6 lodash 替换为原生 | 完全移除依赖 | 低 |
| **P3** | #8 Playground 懒加载 | 路由分包 | 低 |
| **P3** | #23 代码生成缓存 | 预览面板打开速度提升 | 低 |
| **P3** | #27 单元测试 | 长期质量保障 | 低 |
| **P1** | #29 Positioner 重复树遍历 | 拖拽性能大幅提升 | 中（依赖 #22） |
| **P1** | #30 loadDefaultContent 提取 | store 文件从 1364 行降至 ~300 行 | 低 |
| **P1** | #31 MarginPaddingIndicator v-bind | 减少 16+ 反应式 CSS 变量 | 低 |
| **P2** | #32 formElementOptions 优化 | 减少不必要的树遍历 | 低 |
| **P1** | #33 LayersPanelItem watch 优化 | N 个 watcher → 1 个 | 低 |
| **P2** | #34 ancestorIds 数组重建 | 配合 v-memo 生效 | 低 |
| **P2** | #35 NodeRegistry 逻辑重复 | 消除重复代码 | 低 |
| **P2** | #36 codeGenerator 配置表化 | 消除 40+ switch-case | 低 |
| **P1** | #37 DragEngine getElementById | 消除 60fps 树遍历 | 中（依赖 #22） |
| **P3** | #38 cloneDeep 滥用 | 减少不必要的深拷贝 | 低 |
| **P2** | #39 SelectedElementToolbar v-bind | 减少 6 反应式 CSS 变量 | 低 |
| **P0** | #40 vue-draggable-plus 移除 | 减少依赖体积 | 低 |
| **P3** | #41 highlight.js CSS 动态导入 | 减少 bundle 体积 | 低 |
| **P2** | #42 originalDisplayMap 内存泄漏 | 修复内存泄漏 | 低 |
| **P1** | #43 useElementStyle 遍历优化 | O(N×M) → O(N×K) | 低 |
| **P1** | #44 getComputedStyle 冗余 | 拖拽性能提升 | 低 |
| **P2** | #45 useDragConnector watcher | N 个 watcher → 1 个 | 低 |
| **P2** | #46 moveElement cloneDeep | 减少深拷贝开销 | 低 |
| **P1** | #47 isSubtreeAllowed 重复调用 | 层级面板拖拽性能提升 | 低 |
| **P2** | #48 Sider 面板懒加载 | 减少非活跃面板资源占用 | 中（需验证状态保留） |
| **P3** | #49 playground 动态导入 | 首屏 bundle 体积减少 | 低 |
| **P1** | #50 mouseover 事件节流 | 减少不必要的重算 | 低 |
| **P3** | #51 CanvasElementIconMap 外移 | 代码组织优化 | 极低 |
| **P2** | #52 style.ts 模块级 cloneDeep | 减少启动时 30+ 次深拷贝 | 低 |
| **P1** | #53 mergeAdjacentTextElements 全树遍历 | 减少添加/移动后的树遍历 | 低 |
| **P3** | #54 元素树深度响应式 | 大画布性能根本性提升 | 高（架构级重构） |
