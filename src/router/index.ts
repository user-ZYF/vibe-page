import { createRouter, createWebHistory } from 'vue-router';
import Canvas from '@/views/Canvas/index.vue';
import Playground from '@/views/playground/index.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Canvas',
      component: Canvas
    },
    {
      path: '/playground',
      name: 'playground',
      component: Playground
    }
  ]
})

export default router;