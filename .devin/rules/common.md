---
trigger: always_on
---

You are an expert in TypeScript, Node.js, pnpm, Vite, Vue.js, Vue Router, Pinia, VueUse, axios, lodash, dayjs, mitt, with a deep understanding of best practices and performance optimization techniques in these technologies.

Code Style and Structure

- Write concise, maintainable, and technically accurate TypeScript code with relevant examples.
- Use functional and declarative programming patterns; avoid classes.
- Favor iteration and modularization to adhere to DRY principles and avoid code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Organize files systematically: each file should contain only related content, such as exported components, subcomponents, helpers, static content, and types.

TypeScript Usage

- Use TypeScript for all code; prefer interfaces over types for their extendability and ability to merge.
- Use functional components with TypeScript interfaces.

Syntax and Formatting

- Use the "function" keyword for pure functions to benefit from hoisting and clarity.
- Always use the Vue Composition API script setup style.

Performance Optimization

- Leverage VueUse functions where applicable to enhance reactivity and performance.
- Wrap asynchronous components in Suspense with a fallback UI.

Key Conventions

- Optimize Web Vitals (LCP, CLS, FID) using tools like Lighthouse or WebPageTest.

# 开发规范

## **实现规范**

- 双向绑定必须使用 `defineModel` 来实现
- 双向绑定使用 `v-model`
- 样式相关的逻辑处理，应尽量使用 `class` 形式，不要使用 `style` 形式
- 不要随意删除无关本次命令的注释掉的代码
- vue 单文件组件的顺序标签是 `template`、`script`、`style`
- **禁止**随意将中文文本标点符号转换为英文标点
- 非自闭合标签，即使内部没有内容，也不能自闭合结束，必须显式书写闭合标签（如 `<div></div>`，而非 `<div />`）
- **禁止**自行生成图标 SVG，所有图标必须使用 `ant-design-vue` 提供的图标组件

# 前端开发通用规则

## 命名规范

### 目录命名规范

- Hook 目录：采用 `camelCase` 形式命名，如 `useUserStore`
- 其他目录：全部使用小写，`kebab-case` 形式命名，如 `new-page`、`components`

### 文件命名规范

- 单文件组件：采用 `PascalCase` 形式命名，如 `DesignSelect.vue`
- 主文件：采用 `index` 名称命名，如 `index.ts`、`index.vue`
- Hook 文件：采用 `camelCase` 形式命名
- 接口定义文件：采用 `camelCase` 形式命名，如 `list.ts` 和 `listModel.ts`
- Store/util/资源/样式文件：采用 `kebab-case` 形式命名
- 类型定义文件：`types` 目录首层子级采用 `.d` 形式命名，其余不采用 `.d` 形式命名
- 页面级类型定义：固定书写到对应页面文件夹下的 `types.ts` 文件中，不得分散到其他位置
- 其他文件：采用 `camelCase` 形式命名

### 类、interface、type、enum 命名规范

- 采用 `PascalCase` 形式命名
- `enum` 变量名称结尾必须为 `Enum`

### 常量、枚举属性、常量属性命名规范
- 枚举名称使用 `PascalCase` 形式命名，必须以 `Enum` 结尾
- 枚举属性名使用 `CONSTANT_CASE` 形式命名
- 枚举值不要用字符串，用数字，`0` 固定代表未定义，例如下：

```javascript
/** 「血压」记录状态 */
export const enum NoteStatusNnum {
  /** 未定义 */
  UNDEFINED = 0,
  /** 剧烈运动 */
  STRENGTHENING_EXERCISE = 1,
  /** 咖啡 */
  COFFEE = 2,
}

```

### HTML class 命名规范

- 采用 BEM 规范命名，但有以下区别：
  - 不使用 `__`，统一使用 `-`
  - 状态相关 `class`，使用 `is-状态` 形式，非状态 `class` 前缀不可为 `is-`
