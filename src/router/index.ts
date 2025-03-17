import { createRouter, createWebHistory } from 'vue-router'
import { MAIN_ROUTES } from '@/router/routes'
import { useAuthStore } from '@/stores/useAuthStore'
import { RouteNames } from './routes/routeNames'
import { notifications } from '@/plugins/notifications'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...MAIN_ROUTES],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    notifications.error('Для доступа к данной странице необходимо авторизоваться')
    next({name: RouteNames.MAIN.name})
  } else {
    next()
  }
})


export default router
