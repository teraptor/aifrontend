import type { RouteRecordRaw } from 'vue-router'
import { RouteNames } from './routeNames'

const defaultMeta = {
  showFooter: true,
  showSidebar: true
}

export const MAIN_ROUTES: RouteRecordRaw[] = [
  {
    path: RouteNames.MAIN.name,
    name: RouteNames.MAIN.name,
    meta: {
      title: 'Главная страница',
      ...defaultMeta,
    },
    component: () => import('@/pages/Index.vue')
  },
  {
    path: RouteNames.ASSISTENS,
    meta: {
      title: 'Мои ассистенты',
      ...defaultMeta,
    },
    component: () => import('@/pages/Assists.vue')
  },
  
  {
    path: `${RouteNames.ASSISTENT_CHAT}/:id`,
    name: 'ASSISTENT_CHAT',
    meta: {
      title: 'Чат с ассистентом',
      ...defaultMeta,
    },
    component: () => import('@/pages/AssistentChat.vue')
  },
  
  {
    path: RouteNames.PROFILE,
    name: RouteNames.PROFILE,
    meta: {
      title: 'Профиль',
      ...defaultMeta,
    },
    component: () => import('@/pages/Profile.vue')
  },
  {
    path: RouteNames.INSTRUMENTS,
    name: RouteNames.INSTRUMENTS,
    meta: {
      title: 'Инструменты',
      ...defaultMeta,
    },
    component: () => import('@/pages/Instruments.vue')
  },
  {
    path: RouteNames.QUESTIONS,
    name: RouteNames.QUESTIONS,
    meta: {
      title: 'Вопросы ассистентов',
      ...defaultMeta,
    },
    component: () => import('@/pages/QuestionsList.vue')
  },
  {
    path: RouteNames.CREATE_ASSISTENT,
    name: RouteNames.CREATE_ASSISTENT,
    meta: {
      title: 'Создать ассистента',
      ...defaultMeta,
    },
    component: () => import('@/pages/CreateAssistent.vue')
  },
  {
    path: `${RouteNames.ASSISTENT_DETAIL}/:id`,
    name: RouteNames.ASSISTENT_DETAIL,
    meta: {
      title: 'Детали ассистента',
      ...defaultMeta,
    },
    component: () => import('@/pages/AssistentDetail.vue')
  },
  {
    path: `${RouteNames.QUESTION_DETAIL}/:id`,
    name: RouteNames.QUESTION_DETAIL,
    meta: {
      title: 'Вопросы ассистенту',
      ...defaultMeta,
    },
    component: () => import('@/pages/QuestionDetail.vue')
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
