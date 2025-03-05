<template>
  <div class="layout">
    <SideMenu />
    <div class="assistant-settings">
      <div class="assistant-settings__header">
        <div class="assistant-settings__back" @click="router.back()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Назад
        </div>
        <h1 class="assistant-settings__title">Настройки ассистента</h1>
      </div>

      <div class="assistant-settings__content">
        <div class="assistant-settings__profile">
          <img :src="assistant?.avatar || randomAvatar" class="assistant-settings__avatar" alt="Avatar" />
          <div class="assistant-settings__info">
            <h2 class="assistant-settings__name">{{ assistant?.name || 'Ассистент' }}</h2>
            <p class="assistant-settings__role">{{ assistant?.profession || 'Специалист' }}</p>
          </div>
        </div>

        <div class="assistant-settings__section">
          <h3 class="assistant-settings__section-title">Основные настройки</h3>
          <div class="assistant-settings__form">
            <div class="form-group">
              <label>Имя ассистента</label>
              <input type="text" v-model="settings.name" placeholder="Введите имя" />
            </div>
            <div class="form-group">
              <label>Роль</label>
              <input type="text" v-model="settings.role" placeholder="Укажите роль" />
            </div>
            <div class="form-group">
              <label>Язык общения</label>
              <select v-model="settings.language">
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        <div class="assistant-settings__section">
          <h3 class="assistant-settings__section-title">Дополнительные настройки</h3>
          <div class="assistant-settings__form">
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="settings.notifications" />
                Получать уведомления
              </label>
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="settings.autoReply" />
                Автоматические ответы
              </label>
            </div>
          </div>
        </div>

        <button class="assistant-settings__save" @click="saveSettings">
          Сохранить изменения
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import SideMenu from '@/components/layout/SideMenu.vue';

interface Assistant {
  id?: string;
  name?: string;
  profession?: string;
  avatar?: string;
}

const router = useRouter();
const route = useRoute();

const assistant = ref<Assistant | null>(null);
const settings = ref({
  name: '',
  role: '',
  language: 'ru',
  notifications: true,
  autoReply: false
});

const randomAvatar = `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;

onMounted(() => {
  // Здесь можно загрузить данные ассистента по ID из route.params.id
  const assistantId = route.params.id;
  // TODO: Загрузка данных ассистента
});

const saveSettings = () => {
  // TODO: Сохранение настроек
  console.log('Сохранение настроек:', settings.value);
};
</script>

<style lang="scss" scoped>
.layout {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

.assistant-settings {
  flex: 1;
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background: #F9FAFB;

  &__header {
    display: flex;
    align-items: center;
    margin-bottom: 32px;
    gap: 24px;
  }

  &__back {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6B7280;
    cursor: pointer;
    font-weight: 500;
    
    &:hover {
      color: #111827;
    }
  }

  &__title {
    font-size: 24px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  &__profile {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
  }

  &__avatar {
    width: 80px;
    height: 80px;
    border-radius: 40px;
    object-fit: cover;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__name {
    font-size: 20px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  &__role {
    font-size: 14px;
    color: #6B7280;
    margin: 0;
  }

  &__section {
    background: #FFFFFF;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  &__section-title {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 16px 0;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__save {
    width: 100%;
    padding: 12px;
    background: #22C55E;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #16A34A;
    }
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
  }

  input, select {
    padding: 8px 12px;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #22C55E;
      box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
    }
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
  }
}
</style> 