import { setActivePinia, createPinia } from 'pinia';
import { useAssistentsStore } from '../useAssistantsStore';
import { agentService } from '@/api/services/agentService';
import { useAuthStore } from '../useAuthStore';

// Моки для зависимостей
jest.mock('@/api/services/agentService');
jest.mock('../useAuthStore', () => ({
  useAuthStore: jest.fn()
}));

describe('useAssistentsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    jest.clearAllMocks();
  });

  describe('state', () => {
    it('должен иметь начальное состояние', () => {
      const store = useAssistentsStore();
      
      expect(store.assistants).toEqual([]);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.sortOption).toBe('popular');
      expect(store.activeFilter).toBe('all');
      expect(store.searchQuery).toBe('');
    });
  });

  describe('actions', () => {
    describe('fetchAssitantents', () => {
      it('должен успешно загружать шаблоны ассистентов', async () => {
        const mockTemplates = [
          {
            id: '1',
            name: 'Test Assistant',
            description: 'Test Description',
            status: true
          }
        ];

        (agentService.fetchAgentsTemplates as jest.Mock).mockResolvedValue(mockTemplates);
        const store = useAssistentsStore();

        await store.fetchAssitantents();

        expect(store.assistants).toHaveLength(1);
        expect(store.assistants[0].id).toBe('1');
        expect(store.assistants[0].name).toBe('Test Assistant');
        expect(store.isLoading).toBe(false);
      });

      it('должен обрабатывать ошибки при загрузке', async () => {
        const error = new Error('Test error');
        (agentService.fetchAgentsTemplates as jest.Mock).mockRejectedValue(error);
        const store = useAssistentsStore();

        await expect(store.fetchAssitantents()).rejects.toThrow('Test error');
        expect(store.error).toBe('Test error');
      });
    });

    describe('getMyAssistents', () => {
      it('должен успешно загружать ассистентов пользователя', async () => {
        const mockResponse = {
          assistants: [
            {
              id: '1',
              name: 'My Assistant',
              description: 'My Description',
              status: true,
              created_at: '2024-01-01'
            }
          ]
        };

        (agentService.getMyAgents as jest.Mock).mockResolvedValue(mockResponse);
        const store = useAssistentsStore();

        await store.getMyAssistents();

        expect(store.assistants).toHaveLength(1);
        expect(store.assistants[0].id).toBe('1');
        expect(store.assistants[0].name).toBe('My Assistant');
        expect(store.isLoading).toBe(false);
      });
    });

    describe('deleteAssistent', () => {
      it('должен успешно удалять ассистента', async () => {
        const store = useAssistentsStore();
        store.assistants = [
          { id: '1', name: 'Test', description: '', summary: '', image: '', call_name: '', status: true, created_at: '', business: false, author_id: '1' }
        ];

        (agentService.deleteAgent as jest.Mock).mockResolvedValue({ success: true });
        
        await store.deleteAssistent('1');
        
        expect(store.assistants).toHaveLength(0);
      });
    });
  });

  describe('getters', () => {
    describe('filteredAssistents', () => {
      it('должен фильтровать ассистентов по активному фильтру', () => {
        const store = useAssistentsStore();
        store.assistants = [
          { id: '1', name: 'Business', description: '', summary: '', image: '', call_name: '', status: true, created_at: '', business: true, author_id: '1' },
          { id: '2', name: 'Regular', description: '', summary: '', image: '', call_name: '', status: true, created_at: '', business: false, author_id: '1' }
        ];

        store.activeFilter = 'business';
        expect(store.filteredAssistents).toHaveLength(1);
        expect(store.filteredAssistents[0].business).toBe(true);
      });

      it('должен фильтровать ассистентов по поисковому запросу', () => {
        const store = useAssistentsStore();
        store.assistants = [
          { id: '1', name: 'Test Assistant', description: 'Test', summary: '', image: '', call_name: '', status: true, created_at: '', business: false, author_id: '1' },
          { id: '2', name: 'Another', description: 'Another', summary: '', image: '', call_name: '', status: true, created_at: '', business: false, author_id: '1' }
        ];

        store.searchQuery = 'Test';
        expect(store.filteredAssistents).toHaveLength(1);
        expect(store.filteredAssistents[0].name).toBe('Test Assistant');
      });
    });

    describe('sortedAssistents', () => {
      it('должен сортировать ассистентов по популярности', () => {
        const store = useAssistentsStore();
        store.assistants = [
          { id: '1', name: 'Inactive', description: '', summary: '', image: '', call_name: '', status: false, created_at: '', business: false, author_id: '1' },
          { id: '2', name: 'Active', description: '', summary: '', image: '', call_name: '', status: true, created_at: '', business: false, author_id: '1' }
        ];

        store.sortOption = 'popular';
        expect(store.sortedAssistents[0].status).toBe(true);
      });
    });

    describe('userAssistents', () => {
      it('должен возвращать только ассистентов авторизованного пользователя', () => {
        const store = useAssistentsStore();
        store.assistants = [
          { id: '1', name: 'User1', description: '', summary: '', image: '', call_name: '', status: true, created_at: '', business: false, author_id: '1' },
          { id: '2', name: 'User2', description: '', summary: '', image: '', call_name: '', status: true, created_at: '', business: false, author_id: '2' }
        ];

        (useAuthStore as unknown as jest.Mock).mockReturnValue({ isAuthenticated: true });
        expect(store.userAssistents).toHaveLength(1);
        expect(store.userAssistents[0].author_id).toBe('1');
      });
    });
  });
}); 