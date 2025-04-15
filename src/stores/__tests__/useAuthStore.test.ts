import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../useAuthStore';
import { authService } from '@/api/services/authService';
import { billingService } from '@/api/services/billingService';
import Cookies from 'js-cookie';
import { notifications } from '@/plugins/notifications';

// Моки для зависимостей
jest.mock('@/api/services/authService');
jest.mock('@/api/services/billingService');
jest.mock('@/plugins/notifications');
jest.mock('js-cookie');

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('state', () => {
    it('должен иметь начальное состояние', () => {
      const store = useAuthStore();
      
      expect(store.isAuthenticated).toBe(false);
      expect(store.user).toBeNull();
      expect(store.token).toBeNull();
      expect(store.refreshToken).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.currentUserId).toBeNull();
      expect(store.users).toEqual([]);
      expect(store.userProfiles).toEqual([]);
      expect(store.nextUserId).toBe(1);
      expect(store.refreshTokenInterval).toBeNull();
    });
  });

  describe('actions', () => {
    describe('login', () => {
      it('должен успешно выполнять вход', async () => {
        const mockResponse = {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          user_id: '1',
          email: 'test@example.com'
        };

        (authService.login as jest.Mock).mockResolvedValue(mockResponse);
        const store = useAuthStore();

        const credentials = {
          email: 'test@example.com',
          password: 'password123'
        };

        await store.login(credentials);

        expect(store.isAuthenticated).toBe(true);
        expect(store.token).toBe('test-access-token');
        expect(store.refreshToken).toBe('test-refresh-token');
        expect(store.currentUserId).toBe(1);
        expect(localStorage.getItem('accessToken')).toBe('test-access-token');
        expect(Cookies.set).toHaveBeenCalledWith('refreshToken', 'test-refresh-token', expect.any(Object));
      });

      it('должен обрабатывать ошибки при входе', async () => {
        const error = new Error('Invalid credentials');
        (authService.login as jest.Mock).mockRejectedValue(error);
        const store = useAuthStore();

        const credentials = {
          email: 'test@example.com',
          password: 'wrong-password'
        };

        await expect(store.login(credentials)).rejects.toThrow('Invalid credentials');
        expect(notifications.error).toHaveBeenCalledWith('Invalid credentials');
      });
    });

    describe('logout', () => {
      it('должен успешно выполнять выход', () => {
        const store = useAuthStore();
        store.isAuthenticated = true;
        store.token = 'test-token';
        store.refreshToken = 'test-refresh-token';
        store.currentUserId = 1;

        store.logout();

        expect(store.isAuthenticated).toBe(false);
        expect(store.token).toBeNull();
        expect(store.refreshToken).toBeNull();
        expect(store.currentUserId).toBeNull();
        expect(localStorage.getItem('accessToken')).toBeNull();
        expect(Cookies.remove).toHaveBeenCalledWith('refreshToken');
      });
    });

    describe('register', () => {
      it('должен успешно регистрировать пользователя', async () => {
        const mockResponse = { success: true };
        (authService.register as jest.Mock).mockResolvedValue(mockResponse);
        (authService.login as jest.Mock).mockResolvedValue({
          access_token: 'test-token',
          refresh_token: 'test-refresh-token',
          user_id: '1'
        });

        const store = useAuthStore();
        const credentials = {
          email: 'new@example.com',
          password: 'password123'
        };

        await store.register(credentials);

        expect(authService.register).toHaveBeenCalledWith(credentials);
        expect(authService.login).toHaveBeenCalledWith(credentials);
        expect(notifications.success).toHaveBeenCalledWith('Регистрация прошла успешно. Добро пожаловать!');
      });
    });

    describe('refreshTokens', () => {
      it('должен успешно обновлять токены', async () => {
        const mockResponse = {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token'
        };

        (authService.refreshToken as jest.Mock).mockResolvedValue(mockResponse);
        const store = useAuthStore();
        store.refreshToken = 'old-refresh-token';
        store.isAuthenticated = true;

        const result = await store.refreshTokens();

        expect(result).toBe(true);
        expect(store.token).toBe('new-access-token');
        expect(store.refreshToken).toBe('new-refresh-token');
        expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'new-access-token');
        expect(Cookies.set).toHaveBeenCalledWith('refreshToken', 'new-refresh-token', expect.any(Object));
      });

      it('должен выполнять выход при ошибке обновления токена', async () => {
        const error = { response: { status: 401 } };
        (authService.refreshToken as jest.Mock).mockRejectedValue(error);
        const store = useAuthStore();
        store.refreshToken = 'old-refresh-token';
        store.isAuthenticated = true;

        const result = await store.refreshTokens();

        expect(result).toBe(false);
        expect(store.isAuthenticated).toBe(false);
        expect(notifications.error).toHaveBeenCalledWith('Сессия истекла. Пожалуйста, войдите снова.');
      });
    });

    describe('fetchUserBalance', () => {
      it('должен успешно получать баланс пользователя', async () => {
        const mockResponse = { balance: 100 };
        (billingService.getUserBalance as jest.Mock).mockResolvedValue(mockResponse);
        const store = useAuthStore();
        store.userProfiles = [{
          id: '1',
          email: 'test@example.com',
          role: 'contractor',
          balance: 0,
          assistant_responses: 0,
          company_id: '1',
          created_at: '',
          updated_at: ''
        }];

        const balance = await store.fetchUserBalance('1');

        expect(balance).toBe(100);
        expect(store.userProfiles[0].balance).toBe(100);
      });
    });
  });

  describe('getters', () => {
    describe('userRole', () => {
      it('должен возвращать роль пользователя', () => {
        const store = useAuthStore();
        store.user = {
          userId: 1,
          username: 'test',
          email: 'test@example.com',
          role: 'admin',
          password: 'password',
          accessToken: 'token',
          refreshToken: 'refresh'
        };

        expect(store.userRole).toBe('admin');
      });

      it('должен возвращать undefined если пользователь не авторизован', () => {
        const store = useAuthStore();
        expect(store.userRole).toBeUndefined();
      });
    });

    describe('currentUserProfile', () => {
      it('должен возвращать профиль текущего пользователя', () => {
        const store = useAuthStore();
        store.currentUserId = 1;
        store.userProfiles = [{
          id: '1',
          email: 'test@example.com',
          role: 'contractor',
          balance: 100,
          assistant_responses: 0,
          company_id: '1',
          created_at: '',
          updated_at: ''
        }];

        expect(store.currentUserProfile).toEqual(store.userProfiles[0]);
      });

      it('должен возвращать null если текущий пользователь не установлен', () => {
        const store = useAuthStore();
        expect(store.currentUserProfile).toBeNull();
      });
    });
  });
}); 