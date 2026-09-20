import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    /** 工具函数依赖 DOMParser / CSSOM，使用 happy-dom 提供浏览器环境 */
    environment: 'happy-dom',
    include: ['tests/**/*.spec.ts'],
  },
});
