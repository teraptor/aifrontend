//стор для старой главной

import { defineStore } from "pinia";
interface IInstall {
  count: number,
  title: string,
  list: string[]
}

interface IAdvantages {
  id: string,
  icon: string,
  title: string,
  subtitle: string
}

interface State {
  install: IInstall[]
  advantages: IAdvantages[]
}
export const useMainContentStore = defineStore<"useMainContentStore", State>(
  "useMainContentStore",
  {
    state: (): State => ({
      install: [
        {
          count: 1,
          title: "Запишись на консультацию",
          list: [
            'за 5 минут создадим ИИ⁠-⁠ассистента под ваши задачи',
            'настроим его в соответствии с вашими целями и вкусами',
            'покажем весь функционал и научим им пользоваться'
          ],
        },
        {
          count: 2,
          title: "Протестируйте OmniChatBot",
          list: [
            'можете управлять ответами и конверсиями',
            'можете пополнять базу данных и менять дизайн',
            'можете ставить собственные задачи и цели'
          ],
        },
        {
          count: 3,
          title: "Включите OmniChatBot в работу",
          list: [
            'интегрируется со всеми CRM⁠⁠-⁠⁠системами (включая кастомные) в среднем за 5 минут',
            'работает в полную силу сразу же после подключения',
          ],
        },
      ],
      advantages: [
        {
          id: '1',
          icon: 'icon-check-circle',
          title: 'Персонализированные ответы',
          subtitle: 'Помощник считывает запрос клиента и продает с позиции его выгод, а не по общему скрипту'
        },
        {
          id: '2',
          icon: 'icon-activity',
          title: 'Повышение вовлечённости',
          subtitle: 'Сам прогревает клиента, предоставляя ему ценные материалы и специальные условия из вашей базы'
        },
        {
          id: '3',
          icon: 'icon-layout',
          title: 'Интеграция с CRM',
          subtitle: 'Отслеживает статус лида и подстраивает диалоги под этап в воронке продаж, на котором находится клиент'
        },
        {
          id: '4',
          icon: 'icon-check-circle',
          title: 'Адаптивные сценарии',
          subtitle: 'Скрипты ИИ⁠-⁠менеджера подстраиваются под социальный портрет, опыт и потребности клиента автоматически'
        },
        {
          id: '5',
          icon: 'icon-layout',
          title: 'Непрерывное обучение',
          subtitle: 'Механизмы самообучения анализируют сделки и улучшают процесс продажи на основе полученных результатов'
        },
        {
          id: '6',
          icon: 'icon-activity',
          title: 'A/B-тестирование',
          subtitle: 'Самостоятельно тестирует разные сценарии и отбирает наиболее эффективные из них для работы'
        }
      ]
    }),
  }
);
