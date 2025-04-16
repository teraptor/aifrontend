import type { RouteRecordRaw } from 'vue-router'
import { RouteNames } from './routeNames'
import { ref, onMounted } from 'vue'

const defaultMeta = {
  showFooter: true,
  showSidebar: true
}

const assistentName = ref('')

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
    path: RouteNames.ASSISTENT_LIST,
    name: RouteNames.ASSISTENT_LIST,
    meta: {
      title: 'Ассистенты',
      ...defaultMeta,
    },
    component: () => import('@/pages/AssistentList.vue')
  },
  {
    path: RouteNames.Chats,
    name: RouteNames.Chats,
    meta: {
      title: 'Чаты',
      ...defaultMeta,
      requiresAuth: true,
    },
    component: () => import('@/pages/AssistentChats.vue')
  },
  {
    path: RouteNames.ASSISTENS,
    name: RouteNames.ASSISTENS,
    meta: {
      title: 'Мои ассистенты',
      ...defaultMeta,
      requiresAuth: true,
    },
    component: () => import('@/pages/Assists.vue')
  },
  
  {
    path: RouteNames.PROFILE,
    name: RouteNames.PROFILE,
    meta: {
      title: 'Профиль',
      ...defaultMeta,
      requiresAuth: true,
    },
    component: () => import('@/pages/Profile.vue')
  },
  {
    path: RouteNames.CREATE_ASSISTENT,
    name: RouteNames.CREATE_ASSISTENT,
    meta: {
      title: 'Создать ассистента',
      ...defaultMeta,
      requiresAuth: true,
    },
    component: () => import('@/pages/CreateAssistant.vue')
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
    path: `${RouteNames.ASSISTENT_SETTING}/:id`,
    name: RouteNames.ASSISTENT_SETTING,
    meta: {
      title: 'Настройки ассистента',
      ...defaultMeta,
      requiresAuth: true,
    },
    component: () => import('@/pages/AssistentSetting.vue')
  },
  {
    path: `${RouteNames.NOT_FOUND}`,
    name: RouteNames.NOT_FOUND,
    component: () => import('@/pages/NotFound.vue'),
    meta: {
      title: '404',
    },
  },
  {
    path: `${RouteNames.CHAT}/:id`,
    name: RouteNames.CHAT,
    component: () => import('@/pages/PublicChat.vue'),
    meta: {
      title: 'диалог',
      layout: 'public-chat'
    },
  },
  {
    path: RouteNames.CHAT,
    redirect: RouteNames.MAIN.name,
    meta: {
      title: 'Вопросы ассистенту',
      ...defaultMeta,
      requiresAuth: false,
    },
  },
]
