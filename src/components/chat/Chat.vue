<template>
  <div class="chat">
    <div class="chat__container" v-if="selectedAssistant && chatStore.activeSessionId">
      <div class="chat-header" ref="chatHeader">
        <div class="assistant-header" @click="toggleAssistentMenu" ref="assistentMenuTrigger">
          <div class="assistant-header__avatar">
            <div class="assistant-avatar" v-if="selectedAssistant">
              {{ selectedAssistant.name.charAt(0) }}
            </div>
          </div>
          <div class="assistant-header__info">
            <h2 class="assistant-header__name">
              {{ selectedAssistant.name }}
              <span class="status-indicator" :class="{ 'status-indicator--active': selectedAssistant.status }"></span>
              <span class="dropdown-icon">▼</span>
            </h2>
            <div class="assistant-header__description-container">
              <p class="assistant-header__description">
                {{ selectedAssistant.description }}
              </p>
            </div>
          </div>
          <div class="assistant-header__share-button">
            <button class="share-button" @click.stop="shareAssistant">
              <span class="share-icon">Share</span>
            </button>
          </div>
        </div>

        <div class="assistant-dropdown" v-if="isAssistentMenuOpen" ref="assistentMenu">
          <div class="assistant-dropdown__header">Действия</div>
          <div class="assistant-dropdown__actions">
            <div
              v-for="item in menuItems"
              :key="item.id"
              class="assistant-dropdown__action"
              @click="item.action"
            >
              <span class="assistant-dropdown__action-icon">{{ item.icon }}</span>
              <span class="assistant-dropdown__action-title">{{ item.title }}</span>
            </div>
          </div>
          <div class="assistant-header__description-container">
            <p class="assistant-header__description">
              {{ selectedAssistant.description }}
            </p>
          </div>
          <div class="assistant-header__share-button">
            <button class="share-button" @click.stop="shareAssistant">
              <span class="share-icon">Share</span>
            </button>
          </div>
        </div>
      </div>

      <div
        class="sticky-header"
        :class="{ 'hidden': !isHeaderSticky }"
        ref="stickyHeader"
        :style="stickyHeaderStyle"
      >
        <div class="assistant-header" @click="toggleAssistentMenu">
          <div class="assistant-header__avatar">
            <div class="assistant-avatar" v-if="selectedAssistant">
              {{ selectedAssistant.name.charAt(0) }}
            </div>
          </div>
          <div class="assistant-header__info">
            <h2 class="assistant-header__name">
              {{ selectedAssistant.name }}
              <span class="status-indicator" :class="{ 'status-indicator--active': selectedAssistant.status }"></span>
              <span class="dropdown-icon">▼</span>
            </h2>
            <div class="assistant-header__description-container">
              <p class="assistant-header__description">
                {{ selectedAssistant.description }}
              </p>
            </div>
          </div>
          <div class="assistant-header__share-button">
            <button class="share-button" @click.stop="shareAssistant">
              <span class="share-icon">Share</span>
            </button>
          </div>
        </div>
      </div>

      <div class="chat-messages" ref="chatContainer">
        <template v-for="message in chatStore.sessionMessages" :key="message.id">
          <UserMessage
            v-if="message.isUser"
            :text="message.text || ''"
            :timestamp="message.timestamp"
            :is-authenticated="isAuthenticated"
            :id="message.id"
            :messages-after-count="getMessagesAfterCount(message.id)"
            :workflow-id="selectedAssistant?.id"
            :session-id="chatStore.activeSessionId"
          />
          <AssistantMessage
            v-else
            :text="message.text || ''"
            :timestamp="message.timestamp"
            :is-authenticated="isAuthenticated"
          />
        </template>

        <TypingIndicator v-if="chatStore.isLoading" />
      </div>
    </div>
    <div v-else class="no-dialog-selected">
      <p>Выберите ассистента и диалог или создайте новый</p>
    </div>
    <div class="fixed-chat-input">
      <div class="mode-menu-container">
        <ModeMenu
          class="mode-menu-component"
          :modes="chatModes"
          :current-mode="currentMode"
          :model="activeModel"
          @update:current-mode="handleModeChange"
        />
      </div>
      <div class="input-container">
        <div class="input-wrapper">
          <textarea
            ref="messageInput"
            v-model="newMessage"
            placeholder="Напишите сообщение..."
            @keydown.ctrl.enter.prevent="sendMessage"
            @input="autoGrow"
            :disabled="chatStore.isLoading"
            rows="1"
          ></textarea>
        </div>
        <button class="send-button" @click="sendMessage" :disabled="!newMessage.trim() || chatStore.isLoading">
          <span class="arrow-icon">↑</span>
        </button>
      </div>
    </div>
    <ShareModal
      :is-open="isShareModalOpen"
      :assistant-name="selectedAssistant?.name"
      :assistant-description="selectedAssistant?.description"
      :assistant-id="selectedAssistant?.id"
      @close="closeShareModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, watch, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useAssistentChatStore } from '@/stores/useAssistantChatStore'
