# GrapesJS 画布元素 → HTML+CSS 代码生成机制分析

## 一、整体架构概览

GrapesJS 将画布中的可视化元素渲染为 HTML+CSS 代码，涉及三个核心模块的协作：

```
用户拖拽编辑 → Component 模型更新 → HtmlGenerator/CssGenerator → HTML/CSS 字符串
```

核心模块关系：

- **DomComponents**：维护一棵 Component 树，每个节点存储标签、属性、样式、子节点
- **HtmlGenerator**：遍历 Component 树，递归生成 HTML
- **CssComposer**：管理所有 CssRule（选择器+样式块），样式变更时同步更新规则
- **CssGenerator**：收集内联样式和类名，匹配 CssRule 并输出 CSS
- **CssRule**：单条规则，包含 selectors + style，支持 @media、:hover 等

---

## 二、画布元素数据结构 (Component)

### 2.1 Component 模型核心属性

每个画布上的元素都是一个 `Component` 实例，它是一个树形结构节点：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `string` | `''` | 组件类型，如 `text`、`image`、`video`、`link` 等 |
| `tagName` | `string` | `'div'` | 对应的 HTML 标签名 |
| `attributes` | `Record<string, any>` | `{}` | HTML 属性键值对，如 `{ id: 'myid', title: 'Hello', src: '...' }` |
| `name` | `string` | `''` | 组件显示名称，用于图层面板和徽章 |
| `content` | `string` | `''` | 组件内部文本内容（不被转义），在无子组件时作为 innerHTML |
| `style` | `string \| Record<string, any>` | `''` | 组件默认内联样式，如 `{ color: 'red', 'font-size': '16px' }` |
| `styles` | `string` | `''` | 组件关联的 CSS 规则字符串，如 `.my-class { color: red }` |
| `classes` | `Selectors` | `''` | 组件绑定的 CSS class 选择器集合 |
| `components` | `Components` | `null` | 子组件集合，形成树形嵌套结构 |
| `traits` | `Traits` | `['id', 'title']` | 可编辑的特性（如 id、title），在设置面板中展示 |
| `void` | `boolean` | `false` | 是否为自闭合标签（如 `<br/>`、`<img/>`、`<hr/>`） |
| `removable` | `boolean` | `true` | 是否可从画布中删除 |
| `draggable` | `boolean \| string \| Function` | `true` | 是否可拖拽，支持 CSS 选择器字符串或函数 |
| `droppable` | `boolean \| string \| Function` | `true` | 是否可接受其他组件拖入 |
| `copyable` | `boolean` | `true` | 是否可克隆 |
| `stylable` | `boolean \| string[]` | `true` | 是否可编辑样式，可传 CSS 属性名数组限制可编辑属性 |
| `editable` | `boolean` | `false` | 是否可编辑内容（文本组件使用） |
| `resizable` | `boolean \| ResizerOptions` | `false` | 是否可调整大小 |
| `selectable` | `boolean` | `true` | 是否可被点击选中 |
| `hoverable` | `boolean` | `true` | 是否在悬停时显示高亮边框 |
| `locked` | `boolean` | `undefined` | 是否锁定（锁定后不可选中自身及子组件） |
| `layerable` | `boolean` | `true` | 是否在图层面板中显示 |
| `highlightable` | `boolean` | `true` | 是否可被高亮（虚线边框） |
| `badgable` | `boolean` | `true` | 是否显示名称徽章 |
| `script` | `string \| Function` | `''` | 组件关联的 JavaScript 脚本 |
| `propagate` | `string[]` | `[]` | 需要传递给子组件的属性名数组 |
| `toolbar` | `ToolbarButtonProps[]` | `null` | 选中时工具栏显示的按钮配置 |
| `delegate` | `ComponentDelegateProps` | `null` | 将命令（删除/移动/复制/选中）委托给其他组件 |

### 2.2 组件树结构示例

