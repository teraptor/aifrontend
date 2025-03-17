import { defineStore } from 'pinia';
import dayjs from 'dayjs';
import avatarImage from '@/assets/cl1_45.png';
import { useAuthStore } from './useAuthStore';
import { agentService } from '@/api/services/agentService';

export interface IAssistent {
  id: string;
  name: string;
  description: string;
  summary: string;
  image: string;

  call_name: string;
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
    assistants: [] as IAssistent[],
    isLoading: false,
    error: null as string | null,
    sortOption: 'popular' as SortOption,
    activeFilter: 'all' as FilterOption,
  }),

  actions: {
    async fetchAssitantents() {
      try {
        this.isLoading = true;
        const response = await agentService.fetchAgentsTemplates();
        
        // Проверяем, является ли response объектом с полем data или массивом
        const templates = Array.isArray(response) ? response : 
                         (response && response.data ? response.data : []);
        
        // Логируем для отладки
        console.log('Received templates:', templates);
        
        if (!templates || templates.length === 0) {
          console.warn('No templates received from API');
          this.assistants = [];
          return [];
        }
        
        // Преобразуем AgentTemplate[] в IAssistent[]
        this.assistants = templates
          .filter(template => template && template.id && template.name) // Проверяем валидность элементов
          .map(template => ({
            id: template.id,
            name: template.name,
            description: template.description || '',
            summary: template.description ? template.description.substring(0, 50) + '...' : '',
            image: avatarImage,
            call_name: template.name,
            isLocked: false,
            isActive: false,
            isDisabled: false,
            created_at: new Date().toISOString(),
            business: false,
            author_id: '1'
          }));
        
        return templates;
      } catch(error){
        console.error('Error fetching assistents:', error);
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при загрузке ассистентов';
        throw error;
      }
    },

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
        new: (a, b) => dayjs(b.created_at).unix() - dayjs(a.created_at).unix(),
        popular: (a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0)
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