- 全局生效的 `class`：添加 `app-`、`comp-` 前缀，如 `app-ellipsis--2`、`comp-copyright`
- 局部生效的 `class`：前缀不可为 `app-`、`comp-`

### LocalStorage、Cookie Key 命名规范

- 采用 `snake_case` 形式命名
- 若存在公共模块前缀，使用 `__前缀名称__` 形式命名拼接

## 通用编码规范

### 注释规范

- 变量、方法、对象属性、`enum` 必须包含 docs 注释：

```javascript
/** 缩略图 */
const levelThumbnails = [
  {
    /** 图片地址 */
    url: '',
  },
];
```

- `interface` 类型定义必须包含 docs 注释：

```javascript
/**
 * 异常信息
 */
export interface Error {
  /**
   * 错误码
   */
  Code?: string;
}
```

- `vue` 文件首行必须有 `<!-- ? 文件说明 -->`

### 编码约定

- `tsconfig` 开启禁止隐式 `any`，非以下情况禁止使用 `any`：
  - 通用业务组件的通用数据参数
  - 外包项目遗留代码
- 必须使用防重复点击按钮，否则必须加 `loading`
- 工具函数、Hook 必须编写单元测试
- 表达式语句结尾必须有分号
- **禁止使用常量联合类型**（如 `'image' | 'color' | 'gradient'`），必须使用枚举类型
- **枚举类型定义位置**：所有枚举类型必须定义在 `src/constants` 目录下的相关同名 `.ts` 文件中，不可在其他文件中定义枚举

### 代码组织规范

- 组件选项使用 `defineOptions` 定义
- Emits 使用 TypeScript 类型定义
- 响应式数据统一使用 `ref`
- 计算属性使用 `computed`
- 方法定义使用 `function` 关键字

## Vue 编码规范

### 响应式数据

- 统一使用 `ref`，不使用 `reactive`

### Props 定义规范

- Props 定义全部采用值写法，好处是做组件 `props` 继承的时候能够把默认值也继承：

```javascript
defineProps({
  /** 标题 */
  title: {
    type: String,
    default: '',
  },
});
```

## 功能实现规范

### 下拉单选组件规范

- 所有下拉单选（`a-select`）必须通过 `:options` prop 传入选项数组，**禁止**在模板中使用 `<a-select-option>` 自定义选项
- 选项数组必须统一定义在 `src/constants` 目录下的对应 `.ts` 文件中，不得在组件内部临时定义
- 选项数组的 `label` 字段必须为字符串类型，`value` 字段使用枚举值

```vue
<!-- ✅ 正确 -->
<a-select v-model:value="model.fontFamily" :options="FONT_FAMILY_OPTIONS" />

<!-- ❌ 错误 -->
<a-select v-model:value="model.fontFamily">
  <a-select-option value="Arial">Arial</a-select-option>
</a-select>
```

## 其他规范

### 性能优化

- 使用 `defineAsyncComponent` 懒加载大型组件
- 合理使用 `v-memo` 和 `v-once` 指令
- 避免在模板中使用复杂计算

### 代码质量

- 所有代码必须通过 ESLint 检查
- 组件必须有完整的类型定义
- 重点测试业务逻辑和工具函数

### 测试规范

- 单元测试：`*.spec.ts`
- 测试文件存放在项目 `tests` 目录
- 工具函数、Hook 必须编写单元测试

### Less 样式规范

- less 代码中，若多个选择器拥有相同类名前缀，必须使用嵌套写法，**禁止**将其拆开独立书写：

```less
/* ✅ 正确 */
.comp-layer-item {
  &-header { ... }
  &-children { ... }
}

/* ❌ 错误 */
.comp-layer-item-header { ... }
.comp-layer-item-children { ... }
```

### 代码审查要点

- 进行代码审查时，必须使用中文输出审查结果
- 类型安全：确保所有代码都有正确的类型定义，禁止隐式 `any`
- 性能考虑：避免不必要的重渲染和内存泄漏
- 可维护性：代码结构清晰，注释完整
- 规范遵循：严格按照命名规范和编码规范执行
