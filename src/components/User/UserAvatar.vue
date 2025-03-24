<template>
  <div class="user-avatar" @click="goToProfile">
    <div class="user-avatar__circle">
      {{ userInitial }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import { RouteNames } from '@/router/routes/routeNames';

const router = useRouter();
const authStore = useAuthStore();

// вычисление профиля пользователя
const currentUser = computed(() => {
  if (authStore.currentUserId) {
    return authStore.getUserProfile(authStore.currentUserId.toString());
  }
  return null;
});

// вычисление первой буквы имени пользователя
const userInitial = computed<string>(() => {
  return currentUser.value?.email?.charAt(0).toUpperCase() || '';
});

const goToProfile = (): void => {
  router.push(RouteNames.PROFILE);
};
</script>

<style lang="scss" scoped>
.user-avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 0;
  margin-top: auto;
  cursor: pointer;
  width: 100%;

  &__circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: $main-color;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    color: $light-color;
    font-size: 16px;
    font-weight: 500;
  }
}
</style> 