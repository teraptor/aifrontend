<template>
  <div class="assistent-setting" v-if="assistent">
    <div class="assistent-setting__container">
      <img :src="assistent.image" class="assistent-setting__image"/>
      <div class="assistent-setting__name-wrapper">
        <h4 class="assistent-setting__name"> {{ assistent.name }}</h4>
        <p class="assistent-setting__summary"> {{ assistent.summary }}</p>
      </div>
    </div>
    <div class="assistent-setting__section">
      <h3 class="assistent-setting__section-title">Основные настройки</h3>
      <div class="assistent-setting__form">
        <div class="form-group">
          <label>Имя ассистента</label>
          <input type="text"  placeholder="Введите имя" />
        </div>
        <div class="form-group">
          <label>Роль</label>
          <input type="text" placeholder="Укажите роль" />
        </div>
        <div class="form-group">
          <label>Язык общения</label>
          <select>
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </div>
    <div class="assistent-setting__section">
      <h3 class="assistent-setting__section-title">Дополнительные настройки</h3>
      <div class="assistent-setting__form">
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" />
            Получать уведомления
          </label>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" />
            Автоматические ответы
          </label>
        </div>
      </div>
    </div>
    <button class="assistent-setting__save">
      Сохранить изменения
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAssistentsStore } from '@/stores/useAssistentsStore';

const route = useRoute();
const assistentsStore = useAssistentsStore();

const assistent = computed(() => {
  return assistentsStore.assistants.find((a) => a.id === route.params.id);
});
</script>
<style lang="scss">
.assistent-setting {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 48rem;
  gap: 32px;

  &__container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 20px;
  }

  &__image {
    width: 100px;
    height: 100px;
    border-radius: 50%;
  }

  &__name-wrapper {
    width: calc( 100% - 100px - 20px);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__name {
    font-weight: 600;
    line-height: 1.5;
    font-size: 24px;
  }

  &__summary {
    color: $help-color;
    line-height: 1.2;
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