<!-- ? 应用根组件 - 通过 ConfigProvider 注入全局主题配置 -->
<template>
  <a-config-provider :theme="themeConfig">
    <div class="container">
      <router-view />
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useStyleTag } from '@vueuse/core';
import { getThemeConfig } from '@/config/theme';
import { useThemeStore } from '@/store/theme';
import githubLightCss from 'highlight.js/styles/github.css?raw';
import githubDarkCss from 'highlight.js/styles/github-dark.css?raw';
import { storeToRefs } from 'pinia';

const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);

/** 响应式主题配置 */
const themeConfig = computed(() => getThemeConfig(isDark.value));

/** 根据主题切换 highlight.js 高亮样式 */
const highlightCss = computed(() => (isDark.value ? githubDarkCss : githubLightCss));
useStyleTag(highlightCss, { id: 'hljs-theme' });

/** 监听主题变化，同步 data-theme 属性到 documentElement */
watch(
  () => themeStore.modeString,
  (modeString) => {
    document.documentElement.dataset.theme = modeString;
  },
  { immediate: true },
);
</script>

<style lang="less" scoped>
.container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>