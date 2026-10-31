import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false });

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Pages',
      meta: { requiresAuth: true },
      component: () => import('@/views/Pages/index.vue')
    },
    {
      path: '/canvas/:id',
      name: 'Canvas',
      meta: { requiresAuth: true },
      component: () => import('@/views/Canvas/index.vue')
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login/index.vue')
    },
    {
      path: '/:path(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound/index.vue')
    }
  ]
})

router.beforeEach((to) => {
  NProgress.start();
  const authStore = useAuthStore();
  /** 需要登录的页面未登录时跳转登录页 */
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
  /** 已登录用户访问登录页时回首页 */
  if (to.path === '/login' && authStore.isLoggedIn) {
    return '/';
  }
});

router.afterEach(() => {
  NProgress.done();
});

export default router;