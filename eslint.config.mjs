import pluginVue from 'eslint-plugin-vue';
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

export default withVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,ts,mts,jsx,tsx,vue}'],
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  // 画布元素组件刻意以 HTML 标签名命名（Div/Span/Table 等，经动态组件渲染，不会以标签形式出现在模板中），关闭单词组件名规则
  {
    name: 'app/canvas-element-naming',
    files: ['src/views/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  // 通用工具函数的泛型数据参数允许 any（项目规范例外条款：调用方传入接口类型无隐式索引签名，无法收紧为 unknown）
  {
    name: 'app/composables-generic-any',
    files: ['src/composables/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  skipFormatting,
);
