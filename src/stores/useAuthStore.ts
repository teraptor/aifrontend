import { push } from 'notivue';
import { defineStore } from 'pinia';

interface Credentials {
  username: string;
  password: string;
}

interface User extends Credentials {
  userId: number;
}

interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'contractor' | 'company';
  company_id: string;
  created_at: string;
  updated_at: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    currentUserId: null as number | null,
    users: [] as Array<User>,
    userProfiles: [
      {
        id: '1',
        email: 'admin@example.com',
        role: 'admin',
        company_id: 'company-123',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
      {
        id: '2',
        email: 'contractor@example.com',
        role: 'contractor',
        company_id: 'company-456',
        created_at: '2023-01-02T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
      },
      {
        id: '3',
        email: 'company@example.com',
        role: 'company',
        company_id: 'company-789',
        created_at: '2023-01-03T00:00:00Z',
        updated_at: '2023-01-03T00:00:00Z',
      },
    ] as Array<UserProfile>,
    nextUserId: 1,
  }),
  actions: {
    login(credentials: Credentials) {
      const user = this.users.find(
        (user) =>
          user.username === credentials.username &&
          user.password === credentials.password
      );

      if (user) {
        this.isAuthenticated = true;
        this.currentUserId = user.userId;
        push.success('Добро пожаловать');
      } else {
        this.isAuthenticated = false;
        this.currentUserId = null;
        push.error('Неверный логин или пароль');
      }
    },
    logout() {
      this.isAuthenticated = false;
      this.currentUserId = null;
    },
    register(credentials: Credentials) {
      const userExists = this.users.some(
        (user) => user.username === credentials.username
      );

      if (userExists) {
        push.error('Пользователь с таким именем уже существует');
      } else {
        const newUser = {
          ...credentials,
          userId: this.nextUserId,
        };
        this.users.push(newUser);
        this.nextUserId++;
        push.success('Регистрация прошла успешно');
      }
    },
    getUserProfile(userId: string): UserProfile | undefined {
      return this.userProfiles.find(profile => profile.id === userId);
    },
    addUserProfile(profile: UserProfile) {
      this.userProfiles.push(profile);
    }
  },
  persist: {
    key: 'auth-store',
    storage: localStorage,
    pick: ['isAuthenticated', 'users', 'nextUserId', 'userProfiles', 'currentUserId'],
  },
});