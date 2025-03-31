import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import apiClient from '@/api/apiClient';
import { agentService } from '@/api/services/agentService';
import { CacheManager } from '@/api/cacheManager';
import { ApiErrorHandler } from '@/api/errorHandler';
// Мокаем зависимости
jest.mock('@/api/apiClient', () => {
    const instance = axios.create();
    return instance;
});
jest.mock('@/api/cacheManager', () => ({
    CacheManager: {
        getOrFetch: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn(),
        isFresh: jest.fn()
    }
}));
jest.mock('@/api/errorHandler', () => ({
    ApiErrorHandler: {
        handleError: jest.fn()
    }
}));
describe('agentService', () => {
    let mockApi;
    beforeEach(() => {
        // Создаем мок для axios
        mockApi = new MockAdapter(apiClient);
        jest.clearAllMocks();
    });
    afterEach(() => {
        mockApi.reset();
    });
    describe('fetchAgentsTemplates', () => {
        it('должен использовать кэш и вернуть шаблоны агентов', async () => {
            const mockResponse = {
                data: [
                    {
                        id: '1',
                        name: 'Template 1',
                        status: 1,
                        description: 'Description 1'
                    },
                    {
                        id: '2',
                        name: 'Template 2',
                        status: 1,
                        description: 'Description 2'
                    }
                ]
            };
            // Настраиваем CacheManager.getOrFetch для возврата данных
            CacheManager.getOrFetch.mockResolvedValue(mockResponse);
            const result = await agentService.fetchAgentsTemplates();
            // Проверяем, что CacheManager.getOrFetch был вызван с правильными параметрами
            expect(CacheManager.getOrFetch).toHaveBeenCalledWith('agentsTemplates', expect.any(Function), { ttl: 3600000, staleWhileRevalidate: true });
            // Проверяем результат
            expect(result).toEqual(mockResponse);
        });
        it('должен обрабатывать ошибки и возвращать пустой массив', async () => {
            // Настраиваем CacheManager.getOrFetch для выброса ошибки
            CacheManager.getOrFetch.mockRejectedValue(new Error('Тестовая ошибка'));
            const result = await agentService.fetchAgentsTemplates();
            // Проверяем, что вернулся пустой массив
            expect(result).toEqual({ data: [] });
        });
    });
    describe('createAgent', () => {
        it('должен создавать нового агента и возвращать его данные', async () => {
            const mockResponse = {
                id: '123',
                name: 'New Agent',
                status: 1,
                description: 'New agent description',
                instructions: 'Agent instructions'
            };
            // Настройка мока для ответа API
            mockApi.onGet('/v1/agents/create').reply(200, mockResponse);
            // Настраиваем CacheManager.getOrFetch для вызова реального запроса
            CacheManager.getOrFetch.mockImplementation(async (key, fetchFn) => fetchFn());
            const result = await agentService.createAgent();
            // Проверяем, что CacheManager.getOrFetch был вызван с правильными параметрами
            expect(CacheManager.getOrFetch).toHaveBeenCalledWith('createAgent', expect.any(Function), { ttl: 3600000, staleWhileRevalidate: true });
            // Проверяем результат
            expect(result).toEqual(mockResponse);
        });
        it('должен обрабатывать ошибки при создании агента', async () => {
            // Настройка мока для ответа API с ошибкой
            mockApi.onGet('/v1/agents/create').reply(500);
            // Настраиваем CacheManager.getOrFetch для вызова реального запроса
            CacheManager.getOrFetch.mockImplementation(async (key, fetchFn) => {
                try {
                    return await fetchFn();
                }
                catch (error) {
                    throw error;
                }
            });
            // Проверяем, что метод выбрасывает ошибку
            await expect(agentService.createAgent()).rejects.toThrow();
            // Проверяем, что ApiErrorHandler.handleError был вызван
            expect(ApiErrorHandler.handleError).toHaveBeenCalled();
        });
    });
    describe('getAgentById', () => {
        it('должен получать агента по ID', async () => {
            const mockResponse = {
                id: '123',
                name: 'Agent 123',
                status: 1,
                description: 'Agent description',
                instructions: 'Agent instructions'
            };
            // Настройка мока для ответа API
            mockApi.onGet('/v1/agents/123').reply(200, mockResponse);
            const result = await agentService.getAgentById('123');
            // Проверяем результат
            expect(result).toEqual(mockResponse);
        });
    });
    describe('createAgentFromTemplate', () => {
        it('должен создавать агента из шаблона', async () => {
            const mockResponse = {
                id: '123',
                name: 'Template Agent',
                status: 1,
                description: 'Template description',
                instructions: 'Template instructions'
            };
            // Настройка мока для ответа API
            mockApi.onGet('/v1/agents/template-123/workflow').reply(200, mockResponse);
            const result = await agentService.createAgentFromTemplate('template-123');
            // Проверяем результат
            expect(result).toEqual(mockResponse);
        });
    });
    describe('getMyAgents', () => {
        it('должен получать список агентов пользователя', async () => {
            const mockResponse = {
                assistants: [
                    {
                        id: '1',
                        name: 'Agent 1',
                        description: 'Description 1',
                        created_at: '2023-01-01'
                    },
                    {
                        id: '2',
                        name: 'Agent 2',
                        description: 'Description 2',
                        created_at: '2023-01-02'
                    }
                ]
            };
            // Настройка мока для ответа API
            mockApi.onGet('/v1/agents/my').reply(200, mockResponse);
            const result = await agentService.getMyAgents();
            // Проверяем результат
            expect(result).toEqual(mockResponse);
        });
    });
    describe('deleteAgent', () => {
        it('должен удалять агента', async () => {
            const mockResponse = {
                id: '123',
                name: 'Deleted Agent',
                status: 1,
                description: 'Deleted description',
                instructions: 'Deleted instructions'
            };
            // Настройка мока для ответа API
            mockApi.onDelete('/v1/agents/123').reply(200, mockResponse);
            const result = await agentService.deleteAgent('123');
            // Проверяем результат
            expect(result).toEqual(mockResponse);
        });
    });
    describe('addMessageToDialog', () => {
        it('должен добавлять сообщение в диалог', async () => {
            const mockMessage = {
                ID: '123',
                Content: 'Test message',
                conversation_id: true,
                ReplyID: '',
                Role: 'user',
                CreatedAt: '2023-01-01T00:00:00Z'
            };
            const agentId = 'agent-123';
            const conversationId = 'conversation-123';
            const messageData = { text: 'Test message' };
            // Настройка мока для ответа API
            mockApi.onPost(`/v1/conversation/${agentId}/${conversationId}/reply`).reply(200, mockMessage);
            const result = await agentService.addMessageToDialog(agentId, conversationId, messageData);
            // Проверяем результат
            expect(result).toEqual(mockMessage);
            // Проверяем, что запрос был отправлен с правильными данными
            expect(mockApi.history.post[0].data).toBe(JSON.stringify(messageData));
        });
    });
});
