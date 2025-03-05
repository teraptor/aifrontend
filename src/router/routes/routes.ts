import type { RouteRecordRaw } from 'vue-router'
import { RouteNames } from './routeNames'

const defaultMeta = {
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
    path: `${RouteNames.MAIN.ASSISTS.name}`,
    name: RouteNames.MAIN.ASSISTS.name,
    meta: {
      title: 'Ассистенты',
      ...defaultMeta,
    },
    component: () => import('@/pages/Assists.vue')
  },
  {
    path: `${RouteNames.MAIN.INSTRUMENTS.name}`,
    name: RouteNames.MAIN.INSTRUMENTS.name,
    meta: {
      title: 'Инструменты AI',
      ...defaultMeta,
    },
    component: () => import('@/pages/Instruments.vue')
  },
  {
    path: `${RouteNames.MAIN.QUESTIONS.name}`,
    name: RouteNames.MAIN.QUESTIONS.name,
    meta: {
      title: 'Вопросы ассистентов',
      ...defaultMeta,
    },
    component: () => import('@/pages/Questions.vue')
  },
  {
    path: `${RouteNames.MAIN.CREATE_ASSISTANT.name}`,
    name: RouteNames.MAIN.CREATE_ASSISTANT.name,
    meta: {
      title: 'Создание ассистента',
      showFooter: false,
      showSidebar: true
    },
    component: () => import('@/pages/CreateAssistant.vue')
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
