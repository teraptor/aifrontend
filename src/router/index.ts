import { createRouter, createWebHistory } from 'vue-router'
import { MAIN_ROUTES } from '@/router/routes'
import QuestionDialog from '@/pages/QuestionDialog.vue'
import AssistantSettings from '../pages/AssistantSettings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...MAIN_ROUTES,
    {
      path: '/questions/:id',
      name: 'QuestionDialog',
      component: QuestionDialog
    },
    {
      path: '/assistant/:id/settings',
      name: 'AssistantSettings',
      component: AssistantSettings
    }
  ]
})

export default router