```json
{
  "type": "wrapper",
  "tagName": "body",
  "attributes": { "id": "ibody" },
  "style": { "background-color": "#f5f5f5" },
  "classes": [{ "name": "page-wrapper", "type": 2 }],
  "components": [
    {
      "type": "text",
      "tagName": "section",
      "attributes": { "id": "iabc" },
      "style": { "padding": "40px", "text-align": "center" },
      "classes": [{ "name": "hero-section", "type": 2 }],
      "components": [
        {
          "type": "text",
          "tagName": "h1",
          "content": "Hello World",
          "style": { "color": "#333", "font-size": "32px" }
        },
        {
          "type": "text",
          "tagName": "p",
          "content": "This is a paragraph.",
          "style": { "color": "#666", "font-size": "16px" }
        }
      ]
    }
  ]
}
```

### 2.3 样式存储机制

Component 继承自 `StyleableModel`，样式的存储和读取通过以下方式：

- **内联样式**：存储在 `style` 属性中，是一个 `{ 属性名: 属性值 }` 的对象
- **CSS 类**：存储在 `classes` 属性中，是一个 `Selectors` 集合，每个 Selector 有 `name`（类名）和 `type`（1=ID, 2=Class, 3=Tag）
- **关联 CSS 规则**：存储在 `styles` 属性中，是一个 CSS 字符串，组件初始化时会被解析为 `CssRule` 并加入 `CssComposer`

---

## 三、HTML 代码生成机制

### 3.1 入口：CodeManager.getCode()

```typescript
// 调用方式
editor.getHtml();   // → CodeManager.getCode(wrapper, 'html')
editor.getCss();    // → CodeManager.getCode(wrapper, 'css')
```

`CodeManager` 维护一个生成器注册表，默认注册了四个生成器：

| 生成器 ID | 类 | 用途 |
|-----------|-----|------|
| `html` | `HtmlGenerator` | 生成 HTML 字符串 |
| `css` | `CssGenerator` | 生成 CSS 字符串 |
| `json` | `JsonGenerator` | 生成 JSON 数据 |
| `js` | `JsGenerator` | 生成 JS 代码 |

### 3.2 HtmlGenerator.build() 流程

`HtmlGenerator` 的核心逻辑是对 `Component.toHTML()` 的封装调用：

1. **cleanId 处理**（可选）：如果启用 `cleanId`，会先收集所有 CSS 规则中用到的 ID 选择器，然后注入自定义 attributes 函数，自动删除无用的自动生成 ID（自动生成的 ID 以 `i` 开头，且不在任何 CSS 规则中被引用）
2. **调用 `wrapper.toHTML(opts)`**：将整个组件树渲染为 HTML 字符串

### 3.3 Component.toHTML() 递归渲染

这是 HTML 生成的核心方法，对组件树进行深度优先遍历：

**步骤 1：获取 tagName**（默认 `'div'`）

**步骤 2：序列化属性字符串 `__attrToString(opts)`**
- 调用 `getAttrToHTML()` 获取 attributes 对象
- 如果配置了 `avoidInlineStyle`，删除 `style` 属性（样式走 CSS 类）
- 如果 `opts.attributes` 是函数，调用它动态生成属性
- 如果 `opts.attributes` 是对象，直接替换
- 如果 `opts.withProps = true`，将组件属性序列化为 `data-gjs-*` 属性（如 `data-gjs-type="text"`）
- 遍历属性对象拼接为 HTML 属性字符串：布尔值 `true` 仅输出属性名，字符串值输出 `attr="value"`（特殊字符转义）

**步骤 3：获取内部 HTML `getInnerHTML(opts)`**
- 如果有子组件 → 递归调用每个子组件的 `toHTML()`，拼接结果
- 如果无子组件 → 返回 `content` 属性值（纯文本内容）

