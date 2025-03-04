import { defineStore } from 'pinia';
import { RouteNames } from '@/router/routes/routeNames';

interface IFooterNav {
  id: string,
  link_name: string,
  link: string
}

interface ILayoutStore {
  SidebarIsOpen: boolean,
  footerNav: IFooterNav[]
}
export const useLayoutStore = defineStore('Layout', {
  state: () : ILayoutStore => ({
    SidebarIsOpen: true,
    footerNav: [
      {
        id: '1',
        link_name: 'О продукте',
        link: RouteNames.NOT_FOUND
      },
      {
        id: '2',
        link_name: 'Для бизнеса',
        link: RouteNames.NOT_FOUND
      },
      {
        id: '3',
        link_name: 'О нас',
        link: RouteNames.NOT_FOUND
      },
      {
        id: '4',
        link_name: 'Цены',
        link: '/lll'
      },
      {
        id: '5',
        link_name: 'Блог',
        link: RouteNames.NOT_FOUND
      },
      {
        id: '6',
        link_name: 'API',
        link: RouteNames.NOT_FOUND
      },
    ]
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