import { createRouter, createWebHistory } from 'vue-router'
import { MAIN_ROUTES } from '@/router/routes'
import { RouteNames } from './routes/routeNames'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...MAIN_ROUTES],
})

export default router
