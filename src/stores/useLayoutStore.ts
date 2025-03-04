import { defineStore } from 'pinia';

export const useLayoutStore = defineStore('Layout', {
  state: () => ({
    SidebarIsOpen: true,
  }),
  actions: {
    toggleSidebar() {
      this.SidebarIsOpen = !this.SidebarIsOpen;
    },
  },
  persist: {
    key: 'layout-store',
    storage: localStorage,
  },
});