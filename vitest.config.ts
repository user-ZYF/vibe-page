import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    /** 工具函数依赖 DOMParser / CSSOM，使用 happy-dom 提供浏览器环境 */
    environment: 'happy-dom',
    include: ['tests/**/*.spec.ts'],
    /** me-ui 产物内联处理：其 dist 中含 css import，需走 Vite 管线而非 Node 加载 */
    server: {
      deps: {
        inline: ['@zyf_dsb/me-ui'],
      },
    },
  },
});
