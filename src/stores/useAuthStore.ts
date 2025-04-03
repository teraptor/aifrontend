import { notifications } from '@/plugins/notifications';
import { defineStore } from 'pinia';
import { authService } from '@/api/services/authService';
import { billingService } from '@/api/services/billingService';
interface Credentials {
  email: string;
  password: string;
}

interface User extends Credentials {
  userId: number;
  username: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'contractor' | 'company';
  balance: number;
  assistant_responses: number;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null as User | null,
    token: null as string | null,
    refreshToken: null as string | null, 
    isLoading: false as boolean,
    error: null as string | null,
    currentUserId: null as number | null,
    users: [] as Array<User>,
    userProfiles: [    ] as Array<UserProfile>,
    nextUserId: 1,
  }),
  getters: {
    userRole: (state) => state.user?.role,
    currentUserProfile(state): UserProfile | null {
      if (!this.currentUserId) return null;
      return this.userProfiles.find(
        profile => profile.id === this.currentUserId?.toString()
      ) || null;
    },
  },
  actions: {
    // Вход в систему
    async login(credentials: Credentials) {
      try {
        this.isLoading = true;
        this.error = null;

        const response = await authService.login(credentials);
        this.token = response.access_token;
        this.refreshToken = response.refresh_token;
        this.isAuthenticated = true;
        this.currentUserId = parseInt(response.user_id);

        localStorage.setItem('accessToken', this.token);
        localStorage.setItem('refreshToken', this.refreshToken);


        const userProfile = this.userProfiles.find(
          profile => profile.email = credentials.email
        );
        if (userProfile) {
          this.currentUserId = parseInt(userProfile.id);
        }
        return response.email;

      } catch (error: any) {
        // this.error = error.message || 'Произошла ошибка';
        notifications.error(error.message);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Выход из системы
    logout() {
      this.isAuthenticated = false;
      this.currentUserId = null;
    },
    
    // Регистрация пользователя
    async register(credentials: Credentials) {
      try {
        this.isLoading = true;
        this.error = null;
        
        const response = await authService.register(credentials);
        notifications.success('Регистрация прошла успешно. Добро пожаловать!');
        
        await this.login(credentials);
        
        return true;
      } catch (error: any) {
        notifications.error(error.message);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Получение профиля пользователя
    getUserProfile(userId: string): UserProfile | undefined {
      return this.userProfiles.find(profile => profile.id === userId);
    },

    // Получение баланса пользователя по API
    async fetchUserBalance(userId: string) {
      try {
        this.isLoading = true;
        // Запрос к API для получения баланса
        const response = await billingService.getUserBalance();
        
        // Обновляем профиль пользователя с новым балансом
        const userProfile = this.userProfiles.find(profile => profile.id === userId);
        if (userProfile) {
          userProfile.balance = response.balance;
        }
        
        return response.balance;
      } catch (error: any) {
        const errorMessage = error.message || 'Ошибка при получении баланса';
        this.error = errorMessage;
        notifications.error(errorMessage);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Добавление профиля пользователя
    addUserProfile(profile: UserProfile) {
      this.userProfiles.push(profile);
    }, 

    // Инициализация хранилища
    async init() {
      try {
      } catch (error: any) {
        this.error = error.message || 'Произошла ошибка';
        notifications.error(error.message);
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  },

  persist: {
    key: 'auth-store',
    storage: localStorage,
    pick: ['isAuthenticated', 'users', 'nextUserId', 'userProfiles', 'currentUserId'],
  },
});