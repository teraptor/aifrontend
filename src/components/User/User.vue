<template>
  <div ref="profileRef" class="profile" @click="toggleMenu">
    <div class="profile__avatar">
      {{ userInitial }}
    </div>
    <div class="profile__info">
      <div class="profile__info-name">{{ currentUser?.email }}</div>
      <div class="profile__info-balance">
        Баланс: {{ isLoading ? '...' : formatBalance(currentUser?.balance) }}
      </div>
    </div>

    <div v-if="isMenuOpen" class="profile-menu">
      <div class="profile-menu__item" @click="goToProfile">
        <span class="icon icon-user" />
        Перейти в профиль
      </div>
      <div class="profile-menu__item profile-menu__item--danger" @click="logout">
        <span class="icon icon-log-out" />
        Выйти из системы
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'vue-router';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { RouteNames } from '@/router/routes/routeNames';

const router = useRouter();
const authStore = useAuthStore();
const isMenuOpen = ref<boolean>(false);
const profileRef = ref<HTMLElement | null>(null);
const isLoading = ref<boolean>(false);

// Форматирование баланса
const formatBalance = (balance?: number): string => {
  return `${balance?.toLocaleString() || 0} ₽`;
};

// вычисление профиля пользователя
const currentUser = computed(() => {
  if (authStore.currentUserId) {
    return authStore.getUserProfile(authStore.currentUserId.toString());
  }
  return null;
});

// вычисление первой буквы имени пользователя
const userInitial = computed<string>(() => {
 return currentUser.value?.email.charAt(0).toUpperCase() || '';
});

// проверка авторизации
const isAuthenticated = computed<boolean>(() => {
  return authStore.isAuthenticated;
});

const goToProfile = (): void => {
  router.push(RouteNames.PROFILE);
  isMenuOpen.value = false;
};

const logout = (): void => {
  authStore.logout();
  isMenuOpen.value = false;
  router.push(RouteNames.MAIN.name)
};

const toggleMenu = (): void => {
  isMenuOpen.value = !isMenuOpen.value;
};

onClickOutside(profileRef, () => {
  isMenuOpen.value = false;
});

// Функция для обновления баланса
const updateBalance = async () => {
  if (!authStore.isAuthenticated || !authStore.currentUserId) return;
  
  try {
    isLoading.value = true;
    await authStore.fetchUserBalance(authStore.currentUserId.toString());
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  updateBalance();
  const balanceInterval = setInterval(updateBalance, 300000);
  
  // Очищаем интервал при размонтировании
  onUnmounted(() => {
    clearInterval(balanceInterval);
  });
});
</script>


<style lang="scss" scoped>
.profile {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  width: 100%;
  max-width: 250px;
  cursor: pointer;
  background: transparent;
  position: relative;

  &__avatar {
    width: 32px;
    height: 32px;
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

  &__info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;

    &-name {
      font-size: 14px;
      font-weight: 500;
      color: $dark-color;
    }

    &-balance {
      font-size: 12px;
      color: $help-color;
    }
  }
}

.profile-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  background-color: $light-color;
  border-bottom: 1px solid $light-grey-color;
  z-index: 100;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;

  &__item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    padding: 8px;
    border: none;
    background: none;
    border-radius: 8px;
    cursor: pointer;
    color: $dark-color;
    font-size: 14px;
    font-weight: 300;
    transition: all 0.2s ease;

    .icon {
      font-size: 16px;
      color: $help-color;
    }

    &:hover {
      background: $light-grey-color;
    }

    &--danger {
      color: $danger-color;

      .icon {
        color: $danger-color;
      }

      &:hover {
        background: rgba($danger-color, 0.1);
      }
    }
  }
}
</style>