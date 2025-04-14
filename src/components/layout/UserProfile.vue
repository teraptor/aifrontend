<template>
  <div class="user-profile" :class="{ 'user-profile--collapsed': collapsed }">
    <div class="user-profile__avatar">
      <span>{{ userInitial }}</span>
    </div>
    <div class="user-profile__info" v-if="!collapsed">
      <div class="user-profile__balance">
        <div class="user-profile__balance-label">Баланс:</div>
        <div class="user-profile__balance-amount">
          {{ isLoading ? '...' : formatBalance(currentUser?.balance) }}
        </div>
      </div>
      <div class="user-profile__name">{{ currentUser?.email || 'Пользователь' }}</div>
      <div class="user-profile__link" @click="goToProfile">Перейти в профиль</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/useAuthStore';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { RouteNames } from '@/router/routes/routeNames';
import { notifications } from '@/plugins/notifications';

const props = defineProps<{
  collapsed?: boolean;
}>();

const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(false);

// Вычисление профиля пользователя
const currentUser = computed(() => {
  if (authStore.currentUserId) {
    return authStore.getUserProfile(authStore.currentUserId.toString());
  }
  return null;
});

// Вычисление первой буквы имени пользователя
const userInitial = computed(() => {
  return currentUser.value?.email?.charAt(0).toUpperCase() || 'У';
});

// Форматирование баланса
const formatBalance = (balance?: number): string => {
  if (balance === undefined || balance === null) return '0';
  try {
    return balance.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  } catch (error) {
    console.error('Ошибка форматирования баланса:', error);
    return '0';
  }
};

// Навигация на страницу профиля
const goToProfile = () => {
  router.push({ name: RouteNames.PROFILE });
};

// Функция для обновления баланса
const updateBalance = async () => {
  if (!authStore.isAuthenticated || !authStore.currentUserId) return;
  
  try {
    isLoading.value = true;
    await authStore.fetchUserBalance(authStore.currentUserId.toString());
  } catch (error) {
    console.error('Ошибка при обновлении баланса:', error);
    notifications.error('Не удалось обновить баланс');
  } finally {
    isLoading.value = false;
  }
};

// Обновление баланса при монтировании компонента
onMounted(() => {
  updateBalance();
  const balanceInterval = setInterval(updateBalance, 30000); // обновляем каждые 30 секунд
  
  // Очищаем интервал при размонтировании
  onUnmounted(() => {
    if (balanceInterval) {
      clearInterval(balanceInterval);
    }
  });
});
</script>

<style scoped>
.user-profile {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  margin-top: auto;
  cursor: pointer;
  border-top: 1px solid #E5E7EB;
  background: #FFFFFF;
  position: relative;
}

.user-profile:hover {
  background-color: #F3F4F6;
}

.user-profile__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #5BA4A4;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: 16px;
}

.user-profile__info {
  flex: 1;
}

.user-profile__name {
  font-weight: 500;
  color: #111827;
  font-size: 14px;
  line-height: 20px;
}

.user-profile__link {
  font-size: 14px;
  color: #6B7280;
  line-height: 20px;
}

.user-profile--collapsed {
  justify-content: center;
  padding: 12px 0;
}

.user-profile__balance {
  background: #F3F4F6;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.user-profile__balance-label {
  color: #6B7280;
  font-size: 14px;
}

.user-profile__balance-amount {
  color: #111827;
  font-weight: 500;
  font-size: 14px;
}
</style> 