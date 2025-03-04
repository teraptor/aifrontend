<template>
  <aside class="side-menu" :class="{ 'side-menu--collapsed': isCollapsed }">
    <div class="side-menu__header">
      <button class="toggle-button" @click="toggleMenu">
        <span class="toggle-icon"></span>
      </button>
    </div>
    <div class="auth-container" v-show="!isCollapsed">
      <AuthForm />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AuthForm from './AuthForm.vue';

const isCollapsed = ref(false);

const toggleMenu = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
.side-menu {
  width: 280px;
  height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.side-menu--collapsed {
  width: 72px;
}

.side-menu__header {
  height: 48px;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-bottom: 1px solid #e5e7eb;
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