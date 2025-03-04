<template>
  <aside class="side-menu" :class="{ 'side-menu--collapsed': SidebarIsOpen }">
    <div class="side-menu__header">
      <h1 v-show="!SidebarIsOpen">AI</h1>
      <button class="toggle-button" @click="toggleSidebar">
        <span class="toggle-icon"></span>
      </button>
    </div>

    <div class="side-menu__content" v-if="isAuthenticated">
      <router-link to="/assistants" class="menu-item">
        <span class="menu-item__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="menu-item__text" v-show="!SidebarIsOpen">Ассистенты GPTs</span>
        <span class="menu-item__arrow" v-show="!SidebarIsOpen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </router-link>

      <router-link to="/tools" class="menu-item">
        <span class="menu-item__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M13 10V3L4 14H11L11 21L20 10L13 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="menu-item__text" v-show="!SidebarIsOpen">Инструменты AI</span>
        <span class="menu-item__arrow" v-show="!SidebarIsOpen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </router-link>

      <router-link to="/chats" class="menu-item">
        <span class="menu-item__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="menu-item__text" v-show="!SidebarIsOpen">Диалоги ассистентов</span>
        <span class="menu-item__plus" v-show="!SidebarIsOpen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 6V12M12 12V18M12 12H18M12 12L6 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
      </router-link>
    </div>

    <div class="side-menu__footer" v-if="isAuthenticated">
      <router-link to="/profile" class="profile-link">
        <div class="profile">
          <div class="profile__avatar">
            <span class="profile__avatar-letter">Y</span>
          </div>
          <div class="profile__info" v-show="!SidebarIsOpen">
            <div class="profile__name">Yuriy Bedarev</div>
            <div class="profile__action">Перейти в профиль</div>
          </div>
        </div>
      </router-link>
      <button class="logout-button" @click="logout" v-show="!SidebarIsOpen">
        Выйти
      </button>
    </div>

    <div class="auth-container" v-show="!SidebarIsOpen">
      <AuthForm />
    </div>
  </aside>
</template>

<script setup lang="ts">
import AuthForm from './AuthForm.vue';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { storeToRefs } from 'pinia';

const layoutStore = useLayoutStore();
const { SidebarIsOpen } = storeToRefs(layoutStore);
const { toggleSidebar } = layoutStore;

const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);
const { logout } = authStore;
</script>

<style scoped>
.side-menu {
  width: 280px;
  height: 100vh;
  background: #FFFFFF;
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

.side-menu__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 8px;
  margin-bottom: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  text-decoration: none;
  color: #111827;
  transition: all 0.2s ease;
  border-radius: 12px;
  background: #F3F4F6;
}

.menu-item:hover {
  background-color: #E5E7EB;
}

.menu-item__icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.menu-item__text {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
}

.menu-item__arrow,
.menu-item__plus {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
}

.side-menu__footer {
  padding: 16px;
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile-link {
  text-decoration: none;
  color: inherit;
}

.profile {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 12px;
  background: #F3F4F6;
  transition: all 0.2s ease;
}

.profile:hover {
  background: #E5E7EB;
}

.profile__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4B9093;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.profile__avatar-letter {
  color: #FFFFFF;
  font-size: 18px;
  font-weight: 500;
}

.profile__info {
  flex: 1;
}

.profile__name {
  font-size: 16px;
  font-weight: 500;
  color: #111827;
}

.profile__action {
  font-size: 14px;
  color: #6B7280;
}

.logout-button {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 12px;
  background: #FEE2E2;
  color: #DC2626;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-button:hover {
  background: #FEE2E2;
  opacity: 0.9;
}

.auth-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  width: 100%;
}
</style> 