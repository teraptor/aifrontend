import { push } from 'notivue';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
  }),
  actions: {

    login(credentials: { username: string; password: string }) {
      const mockUsername = '123';
      const mockPassword = '123';

      if (
        credentials.username === mockUsername &&
        credentials.password === mockPassword
      ) {
        this.isAuthenticated = true;
        push.success('Добро пожаловать')
      } else {
        this.isAuthenticated = false;
        push.error('Неверный логин или пароль')
      }
    },
    logout() {
      this.isAuthenticated = false;
    },
  },
  persist: {
    key: 'auth-store',
    storage: localStorage,
  },
});