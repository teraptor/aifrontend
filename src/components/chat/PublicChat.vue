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
              <span class="status-indicator" :class="{ 'status-indicator--active': selectedAssistant.isActive }"></span>
            </h2>
            <div class="assistant-header__description-container">
              <p class="assistant-header__description">
                {{ selectedAssistant.description }}
              </p>
            </div>
          </div>
          <button class="new-survey-button" @click="createNewSurvey">
            <span class="new-survey-icon">+</span>
            <span class="new-survey-text">Новый опрос</span>
          </button>
        </div>
      </div>

      <div class="chat-messages" ref="chatContainer">
        <div
          v-for="message in chatStore.sessionMessages"
          :key="message.id"
          :class="['message', message.isUser ? 'message--user' : 'message--assistant']"
        >
          <div class="message__content">
            <p class="message__text" v-html="message.text"></p>
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
        <span class="arrow-icon">↵</span>
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
import { useRoute } from 'vue-router'
import { formattedText } from '@/utils/messageFormatter'

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

// Инициализация хранилища
const chatStore = useAssistentChatStore()
const route = useRoute()
const newMessage = ref('')
const messageInput = ref<HTMLTextAreaElement | null>(null)
const chatContainer = ref<HTMLElement | null>(null)
const chatHeader = ref<HTMLElement | null>(null)
const isHeaderSticky = ref(false)
const roomId = ref<string | null>(null)
const isWebSocketConnected = ref(false)
const formattedMessage = ref('')

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
    console.error('Ошибка при получении сессии из localStorage:', error)
  }
  return null
}

const saveSessionToStorage = (sessionData: { roomId: string, sessionId: string }) => {
  try {
    const workflowId = getWorkflowIdFromUrl()
    const storageKey = `public_chat_session_${workflowId}`
    localStorage.setItem(storageKey, JSON.stringify(sessionData))
    console.log('Сессия сохранена в localStorage:', sessionData)
  } catch (error) {
    console.error('Ошибка при сохранении сессии в localStorage:', error)
  }
}

// Функции для работы с WebSocket
const initializeWebSocket = async () => {
  try {
    const workflowId = getWorkflowIdFromUrl()
    console.log('Инициализация WebSocket для ассистента, workflowId:', workflowId);
    console.log('ID анонимного пользователя:', userId.value);
    
    // Принудительно переподключаем WebSocket если нужно
    if (!webSocketService.isConnected()) {
      console.log('WebSocket не подключен, инициируем подключение');
      await webSocketService.connect();
    }
    
    isWebSocketConnected.value = webSocketService.isConnected();
    console.log('Состояние WebSocket соединения:', isWebSocketConnected.value ? 'Открыто' : 'Закрыто');
    
    // Проверяем наличие сохраненной сессии
    const savedSession = getSessionFromStorage()
    
    if (savedSession && savedSession.roomId && savedSession.sessionId) {
      console.log('Найдена сохраненная сессия:', savedSession)
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
      console.log('Присоединяемся к существующей комнате:', roomId.value)
      webSocketService.send({
        action: WebSocketAction.JoinRoom,
        workflowId: workflowId,
        roomId: savedSession.roomId,
        userId: userId.value
      });
    } else {
      console.log('Сохраненная сессия не найдена, создаем новую');
      
      // Проверяем, активна ли сессия, если нет - создаем новую
      if (!chatStore.activeSessionId) {
        console.log('Нет активной сессии, создаем новую');
        
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
          console.log('Создана локальная сессия:', localSession);
        } else {
          // Для авторизованных пользователей используем API
          const newSession = await chatStore.createNewSession(workflowId);
          console.log('Создана новая сессия через API:', newSession);
        }
      }
      
      // Создаем комнату
      console.log('Отправляем запрос на создание комнаты');
      await webSocketService.send({
        action: WebSocketAction.CreateRoom,
        workflowId: workflowId,
        userId: userId.value
      });
    }

    console.log('Подписываемся на события WebSocket');
    // Подписываемся на события
    webSocketService.subscribe(WebSocketAction.CreatedRoom, handleRoomCreated);
    webSocketService.subscribe(WebSocketAction.NewMessage, handleNewMessage);
    webSocketService.subscribe(WebSocketAction.WelcomeMessage, handleNewMessage);
  } catch (error) {
    console.error('Ошибка при инициализации WebSocket:', error);
  }
};

