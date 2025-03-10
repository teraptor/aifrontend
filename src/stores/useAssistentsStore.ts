import { defineStore } from 'pinia';
import dayjs from 'dayjs';
import avatarImage from '@/assets/cl1_45.png';
import { useAuthStore } from './useAuthStore';

export interface IAssistent {
  id: string;
  name: string;
  summary: string;
  image: string;
  description: string;
  call_name: string;
  install: number;
  comments_count: number;
  isLocked: boolean;
  isActive: boolean;
  isDisabled: boolean;
  created_at: string;
  business: boolean;
  author_id: string;
}

export type SortOption = 'popular' | 'new';
export type FilterOption = 'all' | 'business';

export const useAssistentsStore = defineStore('assistents', {
  state: () => ({
    assistants: [
      {
        id: '1',
        name: 'Александр',
        summary: 'Персональный помощник',  
        image: avatarImage,
        description: 'Персональный помощник для решения повседневных задач',
        call_name: 'Alex',
        install: 3,
        comments_count: 2,
        isLocked: false,
        isActive: true,
        isDisabled: false,
        created_at: "2024-03-02T18:15:00Z",
        business: true,
        author_id: '1'
      },
      {
        id: '2',
        name: 'Мария',
        summary: 'Бизнес-аналитик', 
        image: avatarImage,
        description: 'Помощник для анализа бизнес-процессов',
        call_name: 'Maria',
        install: 4,
        comments_count: 2,
        isLocked: false,
        isActive: false,
        isDisabled: false,
        created_at: "2024-03-08T18:15:00Z",
        business: true,
        author_id: '20'
      },
      {
        id: '3',
        name: 'Дмитрий',
        summary: 'Технический специалист', 
        image: avatarImage, 
        description: 'Эксперт по техническим вопросам',
        call_name: 'Dmitry',
        install: 2,
        comments_count: 2,
        isLocked: false,
        isActive: false,
        isDisabled: true,
        created_at: "2024-03-12T18:15:00Z",
        business: false,
        author_id: '1'
      },
      {
        id: '4',
        name: 'Анна',
        summary: 'Маркетолог', 
        description: 'Специалист по маркетингу и PR',
        image: avatarImage,
        call_name: 'Anna',
        install: 0,
        comments_count: 2,
        isLocked: false,
        isActive: false,
        isDisabled: true,
        created_at: "2024-02-01T18:15:00Z",
        business: false,
        author_id: '20'
      },
      {
        id: '5',
        name: 'Сергей',
        summary: 'Финансовый консультант', 
        description: 'Эксперт по финансам и инвестициям',
        image: avatarImage,
        call_name: 'Sergey',
        install: 0,
        comments_count: 2,
        isLocked: false,
        isActive: false,
        isDisabled: false,
        created_at: "2024-03-15T18:15:00Z",
        business: false,
        author_id: '20'
      },
      {
        id: '6',
        name: 'Екатерина',
        summary: 'HR специалист', 
        description: 'Консультант по управлению персоналом',
        image: avatarImage,
        call_name: 'Kate',
        install: 2,
        comments_count: 2,
        isLocked: true,
        isActive: false,
        isDisabled: false,
        created_at: "2024-03-06T18:15:00Z",
        business: true,
        author_id: '20'
      },
      {
        id: '7',
        name: 'Павел',
        summary: 'Юрист', 
        description: 'Специалист по правовым вопросам',
        image: avatarImage,
        call_name: 'Pavel',
        install: 4,
        comments_count: 2,
        isLocked: true,
        isActive: false,
        isDisabled: false,
        created_at: "2024-01-01T18:15:00Z",
        business: false,
        author_id: '20'
      },
      {
        id: '8',
        name: 'Ольга',
        summary: 'Дизайнер',
        image: avatarImage,  
        description: 'Специалист по графическому дизайну',
        call_name: 'Olga',
        install: 1,
        comments_count: 2,
        isLocked: true,
        isActive: false,
        isDisabled: false,
        created_at: "2024-02-02T18:15:00Z",
        business: true,
        author_id: '20'
      },
      {
        id: '9',
        name: 'Игорь',
        summary: 'Копирайтер', 
        image: avatarImage,
        description: 'Специалист по созданию контента',
        call_name: 'Igor',
        install: 1,
        comments_count: 2,
        isLocked: false,
        isActive: false,
        isDisabled: false,
        created_at: "2024-03-22T18:15:00Z",
        business: false,
        author_id: '20'
      }
    ],
    
    sortOption: 'popular' as SortOption,
    activeFilter: 'all' as FilterOption,
  }),

  actions: {
    setSortOption(option: SortOption) {
      this.sortOption = option;
    },

    setActiveFilter(filter: FilterOption) {
      this.activeFilter = filter;
    },
  },

  getters: {
    filteredAssistents(state): IAssistent[] {
      const filterMap: Record<FilterOption, (item: IAssistent) => boolean> = {
        all: () => true,
        business: (item) => item.business
      };

      return state.assistants.filter(filterMap[state.activeFilter]);
    },

    sortedAssistents(state): IAssistent[] {
      const sortMap: Record<SortOption, (a: IAssistent, b: IAssistent) => number> = {
        popular: (a, b) => b.install - a.install,
        new: (a, b) => dayjs(b.created_at).unix() - dayjs(a.created_at).unix(),
      };

      return this.filteredAssistents.sort(sortMap[state.sortOption]);
    },

    userAssistents(state): IAssistent[] {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return [];

      return state.assistants.filter((assistant) => assistant.author_id === '1');
    },

    getAssistentById: (state) => (id: string) => {
      return state.assistants.find((a) => a.id === id);
    },
  },
});