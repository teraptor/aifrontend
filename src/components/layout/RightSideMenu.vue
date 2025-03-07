<template>
  <aside class="right-side-menu" :class="{ 'right-side-menu--collapsed': RightSidebarIsOpen }">
    <div class="right-side-menu__header">
      <h1 v-show="!RightSidebarIsOpen">Right Menu</h1>
      <button class="toggle-button" @click="toggleRightSidebar">
        <span class="toggle-icon"></span>
      </button>
    </div>
    <div class="right-side-menu__container" v-show="!RightSidebarIsOpen">
      <p>Правое меню</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useLayoutStore } from '@/stores/useLayoutStore';
import { storeToRefs } from 'pinia';

const layoutStore = useLayoutStore();
const { RightSidebarIsOpen } = storeToRefs(layoutStore);
const { toggleRightSidebar } = layoutStore;
</script>

<style scoped lang="scss">
.right-side-menu {
  width: 280px;
  height: 100vh;
  background: transparent;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  top: 0;
  right: 0; /* Располагаем справа */
  z-index: 10;

  &--collapsed {
    width: 72px;
  }

  &--collapsed + .main-content {
    margin-right: 72px;
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
    align-items: center;
    justify-content: center;
    padding: 0;
    width: 100%;
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
  left: 1rem; /* Кнопка слева */
  top: 50%;
  transform: translateY(-50%);
}

.toggle-icon {
  position: relative;
  width: 18px;
  height: 2px;
  background-color: #111827;
  transition: all 0.3s ease;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 18px;
    height: 2px;
    background-color: #111827;
    transition: all 0.3s ease;
  }

  &::before {
    transform: translateY(-6px);
  }

  &::after {
    transform: translateY(6px);
  }
}

.right-side-menu--collapsed .toggle-icon {
  transform: rotate(180deg);
}
</style>