const handleRoomCreated = (response: WebSocketResponse) => {
  console.log('Получен ответ о создании комнаты:', response);
  if (response.roomId) {
    roomId.value = response.roomId;
    console.log('Комната создана:', roomId.value);
    
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
  console.log('Получено новое сообщение:', response);
  
  // Выводим полное сообщение для отладки
  console.log('Полное содержимое ответа:', JSON.stringify(response));
  
  // Проверяем тип действия и наличие сообщения
  if (response.message !== undefined) {
    let messageText = response.message || '';
    
    // Если сообщение пустое или только 'join', игнорируем его как служебное
    if (!messageText || messageText === 'join') {
      console.log('Получено служебное сообщение, игнорируем:', messageText);
      return;
    }
    
    console.log('Добавляем сообщение в чат:', messageText);
    
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
  console.log('Отправка сообщения. Активная сессия:', chatStore.activeSessionId);
  console.log('ID комнаты:', roomId.value);
  console.log('WorkflowId из URL:', workflowId);
  console.log('ID анонимного пользователя:', userId.value);

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
      console.log('WebSocket не подключен, пытаемся подключиться');
      await webSocketService.connect();
      
      // Подождем немного, чтобы соединение установилось
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Если соединение не установлено, выводим ошибку
      if (!webSocketService.isConnected()) {
        console.error('Не удалось установить соединение WebSocket');
        throw new Error('Не удалось установить соединение с сервером');
      }
    }
    
    // Проверяем, активна ли сессия
    if (!chatStore.activeSessionId) {
      console.log('Нет активной сессии, создаем новую');
      
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
        console.log('Создана локальная сессия:', localSession);
      } else {
        // Для авторизованных пользователей используем API
        await chatStore.createNewSession(workflowId);
      }
    }

    // Добавляем сообщение в чат
    console.log('Добавляем сообщение пользователя в чат');
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
    console.log('Состояние WebSocket соединения:', isWebSocketConnected.value ? 'Открыто' : 'Закрыто');

    // Если нет ID комнаты, пытаемся получить ее из хранилища
    if (!roomId.value) {
      const savedSession = getSessionFromStorage();
      
      if (savedSession && savedSession.roomId) {
        console.log('Восстановлена сессия из хранилища:', savedSession);
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
        console.log('Нет ID комнаты, создаем новую комнату');
        
        await webSocketService.send({
          action: WebSocketAction.CreateRoom,
          workflowId: workflowId,
          userId: userId.value
        });
        
        // Ждем немного, чтобы получить ID комнаты
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (!roomId.value) {
          console.error('Не удалось получить ID комнаты после создания');
          throw new Error('Не удалось получить ID комнаты');
        }
      }
    }

    // Отправляем сообщение через WebSocket
    console.log('Отправляем сообщение через WebSocket в комнату:', roomId.value);
    
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
    
    console.log('Запрос WebSocket:', JSON.stringify(request));
    
    // Отправляем сообщение
    const sendPromise = webSocketService.send(request);
    
    // Ждем отправки с таймаутом
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Таймаут отправки сообщения')), 5000)
    );
    
    await Promise.race([sendPromise, timeoutPromise]);
    console.log('Сообщение успешно отправлено через WebSocket');
    
    // Устанавливаем таймаут для отмены состояния загрузки через 15 секунд
    const loadingTimeout = setTimeout(() => {
      if (chatStore.isLoading) {
        console.log('Превышен таймаут ожидания ответа, отменяем состояние загрузки');
        chatStore.isLoading = false;
      }
    }, 15000);
    
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    // Если произошла ошибка, можно вернуть текст в поле ввода
    newMessage.value = tempMessage;
    // Отключаем состояние загрузки
    chatStore.isLoading = false;
  }
};

// Следим за изменением выбранного ассистента и сразу инициализируем
watch(() => props.selectedAssistant, (newAssistant) => {
  if (newAssistant) {
    console.log('Выбран новый ассистент, инициализируем WebSocket');
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
      console.log('Изменение состояния WebSocket:', connected ? 'Подключено' : 'Отключено');
      isWebSocketConnected.value = connected;
      
      // Если соединение потеряно, пытаемся переподключиться
      if (!connected && props.selectedAssistant) {
        console.log('Соединение потеряно, пытаемся переподключиться');
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
    console.log('Создаем новый опрос...');
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
    
    console.log('Новый опрос создан, история очищена');
  } catch (error) {
    console.error('Ошибка при создании нового опроса:', error);
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
    // Добавим условные стили для контейнера без шапки
    &:not(:has(.chat-header)) {
      padding-top: 0;
      
      .chat-messages {
        height: calc(100vh - 120px); // Корректируем высоту для чата без шапки
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

.message {
  max-width: 85%;
  display: flex;
  flex-direction: column;
}

.message--user {
  align-self: flex-end;
  
  .message__content {
    background-color: #ebf5ff;
    color: #000000;
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
    }

    // Активное состояние при наличии текста
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