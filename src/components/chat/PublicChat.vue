<template>
  <div class="chat">
    <div class="chat__container" v-if="selectedAssistant && chatStore.activeSessionId">
      <div 
        class="chat-header" 
        ref="chatHeader"
        :class="{ 'chat-header--sticky': isHeaderSticky }"
      >
        <div class="assistant-header">
          <div class="assistant-header__avatar">
            <div class="assistant-avatar" v-if="selectedAssistant">
              {{ selectedAssistant.name.charAt(0) }}
            </div>
          </div>
          <div class="assistant-header__info">
            <h2 class="assistant-header__name">
              {{ selectedAssistant.name }}
              <span class="status-indicator" :class="{ 'status-indicator--active': selectedAssistant.isActive }"></span>
            </h2>
            <div class="assistant-header__description-container">
              <p class="assistant-header__description">
                {{ selectedAssistant.description }}
              </p>
            </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useAssistentChatStore } from '@/stores/useAssistantChatStore'
import type { IAssistent } from '@/stores/useAssistantsStore'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import mermaid from 'mermaid'
import { webSocketService, WebSocketAction, type WebSocketRequest, type WebSocketResponse } from '@/api/services/webSocketService'

// Инициализация Mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
})

// Props
const props = defineProps<{
  selectedAssistant: IAssistent | null
  isPublicAccess?: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'createNewDialog'): void
}>()

// Инициализация хранилища
const chatStore = useAssistentChatStore()

// Локальные переменные для UI и WebSocket
const newMessage = ref('')
const messageInput = ref<HTMLTextAreaElement | null>(null)
const chatContainer = ref<HTMLElement | null>(null)
const chatHeader = ref<HTMLElement | null>(null)
const isHeaderSticky = ref(false)
const currentRoomId = ref<string | null>(null)
const isConnecting = ref(false)

// Получение roomId из localStorage
const getRoomIdFromStorage = (assistantId: string): string | null => {
  const key = `public_chat_${assistantId}`
  return localStorage.getItem(key)
}

// Сохранение roomId в localStorage
const saveRoomIdToStorage = (assistantId: string, roomId: string) => {
  const key = `public_chat_${assistantId}`
  localStorage.setItem(key, roomId)
}

// Подключение к комнате
const connectToRoom = async () => {
  if (!props.selectedAssistant || isConnecting.value) return
  
  isConnecting.value = true
  
  try {
    // Проверяем наличие сохраненной комнаты
    const savedRoomId = getRoomIdFromStorage(props.selectedAssistant.id)
    
    if (savedRoomId) {
      // Присоединяемся к существующей комнате
      const joinRequest: WebSocketRequest = {
        action: WebSocketAction.JoinRoom,
        workflowId: props.selectedAssistant.id,
        roomId: savedRoomId
      }
      
      webSocketService.send(joinRequest)
      currentRoomId.value = savedRoomId
    } else {
      // Создаем новую комнату
      const createRequest: WebSocketRequest = {
        action: WebSocketAction.CreateRoom,
        workflowId: props.selectedAssistant.id
      }
      
      webSocketService.send(createRequest)
    }
  } catch (error) {
    console.error('Error connecting to room:', error)
  } finally {
    isConnecting.value = false
  }
}

// Обработчик WebSocket сообщений
const handleWebSocketMessage = (response: WebSocketResponse) => {
  switch (response.action) {
    case WebSocketAction.CreatedRoom:
      if (response.success && response.roomId) {
        currentRoomId.value = response.roomId
        saveRoomIdToStorage(props.selectedAssistant!.id, response.roomId)
        
        // Присоединяемся к созданной комнате
        const joinRequest: WebSocketRequest = {
          action: WebSocketAction.JoinRoom,
          workflowId: props.selectedAssistant!.id,
          roomId: response.roomId
        }
        webSocketService.send(joinRequest)
      }
      break
      
    case WebSocketAction.JoinedRoom:
      if (response.success && response.roomId) {
        // Создаем новую сессию для публичного чата
        chatStore.createNewSession(props.selectedAssistant!.id).then(() => {
          // После создания сессии, устанавливаем её как активную
          chatStore.selectSession(response.roomId)
        })
      }
      break
      
    case WebSocketAction.NewMessage:
      if (response.message && response.roomId) {
        // Добавляем новое сообщение от ассистента
        chatStore.addMessage(response.message, false, response.roomId)
        
        // Прокручиваем чат вниз при получении нового сообщения
        nextTick(() => {
          if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight
          }
        })
      }
      break
  }
}

// Функция отправки сообщения через WebSocket
const sendMessage = async () => {
  if (!newMessage.value.trim() || chatStore.isLoading || !currentRoomId.value) return

  const message = newMessage.value.trim()
  newMessage.value = ''
  
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
  }

  // Отправляем сообщение через WebSocket и добавляем в стор
  const messageRequest: WebSocketRequest = {
    action: WebSocketAction.SendMessage,
    workflowId: props.selectedAssistant!.id,
    roomId: currentRoomId.value,
    message: message
  }
  
  // Добавляем сообщение в стор
  await chatStore.addMessage(message, true, currentRoomId.value)
  
  // Отправляем сообщение через WebSocket
  webSocketService.send(messageRequest)
}

