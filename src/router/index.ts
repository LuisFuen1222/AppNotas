import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'
import PapeleraView from '@/views/PapeleraView.vue'
import ArchivadasView from '@/views/ArchivadasView.vue'
import FavView from '@/views/FavView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/Register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/Home',
      name: 'home',
      component: HomeView
    },
    {
      path: '/Papelera',
      name: 'papelera',
      component: PapeleraView
    },
    {
      path: '/Favorites',
      name: 'favoritos',
      component: FavView
    },
    {
      path: '/Archivados',
      name: 'archivados',
      component: ArchivadasView
    },
  ]
})

export default router
