<template>
  <div class="chat">
    <div class="chat__container" v-if="selectedAssistant && chatStore.activeSessionId">
      <div 
        v-if="!hideHeader"
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
              <span class="status-indicator" :class="{ 'status-indicator--active': selectedAssistant.status }"></span>
            </h2>
            <div class="assistant-header__description-container">
              <p class="assistant-header__description">
                {{ selectedAssistant.description }}
              </p>
            </div>
          </div>
          <button 
            class="new-survey-button" 
            @click="createNewSurvey"
            v-if="isAuthenticated"
          >
            <span class="new-survey-icon">+</span>
            <span class="new-survey-text">Новый опрос</span>
          </button>
        </div>
      </div>

      <div class="chat-messages" ref="chatContainer">
        <template v-for="message in chatStore.sessionMessages" :key="message.id">
          <UserMessage
            v-if="message.isUser"
            :text="message.text"
            :timestamp="message.timestamp"
            :is-authenticated="isAuthenticated"
            :id="message.id"
            :messages-after-count="0"
            :workflow-id="''"
            :session-id="chatStore.activeSessionId"
          />
          <AssistantMessage
            v-else
            :text="message.text"
            :timestamp="message.timestamp"
            :is-authenticated="isAuthenticated"
          />
        </template>

        <TypingIndicator v-if="chatStore.isLoading" />
      </div>
    </div>
    <div class="fixed-chat-input">
      <textarea
        ref="messageInput"
        v-model="newMessage"
        placeholder="Напишите сообщение..."
        @keydown.ctrl.enter.prevent="sendMessage"
        @input="autoGrow"
        :disabled="chatStore.isLoading || !isAuthenticated"
        rows="1"
      ></textarea>
      <button 
        class="send-button" 
        @click="sendMessage" 
        :disabled="!newMessage.trim() || chatStore.isLoading || !isAuthenticated"
      >
        <span class="arrow-icon">↵</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, watch, computed } from 'vue'
import { useAssistentChatStore } from '@/stores/useAssistantChatStore'
import { useAuthStore } from '@/stores/useAuthStore'
import type { IAssistent } from '@/stores/useAssistantsStore'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import mermaid from 'mermaid'
import { webSocketService, WebSocketAction, type WebSocketRequest, type WebSocketResponse } from '@/api/services/webSocketService'
import { useRoute } from 'vue-router'
import { formattedText } from '@/utils/messageFormatter'
import UserMessage from './messages/UserMessage.vue'
import AssistantMessage from './messages/AssistantMessage.vue'
import TypingIndicator from './messages/TypingIndicator.vue'

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
  hideHeader?: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'createNewDialog'): void
}>()

// Инициализация хранилищ
const chatStore = useAssistentChatStore()
const authStore = useAuthStore()
const route = useRoute()
const newMessage = ref('')
const messageInput = ref<HTMLTextAreaElement | null>(null)
const chatContainer = ref<HTMLElement | null>(null)
const chatHeader = ref<HTMLElement | null>(null)
const isHeaderSticky = ref(false)
const roomId = ref<string | null>(null)
const isWebSocketConnected = ref(false)
const formattedMessage = ref('')

// Проверка авторизации
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Генерация или получение ID анонимного пользователя
const getAnonymousUserId = (): string => {
  const storageKey = 'anonymous_user_id'
  let userId = localStorage.getItem(storageKey)
  
  if (!userId) {
    // Генерируем случайный ID, если его еще нет
    userId = 'anon_' + Math.random().toString(36).substring(2, 15) + 
      Math.random().toString(36).substring(2, 15)
    localStorage.setItem(storageKey, userId)
  }
  
  return userId
}

// Получаем ID пользователя
const userId = ref(getAnonymousUserId())

// Получаем workflowId из URL
const getWorkflowIdFromUrl = () => {
  const pathParts = route.path.split('/')
  // Ищем часть пути после "chat/"
  const chatIndex = pathParts.findIndex(part => part === 'chat')
  if (chatIndex !== -1 && pathParts.length > chatIndex + 1) {
    return pathParts[chatIndex + 1]
  }
  // Если не нашли в пути, возвращаем ID выбранного ассистента
  return props.selectedAssistant?.id || ''
}

// Функции для работы с сессией пользователя в localStorage
const getSessionFromStorage = () => {
  try {
    const workflowId = getWorkflowIdFromUrl()
    const storageKey = `public_chat_session_${workflowId}`
    const sessionData = localStorage.getItem(storageKey)
    
    if (sessionData) {
      return JSON.parse(sessionData)
    }
  } catch (error) {
  }
  return null
}

