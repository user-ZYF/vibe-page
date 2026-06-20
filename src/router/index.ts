import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home/index.vue';
import Playground from '@/views/playground/index.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/playground',
      name: 'playground',
      component: Playground
    }
  ]
})

export default router;