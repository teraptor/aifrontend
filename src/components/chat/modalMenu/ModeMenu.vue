<template>
  <div class="mode-container" ref="containerRef">
    <!-- Кнопка для вызова меню режимов -->
    <div class="mode-toggle">
      <button
        v-for="mode in modes"
        :key="mode.id"
        class="mode-button"
        :class="{ 'mode-button--active': currentMode === mode.id }"
        @click="selectMode(mode.id)"
      >
        <span class="mode-icon">{{ mode.icon }}</span>
        <span>{{ mode.name }}</span>
        <span v-if="mode.shortcut" class="mode-shortcut">{{ mode.shortcut }}</span>
      </button>
      <button class="mode-button" @click="toggleToolsModal">
        <span class="mode-icon">🛠</span>
        <span>Tools</span>
      </button>
    </div>
    
    <!-- Выпадающее меню режимов -->
    <transition name="menu-fade">
      <div v-show="isOpen" class="mode-menu" ref="menuRef">
        <div
          v-for="mode in modes"
          :key="mode.id"
          class="mode-menu__item"
          :class="{ 'mode-menu__item--active': currentMode === mode.id }"
          @click="selectMode(mode.id)"
        >
          <span class="mode-menu__icon">{{ mode.icon }}</span>
          <span class="mode-menu__text">{{ mode.name }}</span>
          <span v-if="mode.shortcut" class="mode-menu__shortcut">{{ mode.shortcut }}</span>
          <div v-if="currentMode === mode.id" class="mode-menu__actions">
            <span class="mode-menu__edit">✏</span>
            <span class="mode-menu__check">✓</span>
          </div>
        </div>
      </div>
    </transition>

    <!-- Модальное окно для инструментов -->
    <transition name="modal-fade">
      <div v-if="isToolsModalOpen" class="tools-modal">
        <div class="tools-modal__content">
          <h2 class="tools-modal__title">Доступные инструменты</h2>
          <button class="tools-modal__close" @click="closeToolsModal">×</button>
          
          <!-- Загрузка -->
          <div v-if="loading" class="tools-modal__loading">
            <div class="loader"></div>
            <p>Загрузка инструментов...</p>
          </div>
          
          <!-- Ошибка -->
          <div v-else-if="error" class="tools-modal__error">
            <p>Произошла ошибка при загрузке инструментов</p>
            <button class="tools-modal__retry" @click="loadTools">Повторить</button>
          </div>
          
          <!-- Пусто -->
          <div v-else-if="tools.length === 0" class="tools-modal__empty">
            <p>Нет доступных инструментов</p>
          </div>
          
          <!-- Список инструментов -->
          <div v-else class="tools-grid">
            <div v-for="tool in tools" :key="tool.id" class="tools-grid__item">
              <div class="tools-grid__icon">🛠</div>
              <div class="tools-grid__label">{{ tool.name }}</div>
              <div class="tools-grid__description">{{ tool.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from 'vue';
import { useAssistentsStore } from '@/stores/useAssistantsStore';

// Интерфейс для режимов
interface ChatMode {
  id: string;
  name: string;
  icon: string;
  shortcut?: string;
}

// Props
const props = defineProps<{
  modes: ChatMode[];
  currentMode: string;
  model: string;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:currentMode', mode: string): void;
}>();

// Переменные
const isOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);
const isToolsModalOpen = ref(false);
const assistantsStore = useAssistentsStore();
const tools = ref<any[]>([]);
const loading = ref(false);
const error = ref(false);

// Метод для загрузки инструментов
const loadTools = async () => {
  loading.value = true;
  error.value = false;
  
  try {
    const response = await assistantsStore.getToolsList();
    tools.value = response?.tools || [];
    console.log('Загруженные инструменты:', tools.value);
  } catch (err) {
    console.error('Ошибка при загрузке инструментов:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

// Методы для получения текущего режима
const getCurrentModeIcon = () => {
  const mode = props.modes.find(m => m.id === props.currentMode);
  return mode ? mode.icon : '∞';
};

const getCurrentModeName = () => {
  const mode = props.modes.find(m => m.id === props.currentMode);
  return mode ? mode.name : 'Agent';
};

// Функции
const toggleMenu = (event: MouseEvent) => {
  event.stopPropagation();
  isOpen.value = !isOpen.value;
};

const selectMode = (modeId: string) => {
  if (modeId !== props.currentMode) {
    emit('update:currentMode', modeId);
  }
  isOpen.value = false;
};

// Функция для закрытия модального окна
const closeToolsModal = () => {
  isToolsModalOpen.value = false;
  document.body.style.overflow = '';
};

// Обновляем функцию toggleToolsModal
const toggleToolsModal = () => {
  if (!isToolsModalOpen.value) {
    isToolsModalOpen.value = true;
    document.body.style.overflow = 'hidden';
    loadTools(); // Загружаем инструменты при открытии модального окна
  } else {
    closeToolsModal();
  }
};

// Обработка клавиш
const handleKeyDown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key === '7') {
    event.preventDefault();
    isOpen.value = !isOpen.value;
  } else if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false;
  } else if (event.key === 'Escape' && isToolsModalOpen.value) {
    toggleToolsModal();
  }
};

// Обработчик клика вне компонента
const handleClickOutside = (event: MouseEvent) => {
  if (isOpen.value && containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

// Событие жизненного цикла
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('click', handleClickOutside);
  // Восстанавливаем прокрутку при размонтировании
  document.body.style.overflow = '';
});
</script>

<style lang="scss" scoped>
.mode-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 36px;
  position: relative;
  width: 100%;
}