// Отписка от комнаты при размонтировании
const leaveRoom = () => {
  if (currentRoomId.value && props.selectedAssistant) {
    const leaveRequest: WebSocketRequest = {
      action: WebSocketAction.LeaveRoom,
      workflowId: props.selectedAssistant.id,
      roomId: currentRoomId.value
    }
    webSocketService.send(leaveRequest)
  }
}

// Следим за изменением ассистента
watch(() => props.selectedAssistant, (newAssistant) => {
  if (newAssistant) {
    connectToRoom()
  }
}, { immediate: true })

// Функция форматирования текста сообщений
const formattedText = (text: string) => {
  if (!text) return ''

  let formatted = text

  // Форматирование блоков кода
  formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || ''
    return `<pre class="code-block ${language}"><code>${code.trim()}</code></pre>`
  })

  // Форматирование формул KaTeX
  formatted = formatted.replace(/\$\$(.*?)\$\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula, { displayMode: true })
    } catch (error) {
      console.error('KaTeX rendering error:', error)
      return match
    }
  })

  formatted = formatted.replace(/\$(.*?)\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula, { displayMode: false })
    } catch (error) {
      console.error('KaTeX rendering error:', error)
      return match
    }
  })

  // Форматирование диаграмм Mermaid
  formatted = formatted.replace(/```mermaid\n([\s\S]*?)```/g, (match, diagram) => {
    try {
      return `<div class="mermaid">${diagram}</div>`
    } catch (error) {
      console.error('Mermaid rendering error:', error)
      return match
    }
  })

  return formatted
}

// Функция форматирования времени
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

// Функция автоматического роста текстового поля
const autoGrow = () => {
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
    messageInput.value.style.height = messageInput.value.scrollHeight + 'px'
  }
}

// Обработка прокрутки
const handleScroll = () => {
  if (!chatHeader.value) return
  
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  isHeaderSticky.value = scrollTop > 0
}

// Жизненный цикл компонента
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  
  // Подписываемся на все необходимые WebSocket события
  webSocketService.subscribe(WebSocketAction.CreatedRoom, handleWebSocketMessage)
  webSocketService.subscribe(WebSocketAction.JoinedRoom, handleWebSocketMessage)
  webSocketService.subscribe(WebSocketAction.NewMessage, handleWebSocketMessage)
  
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  
  // Отписываемся от всех WebSocket событий
  webSocketService.unsubscribe(WebSocketAction.CreatedRoom, handleWebSocketMessage)
  webSocketService.unsubscribe(WebSocketAction.JoinedRoom, handleWebSocketMessage)
  webSocketService.unsubscribe(WebSocketAction.NewMessage, handleWebSocketMessage)
  
  leaveRoom()
})
</script>

<style lang="scss" scoped>
.chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.chat__container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  background: #fff;
}

.chat-header {
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 10;
  transition: box-shadow 0.3s ease;

  &--sticky {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
}

.assistant-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.assistant-header__avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.assistant-avatar {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: #f5f5f5;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.assistant-header__info {
  flex: 1;
  min-width: 0;
}

.assistant-header__name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ddd;
}

.status-indicator--active {
  background: #52c41a;
}

.assistant-header__description {
  margin: 4px 0 0;
  font-size: 14px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #fafafa;
}

.message {
  max-width: 85%;
  display: flex;
  flex-direction: column;
}

.message--user {
  align-self: flex-end;
  
  .message__content {
    background: #1890ff;
    color: #fff;
    border-radius: 16px 16px 4px 16px;
    
    .message__time {
      color: rgba(255, 255, 255, 0.75);
    }
  }
}

.message--assistant {
  align-self: flex-start;
  
  .message__content {
    background: #fff;
    color: #333;
    border-radius: 16px 16px 16px 4px;
    border: 1px solid #f0f0f0;
    
    .message__time {
      color: #999;
    }
  }
}

.message__content {
  position: relative;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.message__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.message__time {
  font-size: 12px;
  margin-top: 4px;
  text-align: right;
}

.fixed-chat-input {
  padding: 16px 24px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

textarea {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  resize: none;
  min-height: 24px;
  max-height: 120px;
  background: #fafafa;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
  transition: all 0.3s ease;

  &:hover {
    border-color: #40a9ff;
  }

  &:focus {
    outline: none;
    border-color: #1890ff;
    background: #fff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  }

  &:disabled {
    background: #f5f5f5;
    border-color: #d9d9d9;
    cursor: not-allowed;
  }
}

.send-button {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #1890ff;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  padding: 0;

  &:hover {
    background: #40a9ff;
  }

  &:active {
    background: #096dd9;
  }

  &:disabled {
    background: #d9d9d9;
    cursor: not-allowed;
  }
}

.arrow-icon {
  font-size: 18px;
  transform: rotate(-90deg);
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: #999;
  border-radius: 50%;
  animation: typing 1s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

.typing-text {
  font-size: 13px;
  color: #999;
}

@keyframes typing {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.code-block {
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 8px;
  font-family: monospace;
  overflow-x: auto;
  margin: 8px 0;
  border: 1px solid #eee;
}

:deep(.mermaid) {
  margin: 12px 0;
  text-align: center;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.no-dialog-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
  background: #fafafa;
}
</style> 