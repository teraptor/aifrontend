<template>
  <div class="mode-container" ref="containerRef">
    <!-- Кнопка для вызова меню режимов -->
    <div class="mode-toggle" @click="toggleMenu">
       <!-- Отображение текущего выбора -->
      <div class="current-mode">
        <span class="current-mode__icon">{{ getCurrentModeIcon() }}</span>
        <span class="current-mode__name">{{ getCurrentModeName() }}</span>
        <span class="current-mode__separator">·</span>
      </div>
      <span class="mode-toggle__icon">⌘7</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from 'vue';

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

// Обработка клавиш
const handleKeyDown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key === '7') {
    event.preventDefault();
    isOpen.value = !isOpen.value;
  } else if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false;
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
});
</script>

<style lang="scss" scoped>
.mode-container {
  display: flex;
  align-items: center;
  height: 36px;
  position: relative;
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
  justify-content: space-between;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 6px 8px 6px 10px;
  border: none;
  border-radius: 8px;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  min-width: 115px;
  user-select: none;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }
  
  &__icon {
    font-weight: 500;
    opacity: 0.7;
    margin-left: 4px;
    font-size: 11px;
    color: #888;
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
</style> 