import { useAuthStore } from '@/stores/useAuthStore'
import type { IAssistent } from '@/stores/useAssistantsStore'
import { webSocketService, WebSocketAction } from '@/api/services/webSocketService'
import ShareModal from './share/ShareModal.vue'
import UserMessage from './messages/UserMessage.vue'
import AssistantMessage from './messages/AssistantMessage.vue'
import TypingIndicator from './messages/TypingIndicator.vue'
import ModeMenu from './modalMenu/ModeMenu.vue'
import { Modal } from 'ant-design-vue'

// Интерфейсы для меню
interface MenuItem {
  id: string
  title: string
  icon: string
  action: () => void
}

// Интерфейс для WebSocket сообщения
interface WebSocketMessage {
  action: WebSocketAction;
  roomId: string;
  message?: string;
  workflowId?: string;
  userId?: string;
  timestamp?: string;
  success?: boolean;
}

// Интерфейс для режимов чата
interface ChatMode {
  id: string;
  name: string;
  icon: string;
  shortcut?: string;
  model?: string;
}

// Props
const props = defineProps<{
  selectedAssistant: IAssistent | null
}>()

// Emits
const emit = defineEmits<{
  (e: 'createNewDialog'): void
  (e: 'clearChat'): void
  (e: 'changeChatMode', mode: string): void
}>()

// Инициализация хранилищ
const chatStore = useAssistentChatStore()
const authStore = useAuthStore()

// Проверка авторизации
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Локальные переменные для UI
const newMessage = ref('')
const messageInput = ref<HTMLTextAreaElement | null>(null)
const chatContainer = ref<HTMLElement | null>(null)
const isAssistentMenuOpen = ref(false)
const assistentMenuTrigger = ref<HTMLElement | null>(null)
const assistentMenu = ref<HTMLElement | null>(null)
const chatHeader = ref<HTMLElement | null>(null)
const stickyHeader = ref<HTMLElement | null>(null)
const isHeaderSticky = ref(false)
const stickyHeaderStyle = ref({
  top: '0px',
  left: '0px',
  width: '0px'
})
const isShareModalOpen = ref(false)
const currentMode = ref('agent')
const activeModel = ref('claude-3')
const observer = ref<MutationObserver | null>(null)
const resizeObserver = ref<ResizeObserver | null>(null)

// Режимы чата
const chatModes = ref([
  { id: 'agent', name: 'Agent', icon: '∞', shortcut: '⌘I' },
  { id: 'ask', name: 'Ask', icon: '💬' }
])

// Создаем меню действий
const menuItems = ref<MenuItem[]>([
  {
    id: 'new-dialog',
    title: 'Новый диалог',
    icon: '+',
    action: () => {
      emit('createNewDialog')
      isAssistentMenuOpen.value = false
    }
  },
  {
    id: 'settings',
    title: 'Настройки ассистента',
    icon: '⚙️',
    action: () => {
      // Здесь будет логика для перехода к настройкам ассистента
      isAssistentMenuOpen.value = false
    }
  },
  {
    id: 'clear-chat',
    title: 'Очистить историю',
    icon: '🗑️',
    action: () => {
      if (chatStore.activeSessionId && confirm('Вы действительно хотите очистить историю чата?')) {
        emit('clearChat')
      }
      isAssistentMenuOpen.value = false
    }
  }
])

