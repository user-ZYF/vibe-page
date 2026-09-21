<!-- ? 应用根组件 - 通过 ConfigProvider 注入全局主题配置 -->
<template>
  <me-config-provider :theme="meThemeConfig">
    <a-config-provider :theme="themeConfig">
      <div class="container">
        <router-view />
      </div>
    </a-config-provider>
  </me-config-provider>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { MeConfigProvider } from '@zyf_dsb/me-ui';
import { getThemeConfig, getMeThemeConfig } from '@/config/theme';
import { useThemeStore } from '@/store/theme';
import { storeToRefs } from 'pinia';

const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);

/** 响应式 antd 主题配置 */
const themeConfig = computed(() => getThemeConfig(isDark.value));

/** 响应式 me-ui 主题 Token 配置 */
const meThemeConfig = computed(() => getMeThemeConfig(isDark.value));

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