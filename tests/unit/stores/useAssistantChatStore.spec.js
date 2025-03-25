import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useAssistentChatStore } from '@/stores/useAssistantChatStore';
import { agentService } from '@/api/services/agentService';
import { setupPiniaForTesting } from './setup';
// Мокируем модули
vi.mock('@/api/services/agentService');
// Мокируем setTimeout
vi.useFakeTimers();
describe('useAssistentChatStore', () => {
    // Подготавливаем хранилище перед каждым тестом
    beforeEach(() => {
        // Устанавливаем Pinia
        setupPiniaForTesting();
        // Очищаем моки
        vi.clearAllMocks();
    });
    afterEach(() => {
        // Очищаем все привязки после каждого теста
        vi.restoreAllMocks();
    });
    describe('createNewSession', () => {
        it('должен создавать новую сессию', async () => {
            // Мокируем ответ от сервиса
            const mockResponse = {
                ID: 'session1',
                id: 'session1'
            };
            agentService.createDialog.mockResolvedValue(mockResponse);
            // Получаем хранилище
            const chatStore = useAssistentChatStore();
            // Выполняем действие
            const result = await chatStore.createNewSession('agent1');
            // Проверяем, что сервис был вызван с правильными параметрами
            expect(agentService.createDialog).toHaveBeenCalledWith('agent1');
            // Проверяем, что сессия была создана
            expect(chatStore.sessions.length).toBe(1);
            expect(chatStore.sessions[0].id).toBe('session1');
            expect(chatStore.sessions[0].agentId).toBe('agent1');
            // Проверяем, что сессия активна
            expect(chatStore.activeSessionId).toBe('session1');
            expect(chatStore.sessions[0].isActive).toBe(true);
            // Проверяем результат
            expect(result).toEqual(chatStore.sessions[0]);
        });
        it('должен обрабатывать ошибки при создании сессии', async () => {
            // Создаем ошибку
            const mockError = new Error('Ошибка создания сессии');
            // Мокируем ответ от сервиса с ошибкой
            agentService.createDialog.mockRejectedValue(mockError);
            // Получаем хранилище
            const chatStore = useAssistentChatStore();
            // Проверяем, что метод выбрасывает ошибку
            await expect(chatStore.createNewSession('agent1')).rejects.toThrow();
            // Проверяем, что сервис был вызван с правильными параметрами
            expect(agentService.createDialog).toHaveBeenCalledWith('agent1');
            // Проверяем, что сессия не была создана
            expect(chatStore.sessions.length).toBe(0);
        });
    });
    describe('selectSession', () => {
        it('должен выбирать сессию и сбрасывать счетчик непрочитанных сообщений', async () => {
            // Получаем хранилище
            const chatStore = useAssistentChatStore();
            // Создаем тестовые сессии
            chatStore.sessions = [
                {
                    id: 'session1',
                    title: 'Session 1',
                    timestamp: new Date().toISOString(),
                    isActive: false,
                    agentId: 'agent1',
                    unreadCount: 5
                },
                {
                    id: 'session2',
                    title: 'Session 2',
                    timestamp: new Date().toISOString(),
                    isActive: false,
                    agentId: 'agent2',
                    unreadCount: 3
                }
            ];
            // Мокируем метод загрузки сообщений
            const loadMessagesSpy = vi.spyOn(chatStore, 'loadDialogMessages').mockImplementation(() => Promise.resolve());
            // Выполняем действие
            chatStore.selectSession('session1');
            // Проверяем, что все сессии деактивированы
            expect(chatStore.sessions[1].isActive).toBe(false);
            // Проверяем, что выбранная сессия активна
            expect(chatStore.sessions[0].isActive).toBe(true);
            expect(chatStore.activeSessionId).toBe('session1');
            // Проверяем, что счетчик непрочитанных сообщений сброшен
            expect(chatStore.sessions[0].unreadCount).toBe(0);
            // Проверяем, что метод загрузки сообщений был вызван
            expect(loadMessagesSpy).toHaveBeenCalledWith('agent1', 'session1');
        });
    });
    describe('addMessage', () => {
        it('должен добавлять сообщение пользователя и получать ответ от ассистента', async () => {
            // Получаем хранилище
            const chatStore = useAssistentChatStore();
            // Создаем тестовую сессию
            chatStore.sessions = [
                {
                    id: 'session1',
                    title: 'Session 1',
                    timestamp: new Date().toISOString(),
                    isActive: true,
                    agentId: 'agent1',
                    unreadCount: 0
                }
            ];
            chatStore.activeSessionId = 'session1';
            // Мокируем ответ от сервиса
            const mockResponse = {
                ID: 'message3',
                Content: 'This is a response from the agent',
                conversation_id: true,
                ReplyID: '',
                Role: 'assistant',
                CreatedAt: new Date().toISOString()
            };
            agentService.addMessageToDialog.mockResolvedValue(mockResponse);
            // Выполняем действие - добавляем сообщение пользователя
            const message = await chatStore.addMessage('Hello, assistant!', true);
            // Проверяем, что сообщение пользователя было добавлено
            expect(chatStore.messages.length).toBe(1);
            expect(chatStore.messages[0].text).toBe('Hello, assistant!');
            expect(chatStore.messages[0].isUser).toBe(true);
            expect(chatStore.messages[0].sessionId).toBe('session1');
            // Проверяем, что сервис был вызван с правильными параметрами
            expect(agentService.addMessageToDialog).toHaveBeenCalledWith('agent1', 'session1', { message: 'Hello, assistant!' });
            // Проверяем, что флаг нового сообщения установлен
            expect(chatStore.newMessageReceived).toBe(true);
            // Проверяем, что в состоянии загрузки
            expect(chatStore.isLoading).toBe(true);
            // Проверяем результат
            expect(message).toEqual(chatStore.messages[0]);
            // Продвигаем таймеры, чтобы выполнилась задержка
            vi.advanceTimersByTime(1500);
            // Проверяем, что ответ от ассистента добавлен
            expect(chatStore.messages.length).toBe(2);
            expect(chatStore.messages[1].text).toBe('This is a response from the agent');
            expect(chatStore.messages[1].isUser).toBe(false);
            expect(chatStore.messages[1].sessionId).toBe('session1');
            // Проверяем, что состояние загрузки сброшено
            expect(chatStore.isLoading).toBe(false);
        });
        it('должен обновлять счетчик непрочитанных сообщений, если сессия не активна', async () => {
            // Получаем хранилище
            const chatStore = useAssistentChatStore();
            // Создаем тестовые сессии
            chatStore.sessions = [
                {
                    id: 'session1',
                    title: 'Session 1',
                    timestamp: new Date().toISOString(),
                    isActive: false,
                    agentId: 'agent1',
                    unreadCount: 0
                },
                {
                    id: 'session2',
                    title: 'Session 2',
                    timestamp: new Date().toISOString(),
                    isActive: true,
                    agentId: 'agent2',
                    unreadCount: 0
                }
            ];
            chatStore.activeSessionId = 'session2';
            // Добавляем сообщение ассистента в неактивную сессию
            await chatStore.addMessage('Message from assistant', false, 'session1');
            // Проверяем, что сообщение добавлено
            expect(chatStore.messages.length).toBe(1);
            expect(chatStore.messages[0].text).toBe('Message from assistant');
            expect(chatStore.messages[0].isUser).toBe(false);
            expect(chatStore.messages[0].sessionId).toBe('session1');
            // Проверяем, что счетчик непрочитанных сообщений увеличен
            expect(chatStore.sessions[0].unreadCount).toBe(1);
        });
    });
    describe('loadDialogMessages', () => {
        it('должен загружать сообщения диалога', async () => {
            // Получаем хранилище
            const chatStore = useAssistentChatStore();
            // Мокируем ответ от сервиса
            const mockResponse = {
                messages: [
                    {
                        id: 'message1',
                        content: 'Hello from user',
                        role: 'user',
                        created_at: '2023-01-01T00:00:00Z'
                    },
                    {
                        id: 'message2',
                        content: 'Hello from assistant',
                        role: 'assistant',
                        created_at: '2023-01-01T00:00:01Z'
                    }
                ]
            };
            agentService.getDialog.mockResolvedValue(mockResponse);
            // Выполняем действие
            await chatStore.loadDialogMessages('agent1', 'session1');
            // Проверяем, что сервис был вызван с правильными параметрами
            expect(agentService.getDialog).toHaveBeenCalledWith('agent1', 'session1');
            // Проверяем, что сообщения загружены
            expect(chatStore.messages.length).toBe(2);
            expect(chatStore.messages[0].text).toBe('Hello from user');
            expect(chatStore.messages[0].isUser).toBe(true);
            expect(chatStore.messages[1].text).toBe('Hello from assistant');
            expect(chatStore.messages[1].isUser).toBe(false);
            // Проверяем, что флаг нового сообщения установлен
            expect(chatStore.newMessageReceived).toBe(true);
        });
        it('не должен загружать сообщения, если они уже загружены', async () => {
            // Получаем хранилище
            const chatStore = useAssistentChatStore();
            // Добавляем существующие сообщения
            chatStore.messages = [
                {
                    id: 'message1',
                    text: 'Existing message',
                    isUser: true,
                    timestamp: new Date().toISOString(),
                    sessionId: 'session1'
                }
            ];
            // Выполняем действие
            await chatStore.loadDialogMessages('agent1', 'session1');
            // Проверяем, что сервис не был вызван
            expect(agentService.getDialog).not.toHaveBeenCalled();
            // Проверяем, что сообщения не изменились
            expect(chatStore.messages.length).toBe(1);
            expect(chatStore.messages[0].text).toBe('Existing message');
        });
    });
    describe('selectAssistantActiveSessions', () => {
        it('должен выбирать активную сессию для ассистента', async () => {
            // Получаем хранилище
            const chatStore = useAssistentChatStore();
            // Создаем тестовые сессии
            chatStore.sessions = [
                {
                    id: 'session1',
                    title: 'Session 1 for Agent 1',
                    timestamp: '2023-01-01T00:00:00Z',
                    isActive: false,
                    agentId: 'agent1',
                    unreadCount: 0
                },
                {
                    id: 'session2',
                    title: 'Session 2 for Agent 1',
                    timestamp: '2023-01-02T00:00:00Z',
                    isActive: false,
                    agentId: 'agent1',
                    unreadCount: 0
                },
                {
                    id: 'session3',
                    title: 'Session for Agent 2',
                    timestamp: '2023-01-03T00:00:00Z',
                    isActive: false,
                    agentId: 'agent2',
                    unreadCount: 0
                }
            ];
            // Мокируем метод загрузки сообщений
            const loadMessagesSpy = vi.spyOn(chatStore, 'loadDialogMessages').mockImplementation(() => Promise.resolve());
            // Выполняем действие - выбираем сессии для агента1
            chatStore.selectAssistantActiveSessions('agent1');
            // Проверяем, что самая последняя сессия для агента1 активна
            expect(chatStore.sessions[1].isActive).toBe(true);
            expect(chatStore.activeSessionId).toBe('session2');
            // Проверяем, что другие сессии не активны
            expect(chatStore.sessions[0].isActive).toBe(false);
            expect(chatStore.sessions[2].isActive).toBe(false);
            // Проверяем, что метод загрузки сообщений был вызван
            expect(loadMessagesSpy).toHaveBeenCalledWith('agent1', 'session2');
        });
        it('должен возвращать null, если у ассистента нет сессий', () => {
            // Получаем хранилище
            const chatStore = useAssistentChatStore();
            // Создаем тестовые сессии только для агента2
            chatStore.sessions = [
                {
                    id: 'session1',
                    title: 'Session for Agent 2',
                    timestamp: new Date().toISOString(),
                    isActive: false,
                    agentId: 'agent2',
                    unreadCount: 0
                }
            ];
            // Выполняем действие - выбираем сессии для агента1
            chatStore.selectAssistantActiveSessions('agent1');
            // Проверяем, что активная сессия не установлена
            expect(chatStore.activeSessionId).toBeNull();
        });
    });
    describe('resetNewMessageFlag', () => {
        it('должен сбрасывать флаг нового сообщения', () => {
            // Получаем хранилище
            const chatStore = useAssistentChatStore();
            // Устанавливаем флаг
            chatStore.newMessageReceived = true;
            // Выполняем действие
            chatStore.resetNewMessageFlag();
            // Проверяем результат
            expect(chatStore.newMessageReceived).toBe(false);
        });
    });
});
