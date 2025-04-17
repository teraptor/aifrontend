<template>
  <div class="chat">
    <div class="chat__container" v-if="selectedAssistant && chatStore.activeSessionId">
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

  </div>
  <ChatForm
      :is-loading="chatStore.isLoading"
      :modes="chatModes"
      :current-mode="currentMode"
      :model="activeModel"
      :show-header="false"
      @send="sendMessage"
      @update:current-mode="handleModeChange"
      @tools-click="toggleAssistentMenu"
    />
    
    <ToolsModal
      :is-open="isToolsModalOpen"
      @close="toggleAssistentMenu"
    />
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, watch, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useAssistentChatStore } from '@/stores/useAssistantChatStore'
import { useAuthStore } from '@/stores/useAuthStore'
import type { IAssistent } from '@/stores/useAssistantsStore'
import { webSocketService, WebSocketAction } from '@/api/services/webSocketService'
import UserMessage from './messages/UserMessage.vue'
import AssistantMessage from './messages/AssistantMessage.vue'
import TypingIndicator from './messages/TypingIndicator.vue'
import ChatTools from './tools/ChatTools.vue'
import ChatForm from './form/ChatForm.vue'
import ToolsModal from './tools/ToolsModal.vue'

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
const chatContainer = ref<HTMLElement | null>(null)
const isAssistentMenuOpen = ref(false)
const assistentMenuTrigger = ref<HTMLElement | null>(null)
const assistentMenu = ref<HTMLElement | null>(null)
const chatHeader = ref<HTMLElement | null>(null)
const currentMode = ref('agent')
const activeModel = ref('claude-3')
const observer = ref<MutationObserver | null>(null)
const resizeObserver = ref<ResizeObserver | null>(null)
const isToolsModalOpen = ref(false)

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

// Обновляем функцию sendMessage
const sendMessage = async (messageText: string) => {
  if (chatStore.isLoading || !chatStore.activeSessionId || !props.selectedAssistant) return

  try {
    chatStore.isLoading = true

    // Добавляем сообщение в локальное хранилище
    await chatStore.addMessage(messageText, true, chatStore.activeSessionId)

    let msg = {
      action: WebSocketAction.NewMessage,
      workflowId: props.selectedAssistant.id,
      roomId: chatStore.activeSessionId,
      message: messageText
    }
    
    webSocketService.send(msg)

    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    chatStore.isLoading = false
  }
}

// Переключение меню ассистента
const toggleAssistentMenu = () => {
  isToolsModalOpen.value = !isToolsModalOpen.value
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
      const height = chatContainer.value.clientHeight;
      const scrollHeight = chatContainer.value.scrollHeight;
      console.log('Container height:', height);
      console.log('Scroll height:', scrollHeight);
      window.scrollTo({
        top: window.scrollY + scrollHeight,
        behavior: 'smooth'
      });
    }
  })
}

// Следим за появлением контейнера
const initContainer = () => {
  if (!chatContainer.value) {
    console.log('Ожидание появления chatContainer...');
    return;
  }

  console.log('chatContainer найден:', chatContainer.value);

  // Настраиваем MutationObserver для отслеживания изменений в чате
  observer.value = new MutationObserver((mutations) => {
    console.log('MutationObserver triggered', mutations);
    if (chatContainer.value) {
      const scrollHeight = chatContainer.value.scrollHeight;
      window.scrollTo({
        top: window.scrollY + scrollHeight,
        behavior: 'smooth'
      });
    }
  });

  observer.value.observe(chatContainer.value, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // Добавляем ResizeObserver для отслеживания изменений высоты
  resizeObserver.value = new ResizeObserver(() => {
    // Прокрутка при изменении размера не нужна
  });

  resizeObserver.value.observe(chatContainer.value);

  // Прокрутка при открытии/обновлении чата
  scrollToBottom()
}

// Загрузка данных при монтировании
onMounted(() => {
  // Подписываемся на события WebSocket
  webSocketService.subscribe(WebSocketAction.NewMessage, handleNewMessage)

  // Запускаем инициализацию
  nextTick(() => {
    initContainer()
  })
})

// Следим за появлением контейнера
watch(chatContainer, (newVal) => {
  if (newVal) {
    console.log('chatContainer появился в watch');
    initContainer()
  }
}, { immediate: true })

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
      // Прокрутка после загрузки сообщений
      nextTick(() => {
        scrollToBottom()
      })
    }
  },
  { immediate: true }
)

// Отписываемся от WebSocket событий при размонтировании компонента
onUnmounted(() => {
  webSocketService.unsubscribe(WebSocketAction.NewMessage, handleNewMessage)
  
  // Отключаем наблюдатели
  if (observer.value) {
    observer.value.disconnect()
  }
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  }
})

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
    padding-bottom: 120px;
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
  margin-bottom: 20px;
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

