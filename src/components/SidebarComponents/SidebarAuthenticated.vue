<template>
  <div class="menu">
    <div class="menu__nav">
      <ul class="menu__nav-items">
        <li class="menu__nav-item" v-for="item in layoutStore.sidebarAuthNav" :key="item.id" 
            :class="{ 'menu__nav-item--active': isActiveRoute(item.link) }"
            @click="navigateToRoute(item.link)">
          <span :class="item.icon"/>
          <p class="menu__nav-item-name">{{ item.link_name }}</p>
          <span class="icon icon-plus" v-if="!isActiveRoute(item.link)" />
          <span class="icon icon-chevron-right" v-else />
        </li>
      </ul>
    </div>
    <div class="menu__footer">
      <User />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLayoutStore } from '@/stores/useLayoutStore';
import User from '../User/User.vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { RouteNames } from '@/router/routes/routeNames';

const router = useRouter();
const route = useRoute();

const layoutStore = useLayoutStore()

// Функция для проверки активного пункта меню
const isActiveRoute = (link: string): boolean => {
  // Точное совпадение имени маршрута
  if (typeof route.name === 'string' && route.name === link) {
    return true;
  }
  
  // Специальная обработка для маршрутов ассистентов
  if (link === RouteNames.ASSISTENS) {
    // Проверяем, содержит ли текущий путь '/assistent/'
    return route.path.includes('/assistent/');
  }
  
  // Специальная обработка для корневого маршрута
  if (link === RouteNames.MAIN.name) {
    // Корневой маршрут активен только если мы находимся на главной странице
    return route.path === '/' || route.path === RouteNames.MAIN.name;
  }
  
  // Для остальных маршрутов проверяем, начинается ли текущий путь с пути пункта меню
  return route.path.startsWith(link);
}

const navigateToRoute = (routeName: string):void => {
  router.push(routeName)
}
</script>
<style lang="scss" scoped>
.menu {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 250px;
  width: 100%;
  height: 100%;
  padding: 0;

  &__nav {
    width: 100%;
    display: flex;
    flex-direction: column;

    &-items {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding: 8px 16px;
      gap: 2px;
    }

    &-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s ease;
      background: transparent;

      .icon {
        font-size: 16px;
        color: $help-color;
      }

      &-name {
        flex: 1;
        margin: 0 12px;
        line-height: 1.2;
        font-size: 14px;
        font-weight: 500;
        color: $help-color;
      }

      &:hover {
        background: $light-grey-color;
      }

      &--active {
        background: $light-grey-color;

        .menu__nav-item-name {
          color: $dark-color;
          font-weight: 600;
        }

        .icon {
          color: $dark-color;
        }
      }
    }
  }

  &__footer {
    width: 100%;
    padding: 16px;
    margin-top: auto;
    margin-bottom: 20px;
  }
}
</style>
