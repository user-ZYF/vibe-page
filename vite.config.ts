import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
  plugins: [
    vue()
  ],
  server: {
    proxy: {
      [env.VITE_API_BASE_URL]: {
        target: env.VITE_API_PROXY_TARGET,
        changeOrigin: true,
      },
    },
  },
  resolve: {
    // 强制 vue 及其运行时核心解析到同一份副本，避免 me-ui 引入另一份 vue 导致类型/实例不一致
    dedupe: ['vue', '@vue/runtime-core'],
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
  };
});
