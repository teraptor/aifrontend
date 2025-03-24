<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useAssistentsStore } from '@/stores/useAssistantsStore';
import Button from '../ui/Button.vue';

const props = defineProps<{
  show: boolean;
  installingId?: string; // ID ассистента, который сейчас устанавливается
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select', assistantId: string): void;
}>();

const assistentsStore = useAssistentsStore();
const assistants = ref([] as any[]);
const loading = ref(false);

// Загрузка шаблонов ассистентов
const loadTemplates = async () => {
  try {
    loading.value = true;
    await assistentsStore.fetchAssitantents();
    assistants.value = assistentsStore.filteredAssistents;
  } catch (error) {
    console.error('Ошибка при загрузке шаблонов ассистентов:', error);
  } finally {
    loading.value = false;
  }
};

// Загружаем шаблоны при открытии модального окна
watch(() => props.show, (newValue) => {
  if (newValue) {
    loadTemplates();
  }
});

// Загружаем шаблоны при монтировании компонента, если окно открыто
onMounted(() => {
  if (props.show) {
    loadTemplates();
  }
});

const closeModal = () => {
  emit('close');
};

const selectAssistant = (id: string) => {
  emit('select', id);
};

// Проверка, устанавливается ли сейчас ассистент
const isInstalling = (id: string) => props.installingId === id;
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <div class="modal__header">
        <h3 class="modal__title">Выберите ассистента</h3>
        <span class="icon icon-x modal__close" @click="closeModal"></span>
      </div>
      <div class="modal__content">
        <div v-if="loading" class="loading-wrapper">
          <span class="icon icon-loader"></span>
          <p>Загрузка ассистентов...</p>
        </div>
        <div 
          v-else-if="assistants.length === 0" 
          class="no-assistants"
        >
          <p>Доступных шаблонов ассистентов не найдено</p>
        </div>
        <div 
          v-else
          v-for="assistant in assistants" 
          :key="assistant.id"
          class="assistant-item"
          @click="selectAssistant(assistant.id)"
          :class="{'assistant-item--installing': isInstalling(assistant.id)}"
        >
          <img :src="assistant.image" class="assistant-item__image" alt="Аватар ассистента" />
          <div class="assistant-item__info">
            <h4 class="assistant-item__name">{{ assistant.name }}</h4>
            <p class="assistant-item__summary">{{ assistant.summary }}</p>
          </div>
          <div v-if="isInstalling(assistant.id)" class="assistant-item__installing">
            <span class="icon icon-loader"></span>
            <span>Установка...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba($dark-color, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: $light-color;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &__header {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid $light-grey-color;
  }

  &__title {
    font-size: 20px;
    font-weight: 600;
    color: $dark-color;
  }

  &__close {
    font-size: 24px;
    color: $help-color;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background: $light-grey-color;
    }
  }

  &__content {
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.assistant-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: $light-grey-color;
  }

  &--installing {
    background: rgba($help-color, 0.05);
    cursor: not-allowed;
    
    &:hover {
      background: rgba($help-color, 0.05);
    }
  }

  &__image {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
  }

  &__info {
    flex: 1;
  }

  &__name {
    font-size: 16px;
    font-weight: 500;
    color: $dark-color;
    margin: 0;
  }

  &__summary {
    font-size: 14px;
    color: $help-color;
    margin: 4px 0 0;
  }

  &__installing {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: $help-color;

    .icon-loader {
      animation: spin 1s linear infinite;
    }
  }
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;

  .icon-loader {
    font-size: 24px;
    color: $help-color;
    animation: spin 1s linear infinite;
  }

  p {
    color: $help-color;
    font-size: 14px;
  }
}

.no-assistants {
  text-align: center;
  padding: 24px;
  color: $help-color;
  font-size: 14px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>