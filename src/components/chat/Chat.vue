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
              <span class="status-indicator" :class="{ 'status-indicator--active': selectedAssistant.isActive }"></span>
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
              <span class="status-indicator" :class="{ 'status-indicator--active': selectedAssistant.isActive }"></span>
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
        <div
          v-for="message in chatStore.sessionMessages"
          :key="message.id"
          :class="['message', message.isUser ? 'message--user' : 'message--assistant']"
        >
          <div class="message__content">
            <p class="message__text" v-html="formattedText(message.text)"></p>
            <span class="message__time">{{ formatTime(message.timestamp) }}</span>
          </div>
        </div>

        <div v-if="chatStore.isLoading" class="message message--assistant message--typing">
          <div class="message__content typing-indicator">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p class="message__text typing-text">Печатает ответ...</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-dialog-selected">
      <p>Выберите ассистента и диалог или создайте новый</p>
    </div>
    <div class="fixed-chat-input">
        <textarea
          ref="messageInput"
          v-model="newMessage"
          placeholder="Напишите сообщение..."
          @keydown.ctrl.enter.prevent="sendMessage"
          @input="autoGrow"
          :disabled="chatStore.isLoading"
          rows="1"
        ></textarea>
        <button class="send-button" @click="sendMessage" :disabled="!newMessage.trim() || chatStore.isLoading">
          <span class="arrow-icon">↑</span>
        </button>
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
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useAssistentChatStore } from '@/stores/useAssistantChatStore'
import type { IAssistent } from '@/stores/useAssistantsStore'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import mermaid from 'mermaid'
import { webSocketService, WebSocketAction } from '@/api/services/webSocketService'
import ShareModal from './ShareModal.vue'

// Инициализация Mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
})

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

// Props
const props = defineProps<{
  selectedAssistant: IAssistent | null
}>()

// Emits
const emit = defineEmits<{
  (e: 'createNewDialog'): void
  (e: 'clearChat'): void
}>()

// Инициализация хранилища
const chatStore = useAssistentChatStore()

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

// Функция форматирования текста сообщений
const formattedText = (text: string) => {
  if (!text) return ''

  let formatted = text

  // Форматирование блоков кода
  formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || ''
    return `<pre class="code-block ${language}"><code>${code.trim()}</code></pre>`
  })

  // Форматирование таблиц
  formatted = formatted.replace(/\|(.+)\|/g, (match, content: string) => {
    const cells: string[] = content.split('|').map((cell: string) => cell.trim())
    return `<div class="table-row">${cells.map((cell: string) => `<div class="table-cell">${cell}</div>`).join('')}</div>`
  })

  // Форматирование диаграмм (поддержка Mermaid)
  formatted = formatted.replace(/```mermaid\n([\s\S]*?)```/g, (match, diagram) => {
    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
    nextTick(() => {
      try {
        mermaid.render(id, diagram.trim()).then((result) => {
          const element = document.getElementById(id)
          if (element) {
            element.innerHTML = result.svg
          }
        })
      } catch (error) {
        console.error('Error rendering mermaid diagram:', error)
      }
    })
    return `<div class="mermaid-diagram"><div id="${id}"></div></div>`
  })

  // Заменяем переносы строк на <br />
  formatted = formatted.replace(/\n/g, '<br />')

  // Форматирование математических формул
  formatted = formatted.replace(/\$\$(.*?)\$\$/g, (match, formula) => {
    try {
      return `<div class="math-block">${katex.renderToString(formula, { displayMode: true })}</div>`
    } catch (error) {
      console.error('Error rendering math formula:', error)
      return match
    }
  })
  formatted = formatted.replace(/\$(.*?)\$/g, (match, formula) => {
    try {
      return `<span class="math-inline">${katex.renderToString(formula, { displayMode: false })}</span>`
    } catch (error) {
      console.error('Error rendering math formula:', error)
      return match
    }
  })

  // Выделяем жирным текст между ** (как в Markdown)
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // Выделяем курсивом текст между * (как в Markdown)
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // Форматируем код (однострочный)
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')

  // Добавляем ссылки
  formatted = formatted.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  )

  return formatted
}

// Обработчики WebSocket событий
const handleNewMessage = (response: WebSocketMessage) => {
  try {
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
    console.error('Ошибка при обработке WebSocket сообщения:', error)
    chatStore.isLoading = false
  }
}

// Отправка сообщения
const sendMessage = async () => {
  if (!newMessage.value.trim() || chatStore.isLoading || !chatStore.activeSessionId || !props.selectedAssistant) return

  try {
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
    console.error('Ошибка при отправке сообщения:', error)
    chatStore.isLoading = false
  }
}

// Переключение меню ассистента
const toggleAssistentMenu = () => {
  isAssistentMenuOpen.value = !isAssistentMenuOpen.value
}

// Закрытие меню при клике вне его
onClickOutside(assistentMenu, (event) => {
  if (assistentMenuTrigger.value && !assistentMenuTrigger.value.contains(event.target as Node)) {
    isAssistentMenuOpen.value = false
  }
})

// Форматирование времени
const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(date)
}

