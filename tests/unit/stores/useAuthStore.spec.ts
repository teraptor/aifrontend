import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useAuthStore } from '@/stores/useAuthStore';
import { authService } from '@/api/services/authService';
import { notifications } from '@/plugins/notifications';
import { setupPiniaForTesting } from './setup';

// Мокируем модули
vi.mock('@/api/services/authService');
vi.mock('@/plugins/notifications');

describe('useAuthStore', () => {
  // Подготавливаем хранилище перед каждым тестом
  beforeEach(() => {
    // Устанавливаем Pinia
    setupPiniaForTesting();
    
    // Очищаем моки
    vi.clearAllMocks();
    
    // Очищаем localStorage
    localStorage.clear();
  });
  
  afterEach(() => {
    // Очищаем все привязки после каждого теста
    vi.restoreAllMocks();
  });
  
  describe('login', () => {
    it('должен авторизовать пользователя и обновить состояние', async () => {
      // Подготавливаем данные для теста
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const mockResponse = {
        user_id: '1',
        email: 'test@example.com',
        access_token: 'mocked-access-token',
        refresh_token: 'mocked-refresh-token',
        expires_in: 3600
      };
      
      // Мокируем ответ от authService
      (authService.login as any).mockResolvedValue(mockResponse);
      
      // Получаем хранилище
      const authStore = useAuthStore();
      
      // Выполняем авторизацию
      const result = await authStore.login(credentials);
      
      // Проверяем, что сервис был вызван с правильными параметрами
      expect(authService.login).toHaveBeenCalledWith(credentials);
      
      // Проверяем, что токены сохранились в хранилище
      expect(authStore.token).toBe(mockResponse.access_token);
      expect(authStore.refreshToken).toBe(mockResponse.refresh_token);
      
      // Проверяем, что пользователь авторизован
      expect(authStore.isAuthenticated).toBe(true);
      
      // Проверяем, что ID пользователя установлен
      expect(authStore.currentUserId).toBe(parseInt(mockResponse.user_id));
      
      // Проверяем, что токены сохранились в localStorage
      expect(localStorage.getItem('accessToken')).toBe(mockResponse.access_token);
      expect(localStorage.getItem('refreshToken')).toBe(mockResponse.refresh_token);
      
      // Проверяем результат
      expect(result).toBe(mockResponse.email);
    });
    
    it('должен обрабатывать ошибки авторизации', async () => {
      // Подготавливаем данные для теста
      const credentials = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };
      
      const mockError = new Error('Неверные учетные данные');
      
      // Мокируем ответ от authService с ошибкой
      (authService.login as any).mockRejectedValue(mockError);
      
      // Получаем хранилище
      const authStore = useAuthStore();
      
      // Проверяем, что метод выбрасывает ошибку
      await expect(authStore.login(credentials)).rejects.toThrow();
      
      // Проверяем, что сервис был вызван с правильными параметрами
      expect(authService.login).toHaveBeenCalledWith(credentials);
      
      // Проверяем, что уведомление об ошибке было показано
      expect(notifications.error).toHaveBeenCalledWith(mockError.message);
      
      // Проверяем, что пользователь не авторизован
      expect(authStore.isAuthenticated).toBe(false);
      
      // Проверяем, что токены не сохранились
      expect(authStore.token).toBeNull();
      expect(authStore.refreshToken).toBeNull();
    });
  });
  
  describe('logout', () => {
    it('должен выйти из системы и очистить состояние', () => {
      // Получаем хранилище
      const authStore = useAuthStore();
      
      // Устанавливаем начальное состояние
      authStore.isAuthenticated = true;
      authStore.currentUserId = 1;
      
      // Выполняем выход
      authStore.logout();
      
      // Проверяем, что пользователь не авторизован после выхода
      expect(authStore.isAuthenticated).toBe(false);
      
      // Проверяем, что ID пользователя сброшен
      expect(authStore.currentUserId).toBeNull();
    });
  });
  
  describe('register', () => {
    it('должен регистрировать нового пользователя', async () => {
      // Подготавливаем данные для теста
      const credentials = {
        email: 'new@example.com',
        password: 'newpassword123'
      };
      
      const mockResponse = {
        user_id: '2',
        email: 'new@example.com',
        access_token: 'mocked-access-token',
        refresh_token: 'mocked-refresh-token',
        expires_in: 3600
      };
      
      // Мокируем ответ от authService
      (authService.register as any).mockResolvedValue(mockResponse);
      
      // Получаем хранилище
      const authStore = useAuthStore();
      
      // Выполняем регистрацию
      const result = await authStore.register(credentials);
      
      // Проверяем, что сервис был вызван с правильными параметрами
      expect(authService.register).toHaveBeenCalledWith(credentials);
      
      // Проверяем, что уведомление об успехе было показано
      expect(notifications.success).toHaveBeenCalledWith('Регистрация прошла успешно');
      
      // Проверяем результат
      expect(result).toBe(true);
    });
    
    it('должен обрабатывать ошибки регистрации', async () => {
      // Подготавливаем данные для теста
      const credentials = {
        email: 'existing@example.com',
        password: 'password123'
      };
      
      const mockError = new Error('Пользователь с таким email уже существует');
      
      // Мокируем ответ от authService с ошибкой
      (authService.register as any).mockRejectedValue(mockError);
      
      // Получаем хранилище
      const authStore = useAuthStore();
      
      // Проверяем, что метод выбрасывает ошибку
      await expect(authStore.register(credentials)).rejects.toThrow();
      
      // Проверяем, что сервис был вызван с правильными параметрами
      expect(authService.register).toHaveBeenCalledWith(credentials);
      
      // Проверяем, что уведомление об ошибке было показано
      expect(notifications.error).toHaveBeenCalledWith(mockError.message);
    });
  });
  
  describe('getters', () => {
    it('должен возвращать роль пользователя', () => {
      // Получаем хранилище
      const authStore = useAuthStore();
      
      // Устанавливаем начальное состояние
      authStore.user = {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'admin',
        accessToken: 'token',
        refreshToken: 'refreshToken'
      };
      
      // Проверяем геттер
      expect(authStore.userRole).toBe('admin');
    });
    
    it('должен возвращать профиль текущего пользователя', () => {
      // Получаем хранилище
      const authStore = useAuthStore();
      
      // Устанавливаем начальное состояние
      authStore.currentUserId = 1;
      
      // Проверяем геттер
      const profile = authStore.currentUserProfile;
      
      // Проверяем, что профиль найден
      expect(profile).not.toBeNull();
      expect(profile?.id).toBe('1');
      expect(profile?.email).toBe('admin@example.com');
      expect(profile?.role).toBe('admin');
    });
    
    it('должен возвращать null, если пользователь не найден', () => {
      // Получаем хранилище
      const authStore = useAuthStore();
      
      // Устанавливаем начальное состояние
      authStore.currentUserId = 999; // Несуществующий ID
      
      // Проверяем геттер
      expect(authStore.currentUserProfile).toBeNull();
    });
  });
}); 