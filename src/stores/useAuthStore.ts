import { notifications } from '@/plugins/notifications';
import { defineStore } from 'pinia';
import { authService } from '@/api/services/authService';

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
    userProfiles: [
      {
        id: '1',
        email: 'admin@example.com',
        role: 'admin',
        company_id: 'company-123',
        balance: 1000,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
      {
        id: '2',
        email: 'contractor@example.com',
        role: 'contractor',
        company_id: 'company-456',
        balance: 1000,
        created_at: '2023-01-02T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
      },
      {
        id: '3',
        email: 'company@example.com',
        role: 'company',
        company_id: 'company-789',
        balance: 1000,
        created_at: '2023-01-03T00:00:00Z',
        updated_at: '2023-01-03T00:00:00Z',
      },
    ] as Array<UserProfile>,
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