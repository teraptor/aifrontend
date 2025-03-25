import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import apiClient from '@/api/apiClient';
import { authService } from '@/api/services/authService';
// Мокаем axios
jest.mock('@/api/apiClient', () => {
    const instance = axios.create();
    return instance;
});
describe('authService', () => {
    let mockApi;
    beforeEach(() => {
        // Создаем мок для axios
        mockApi = new MockAdapter(apiClient);
        localStorage.clear();
    });
    afterEach(() => {
        mockApi.reset();
    });
    describe('login', () => {
        it('должен отправить запрос на логин и вернуть данные пользователя', async () => {
            // Подготовка данных для теста
            const credentials = {
                email: 'test@example.com',
                password: 'password'
            };
            const mockResponse = {
                user_id: '123',
                email: 'test@example.com',
                access_token: 'mock-access-token',
                refresh_token: 'mock-refresh-token',
                expires_in: 3600
            };
            // Настройка мока для ответа
            mockApi.onPost('/v1/auth/login').reply(200, mockResponse);
            // Вызываем тестируемый метод
            const result = await authService.login(credentials);
            // Проверяем результат
            expect(result).toEqual(mockResponse);
        });
        it('должен выбросить ошибку, если запрос на логин не удался', async () => {
            // Подготовка данных для теста
            const credentials = {
                email: 'test@example.com',
                password: 'password'
            };
            // Настройка мока для ответа с ошибкой
            mockApi.onPost('/v1/auth/login').reply(401);
            // Проверяем, что метод выбрасывает ошибку
            await expect(authService.login(credentials)).rejects.toThrow();
        });
    });
    describe('register', () => {
        it('должен отправить запрос на регистрацию и вернуть данные пользователя', async () => {
            // Подготовка данных для теста
            const credentials = {
                email: 'test@example.com',
                password: 'password'
            };
            const mockResponse = {
                user_id: '123',
                email: 'test@example.com',
                access_token: 'mock-access-token',
                refresh_token: 'mock-refresh-token',
                expires_in: 3600
            };
            // Настройка мока для ответа
            mockApi.onPost('/v1/auth/register').reply(200, mockResponse);
            // Вызываем тестируемый метод
            const result = await authService.register(credentials);
            // Проверяем результат
            expect(result).toEqual(mockResponse);
        });
        it('должен выбросить ошибку, если запрос на регистрацию не удался', async () => {
            // Подготовка данных для теста
            const credentials = {
                email: 'test@example.com',
                password: 'password'
            };
            // Настройка мока для ответа с ошибкой
            mockApi.onPost('/v1/auth/register').reply(400);
            // Проверяем, что метод выбрасывает ошибку
            await expect(authService.register(credentials)).rejects.toThrow();
        });
    });
    describe('logout', () => {
        it('должен отправить запрос на выход', async () => {
            // Настройка мока для ответа
            mockApi.onPost('/auth/logout').reply(200);
            // Вызываем тестируемый метод
            await authService.logout();
            // Проверяем, что запрос был отправлен
            expect(mockApi.history.post.length).toBe(1);
            expect(mockApi.history.post[0].url).toBe('/auth/logout');
        });
    });
    describe('refreshToken', () => {
        it('должен отправить запрос на обновление токена и вернуть новый токен', async () => {
            const mockResponse = {
                user_id: '123',
                email: 'test@example.com',
                access_token: 'new-access-token',
                refresh_token: 'new-refresh-token',
                expires_in: 3600
            };
            // Настройка мока для ответа
            mockApi.onPost('/v1/auth/refresh').reply(200, mockResponse);
            // Вызываем тестируемый метод
            const result = await authService.refreshToken();
            // Проверяем результат
            expect(result).toEqual(mockResponse);
        });
    });
    describe('getCurrentUser', () => {
        it('должен отправить запрос на получение данных пользователя', async () => {
            const mockResponse = 'test@example.com';
            // Настройка мока для ответа
            mockApi.onGet('/v1/auth/me').reply(200, mockResponse);
            // Вызываем тестируемый метод
            const result = await authService.getCurrentUser();
            // Проверяем результат
            expect(result).toEqual(mockResponse);
        });
    });
});
