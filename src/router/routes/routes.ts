import type { RouteRecordRaw } from 'vue-router'
import { RouteNames } from './routeNames'

const defaultMeta = {
  showHeader: true,
  showFooter: true,
  showSidebar: true
}

export const MAIN_ROUTES: RouteRecordRaw[] = [
  {
    path: `${RouteNames.MAIN.MAIN_PAGE.name}`,
    name: RouteNames.MAIN.MAIN_PAGE.name,
    meta: {
      title: 'Главная страница',
      ...defaultMeta,
    },
    component: () => import('@/pages/Index.vue')
  },
  {
    path: `${RouteNames.NOT_FOUND}`,
    name: RouteNames.NOT_FOUND,
    component: () => import('@/pages/NotFound.vue'),
    meta: {
      title: '404',
    },
  },
]
