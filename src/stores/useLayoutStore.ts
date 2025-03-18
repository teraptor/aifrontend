import { defineStore } from 'pinia';
import { RouteNames } from '@/router/routes/routeNames';

interface IFooterNav {
  id: string;
  link_name: string;
  link: string;
}

interface ISidebarAuthNav {
  id: string;
  icon: string;
  link_name: string;
  link: string;
}

interface ILayoutStore {
  SidebarIsOpen: boolean;
  RightSidebarIsOpen: boolean;
  footerNav: IFooterNav[];
  sidebarAuthNav: ISidebarAuthNav[];
}

export const useLayoutStore = defineStore('Layout', {
  state: (): ILayoutStore => ({
    SidebarIsOpen: true,
    RightSidebarIsOpen: true,
    footerNav: [
      {
        id: '1',
        link_name: 'О продукте',
        link: RouteNames.NOT_FOUND,
      },
      {
        id: '2',
        link_name: 'Для бизнеса',
        link: RouteNames.NOT_FOUND,
      },
      {
        id: '3',
        link_name: 'О нас',
        link: RouteNames.NOT_FOUND,
      },
      {
        id: '4',
        link_name: 'Цены',
        link: '/lll',
      },
      {
        id: '5',
        link_name: 'Блог',
        link: RouteNames.NOT_FOUND,
      },
      {
        id: '6',
        link_name: 'API',
        link: RouteNames.NOT_FOUND,
      },
    ],
    sidebarAuthNav: [

      {
        id: '2',
        icon: 'icon icon-activity',
        link_name: 'Чаты',
        link: RouteNames.Chats,
      },
      {
        id: '1',
        icon: 'icon icon-users',
        link_name: 'Мои ассистенты',
        link: RouteNames.ASSISTENS,
      },
      {
        id: '2',
        icon: 'icon icon-menu',
        link_name: 'Ассистенты GPT',
        link: RouteNames.MAIN.name,
      },
      // {
      //   id: '3',
      //   icon: 'icon icon-activity',
      //   link_name: 'Инструменты AI',
      //   link: RouteNames.INSTRUMENTS,
      // },
      // {
      //   id: '4',
      //   icon: 'icon icon-message-circle',
      //   link_name: 'Вопросы ассистентов',
      //   link: RouteNames.QUESTIONS,
      // },
    ],
  }),
  actions: {
    toggleSidebar() {
      this.SidebarIsOpen = !this.SidebarIsOpen;
    },
    toggleRightSidebar() {
      this.RightSidebarIsOpen = !this.RightSidebarIsOpen; // Метод для правого сайдбара
    },
  },
  persist: {
    key: 'layout-store',
    storage: localStorage,
    pick: ['SidebarIsOpen', 'RightSidebarIsOpen'], // Сохраняем состояние правого сайдбара
  },
});