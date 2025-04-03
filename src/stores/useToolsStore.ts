import { defineStore } from "pinia";

interface ISkills {
  id: string,
  icon: string,
  title: string,
  description: string
}

interface ISkillsStore {
  skills: ISkills[]
}

export const useSkillsStore = defineStore('Skills', {
  state: (): ISkillsStore => ({
    skills: [
      {
        id: '1',
        icon: 'icon icon-edit-3',
        title: 'Общение',
        description: 'Навык коммуникации и общения'
      },
      {
        id: '2',
        icon: 'icon icon-clipboard',
        title: 'Анализ данных',
        description: 'Обработка и анализ информации'
      },
      {
        id: '3',
        icon: 'icon icon-edit-3',
        title: 'Общение',
        description: 'Навык коммуникации и общения'
      },
      {
        id: '4',
        icon: 'icon icon-clipboard',
        title: 'Анализ данных',
        description: 'Обработка и анализ информации'
      },
      {
        id: '5',
        icon: 'icon icon-edit-3',
        title: 'Общение',
        description: 'Навык коммуникации и общения'
      },
      {
        id: '6',
        icon: 'icon icon-clipboard',
        title: 'Анализ данных',
        description: 'Обработка и анализ информации'
      }
    ]
  })
})