import { computed } from 'vue';
import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';
import { ThemeModeEnum } from '@/constants/theme';

/** 主题持久化存储 key */
const THEME_STORAGE_KEY = 'vibepage__theme__';

/** 主题 store */
export const useThemeStore = defineStore('theme', () => {
  /** 当前主题模式 */
  const mode = useStorage<ThemeModeEnum>(THEME_STORAGE_KEY, ThemeModeEnum.DARK);

  /** 是否为暗色主题 */
  const isDark = computed(() => mode.value === ThemeModeEnum.DARK);

  /** 主题模式字符串（用于 data-theme 属性） */
  const modeString = computed(() => (isDark.value ? 'dark' : 'light'));

  /** 切换主题 */
  function toggleTheme() {
    mode.value = isDark.value ? ThemeModeEnum.LIGHT : ThemeModeEnum.DARK;
  }

  return {
    mode,
    isDark,
    modeString,
    toggleTheme,
  };
});
