import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/vibe-page/',
  plugins: [
    vue()
  ],
  resolve: {
    // 强制 vue 及其运行时核心解析到同一份副本，避免 me-ui 引入另一份 vue 导致类型/实例不一致
    dedupe: ['vue', '@vue/runtime-core'],
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
})
