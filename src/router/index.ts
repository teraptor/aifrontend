import { createRouter, createWebHistory } from 'vue-router'
import { MAIN_ROUTES } from '@/router/routes'
import { routeNames } from '@/router/routeNames'
import QuestionDialog from '@/pages/QuestionDialog.vue'
import Questions from '@/pages/Questions.vue'
import AssistantSettings from '../pages/AssistantSettings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...MAIN_ROUTES,
    {
      path: '/questions',
      name: routeNames.QUESTIONS,
      component: Questions
    },
    {
      path: '/questions/:id',
      name: routeNames.QUESTION_DIALOG,
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