const saveSessionToStorage = (sessionData: { roomId: string, sessionId: string }) => {
  try {
    const workflowId = getWorkflowIdFromUrl()
    const storageKey = `public_chat_session_${workflowId}`
    localStorage.setItem(storageKey, JSON.stringify(sessionData))
  } catch (error) {
  }
}

// Функции для работы с WebSocket
const initializeWebSocket = async () => {
  try {
    const workflowId = getWorkflowIdFromUrl()
    
    // Принудительно переподключаем WebSocket если нужно
    if (!webSocketService.isConnected()) {
      await webSocketService.connect();
    }
    
    isWebSocketConnected.value = webSocketService.isConnected();
    
    // Проверяем наличие сохраненной сессии
    const savedSession = getSessionFromStorage()
    
    if (savedSession && savedSession.roomId && savedSession.sessionId) {
      roomId.value = savedSession.roomId
      
      // Устанавливаем активную сессию из сохраненных данных
      if (!chatStore.activeSessionId) {
        // Для публичного доступа создаем локальную сессию вместо запроса к API
        if (props.isPublicAccess) {
          // Создаем локальную сессию без вызова API
          const localSession = {
            id: savedSession.sessionId,
            title: `Публичный чат ${workflowId}`,
            timestamp: new Date().toISOString(),
            isActive: true,
            agentId: workflowId,
            unreadCount: 0
          };
          
          // Добавляем сессию в хранилище
          chatStore.sessions.push(localSession);
          chatStore.activeSessionId = localSession.id;
        } else {
          // Для авторизованных пользователей используем API
          await chatStore.loadDialogMessages(workflowId, savedSession.sessionId);
          chatStore.selectSession(savedSession.sessionId);
        }
      }
      
      // Присоединяемся к существующей комнате
      webSocketService.send({
        action: WebSocketAction.JoinRoom,
        workflowId: workflowId,
        roomId: savedSession.roomId,
        userId: userId.value
      });
    } else {
      
      // Проверяем, активна ли сессия, если нет - создаем новую
      if (!chatStore.activeSessionId) {
        
        // Для публичного доступа создаем локальную сессию вместо запроса к API
        if (props.isPublicAccess) {
          // Генерируем локальный ID сессии
          const sessionId = `local_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          
          // Создаем локальную сессию без вызова API
          const localSession = {
            id: sessionId,
            title: `Публичный чат ${workflowId}`,
            timestamp: new Date().toISOString(),
            isActive: true,
            agentId: workflowId,
            unreadCount: 0
          };
          
          // Добавляем сессию в хранилище
          chatStore.sessions.push(localSession);
          chatStore.activeSessionId = localSession.id;
        } else {
          // Для авторизованных пользователей используем API
          const newSession = await chatStore.createNewSession(workflowId);
        }
      }
      
      // Создаем комнату
      await webSocketService.send({
        action: WebSocketAction.CreateRoom,
        workflowId: workflowId,
        userId: userId.value
      });
    }

    // Подписываемся на события
    webSocketService.subscribe(WebSocketAction.CreatedRoom, handleRoomCreated);
    webSocketService.subscribe(WebSocketAction.NewMessage, handleNewMessage);
    webSocketService.subscribe(WebSocketAction.WelcomeMessage, handleNewMessage);
  } catch (error) {
  }
};

const handleRoomCreated = (response: WebSocketResponse) => {
  if (response.roomId) {
    roomId.value = response.roomId;
    
    // Сохраняем информацию о сессии в localStorage
    if (chatStore.activeSessionId) {
      saveSessionToStorage({
        roomId: roomId.value,
        sessionId: chatStore.activeSessionId
      });
    }
    
    const workflowId = getWorkflowIdFromUrl();
    // После создания комнаты присоединяемся к ней
    webSocketService.send({
          action: WebSocketAction.JoinRoom,
      workflowId: workflowId,
      roomId: roomId.value,
      userId: userId.value
    });
  }
};

const handleNewMessage = (response: WebSocketResponse) => {
  
  // Проверяем тип действия и наличие сообщения
  if (response.message !== undefined) {
    let messageText = response.message || '';
    
    // Если сообщение пустое или только 'join', игнорируем его как служебное
    if (!messageText || messageText === 'join') {
      return;
    }
    
    // Останавливаем индикатор загрузки
    chatStore.isLoading = false;
    
    // Форматируем сообщение перед добавлением
    formattedText(messageText).then(formattedMessage => {
      chatStore.addMessage(formattedMessage, false, chatStore.activeSessionId);
      
      // Прокручиваем чат вниз
      nextTick(() => {
        if (chatContainer.value) {
          chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
      });
    });
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || chatStore.isLoading) return;
  const workflowId = getWorkflowIdFromUrl();
  const messageText = newMessage.value.trim();
  // Сохраняем сообщение перед отправкой
  const tempMessage = newMessage.value.trim();
  
  // Очищаем поле ввода и сбрасываем его высоту
  newMessage.value = '';
  if (messageInput.value) {
    messageInput.value.style.height = '44px';
  }
  
  try {
    // Проверяем соединение WebSocket
    if (!webSocketService.isConnected()) {
      await webSocketService.connect();
      
      // Подождем немного, чтобы соединение установилось
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Если соединение не установлено, выводим ошибку
      if (!webSocketService.isConnected()) {
        throw new Error('Не удалось установить соединение с сервером');
      }
    }
    
    // Проверяем, активна ли сессия
    if (!chatStore.activeSessionId) {
      
      // Для публичного доступа создаем локальную сессию вместо запроса к API
      if (props.isPublicAccess) {
        // Генерируем локальный ID сессии
        const sessionId = `local_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        // Создаем локальную сессию без вызова API
        const localSession = {
          id: sessionId,
          title: `Публичный чат ${workflowId}`,
          timestamp: new Date().toISOString(),
          isActive: true,
          agentId: workflowId,
          unreadCount: 0
        };
        
        // Добавляем сессию в хранилище
        chatStore.sessions.push(localSession);
        chatStore.activeSessionId = localSession.id;
      } else {
        // Для авторизованных пользователей используем API
        await chatStore.createNewSession(workflowId);
      }
    }

    // Добавляем сообщение в чат
    chatStore.addMessage(messageText, true, chatStore.activeSessionId);
    
    // Устанавливаем состояние загрузки
    chatStore.isLoading = true;
    
    // Прокручиваем чат вниз
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
      }
    });

    // Проверяем состояние WebSocket соединения
    isWebSocketConnected.value = webSocketService.isConnected();

    // Если нет ID комнаты, пытаемся получить ее из хранилища
    if (!roomId.value) {
      const savedSession = getSessionFromStorage();
      
      if (savedSession && savedSession.roomId) {
        roomId.value = savedSession.roomId;
        
        // Если нет активной сессии, устанавливаем ее из сохраненных данных
        if (!chatStore.activeSessionId && savedSession.sessionId) {
          if (props.isPublicAccess) {
            // Создаем локальную сессию без вызова API
            const localSession = {
              id: savedSession.sessionId,
              title: `Публичный чат ${workflowId}`,
              timestamp: new Date().toISOString(),
              isActive: true,
              agentId: workflowId,
              unreadCount: 0
            };
            
            // Добавляем сессию в хранилище
            chatStore.sessions.push(localSession);
            chatStore.activeSessionId = localSession.id;
          } else {
            // Для авторизованных пользователей используем API
            await chatStore.loadDialogMessages(workflowId, savedSession.sessionId);
            chatStore.selectSession(savedSession.sessionId);
          }
        }
        
        // Присоединяемся к существующей комнате
        await webSocketService.send({
          action: WebSocketAction.JoinRoom,
          workflowId: workflowId,
          roomId: savedSession.roomId,
          userId: userId.value
        });
      } else {
        // Создаем новую комнату, если не нашли сохраненную
        
        await webSocketService.send({
          action: WebSocketAction.CreateRoom,
          workflowId: workflowId,
          userId: userId.value
        });
        
        // Ждем немного, чтобы получить ID комнаты
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (!roomId.value) {
          throw new Error('Не удалось получить ID комнаты');
        }
      }
    }

    // Отправляем сообщение через WebSocket
    
    // Дополнительная задержка перед отправкой
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Формируем запрос для отправки
    const request = {
      action: WebSocketAction.NewMessage,
      workflowId: workflowId,
      roomId: roomId.value || '',
      message: messageText,
      userId: userId.value
    };
    
    
    // Отправляем сообщение
    const sendPromise = webSocketService.send(request);
    
    // Ждем отправки с таймаутом
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Таймаут отправки сообщения')), 5000)
    );
    
    await Promise.race([sendPromise, timeoutPromise]);
    
    // Устанавливаем таймаут для отмены состояния загрузки через 15 секунд
    const loadingTimeout = setTimeout(() => {
      if (chatStore.isLoading) {
        chatStore.isLoading = false;
      }
    }, 15000);
    
  } catch (error) {
    // Если произошла ошибка, можно вернуть текст в поле ввода
    newMessage.value = tempMessage;
    // Отключаем состояние загрузки
    chatStore.isLoading = false;
  }
};

