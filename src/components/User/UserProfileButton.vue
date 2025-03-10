<!-- не используется -->
<template>
  <div class="profile-button" ref="buttonRef">
    <button class="profile-button__trigger" @click="toggleMenu">
      <div class="profile-button__avatar">
        {{ userInitial }}
      </div>
      <div class="profile-button__info">
        <h4 class="profile-button__name">{{ userName }}</h4>
        <p class="profile-button__action">Перейти в профиль</p>
      </div>
    </button>
    <UserProfileMenu 
      :is-open="isMenuOpen"
      @close="closeMenu"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import UserProfileMenu from './UserProfileMenu.vue';

const authStore = useAuthStore();
const buttonRef = ref<HTMLElement | null>(null);
const isMenuOpen = ref(false);

const userName = computed(() => authStore.user?.name || 'Пользователь');
const userInitial = computed(() => userName.value.charAt(0).toUpperCase());

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};
</script>

<style lang="scss" scoped>
.profile-button {
  position: relative;
  display: block;
  margin: 0;

  &__trigger {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    text-align: left;

    &:hover {
      background: transparent;
    }
  }

  &__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: $main-color;
    color: $light-color;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 500;
  }

  &__info {
    text-align: left;
    flex: 1;
  }

  &__name {
    font-size: 14px;
    font-weight: 500;
    color: $dark-color;
    margin: 0;
    line-height: 1.2;
  }

  &__action {
    font-size: 12px;
    color: $help-color;
    margin: 0;
    line-height: 1.2;
  }
}
</style> 