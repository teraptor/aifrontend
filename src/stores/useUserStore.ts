import { defineStore } from "pinia";

interface IUser {
  surname: string,
  name: string
}

interface IUserStore {
  user: IUser
}
export const useUserStore = defineStore('user', {
  state: () : IUserStore => ({
    user: {
      surname: 'Bedarev',
      name: 'Yuri'
    }
  })
})