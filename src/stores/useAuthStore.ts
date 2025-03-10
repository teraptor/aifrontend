import { push } from 'notivue';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    users: [] as Array<{ username: string; password: string }>,
  }),
  actions: {
    login(credentials: { username: string; password: string }) {
      const user = this.users.find(
        (user) =>
          user.username === credentials.username &&
          user.password === credentials.password
      );

      if (user) {
        this.isAuthenticated = true;
        push.success('Добро пожаловать');
      } else {
        this.isAuthenticated = false;
        push.error('Неверный логин или пароль');
      }
    },
    logout() {
      this.isAuthenticated = false;
    },
    register(credentials: { username: string; password: string }) {
      const userExists = this.users.some(
        (user) => user.username === credentials.username
      );

      if (userExists) {
        push.error('Пользователь с таким именем уже существует');
      } else {
        this.users.push(credentials);
        push.success('Регистрация прошла успешно');
      }
    },
  },
  persist: {
    key: 'auth-store',
    storage: localStorage,
    pick: ['isAuthenticated', 'users'],
  },
});