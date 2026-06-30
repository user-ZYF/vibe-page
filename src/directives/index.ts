import type { App } from 'vue';
import { editable } from './editable';

/**
 * 全局注册自定义指令
 * @param app Vue 应用实例
 */
export function registerDirectives(app: App): void {
  app.directive('editable', editable);
}
