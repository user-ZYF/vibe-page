import { createRouter, createWebHistory } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false });

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Canvas',
      component: () => import('@/views/Canvas/index.vue')
    },
    /** playground 仅开发环境注册；生产构建时该分支为死代码，路由与组件 chunk 一并被 tree-shake */
    ...(import.meta.env.DEV
      ? [
          {
            path: '/playground',
            name: 'playground',
            component: () => import('@/views/playground/index.vue')
          }
        ]
      : [])
  ]
})

router.beforeEach(() => {
  NProgress.start();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;