// Обработчик изменения режима
const handleModeChange = (mode: string) => {
  currentMode.value = mode
  emit('changeChatMode', mode)
}

// Закрытие меню режимов при клике вне его
onClickOutside(assistentMenu, (event) => {
  if (assistentMenuTrigger.value && !assistentMenuTrigger.value.contains(event.target as Node)) {
    isAssistentMenuOpen.value = false
  }
})

// Обработчики WebSocket событий
const handleNewMessage = (response: WebSocketMessage) => {
  try {
    if (!response.roomId || !props.selectedAssistant) {
      return
    }

    if (response.roomId === chatStore.activeSessionId) {
      // Если сообщение для активного диалога
      if (response.message) {
        chatStore.addMessage(response.message, false, response.roomId)
        scrollToBottom()
        
        // Удаляем запрос из списка ожидающих ответов
        chatStore.pendingResponses = chatStore.pendingResponses.filter(
          pr => !(pr.sessionId === response.roomId && pr.agentId === props.selectedAssistant?.id)
        )
        
        // Сразу сбрасываем состояние загрузки для текущего диалога
        chatStore.isLoading = false
      }
    } else {
      // Если сообщение для неактивного диалога
      const session = chatStore.sessions.find(s => s.id === response.roomId)
      if (session) {
        session.unreadCount++
        chatStore.newMessageReceived = true
        chatStore.lastReceivedMessageSessionId = response.roomId
        
        // Если это ответ на наше сообщение в другом диалоге, тоже нужно убрать из ожидающих
        chatStore.pendingResponses = chatStore.pendingResponses.filter(
          pr => !(pr.sessionId === response.roomId)
        )
        
        // Проверяем, остались ли еще ожидающие ответы
        if (chatStore.pendingResponses.length === 0) {
          chatStore.isLoading = false
        }
      }
    }
  } catch (error) {
    chatStore.isLoading = false
  }
}

// Отправка сообщения
const sendMessage = async () => {
  if (!newMessage.value.trim() || chatStore.isLoading || !chatStore.activeSessionId || !props.selectedAssistant) return

  try {
    // Устанавливаем состояние загрузки
    chatStore.isLoading = true

    // Сохраняем текст сообщения в переменную
    const messageText = newMessage.value

    // Очищаем поле ввода и сбрасываем его высоту
    newMessage.value = ''
    if (messageInput.value) {
      messageInput.value.style.height = '44px' // Устанавливаем минимальную высоту
    }

    // Добавляем сообщение в локальное хранилище
    await chatStore.addMessage(messageText, true, chatStore.activeSessionId)

    let msg = {
      action: WebSocketAction.NewMessage,
      workflowId: props.selectedAssistant.id,
      roomId: chatStore.activeSessionId,
      message: messageText
    }
    // Отправляем сообщение через WebSocket
    webSocketService.send(msg)

    // Фокус на поле ввода и прокрутка вниз
    nextTick(() => {
      if (messageInput.value) {
        messageInput.value.focus()
      }
      scrollToBottom()
    })
  } catch (error) {
    chatStore.isLoading = false
  }
}

// Переключение меню ассистента
const toggleAssistentMenu = () => {
  isAssistentMenuOpen.value = !isAssistentMenuOpen.value
}

// Форматирование времени
const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(date)
}

// Прокрутка чата вниз
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      const scrollHeight = chatContainer.value.scrollHeight
      const clientHeight = chatContainer.value.clientHeight
      const maxScroll = scrollHeight - clientHeight
      
      chatContainer.value.scrollTo({
        top: maxScroll,
        behavior: 'smooth'
      })
    }
  })
}

