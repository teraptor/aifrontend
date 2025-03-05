<script setup lang="ts">
import Button from '../ui/Button.vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLayoutStore } from '@/stores/useLayoutStore';
import User from '../User/User.vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const authStore = useAuthStore()
const layoutStore = useLayoutStore()

const navigateToRoute = (routeName: string):void => {
  router.push(routeName)
}

const logout = () => authStore.logout()
</script>
<template>
  <div class="menu">
    <div class="menu__nav">
      <ul class="menu__nav-items">
        <li class="menu__nav-item" v-for="item in layoutStore.sidebarAuthNav" :key="item.id" @click="navigateToRoute(item.link)">
          <span :class="item.icon"/>
          <p class="menu__nav-item-name">{{ item.link_name }}</p>
          <span :class="[route.name === item.link ? 'icon icon-chevron-right': 'icon icon-plus', { 'icon--active': route.name === item.link }]"/>
        </li>
      </ul>
    </div>
    <div class="menu__footer">
      <User />
      <Button
        button-type="danger"
        text="Выйти"
        @click="logout"
        size="large"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.menu {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  max-width: 250px;
  align-items: center;
  width: 100%;
  height: 100%;

  &__nav {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;

    &-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 250px;
    }

    &-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      cursor: pointer;

      &:hover {
        background: $light-grey-color;
        border-radius: 6px;
      }

      .icon {
        color: $help-color;

        &--active {
          color: $success-color;
        }
      }

      &-name {
        width: 60%;
        line-height: 1.2;
        font-size: 15px;
      }
    }
  }


  &__footer {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    width: 100%;
    margin-bottom: 60px;
  }
}
</style>
