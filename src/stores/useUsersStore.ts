import { defineStore } from "pinia";

interface IUser {
  id: string;
  email: string;
  balance: number;
}

export const useUsersStore = defineStore('Users', {
  state: () => ({
    users: [] as IUser[],
  }),
});