// Наблюдаем за изменениями в сообщениях
watch(() => chatStore.sessionMessages, () => {
  scrollToBottom()
}, { deep: true })

// Автоматически увеличиваем высоту поля ввода сообщения
const autoGrow = () => {
  if (!messageInput.value) return

  // Сбрасываем высоту для корректного расчета
  messageInput.value.style.height = '44px' // Устанавливаем минимальную высоту

  // Устанавливаем высоту на основе содержимого, но не более 150px
  const newHeight = Math.min(messageInput.value.scrollHeight, 150)
  messageInput.value.style.height = `${newHeight}px`
}

// Функция для проверки видимости шапки
const checkHeaderVisibility = () => {
  if (!chatHeader.value || !stickyHeader.value) return

  const headerRect = chatHeader.value.getBoundingClientRect()
  const isMainHeaderVisible = headerRect.top >= 0

  // Если основная шапка стала видимой, плавно скрываем прикрепленную
  if (isMainHeaderVisible && isHeaderSticky.value) {
    setTimeout(() => {
      isHeaderSticky.value = false
    }, 300)
  } else if (!isMainHeaderVisible) {
    // Если основная шапка не видна, показываем прикрепленную
    isHeaderSticky.value = true

    // Обновляем позицию прикрепленной шапки
    const chatContainer = chatHeader.value.closest('.chat__container')
    if (chatContainer) {
      const containerRect = chatContainer.getBoundingClientRect()
      stickyHeaderStyle.value = {
        top: '0px',
        left: `${containerRect.left}px`,
        width: `${containerRect.width}px`
      }
    }
  }
}

// Загрузка данных при монтировании
onMounted(() => {
  // Подписываемся на события WebSocket
  webSocketService.subscribe(WebSocketAction.NewMessage, handleNewMessage)

  // Настраиваем MutationObserver для отслеживания изменений в чате
  if (chatContainer.value) {
    observer.value = new MutationObserver(() => {
      scrollToBottom()
    });

    observer.value.observe(chatContainer.value, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Добавляем ResizeObserver для отслеживания изменений высоты
    resizeObserver.value = new ResizeObserver(() => {
      scrollToBottom()
    });

    resizeObserver.value.observe(chatContainer.value);
  }

  // Добавляем слушатель прокрутки
  window.addEventListener('scroll', checkHeaderVisibility)
})

// Следим за изменением активной сессии и ассистента
watch(
  [() => chatStore.activeSessionId, () => props.selectedAssistant],
  ([newSessionId, newAssistant], [oldSessionId, oldAssistant]) => {
    // Загружаем только если изменился sessionId или id ассистента
    if (newSessionId && newAssistant && (
      newSessionId !== oldSessionId || 
      newAssistant.id !== oldAssistant?.id
    )) {
      chatStore.loadDialogMessages(newAssistant.id, newSessionId)
    }
  },
  { immediate: true }
)

// Отписываемся от WebSocket событий при размонтировании компонента
onUnmounted(() => {
  webSocketService.unsubscribe(WebSocketAction.NewMessage, handleNewMessage)
  window.removeEventListener('scroll', checkHeaderVisibility)
  
  // Отключаем наблюдатели
  if (observer.value) {
    observer.value.disconnect()
  }
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  }
})

// Обновляем функцию shareAssistant
const shareAssistant = () => {
  isShareModalOpen.value = true
}

const closeShareModal = () => {
  isShareModalOpen.value = false
}

// Добавляем функцию подсчета сообщений
const getMessagesAfterCount = (messageId: string): number => {
  const messageIndex = chatStore.sessionMessages.findIndex(msg => msg.id === messageId)
  if (messageIndex === -1) return 0
  return chatStore.sessionMessages.length - messageIndex - 1
}
</script>

<style lang="scss" scoped>
.chat {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;

  &__container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    padding-bottom: 84px;
  }
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(#999, 0.1);
  position: relative;
}

