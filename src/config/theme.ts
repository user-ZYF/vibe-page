import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context';
import { theme as antdTheme } from 'ant-design-vue';
import type { ThemeTokens } from '@zyf_dsb/me-ui/config-provider';

/**
 * 项目品牌色 Token（暗色/亮色共用）
 * 基于 Ant Design Vue 4.x 的 Design Token 系统
 * 这些值既用于 antd 组件主题，也同步映射为 CSS 变量供全局使用
 */
export const brandTokens = {
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
  /** 圆角 */
  borderRadius: 6,
  /** 字体大小 */
  fontSize: 14,
} as const;

/**
 * 亮色主题额外 Token 覆盖
 */
export const lightTokens = {
  ...brandTokens,
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
} as const;

/**
 * 暗色主题额外 Token 覆盖
 */
export const darkTokens = {
  ...brandTokens,
  /** 主要文字色 */
  colorText: 'rgba(255, 255, 255, 0.9)',
  /** 次要文字色 */
  colorTextSecondary: 'rgba(255, 255, 255, 0.72)',
  /** 占位文字色 */
  colorTextTertiary: 'rgba(255, 255, 255, 0.52)',
  /** 禁用文字色 */
  colorTextQuaternary: 'rgba(255, 255, 255, 0.3)',
  /** 组件背景色 */
  colorBgContainer: '#1f1f1f',
  /** 布局背景色 */
  colorBgLayout: '#141414',
  /** 悬浮背景色 */
  colorBgContainerHover: 'rgba(255, 255, 255, 0.04)',
  /** 边框色 */
  colorBorder: 'rgba(255, 255, 255, 0.1)',
  /** 次级边框色 */
  colorBorderSecondary: 'rgba(255, 255, 255, 0.06)',
} as const;

/**
 * 获取 antd ConfigProvider 主题配置
 * @param isDark - 是否为暗色主题
 */
export function getThemeConfig(isDark: boolean): ThemeConfig {
  return {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: isDark ? darkTokens : lightTokens,
    hashed: true,
  };
}

/**
 * 获取 me-ui ConfigProvider 主题 Token 配置
 * @param isDark - 是否为暗色主题
 */
export function getMeThemeConfig(isDark: boolean): ThemeTokens {
  const tokens = isDark ? darkTokens : lightTokens;
  return {
    colorPrimary: tokens.colorPrimary,
    colorSuccess: tokens.colorSuccess,
    colorWarning: tokens.colorWarning,
    colorDanger: tokens.colorError,
    colorInfo: tokens.colorInfo,
    textColorPrimary: tokens.colorText,
    textColorRegular: tokens.colorTextSecondary,
    textColorSecondary: tokens.colorTextTertiary,
    textColorPlaceholder: tokens.colorTextQuaternary,
    textColorDisabled: tokens.colorTextQuaternary,
    borderColor: tokens.colorBorder,
    borderColorLight: tokens.colorBorderSecondary,
    borderRadiusBase: `${brandTokens.borderRadius}px`,
    borderRadiusSmall: `${brandTokens.borderRadius - 2}px`,
    fontSizeBase: `${brandTokens.fontSize}px`,
  };
}
