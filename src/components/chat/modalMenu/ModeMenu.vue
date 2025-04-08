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
      <div v-if="isToolsModalOpen" class="tools-modal" @click.self="closeToolsModal">
        <div class="tools-modal__content">
          <button class="tools-modal__close" @click="closeToolsModal">×</button>
          <div class="tools-grid">
            <div class="tools-grid__item">
              <div class="tools-grid__icon tools-grid__icon--drive">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 87.3 78" height="48">
                  <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                  <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                  <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l6.85 11.85z" fill="#ea4335"/>
                  <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                  <path d="m59.8 53h-47.3l-6.1 10.5c-.8 1.4-1.2 2.95-1.2 4.5h61.9c1.55 0 3.1-.4 4.5-1.2z" fill="#2684fc"/>
                  <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                </svg>
              </div>
              <span class="tools-grid__label">Google Drive</span>
            </div>
            <div class="tools-grid__item">
              <div class="tools-grid__icon tools-grid__icon--sheets">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" height="48">
                  <path fill="#43A047" d="M37,45H11c-1.657,0-3-1.343-3-3V6c0-1.657,1.343-3,3-3h19l10,10v29C40,43.657,38.657,45,37,45z"/>
                  <path fill="#C8E6C9" d="M40,13H30V3L40,13z"/>
                  <path fill="#2E7D32" d="M30,13h10v3H30V13z"/>
                  <path fill="#E8F5E9" d="M31,23H17v2h14V23z M31,19H17v2h14V19z M31,27H17v2h14V27z M31,31H17v2h14V31z M31,35H17v2h14V35z"/>
                </svg>
              </div>
              <span class="tools-grid__label">Google Sheets</span>
            </div>
            <div class="tools-grid__item">
              <div class="tools-grid__icon tools-grid__icon--telegram">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" height="48">
                  <path fill="#29b6f6" d="M24 4A20 20 0 1 0 24 44A20 20 0 1 0 24 4Z"/>
                  <path fill="#fff" d="M33.95,15l-3.746,19.126c0,0-0.161,0.874-1.245,0.874c-0.576,0-0.873-0.274-0.873-0.274l-8.114-6.733 l-3.97-2.001l-5.095-1.355c0,0-0.907-0.262-0.907-1.012c0-0.625,0.933-0.923,0.933-0.923l21.316-8.468 c-0.001-0.001,0.651-0.235,1.126-0.234C33.667,14,34,14.125,34,14.5C34,14.75,33.95,15,33.95,15z"/>
                  <path fill="#b0bec5" d="M23,30.505l-3.426,3.374c0,0-0.149,0.115-0.348,0.12c-0.069,0.002-0.143-0.009-0.219-0.043 l0.964-5.965L23,30.505z"/>
                  <path fill="#cfd8dc" d="M29.897,18.196c-0.169-0.22-0.481-0.26-0.701-0.093L16,26c0,0,2.106,5.892,2.427,6.912 c0.322,1.021,0.58,1.045,0.58,1.045l0.964-5.965l9.832-9.096C30.023,18.729,30.064,18.416,29.897,18.196z"/>
                </svg>
              </div>
              <span class="tools-grid__label">Telegram</span>
            </div>
            <div class="tools-grid__item">
              <div class="tools-grid__icon tools-grid__icon--whatsapp">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" height="48">
                  <path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"/>
                  <path fill="#fff" d="M4.868,43.803c-0.132,0-0.26-0.052-0.355-0.148c-0.125-0.127-0.174-0.312-0.127-0.483l2.639-9.636c-1.636-2.906-2.499-6.206-2.497-9.556C4.532,13.238,13.273,4.5,24.014,4.5c5.21,0.002,10.105,2.031,13.784,5.713c3.679,3.683,5.704,8.577,5.702,13.781c-0.004,10.741-8.746,19.48-19.486,19.48c-3.189-0.001-6.344-0.788-9.144-2.277l-9.875,2.589C4.953,43.798,4.911,43.803,4.868,43.803z"/>
                  <path fill="#cfd8dc" d="M24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,4C24.014,4,24.014,4,24.014,4C12.998,4,4.032,12.962,4.027,23.979c-0.001,3.367,0.849,6.685,2.461,9.622l-2.585,9.439c-0.094,0.345,0.002,0.713,0.254,0.967c0.19,0.192,0.447,0.297,0.711,0.297c0.085,0,0.17-0.011,0.254-0.033l9.687-2.54c2.828,1.468,5.998,2.243,9.197,2.244c11.024,0,19.99-8.963,19.995-19.98c0.002-5.339-2.075-10.359-5.848-14.135C34.378,6.083,29.357,4.002,24.014,4L24.014,4z"/>
                  <path fill="#40c351" d="M35.176,12.832c-2.98-2.982-6.941-4.625-11.157-4.626c-8.704,0-15.783,7.076-15.787,15.774c-0.001,2.981,0.833,5.883,2.413,8.396l0.376,0.597l-1.595,5.821l5.973-1.566l0.577,0.342c2.422,1.438,5.2,2.198,8.032,2.199h0.006c8.698,0,15.777-7.077,15.78-15.776C39.795,19.778,38.156,15.814,35.176,12.832z"/>
                  <path fill="#fff" fill-rule="evenodd" d="M19.268,16.045c-0.355-0.79-0.729-0.806-1.068-0.82c-0.277-0.012-0.593-0.011-0.909-0.011c-0.316,0-0.83,0.119-1.265,0.594c-0.435,0.475-1.661,1.622-1.661,3.956c0,2.334,1.7,4.59,1.937,4.906c0.237,0.316,3.282,5.259,8.104,7.161c4.007,1.58,4.823,1.266,5.693,1.187c0.87-0.079,2.807-1.147,3.202-2.255c0.395-1.108,0.395-2.057,0.277-2.255c-0.119-0.198-0.435-0.316-0.909-0.554s-2.807-1.385-3.242-1.543c-0.435-0.158-0.751-0.237-1.068,0.238c-0.316,0.474-1.225,1.543-1.502,1.859c-0.277,0.317-0.554,0.357-1.028,0.119c-0.474-0.238-2.002-0.738-3.815-2.354c-1.41-1.257-2.362-2.81-2.639-3.285c-0.277-0.474-0.03-0.731,0.208-0.968c0.213-0.213,0.474-0.554,0.712-0.831c0.237-0.277,0.316-0.475,0.474-0.791c0.158-0.317,0.079-0.594-0.04-0.831C20.612,19.329,19.69,16.983,19.268,16.045z" clip-rule="evenodd"/>
                </svg>
              </div>
              <span class="tools-grid__label">WhatsApp</span>
            </div>
            <div class="tools-grid__item">
              <div class="tools-grid__icon tools-grid__icon--hh">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" height="48">
                  <rect width="48" height="48" rx="8" fill="#D6001C"/>
                  <path d="M11.5 8.3v31.4h4.1V27.8h16.8v11.9h4.1V8.3h-4.1v15.7H15.6V8.3h-4.1z" fill="#FFFFFF"/>
                </svg>
              </div>
              <span class="tools-grid__label">hh.ru</span>
            </div>
            <div class="tools-grid__item">
              <div class="tools-grid__icon tools-grid__icon--rag">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" height="48">
                  <circle cx="24" cy="24" r="20" fill="#6366f1"/>
                  <path d="M32 21c0-4.4-3.6-8-8-8s-8 3.6-8 8c0 3.7 2.5 6.8 6 7.7V35h4v-6.3c3.5-.9 6-4 6-7.7z" fill="white"/>
                  <circle cx="24" cy="21" r="4" fill="#6366f1"/>
                  <path d="M22 29h4v6h-4z" fill="white"/>
                </svg>
              </div>
              <span class="tools-grid__label">RAG</span>
            </div>
            <div class="tools-grid__item">
              <div class="tools-grid__icon tools-grid__icon--storage">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" height="48">
                  <circle cx="24" cy="24" r="20" fill="#64748b"/>
                  <rect x="14" y="16" width="20" height="4" rx="1" fill="#e2e8f0"/>
                  <rect x="14" y="22" width="20" height="4" rx="1" fill="#e2e8f0"/>
                  <rect x="14" y="28" width="20" height="4" rx="1" fill="#e2e8f0"/>
                  <circle cx="18" cy="18" r="1" fill="#64748b"/>
                  <circle cx="18" cy="24" r="1" fill="#64748b"/>
                  <circle cx="18" cy="30" r="1" fill="#64748b"/>
                </svg>
              </div>
              <span class="tools-grid__label">Storage</span>
            </div>
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
const isToolsModalOpen = ref(false);

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

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
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
    
    &:hover {
      background-color: #f5f5f5;
    }
  }
  
  &__icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    
    svg {
      width: auto;
      height: 48px;
    }
  }
  
  &__label {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    text-align: center;
  }
}
</style> 