import { defineStore } from 'pinia';
import dayjs from 'dayjs';
import avatarImage from '@/assets/cl1_45.png';
import { useAuthStore } from './useAuthStore';
import { agentService } from '@/api/services/agentService';
import { notifications } from '@/plugins/notifications';

// Интерфейс для ответа API
interface ApiAssistant {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isLocked?: boolean;
  isActive?: boolean;
  isDisabled?: boolean;
  created_at?: string;
  business?: boolean;
  author_id?: string;
}

// Интерфейс для ответа API с массивом ассистентов
interface MyAgentsResponse {
  assistants: Array<{
    id: string;
    name: string;
    description?: string;
    image?: string;
    status: boolean;
    created_at?: string;
    business?: boolean;
    author_id?: string;
  }>;
}

export interface IAssistent {
  id: string;
  name: string;
  description: string;
  summary: string;
  image: string;
  call_name: string;
  status: boolean;
  created_at: string;
  business: boolean;
  author_id: string;
  instructions?: string;
  skillLevel?: number;
  systemPrompt?: string;
  model?: string;
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
    searchQuery: '',
  }),

  actions: {

    // обновление ассистента
    async updateAssistent(id: string, data: Partial<IAssistent>) {
      try {
        const response = await agentService.updateAgent(id, data);
        return response;
      } catch(error) {
        throw error;
      }
    },

    // получение шаблонов ассистентов
    async fetchAssitantents() {
      try {
        this.isLoading = true;
        const response = await agentService.fetchAgentsTemplates();

        // Проверяем, является ли response объектом с полем assistants или массивом
        const templates = Array.isArray(response) ? response : 
                         (response && 'assistants' in response ? response.assistants : []) as Array<any>;
        
        if (!templates || templates.length === 0) {
          this.assistants = [];
          return [];
        }
        
        // Преобразуем AgentTemplate[] в IAssistent[]
        this.assistants = templates
          .filter((template: any) => template && template.id && template.name) // Проверяем валидность элементов
          .map((template: any) => ({
            id: template.id,
            name: template.name,
            description: template.description || '',
            summary: template.description ? template.description.substring(0, 50) + '...' : '',
            image: avatarImage,
            call_name: template.name,
            status: template.status,
            created_at: new Date().toISOString(),
            business: false,
            author_id: '1'
          }));
        return templates;
      } catch(error){
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при загрузке ассистентов';
        throw error;
      }
    },

    // получение ассистентов пользователя
    async getMyAssistents() {
      try {
        this.isLoading = true;
        const response = await agentService.getMyAgents();
        
        if (!response.assistants || !Array.isArray(response.assistants)) {
          this.assistants = [];
          return [];
        }

        console.log(response.assistants);

        // Преобразуем массив ассистентов из API в наш формат
        this.assistants = response.assistants.map(assistant => (
          {
          id: assistant.id || '',
          name: assistant.name || '',
          description: assistant.description || '',
          summary: assistant.description ? assistant.description.substring(0, 50) + '...' : '',
          image: assistant.image || avatarImage,
          call_name: assistant.name || '',
          instructions: '',
          status: assistant.status || false,
          created_at: assistant.created_at || new Date().toISOString(),
          business: assistant.business || false,
          author_id: assistant.author_id || '1'
        }));
        
        return this.assistants;
      } catch(error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при загрузке ассистентов';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteAssistent(id: string) {
      try {
        const response = await agentService.deleteAgent(id);
        
        // Удаляем ассистента из локального состояния
        this.assistants = this.assistants.filter(assistant => assistant.id !== id);
        return response;
      } catch(error) {
        throw error;
      }
    },

    async fetchAssistentById(id: string) {
      try {
        const response = await agentService.getAgentById(id);
        return response;
      } catch(error) {
        throw error;
      }
    },
    
    // установка ассистента
    async installAssistent(id: string) {
      try {
        const response = await agentService.createAgentFromTemplate(id);
        // Обновляем список моих ассистентов после установки
        await this.getMyAssistents();
        
        return response;
      } catch(error) {
        notifications.success('Ошибка создания ассистента');
        throw error;
      }
    },

    setSortOption(option: SortOption) {
      this.sortOption = option;
    },

    setActiveFilter(filter: FilterOption) {
      this.activeFilter = filter;
    },

    setSearchQuery(query: string) {
      this.searchQuery = query;
    },

    // получение списка инструментов
    async getToolsList() {
      try {
        const response = await agentService.getToolsList();
        return response;
      } catch(error) {
        this.error = error instanceof Error ? error.message : 'Произошла ошибка при загрузке инструментов';
        throw error;
      }
    },
  },

  getters: {
    filteredAssistents(state): IAssistent[] {
      const filterMap: Record<FilterOption, (item: IAssistent) => boolean> = {
        all: () => true,
        business: (item) => item.business
      };

      const filtered = state.assistants.filter(filterMap[state.activeFilter]);
      
      // Если есть поисковый запрос, дополнительно фильтруем по нему
      if (state.searchQuery.trim()) {
        const searchLower = state.searchQuery.toLowerCase();
        return filtered.filter(assistant => 
          assistant.name.toLowerCase().includes(searchLower) ||
          assistant.description.toLowerCase().includes(searchLower)
        );
      }
      
      return filtered;
    },

    sortedAssistents(state): IAssistent[] {
      const sortMap: Record<SortOption, (a: IAssistent, b: IAssistent) => number> = {
        new: (a, b) => dayjs(b.created_at).unix() - dayjs(a.created_at).unix(),
        popular: (a, b) => (b.status ? 1 : 0) - (a.status ? 1 : 0)
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