.current-mode {
  display: flex;
  align-items: center;
  margin-right: 2px;
  font-size: 13px;
  color: #666;
  
  &__icon {
    margin-right: 4px;
    opacity: 0.85;
  }
  
  &__name {
    font-weight: 500;
  }

  &__separator {
    margin-left: 5px;
    opacity: 0.5;
    font-weight: 600;
  }
}

.mode-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  padding: 4px;
}

.mode-button {
  padding: 6px 12px;
  border-radius: 6px;
  background-color: #f5f5f5;
  color: #333;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background-color: #e6e6e6;
  }

  &--active {
    background-color: #2f3542;
    color: white;

    &:hover {
      background-color: #1e2532;
    }
  }

  .mode-icon {
    font-size: 14px;
  }

  .mode-shortcut {
    font-size: 11px;
    color: #999;
    margin-left: 4px;
  }
}

.mode-menu {
  position: absolute;
  top: -112px;
  right: 0;
  width: 180px;
  background-color: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  z-index: 100;
  
  &__item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    color: #fff;
    cursor: pointer;
    user-select: none;
    
    &:hover {
      background-color: #2a2a2a;
    }
    
    &--active {
      background-color: #0d4b8c;
    }
  }
  
  &__icon {
    margin-right: 12px;
    width: 18px;
    display: inline-block;
    text-align: center;
  }
  
  &__text {
    flex: 1;
    font-size: 13px;
  }
  
  &__shortcut {
    color: #888;
    margin-left: 10px;
    font-size: 11px;
  }
  
  &__actions {
    display: flex;
    gap: 4px;
    margin-left: 10px;
  }
  
  &__edit {
    color: #ddd;
    font-size: 14px;
  }
  
  &__check {
    color: #fff;
    font-size: 14px;
    font-weight: bold;
  }
}

// Анимация для появления и исчезновения меню
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

// Стили для модального окна
.tools-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10vh 10vw;

  &__content {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 2rem;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
  }

  &__title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 24px;
    text-align: center;
  }

  &__close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: #f5f5f5;
    color: #333;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
      background: #e6e6e6;
      color: #000;
    }
  }
  
  &__loading, &__error, &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    text-align: center;
  }
  
  &__retry {
    margin-top: 16px;
    padding: 8px 16px;
    background-color: #f5f5f5;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    
    &:hover {
      background-color: #e6e6e6;
    }
  }
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 24px;
  padding: 24px;
  
  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid #eaeaea;
    
    &:hover {
      background-color: #f5f5f5;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    }
  }
  
  &__icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background-color: #f5f5f5;
    font-size: 32px;
  }
  
  &__label {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    text-align: center;
  }
  
  &__description {
    font-size: 12px;
    color: #666;
    text-align: center;
    line-height: 1.4;
  }
}

// Анимация для модального окна
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style> 