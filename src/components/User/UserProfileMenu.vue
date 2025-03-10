<template>
  <div class="profile-menu" v-if="isOpen" ref="menuRef">
    <div class="profile-menu__user">
      <div class="profile-menu__user-avatar">
        {{ userInitial }}
      </div>
      <div class="profile-menu__user-info">
        <h4 class="profile-menu__user-name">{{ userName }}</h4>
        <p class="profile-menu__user-role">{{ userRole }}</p>
      </div>
    </div>
    <div class="profile-menu__divider"></div>
    <div class="profile-menu__items">
      <button class="profile-menu__item" @click="goToProfile">
        <span class="icon icon-user"></span>
        Профиль
      </button>
      <button class="profile-menu__item profile-menu__item--danger" @click="logout">
        <span class="icon icon-log-out"></span>
        Выйти
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { RouteNames } from '@/router/routes/routeNames';
import { useAuthStore } from '@/stores/useAuthStore';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();
const authStore = useAuthStore();
const menuRef = ref<HTMLElement | null>(null);

const userName = computed(() => authStore.user?.name || 'Пользователь');
const userRole = computed(() => authStore.user?.role || 'HR-специалист');
const userInitial = computed(() => userName.value.charAt(0).toUpperCase());

const goToProfile = () => {
  router.push({ name: RouteNames.PROFILE });
  emit('close');
};

const logout = () => {
  authStore.logout();
  emit('close');
};

const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    emit('close');
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="scss" scoped>
.profile-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  width: 100%;
  min-width: 240px;
  background: $light-color;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px;
  z-index: 1000;

  &__user {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
  }

  &__user-avatar {
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

  &__user-info {
    flex: 1;
  }

  &__user-name {
    font-size: 14px;
    font-weight: 500;
    color: $dark-color;
    margin: 0;
    line-height: 1.2;
  }

  &__user-role {
    font-size: 12px;
    color: $help-color;
    margin: 0;
    line-height: 1.2;
  }

  &__divider {
    height: 1px;
    background: $border-light;
    margin: 4px 0;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border: none;
    background: none;
    border-radius: 8px;
    cursor: pointer;
    color: $dark-color;
    font-size: 14px;
    font-weight: 500;
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