**步骤 4：拼接最终 HTML**
- 自闭合标签（`void=true` 且无内容）：`<tag attr1="v1"/>`
- 普通标签：`<tag attr1="v1">innerHTML</tag>`

**渲染示例**：

输入 Component:
- `tagName: "section"`, `attributes: { "class": "hero" }`
- `style: { "padding": "40px" }`
- 子组件：`{ tagName: "h1", content: "Hello", style: { "color": "red" } }`

输出 HTML:
```html
<section class="hero" style="padding:40px;">
  <h1 style="color:red;">Hello</h1>
</section>
```

---

## 四、CSS 代码生成机制

CSS 生成比 HTML 复杂，因为它需要同时处理**内联样式**和**CSS 规则系统**。

### 4.1 CssComposer — CSS 规则管理器

`CssComposer` 维护一个 `CssRules` 集合，存储所有 CSS 规则。每个规则的数据结构：

| 属性 | 类型 | 说明 |
|------|------|------|
| `selectors` | `Selector[]` | 选择器数组，如 `[.my-class, #my-id]` |
| `style` | `Record<string, any>` | 样式声明，如 `{ color: 'red', width: '100px' }` |
| `selectorsAdd` | `string` | 附加选择器字符串 |
| `atRuleType` | `string` | @规则类型，如 `'media'`、`'font-face'` |
| `mediaText` | `string` | @media 参数，如 `'(max-width: 768px)'` |
| `singleAtRule` | `boolean` | 单一样式 at-rule（如 @font-face 只有样式声明没有选择器） |
| `state` | `string` | 伪类状态，如 `'hover'`、`'focus'` |
| `important` | `boolean \| string[]` | `!important` 标记 |
| `stylable` | `boolean` | 是否可在编辑器中编辑 |
| `shallow` | `boolean` | 是否跳过 JSON 存储和 CSS 导出 |

**规则查找与去重**：`CssComposer` 使用缓存 Map，以 `atRuleKey__selectorsKey` 为键，确保相同选择器+状态+媒体查询的组合只存在一条规则。

### 4.2 CssGenerator.build() 流程

CSS 生成分两个阶段：

**阶段一：`buildFromModel(wrapper)` — 收集内联样式和类名**

递归遍历整个 Component 树：
- 收集所有组件的 ID → `this.ids.push('#iabc')`
- 收集所有组件的 class → `this.compCls.push('.my-class')`
- 如果未启用 `avoidInlineStyle` 且有内联样式，生成 `#id{style}` 格式的内联样式规则（如 `#iabc{padding:40px;text-align:center;}`）

**阶段二：遍历 CssComposer 中的所有 CssRule**

对每条规则调用 `buildFromRule(rule, dump, opts)`：
- 提取规则的选择器字符串
- 检查选择器是否匹配阶段一收集的 `compCls` 或 `ids`
  - 匹配 → 调用 `rule.getDeclaration()` 输出 CSS 声明块
  - 不匹配 → 推入 `dump` 数组（待清理的未使用规则）
- 如果规则包含 `@media`：按 atRule 分组，排序后包裹在 `@media{}` 中输出。排序规则为 mobile-first（min-width 从小到大）
- 如果 `opts.onlyMatched = true`：使用 DOM `element.matches()` 精确匹配规则
- 如果 `opts.clearStyles = true`：从 CssComposer 中移除 dump 中的未使用规则

### 4.3 CssRule.toCSS() — 单条规则渲染

1. **`getAtRule()`**：生成 @规则前缀，如 `@media (max-width: 768px)`
2. **`getDeclaration(opts)`**：生成声明块
   - `selectorsToString()`：生成选择器字符串，如 `.my-class:hover, #my-id`
   - `styleToString()`：遍历 style 对象，拼接为 `"prop:value;prop:value;"`，支持 `!important` 标记，跳过以 `__` 开头的私有属性
   - 拼接：`selectors{style}`，如 `.my-class:hover{color:red;font-size:16px;}`
