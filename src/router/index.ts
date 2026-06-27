import { createRouter, createWebHistory } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import Playground from '@/views/playground/index.vue';

NProgress.configure({ showSpinner: false });

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Canvas',
      component: () => import('@/views/Canvas/index.vue')
    },
    {
      path: '/playground',
      name: 'playground',
      component: Playground
    }
  ]
})

router.beforeEach(() => {
  NProgress.start();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;