.assistant-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  width: 100%;
  position: relative;

  &:hover {
    background-color: rgba(#1890ff, 0.05);
  }

  &__avatar {
    margin-right: 8px;

    .assistant-avatar {
      width: 24px;
      height: 24px;
      min-width: 24px;
      font-size: 12px;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    flex: 1;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 4px;

    .dropdown-icon {
      font-size: 8px;
      color: #999;
      margin-left: 4px;
    }

    .status-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #ff4d4f;
      display: inline-block;

      &--active {
        background-color: #52c41a;
      }
    }
  }

  &__description-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__description {
    font-size: 10px;
    color: #666;
    margin: 0;
  }

  &__share-button {
    margin-left: 8px;
    display: flex;
    align-items: center;
  }
}

.assistant-dropdown {
  position: absolute;
  top: 100%;
  left: 16px;
  width: 300px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  margin-top: 8px;
  overflow: hidden;

  &__header {
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    border-bottom: 1px solid rgba(#999, 0.1);
  }

  &__actions {
    padding: 8px 0;
    border-bottom: 1px solid rgba(#999, 0.1);
  }

  &__action {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;

    &:hover {
      background-color: rgba(#999, 0.05);
    }

    &-icon {
      margin-right: 12px;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    &-title {
      font-size: 14px;
    }
  }
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100% - 60px);
  padding-bottom: 20px;
}

.fixed-chat-input {
  position: fixed;
  bottom: 0;
  z-index: 100;
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 20px;
  box-sizing: border-box;

  .mode-menu-container {
    margin-bottom: 8px;
    align-self: flex-end;
  }

  .input-container {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 10px;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    flex: 1;
    align-items: center;
    background-color: $light-color;
    border-radius: 20px;
    border: 1px solid rgba($help-color, 0.2);
    padding-right: 8px;
    box-shadow: 0 0px 20px rgba(0, 0, 0, 0.1);
  }
  
  textarea {
    flex: 1;
    border: none;
    border-radius: 20px;
    background-color: transparent;
    font-family: inherit;
    font-size: 14px;
    min-height: 50px;
    max-height: 250px;
    resize: none;
    overflow-y: auto;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    display: block;
    box-sizing: border-box;
    padding: 11px 16px;
    vertical-align: middle;

    &:focus {
      outline: none;
      background-color: transparent;
    }

    &::placeholder {
      color: #999;
      vertical-align: middle;
    }

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #c0c0c0;
      border-radius: 2px;
    }

    &::-webkit-scrollbar-track {
      background-color: transparent;
    }
  }

  .send-button {
    width: 44px;
    height: 44px;
    min-width: 44px;
    border-radius: 50%;
    background-color: #40c4dd;
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
    margin-left: 10px;

    &:hover {
      background-color: #33b5ce;
    }

    &:disabled {
      background-color: #d9d9d9;
      cursor: not-allowed;
    }

    .arrow-icon {
      font-size: 18px;
    }
  }
}

.assistant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.no-dialog-selected {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 16px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
  
  p {
    margin: 0;
    max-width: 80%;
    line-height: 1.5;
  }
}

.sticky-header {
  position: fixed;
  z-index: 100;
  background-color: #ffffff;
  border-bottom: 1px solid rgba(#999, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 8px 16px;
  opacity: 1;
  visibility: visible;
  transition: all 0.3s ease-out;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;

  &.hidden {
    opacity: 0;
    visibility: hidden;
    transform: translateY(-100%);
  }

  .assistant-header {
    padding: 4px;
    border-radius: 6px;

    &:hover {
      background-color: rgba(#1890ff, 0.05);
    }
  }
}

.assistant-header__share-button {
  margin-left: auto;
  padding-left: 8px;
}

.share-button {
  background: rgba(24, 144, 255, 0.1);
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  color: #1890ff;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  white-space: nowrap;

  &:hover {
    background: rgba(24, 144, 255, 0.15);
  }

  .share-icon {
    font-size: 12px;
  }
}

.mode-menu-component {
  display: flex;
  align-items: center;
  padding: 0 2px;
  z-index: 5;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  gap: 4px;

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
}
</style>