// Следим за изменением выбранного ассистента и сразу инициализируем
watch(() => props.selectedAssistant, (newAssistant) => {
  if (newAssistant) {
    nextTick(() => {
      initializeWebSocket();
    });
  }
}, { immediate: true });

// Обработка прокрутки
const handleScroll = () => {
  if (!chatHeader.value) return
  
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  isHeaderSticky.value = scrollTop > 0
}

// Следим за изменением newMessage для сброса высоты
watch(newMessage, (value) => {
  if (!value && messageInput.value) {
    messageInput.value.style.height = '44px';
  }
});

// Жизненный цикл компонента
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  
  // Проверяем состояние WebSocket каждые 10 секунд
  const connectionCheckInterval = setInterval(() => {
    const connected = webSocketService.isConnected();
    if (connected !== isWebSocketConnected.value) {
      isWebSocketConnected.value = connected;
      
      // Если соединение потеряно, пытаемся переподключиться
      if (!connected && props.selectedAssistant) {
        initializeWebSocket();
      }
    }
  }, 10000);
  
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
  
  // Очищаем интервал при размонтировании
  onUnmounted(() => {
    clearInterval(connectionCheckInterval);
    window.removeEventListener('scroll', handleScroll);
    
    // Отписываемся от событий и покидаем комнату
    if (roomId.value) {
      webSocketService.send({
        action: WebSocketAction.LeaveRoom,
        workflowId: getWorkflowIdFromUrl(),
        roomId: roomId.value,
        userId: userId.value
      });
    }
    
    webSocketService.unsubscribe(WebSocketAction.CreatedRoom, handleRoomCreated);
    webSocketService.unsubscribe(WebSocketAction.NewMessage, handleNewMessage);
    webSocketService.unsubscribe(WebSocketAction.WelcomeMessage, handleNewMessage);
  });
});

