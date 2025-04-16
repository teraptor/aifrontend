<template>
  <div class="assistent">
    <div class="assistent__header-wrapper">
      <div class="assistent__header-back" @click="goBack">
        <span class="icon icon-arrow-left2" />
        Назад
      </div>
      <TitleWrapper title="Параметры ассистента" />
    </div>
    <div class="assistent-detail" v-if="assistent">
      <div class="assistent-detail__container">
        <img :src="assistent.image" class="assistent-detail__image"/>
        <div class="assistent-detail__name-wrapper">
          <h4 class="assistent-detail__name"> {{ assistent.name }}</h4>
          <p class="assistent-detail__summary"> {{ assistent.summary }}</p>
        </div>
        <Button
            v-if="authStore.isAuthenticated && assistent.status"
            button-type="secondary"
            text="Установить"
            type="button"
            size="medium"
            icon="icon icon-arrow-right2"
            @click="installAssistentWithRedirect(assistent.id)"
          />
        <Button
            v-else-if="!assistent.status"
            button-type="secondary"
            text="Ассистент неактивен"
            type="button"
            size="medium"
            disabled
          />
        <Button
            v-else
            button-type="secondary"
            text="Войдите для установки"
            type="button"
            size="medium"
            @click="openLoginModal"
          />
      </div>

      <Tabs :tabs="tabs" :initialTab="activeTab">
        <template #description>
          <div class="assistent-detail__content">
            <h2 class="assistent-detail__content-title">Пример работы ассистента</h2>
            <p class="assistent-detail__content-text">Автор не предоставил пример работы @{{ assistent.id }}</p>

            <h2 class="assistent-detail__content-title">Описание</h2>
            <p class="assistent-detail__content-text">{{ assistent.description }}</p>
          </div>
        </template>
        <template #comments>
          <div class="assistent-detail__content">
            <div>здесь скоро будет контент</div>
          </div>
        </template>
      </Tabs>
    </div>
    
    <!-- Модальные окна -->
    <LoginModal ref="loginModal" />
  </div>
</template>

<script setup lang="ts">
import { useAssistentsStore } from '@/stores/useAssistantsStore';
import { useRouter, useRoute } from 'vue-router';
import { computed, ref, onMounted, watch } from 'vue';
import TitleWrapper from '@/components/ui/TitleWrapper.vue';
import Button from '@/components/ui/Button.vue';
import Tabs from '@/components/ui/Tabs.vue';
import { notifications } from '@/plugins/notifications';
import { useAuthStore } from '@/stores/useAuthStore';
import LoginModal from '@/components/Modal/LoginModal.vue';

const assistentsStore = useAssistentsStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const loginModal = ref<InstanceType<typeof LoginModal> | null>(null);
const pendingInstallId = ref<string | null>(null);

const assistent = computed(() => assistentsStore.getAssistentById(route.params.id as string)); 

const goBack = (): void => router.back();

const tabs = ref([
  { id: 'description', label: 'Описание' },
  { id: 'comments', label: 'Комментарии' },
]);

const activeTab = ref(tabs.value[0].id);

// Открытие модального окна авторизации
const openLoginModal = () => {
  loginModal.value?.openModal();
};

// Наблюдаем за изменением статуса авторизации
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated && pendingInstallId.value) {
    // Если пользователь авторизовался и есть отложенная установка ассистента
    installAssistentWithRedirect(pendingInstallId.value);
    pendingInstallId.value = null;
    loginModal.value?.prefillEmail(''); // Очищаем поле почты в модальном окне
  }
});

// Функция для установки ассистента с редиректом
const installAssistentWithRedirect = async (id: string) => {
  if (!authStore.isAuthenticated) {
    notifications.warning('Пожалуйста, войдите в систему для установки ассистента');
    pendingInstallId.value = id; // Сохраняем ID ассистента для отложенной установки
    openLoginModal();
    return;
  }
  
  try {
    await assistentsStore.installAssistent(id);
    // После успешной установки перенаправляем на страницу чатов
    router.push({ path: '/chats' });
    notifications.success('Ассистент установлен');
  } catch (error) {
    notifications.error('Ошибка при установке ассистента');
  }
};

// Загрузка данных ассистентов при монтировании компонента
onMounted(async () => {
  // Проверяем, есть ли ассистенты в хранилище
  if (!assistentsStore.assistants || assistentsStore.assistants.length === 0) {
    try {
      await assistentsStore.fetchAssitantents();
    } catch (error) {
      notifications.error('Ошибка при загрузке ассистентов');
    }
  }
  
  // Если ассистент не найден по ID, попробуем загрузить его отдельно
  if (!assistent.value) {
    try {
      await assistentsStore.fetchAssistentById(route.params.id as string);
    } catch (error) {
      notifications.error('Не удалось загрузить данные ассистента');
    }
  }
});
</script>

<style lang="scss" scoped>
.assistent {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  width: 100%;
  padding: 13px 20px;

  &__header-wrapper {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  &__header-back {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    margin-bottom: 4px;
    color: $help-color;
    cursor: pointer;
    font-weight: 500;

    &:hover {
      color: $dark-secondary-color;
    }
  }
}

.assistent-detail {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 48rem;
  gap: 16px;

  &__container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  &__image {
    width: 80px;
    height: 80px;
    border-radius: 50%;
  }

  &__name-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  &__name {
    font-weight: 600;
    font-size: 20px;
  }

  &__summary {
    color: $help-color;
    font-size: 14px;
  }

  &__content {
    padding: 24px 0;
    display: flex;
    flex-direction: column;
    gap: 16px;

    &-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    &-text {
      color: $help-color;
      line-height: 1.5;
      margin-bottom: 16px;
      white-space: pre-line;
    }
  }
}
</style>