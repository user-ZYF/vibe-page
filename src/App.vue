<!-- ? 应用根组件 - 通过 ConfigProvider 注入全局主题配置 -->
<template>
  <a-config-provider :theme="themeConfig">
    <div class="container">
      <router-view />
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import { themeConfig } from '@/config/theme';
</script>

<style lang="less" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>