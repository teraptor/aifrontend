import { defineStore } from 'pinia';
import dayjs from 'dayjs';
import avatarImage from '@/assets/cl1_45.png';
import { useAuthStore } from './useAuthStore';

export interface IAssistent {
  id: string;
  name: string;
  summary: string;
  image?: string;
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
export type FilterOption = 'all' | 'business' | 'my';

export const useAssistentsStore = defineStore('assistents', {
  state: () => ({
    assistants: [
      {
        id: '1',
        name: 'Бот 1',
        summary: 'Краткое описание',  
        image: avatarImage,
        description: 'Бот 1',
        call_name: 'Bot1',
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
        name: 'Бот 2',
        summary: 'Краткое описание', 
        image: avatarImage,
        description: 'Бот 2',
        call_name: 'Bot2',
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
        name: 'Бот 3',
        summary: 'Краткое описание', 
        image: avatarImage, 
        description: 'Бот 3',
        call_name: 'Bot3',
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
        name: 'Бот 4',
        summary: 'Краткое описание', 
        description: 'Бот 4',
        image: avatarImage,
        call_name: 'Bot4',
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
        name: 'Бот 5',
        summary: 'Краткое описание', 
        description: 'Бот 5',
        image: avatarImage,
        call_name: 'Bot5',
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
        name: 'Бот 6',
        summary: 'Краткое описание', 
        description: 'Бот 6',
        image: avatarImage,
        call_name: 'Bot6',
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
        name: 'Бот 7',
        summary: 'Краткое описание', 
        description: 'Бот 7',
        image: avatarImage,
        call_name: 'Bot8',
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
        name: 'Бот 8',
        summary: 'Краткое описание',
        image: avatarImage,  
        description: 'Бот 8',
        call_name: 'Bot8',
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
        name: 'Бот 9',
        summary: 'Краткое описание', 
        image: avatarImage,
        description: 'Бот 9',
        call_name: 'Bot9',
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
      const authStore = useAuthStore();
      const filterMap: Record<FilterOption, (item: IAssistent) => boolean> = {
        all: () => true,
        business: (item) => item.business,
        my: (item) => {
          if (!authStore.isAuthenticated) return false;
          return item.author_id === '1';
        },
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