3. 如果有 @规则 → `@media (...) { selectors{style} }`，否则直接 `selectors{style}`

### 4.4 CSS 生成完整示例

**输入**：

Component 树:
```
wrapper#ibody
  └─ section#iabc (.hero-section)
       ├─ h1#ixyz → content: "Hello", style: { color: "red" }
       └─ p#iuvw → content: "World"
```

CssComposer 中的规则:
1. `selectors: [.hero-section]`, `style: { padding: "40px", background: "#fff" }`
2. `selectors: [.hero-section]`, `state: "hover"`, `style: { background: "#eee" }`
3. `selectors: [.hero-section]`, `mediaText: "(max-width: 768px)"`, `style: { padding: "20px" }`

**输出 CSS**：

```css
#ibody{}
#iabc{}
#ixyz{color:red;}
#iuvw{}

.hero-section{padding:40px;background:#fff;}
.hero-section:hover{background:#eee;}
@media (max-width: 768px){
  .hero-section{padding:20px;}
}
```

---

## 五、完整数据流：从画布编辑到代码导出

### 5.1 编辑阶段

当用户在画布中拖入一个 Section 块：

1. `DomComponents.addComponent()` 创建 Component 实例
2. 解析 `styles` 属性，生成 `CssRule` 加入 `CssComposer`
3. 触发 `'component:add'` 事件
4. 渲染到画布 DOM

当用户修改样式（如设置 `padding: 40px`）：

1. StyleManager 调用 `component.setStyle({ padding: '40px' })`
2. 更新 `component.attributes.style`
3. 同步到对应的 `CssRule`（通过 ID 选择器如 `#iabc`）
4. 触发 `'component:styleUpdate'` 事件
5. 实时更新画布 DOM 的 style 属性

### 5.2 导出阶段

**HTML 导出**（`editor.getHtml()`）：
1. `CodeManager.getCode(wrapper, 'html')`
2. `HtmlGenerator.build(wrapper)` → cleanId 处理 → `wrapper.toHTML()`
3. 递归遍历组件树，拼接为 HTML 字符串

**CSS 导出**（`editor.getCss()`）：
1. `CodeManager.getCode(wrapper, 'css')`
2. `CssGenerator.build(wrapper)` → buildFromModel 收集 ID/类名 + 生成内联样式规则 → 遍历 CssRules 匹配选择器 → 输出声明块 → 处理 @media 分组 → 清理未使用规则
3. 输出 CSS 字符串

### 5.3 avoidInlineStyle 配置的影响

当编辑器配置 `avoidInlineStyle: true` 时：

- **HTML 导出**：`getAttrToHTML()` 会删除 `style` 属性，HTML 中不包含内联样式
- **CSS 导出**：`buildFromModel()` 跳过内联样式生成，所有样式仅通过 `CssRule` 输出
- **结果**：HTML 更干净，样式完全集中在 CSS 中

---

## 六、关键设计要点总结

1. **树形数据结构**：Component 是核心，通过 `components` 属性形成父子嵌套，与 DOM 树一一对应

2. **样式双轨制**：样式可以存储为内联 `style` 属性（直接写在 HTML 标签上），也可以存储为 `CssRule`（通过 class/ID 选择器关联），两种方式可以共存

3. **规则去重与缓存**：`CssComposer` 以 `atRuleKey__selectorsKey` 为缓存键，确保相同选择器组合的规则唯一

4. **按需输出**：CSS 生成时只输出与画布中实际存在的组件相关的规则，未使用的规则会被清理（`dump` 机制）

5. **响应式支持**：通过 `@media` 规则和 `mediaText` 属性，支持不同屏幕尺寸的样式，导出时按 mobile-first 排序

6. **可扩展的生成器**：`CodeManager` 支持注册自定义生成器，可以扩展输出任意格式（如 SCSS、LESS、JSX 等）
