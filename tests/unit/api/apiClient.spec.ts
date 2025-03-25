import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import apiClient from '@/api/apiClient';
import { notifications } from '@/plugins/notifications';
import router from '@/router';

// Мокаем зависимости
jest.mock('@/plugins/notifications', () => ({
  notifications: {
    error: jest.fn()
  }
}));

jest.mock('@/router', () => ({
  push: jest.fn()
}));

describe('apiClient', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    // Создаем мок для axios
    mockAxios = new MockAdapter(apiClient);
    
    // Очищаем состояние перед каждым тестом
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockAxios.reset();
  });

  describe('interceptors', () => {
    it('должен добавлять токен авторизации, если он есть в localStorage', async () => {
      // Установка токена в localStorage
      localStorage.setItem('accessToken', 'test-token');
      
      // Настройка мока для успешного ответа
      mockAxios.onGet('/test').reply(config => {
        // Проверяем, что токен установлен в заголовке
        expect(config.headers?.Authorization).toBe('Bearer test-token');
        return [200, { success: true }];
      });
      
      // Выполняем запрос
      await apiClient.get('/test');
    });
    
    it('должен обрабатывать ошибку 401 и показывать уведомление', async () => {
      // Настройка мока для ошибки 401
      mockAxios.onGet('/test').reply(401);
      
      try {
        await apiClient.get('/test');
      } catch (error) {
        // Проверяем, что показано уведомление об ошибке
        expect(notifications.error).toHaveBeenCalledWith('Сессия истекла, войдите снова');
        
        // Проверяем, что токены удалены из localStorage
        expect(localStorage.getItem('accessToken')).toBeNull();
        expect(localStorage.getItem('refreshToken')).toBeNull();
      }
    });
    
    it('должен обрабатывать ошибку 403 и показывать уведомление', async () => {
      // Настройка мока для ошибки 403
      mockAxios.onGet('/test').reply(403);
      
      try {
        await apiClient.get('/test');
      } catch (error) {
        // Проверяем, что показано уведомление об ошибке
        expect(notifications.error).toHaveBeenCalledWith('Доступ запрещен');
      }
    });
    
    it('должен обрабатывать ошибку 500 и показывать уведомление', async () => {
      // Настройка мока для ошибки 500
      mockAxios.onGet('/test').reply(500);
      
      try {
        await apiClient.get('/test');
      } catch (error) {
        // Проверяем, что показано уведомление об ошибке
        expect(notifications.error).toHaveBeenCalledWith('Внутренняя ошибка сервера');
      }
    });
    
    it('должен обрабатывать ошибку при отсутствии ответа сервера', async () => {
      // Настройка мока для имитации отсутствия ответа
      mockAxios.onGet('/test').networkError();
      
      try {
        await apiClient.get('/test');
      } catch (error) {
        // Проверяем, что показано уведомление об ошибке
        expect(notifications.error).toHaveBeenCalledWith('Сервер не отвечает');
      }
    });
  });
}); 