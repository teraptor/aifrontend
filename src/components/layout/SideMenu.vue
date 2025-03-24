<template>
  <aside class="side-menu" :class="{ 'side-menu--collapsed': SidebarIsOpen }">
    <div class="side-menu__header">
      <h1 v-show="!SidebarIsOpen">AI</h1>
      <button class="toggle-button" @click="toggleSidebar">
        <span class="toggle-icon"></span>
      </button>
    </div>
    <div class="side-menu__container">
      <SidebarUnauthenticated v-if="!isAuthenticated && !SidebarIsOpen"/>
      <SidebarAuthenticated v-else-if="!SidebarIsOpen"/>
      <div v-else-if="SidebarIsOpen && isAuthenticated" class="side-menu__user-collapsed">
        <UserAvatar />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import SidebarUnauthenticated from '../SidebarComponents/SidebarUnauthenticated.vue';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/useAuthStore';
import SidebarAuthenticated from '../SidebarComponents/SidebarAuthenticated.vue';
import UserAvatar from '../User/UserAvatar.vue';

const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore);

const layoutStore = useLayoutStore();
const { SidebarIsOpen } = storeToRefs(layoutStore);
const { toggleSidebar } = layoutStore;


</script>

<style scoped lang="scss">
.side-menu {
  width: 250px;
  height: 100vh;
  background: $light-color;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  border-right: 1px solid rgba(0, 0, 0, 0.1);

  &--collapsed {
    width: 72px;
  }

  &--collapsed + .main-content {
    margin-left: 72px;
  }

  &__header {
    width: 100%;
    height: 60px;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }

  &__container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 0;
    width: 100%;
    overflow-y: auto;
  }

  &__user-collapsed {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}

.toggle-button {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  padding: 0.5rem;
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

.toggle-icon {
  position: relative;
  width: 18px;
  height: 2px;
  background-color: transparent;
  transition: all 0.3s ease;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 2px;
    background-color: #111827;
    transition: all 0.3s ease;
  }

  &::before {
    transform: rotate(45deg);
    transform-origin: 0 0;
  }

  &::after {
    transform: rotate(-45deg);
    transform-origin: 0 100%;
  }
}

.side-menu--collapsed .toggle-icon {
  &::before {
    transform: rotate(-45deg);
    transform-origin: 100% 0;
  }

  &::after {
    transform: rotate(45deg);
    transform-origin: 100% 100%;
  }
}
</style>