// Прокрутка чата вниз
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

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
  // Настраиваем MutationObserver для отслеживания изменений в чате
  if (chatContainer.value) {
    const observer = new MutationObserver((mutations) => {
      // Прокручиваем чат вниз при изменениях содержимого
      scrollToBottom();
    });

    observer.observe(chatContainer.value, {
      childList: true,      // наблюдать за добавлением/удалением дочерних элементов
      subtree: true,        // наблюдать за изменениями во всех потомках
      characterData: true,  // наблюдать за изменениями текста
    });
  }

  // Добавляем слушатель прокрутки
  window.addEventListener('scroll', checkHeaderVisibility)

  // Подписываемся на события WebSocket
  webSocketService.subscribe(WebSocketAction.NewMessage, handleNewMessage)
})

// Отписываемся от WebSocket событий при размонтировании компонента
onUnmounted(() => {
  webSocketService.unsubscribe(WebSocketAction.NewMessage, handleNewMessage)
  window.removeEventListener('scroll', checkHeaderVisibility)
})

// Обновляем функцию shareAssistant
const shareAssistant = () => {
  isShareModalOpen.value = true
}

const closeShareModal = () => {
  isShareModalOpen.value = false
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
    padding-bottom: 84px; // Добавляем отступ снизу для поля ввода
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
  height: calc(100% - 60px); // Вычитаем высоту шапки
  padding-bottom: 20px; // Добавляем отступ снизу
}

.message {
  display: flex;
  max-width: 80%;
  width: 100%;

  &__content {
    padding: 12px 16px;
    border-radius: 12px;
    position: relative;
    word-wrap: break-word;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    width: 100%;
    box-sizing: border-box;

    :deep(.code-block) {
      background-color: #1e1e1e;
      color: #d4d4d4;
      padding: 12px;
      border-radius: 6px;
      margin: 8px 0;
      font-family: 'Fira Code', monospace;
      font-size: 13px;
      overflow-x: auto;
      position: relative;

      &::before {
        content: attr(class);
        position: absolute;
        top: 0;
        right: 0;
        padding: 4px 8px;
        font-size: 12px;
        color: #666;
        background-color: rgba(255, 255, 255, 0.1);
        border-bottom-left-radius: 6px;
        border-top-right-radius: 6px;
      }
    }

    :deep(.table-row) {
      display: flex;
      border-bottom: 1px solid rgba(#999, 0.1);

      &:first-child {
        font-weight: bold;
        background-color: rgba(#1890ff, 0.05);
      }
    }

    :deep(.table-cell) {
      padding: 8px;
      flex: 1;
      min-width: 100px;
      border-right: 1px solid rgba(#999, 0.1);

      &:last-child {
        border-right: none;
      }
    }

    :deep(.mermaid-diagram) {
      background-color: #fff;
      padding: 16px;
      border-radius: 6px;
      margin: 8px 0;
      border: 1px solid rgba(#999, 0.1);
    }

    :deep(.math-block) {
      padding: 8px;
      margin: 8px 0;
      background-color: rgba(#1890ff, 0.05);
      border-radius: 4px;
      text-align: center;
      font-family: 'KaTeX', 'Times New Roman', serif;
    }

    :deep(.math-inline) {
      font-family: 'KaTeX', 'Times New Roman', serif;
      padding: 0 4px;
    }

    :deep(.inline-code) {
      background-color: rgba(#000, 0.05);
      padding: 2px 4px;
      border-radius: 4px;
      font-family: 'Fira Code', monospace;
      font-size: 13px;
    }
  }

  &__text {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;

    :deep(a) {
      color: #1890ff;
      text-decoration: underline;
      word-break: break-word;

      &:hover {
        text-decoration: none;
      }
    }
  }

  &__time {
    font-size: 10px;
    color: #999;
    position: absolute;
    bottom: 4px;
    right: 8px;
  }

  &--assistant {
    align-self: flex-start;

    .message__content {
      background-color: #f5f7fa;
      border-bottom-left-radius: 4px;
    }
  }

  &--user {
    align-self: flex-end;

    .message__content {
      background-color: #1890ff;
      color: #ffffff;
      border-bottom-right-radius: 4px;
    }

    .message__time {
      color: rgba(#ffffff, 0.8);
    }
  }

  &--typing {
    opacity: 0.8;

    .message__content {
      padding-bottom: 8px;
    }
  }
}

.fixed-chat-input {
  position: fixed; // Меняем с fixed на absolute
  bottom: 0;
  z-index: 100;
  width: 50%;
  display: flex;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;


  textarea {
    flex: 1;
    border: 1px solid rgba($help-color, 0.2);
    border-radius: 20px;
    background-color: $light-color;
    font-family: inherit;
    font-size: 14px;
    min-height: 50px;
    max-height: 250px;
    resize: none;
    overflow-y: auto;
    margin: 0 20px;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    display: block;
    box-sizing: border-box;
    padding: 11px 16px;
    vertical-align: middle;
    box-shadow: 0 0px 20px rgba(0, 0, 0, 0.1); // Добавляем мягкую тень сверху


    &:focus {
      outline: none;
      background-color: #edf1f7;
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
}

.typing-indicator {
  background-color: #f5f7fa;
  border-bottom-left-radius: 4px;
}

.typing-dots {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;

  span {
    display: inline-block;
    width: 7px;
    height: 7px;
    background-color: #999;
    border-radius: 50%;
    opacity: 0.6;
    animation: typing 1s infinite ease-in-out;

    &:nth-child(1) {
      animation-delay: 0s;
    }

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

.typing-text {
  font-size: 14px;
  color: #666;
  margin: 4px 0 0 0;
}

@keyframes typing {
  0% {
    transform: translateY(0);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-5px);
    opacity: 1;
  }
  100% {
    transform: translateY(0);
    opacity: 0.6;
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
</style>
