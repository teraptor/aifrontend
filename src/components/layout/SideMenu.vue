<template>
  <aside class="side-menu" :class="{ 'side-menu--collapsed': SidebarIsOpen }">
    <div class="side-menu__header">
      <h1 v-show="!SidebarIsOpen">AI</h1>
      <button class="toggle-button" @click="toggleSidebar">
        <span class="toggle-icon"></span>
      </button>
    </div>
    <div class="auth-container" v-show="!SidebarIsOpen" >
      <AuthForm />
    </div>
  </aside>
</template>

<script setup lang="ts">
import AuthForm from './AuthForm.vue';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { storeToRefs } from 'pinia';

const layoutStore = useLayoutStore();
const { SidebarIsOpen } = storeToRefs(layoutStore);
const { toggleSidebar } = layoutStore;
</script>

<style scoped>
.side-menu {
  width: 280px;
  height: 100vh;
  background: transparent;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
}

.side-menu--collapsed {
  width: 72px;
}

.side-menu--collapsed + .main-content {
  margin-left: 72px;
}

.side-menu__header {
  width: 100%;
  height: 60px;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
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
  background-color: #111827;
  transition: all 0.3s ease;
}

.toggle-icon::before,
.toggle-icon::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 2px;
  background-color: #111827;
  transition: all 0.3s ease;
}

.toggle-icon::before {
  transform: translateY(-6px);
}

.toggle-icon::after {
  transform: translateY(6px);
}

.side-menu--collapsed .toggle-icon {
  transform: rotate(180deg);
}

.auth-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 100%;
}
</style> 