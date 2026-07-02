import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context';

/**
 * 项目主题色 Token 定义
 * 基于 Ant Design Vue 4.x 的 Design Token 系统
 * 这些值既用于 antd 组件主题，也同步映射为 CSS 变量供全局使用
 */
export const projectTokens = {
  /** 主色 */
  colorPrimary: '#1677ff',
  /** 成功色 */
  colorSuccess: '#52c41a',
  /** 警告色 */
  colorWarning: '#faad14',
  /** 错误色 */
  colorError: '#ff4d4f',
  /** 信息色 */
  colorInfo: '#1677ff',
  /** 主要文字色 */
  colorText: 'rgba(0, 0, 0, 0.88)',
  /** 次要文字色 */
  colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
  /** 占位文字色 */
  colorTextTertiary: 'rgba(0, 0, 0, 0.45)',
  /** 禁用文字色 */
  colorTextQuaternary: 'rgba(0, 0, 0, 0.25)',
  /** 组件背景色 */
  colorBgContainer: '#ffffff',
  /** 布局背景色 */
  colorBgLayout: '#f5f5f5',
  /** 悬浮背景色 */
  colorBgContainerHover: 'rgba(0, 0, 0, 0.04)',
  /** 边框色 */
  colorBorder: '#d9d9d9',
  /** 次级边框色 */
  colorBorderSecondary: '#f0f0f0',
  /** 圆角 */
  borderRadius: 6,
  /** 字体大小 */
  fontSize: 14,
} as const;

/**
 * antd ConfigProvider 主题配置
 */
export const themeConfig: ThemeConfig = {
  token: projectTokens,
  hashed: true,
};