// Функция форматирования времени
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

// Функция автоматического роста текстового поля
const autoGrow = () => {
  if (messageInput.value) {
    // Сначала сбрасываем высоту до минимальной
    messageInput.value.style.height = '44px';
    
    // Затем устанавливаем высоту на основе содержимого
    const newHeight = Math.min(messageInput.value.scrollHeight, 120);
    messageInput.value.style.height = `${newHeight}px`;
  }
}

const createNewSurvey = async () => {
  try {
    chatStore.isLoading = true;
    
    const workflowId = getWorkflowIdFromUrl();
    
    // Очищаем текущий roomId
    roomId.value = null;
    
    // Очищаем сообщения в localStorage
    const storageKey = `public_chat_session_${workflowId}`;
    localStorage.removeItem(storageKey);
    
    // Очищаем сообщения в хранилище
    if (chatStore.activeSessionId) {
      chatStore.messages = chatStore.messages.filter(m => m.sessionId !== chatStore.activeSessionId);
    }
    
    // Создаем новую комнату через WebSocket
    await webSocketService.send({
      action: WebSocketAction.CreateRoom,
      workflowId: workflowId,
      userId: userId.value
    });
    
    // Отправляем приветственное сообщение
    chatStore.addMessage('Создан новый опрос', false, chatStore.activeSessionId);
    
  } catch (error) {
  } finally {
    chatStore.isLoading = false;
  }
};

const updateFormattedText = async (text: string) => {
  formattedMessage.value = await formattedText(text);
};
</script>

<style lang="scss" scoped>
.chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;

  &__container {
    &:not(:has(.chat-header)) {
      padding-top: 0;
      
      .chat-messages {
        height: calc(100vh - 120px);
      }
    }
  }
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
  padding-right: 16px;
  position: relative;
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

.fixed-chat-input {
  padding: 8px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;

  textarea {
    flex: 1;
    padding: 12px;
    border: 1px solid #e8e8e8;
    border-radius: 12px;
    resize: none;
    min-height: 44px;
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
      color: #999;
      
      &::placeholder {
        color: #999;
      }
    }
  }

  .send-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 8px;
    background: #f0f0f0;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: all 0.2s ease;
    
    .arrow-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transform: rotate(0deg) scale(1.2);
      font-size: 20px;
      line-height: 1;
      transition: color 0.2s ease;
    }

    &:hover {
      background: #e5e5e5;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: #f0f0f0;
      
      .arrow-icon {
        color: #999;
      }
    }

    &:not(:disabled) {
      background: #007AFF;

      .arrow-icon {
        color: white;
      }

      &:hover {
        background: #0066DB;
      }
    }
  }
}

.new-survey-button {
  margin-left: auto;
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  background: #ff69b4;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ff1493;
  }
  
  &:active {
    background: #c71585;
  }
}

.new-survey-icon {
  font-size: 18px;
  font-weight: bold;
}

.new-survey-text {
  white-space: nowrap;
}
</style> 