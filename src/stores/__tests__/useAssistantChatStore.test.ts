import { setActivePinia, createPinia } from 'pinia';
import { useAssistentChatStore } from '../useAssistantChatStore';
import { agentService } from '@/api/services/agentService';
import { notifications } from '@/plugins/notifications';

// Моки для зависимостей
jest.mock('@/api/services/agentService');
jest.mock('@/plugins/notifications');

describe('useAssistentChatStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    jest.clearAllMocks();
  });

  describe('state', () => {
    it('должен иметь начальное состояние', () => {
      const store = useAssistentChatStore();
      
      expect(store.sessions).toEqual([]);
      expect(store.messages).toEqual([]);
      expect(store.activeSessionId).toBeNull();
      expect(store.newMessageReceived).toBe(false);
      expect(store.isLoading).toBe(false);
      expect(store.lastReceivedMessageSessionId).toBeNull();
      expect(store.pendingResponses).toEqual([]);
    });
  });

  describe('actions', () => {
    describe('addMessage', () => {
      it('должен добавлять сообщение в активный диалог', async () => {
        const store = useAssistentChatStore();
        const sessionId = 'test-session';
        store.sessions = [{
          id: sessionId,
          title: 'Test Session',
          timestamp: new Date().toISOString(),
          isActive: true,
          agentId: 'test-agent',
          unreadCount: 0
        }];
        store.activeSessionId = sessionId;

        const message = await store.addMessage('Hello', true);

        expect(message).toBeDefined();
        expect(store.messages).toHaveLength(1);
        expect(store.messages[0].text).toBe('Hello');
        expect(store.messages[0].isUser).toBe(true);
        expect(store.messages[0].sessionId).toBe(sessionId);
        expect(store.pendingResponses).toHaveLength(1);
        expect(store.isLoading).toBe(true);
      });

      it('должен увеличивать счетчик непрочитанных сообщений для неактивного диалога', async () => {
        const store = useAssistentChatStore();
        const sessionId = 'test-session';
        store.sessions = [{
          id: sessionId,
          title: 'Test Session',
          timestamp: new Date().toISOString(),
          isActive: false,
          agentId: 'test-agent',
          unreadCount: 0
        }];
        store.activeSessionId = 'other-session';

        await store.addMessage('Hello', false, sessionId);

        expect(store.sessions[0].unreadCount).toBe(1);
      });
    });

    describe('createNewSession', () => {
      it('должен создавать новую сессию', async () => {
        const mockResponse = { id: 'new-session-id' };
        (agentService.createDialog as jest.Mock).mockResolvedValue(mockResponse);
        const store = useAssistentChatStore();

        const session = await store.createNewSession('test-agent');

        expect(session).toBeDefined();
        expect(session.id).toBe('new-session-id');
        expect(store.sessions).toHaveLength(1);
        expect(store.activeSessionId).toBe('new-session-id');
        expect(store.sessions[0].isActive).toBe(true);
      });
    });

    describe('selectSession', () => {
      it('должен активировать выбранную сессию и сбрасывать счетчик непрочитанных сообщений', () => {
        const store = useAssistentChatStore();
        const sessionId = 'test-session';
        store.sessions = [
          {
            id: sessionId,
            title: 'Test Session',
            timestamp: new Date().toISOString(),
            isActive: false,
            agentId: 'test-agent',
            unreadCount: 5
          },
          {
            id: 'other-session',
            title: 'Other Session',
            timestamp: new Date().toISOString(),
            isActive: true,
            agentId: 'test-agent',
            unreadCount: 0
          }
        ];

        store.selectSession(sessionId);

        expect(store.sessions[0].isActive).toBe(true);
        expect(store.sessions[1].isActive).toBe(false);
        expect(store.activeSessionId).toBe(sessionId);
        expect(store.sessions[0].unreadCount).toBe(0);
        expect(store.isLoading).toBe(false);
      });
    });

    describe('loadDialogMessages', () => {
      it('должен загружать сообщения диалога', async () => {
        const mockResponse = {
          messages: [
            {
              id: '1',
              content: 'Hello',
              role: 'user',
              created_at: '2024-01-01T00:00:00Z'
            },
            {
              id: '2',
              content: 'Hi',
              role: 'assistant',
              created_at: '2024-01-01T00:01:00Z'
            }
          ]
        };

        (agentService.getConversation as jest.Mock).mockResolvedValue(mockResponse);
        const store = useAssistentChatStore();

        await store.loadDialogMessages('test-agent', 'test-session');

        expect(store.messages).toHaveLength(2);
        expect(store.messages[0].text).toBe('Hello');
        expect(store.messages[1].text).toBe('Hi');
        expect(store.isLoading).toBe(false);
      });

      it('должен обновлять название диалога, если оно пришло в ответе', async () => {
        const mockResponse = {
          name: 'New Title',
          messages: []
        };

        (agentService.getConversation as jest.Mock).mockResolvedValue(mockResponse);
        const store = useAssistentChatStore();
        store.sessions = [{
          id: 'test-session',
          title: 'Old Title',
          timestamp: new Date().toISOString(),
          isActive: true,
          agentId: 'test-agent',
          unreadCount: 0
        }];

        await store.loadDialogMessages('test-agent', 'test-session');

        expect(store.sessions[0].title).toBe('New Title');
      });
    });

    describe('loadDialogs', () => {
      it('должен загружать диалоги ассистента', async () => {
        const mockResponse = [
          {
            id: '1',
            name: 'Dialog 1',
            created_at: '2024-01-01T00:00:00Z',
            unread_count: 0
          },
          {
            id: '2',
            name: 'Dialog 2',
            created_at: '2024-01-02T00:00:00Z',
            unread_count: 1
          }
        ];

        (agentService.getDialogs as jest.Mock).mockResolvedValue(mockResponse);
        const store = useAssistentChatStore();

        await store.loadDialogs('test-agent');

        expect(store.sessions).toHaveLength(2);
        expect(store.sessions[0].title).toBe('Dialog 1');
        expect(store.sessions[1].title).toBe('Dialog 2');
        expect(store.sessions[1].unreadCount).toBe(1);
      });
    });

    describe('updateSessionTitle', () => {
      it('должен обновлять название сессии', () => {
        const store = useAssistentChatStore();
        store.sessions = [{
          id: 'test-session',
          title: 'Old Title',
          timestamp: new Date().toISOString(),
          isActive: true,
          agentId: 'test-agent',
          unreadCount: 0
        }];

        store.updateSessionTitle('test-session', 'New Title');

        expect(store.sessions[0].title).toBe('New Title');
      });
    });
  });
}); 