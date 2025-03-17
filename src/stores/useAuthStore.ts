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
    logout() {
      this.isAuthenticated = false;
      this.currentUserId = null;
    },
    register(credentials: Credentials) {
      const userExists = this.users.some(
        (user) => user.username === credentials.email
      );

      if (userExists) {
        notifications.error('Пользователь с таким именем уже существует');
      } else {
        const newUser = {
          ...credentials,
          userId: this.nextUserId,
          username: credentials.email,
          role: 'company',
          accessToken: '',
          refreshToken: '',
        };
        this.users.push(newUser);
        
        // Создаем профиль пользователя, если его еще нет
        const userProfileExists = this.userProfiles.some(
          (profile) => profile.email === credentials.email
        );
        
        if (!userProfileExists) {
          const newProfile: UserProfile = {
            id: this.nextUserId.toString(),
            email: credentials.email,
            role: 'company', // Устанавливаем роль по умолчанию
            balance: 1000, // Начальный баланс
            company_id: 'company-' + this.nextUserId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          this.userProfiles.push(newProfile);
        }
        
        // Устанавливаем текущего пользователя и статус аутентификации
        this.currentUserId = this.nextUserId;
        this.isAuthenticated = true;
        
        this.nextUserId++;
        notifications.success('Регистрация прошла успешно');
      }
    },
    getUserProfile(userId: string): UserProfile | undefined {
      return this.userProfiles.find(profile => profile.id === userId);
    },
    addUserProfile(profile: UserProfile) {
      this.userProfiles.push(profile);
    }, 
    async init() {
      try {
        // await this.fet();
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