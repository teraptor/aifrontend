<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAssistentsStore } from '@/stores/useAssistentsStore';
import { RouteNames } from '@/router/routes/routeNames';

const route = useRoute();
const router = useRouter();
const assistentId = route.params.id as string;
const assistentsStore = useAssistentsStore();
const messages = ref([
  { id: 1, text: 'Привет! Чем я могу помочь?', isUser: false, timestamp: new Date().toISOString() },
  { id: 2, text: 'Расскажи о своих возможностях', isUser: true, timestamp: new Date(Date.now() - 60000).toISOString() },
  { id: 3, text: 'Я могу помочь вам с различными задачами: ответить на вопросы, написать текст, проанализировать данные, помочь с кодом и многое другое. Просто опишите, что вам нужно, и я постараюсь помочь!', isUser: false, timestamp: new Date(Date.now() - 30000).toISOString() }
]);
const newMessage = ref('');
const chatContainer = ref(null);

// Имитация истории сессий
const sessions = ref([
  { 
    id: 'new', 
    title: 'Новое задание/вопрос', 
    timestamp: new Date().toISOString(),
    isActive: true 
  },
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `session-${i + 1}`,
    title: i === 0 ? 'объясни как работает данны...' : 
           i === 1 ? 'объясни как n8n хранит work...' :
           i === 2 ? 'придумай 10 доменных име...' :
           i === 3 ? 'mongo docker compose local...' :
           i === 4 ? 'Дано описание агента. Соста...' :
           i === 5 ? 'объясни коротко что такое б...' :
           i === 6 ? 'Bounded Contexts - объясни ...' :
           i === 7 ? 'задай вопросы по ТЗ: ### Ав...' :
           i === 8 ? 'создай оргструктуру компан...' :
           i === 9 ? 'архитектура битрикс24 марк...' : '',
    timestamp: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
    isActive: false
  }))
]);

const assistent = computed(() => {
  return assistentsStore.userAssistents.find(a => a.id === assistentId) || null;
});

const sendMessage = () => {
  if (newMessage.value.trim() === '') return;
  
  // Добавляем сообщение пользователя
  messages.value.push({
    id: Date.now(),
    text: newMessage.value,
    isUser: true,
    timestamp: new Date().toISOString()
  });
  
  const userMessage = newMessage.value;
  newMessage.value = '';
  
  // Имитация ответа ассистента
  setTimeout(() => {
    messages.value.push({
      id: Date.now(),
      text: `Я получил ваше сообщение: "${userMessage}". Чем еще могу помочь?`,
      isUser: false,
      timestamp: new Date().toISOString()
    });
    scrollToBottom();
  }, 1000);
};

const scrollToBottom = () => {
  setTimeout(() => {
    if (chatContainer.value) {
      const container = chatContainer.value;
      container.scrollTop = container.scrollHeight;
    }
  }, 100);
};

const createNewSession = () => {
  // Деактивируем все сессии
  sessions.value.forEach(session => {
    session.isActive = false;
  });
  
  // Создаем новую сессию и делаем ее активной
  const newSession = {
    id: `session-${Date.now()}`,
    title: 'Новое задание/вопрос',
    timestamp: new Date().toISOString(),
    isActive: true
  };
  
  // Добавляем новую сессию в начало списка
  sessions.value.unshift(newSession);
  
  // Очищаем сообщения
  messages.value = [
    { id: 1, text: 'Привет! Чем я могу помочь?', isUser: false, timestamp: new Date().toISOString() },
    { id: 2, text: 'Расскажи о своих возможностях', isUser: true, timestamp: new Date(Date.now() - 60000).toISOString() },
    { id: 3, text: 'Я могу помочь вам с различными задачами: ответить на вопросы, написать текст, проанализировать данные, помочь с кодом и многое другое. Просто опишите, что вам нужно, и я постараюсь помочь!', isUser: false, timestamp: new Date(Date.now() - 30000).toISOString() }
  ];
};

const selectSession = (sessionId) => {
  // Деактивируем все сессии
  sessions.value.forEach(session => {
    session.isActive = session.id === sessionId;
  });
  
  // Имитация загрузки сообщений для выбранной сессии
  if (sessionId === 'new') {
    messages.value = [
      { id: 1, text: 'Привет! Чем я могу помочь?', isUser: false, timestamp: new Date().toISOString() },
      { id: 2, text: 'Расскажи о своих возможностях', isUser: true, timestamp: new Date(Date.now() - 60000).toISOString() },
      { id: 3, text: 'Я могу помочь вам с различными задачами: ответить на вопросы, написать текст, проанализировать данные, помочь с кодом и многое другое. Просто опишите, что вам нужно, и я постараюсь помочь!', isUser: false, timestamp: new Date(Date.now() - 30000).toISOString() }
    ];
  } else {
    // Имитация загрузки истории сообщений
    messages.value = [
      { id: 1, text: 'Привет! Чем я могу помочь?', isUser: false, timestamp: new Date().toISOString() },
      { id: 2, text: 'Расскажи о своих возможностях', isUser: true, timestamp: new Date(Date.now() - 60000).toISOString() },
      { id: 3, text: 'Я могу помочь вам с различными задачами: ответить на вопросы, написать текст, проанализировать данные, помочь с кодом и многое другое. Просто опишите, что вам нужно, и я постараюсь помочь!', isUser: false, timestamp: new Date(Date.now() - 30000).toISOString() },
      { id: 4, text: `Это история сессии ${sessionId}`, isUser: false, timestamp: new Date().toISOString() }
    ];
  }
  
  scrollToBottom();
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 1) {
    return 'less than a minute ago';
  } else if (diffDays === 1) {
    return '1 day ago';
  } else if (diffDays < 10) {
    return `${diffDays} days ago`;
  } else {
    return `${diffDays} days ago`;
  }
};

const getModelName = (sessionId) => {
  // Имитация разных моделей для разных сессий
  if (parseInt(sessionId.split('-')[1]) % 2 === 0) {
    return 'qwen2.5:32b';
  } else {
    return 'llama3.2-vision:latest';
  }
};

const goBack = () => {
  router.push(RouteNames.ASSISTENS);
};

onMounted(() => {
  scrollToBottom();
});
</script>

<template>
  <div class="chat-page">
    <div class="chat-container-wrapper">
      <div class="chat-sidebar">
        <div class="new-session-button" @click="createNewSession">
          <span>Новое задание/вопрос</span>
        </div>
        
        <div class="sessions-list">
          <div 
            v-for="session in sessions" 
            :key="session.id"
            :class="['session-item', { 'active': session.isActive }]"
            @click="selectSession(session.id)"
          >
            <div class="session-item__content">
              <div class="session-item__title">{{ session.title }}</div>
              <div class="session-item__meta">
                <span class="session-item__time">{{ formatDate(session.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="chat-content">
        <div class="chat-container" v-if="assistent">
          <div class="chat-header">
            <div class="chat-header__avatar">
              <img :src="assistent.image" alt="Аватар ассистента" />
            </div>
            <div class="chat-header__info">
              <h2 class="chat-header__name">{{ assistent.name }}</h2>
              <p class="chat-header__type">{{ assistent.summary || 'Персональный помощник' }}</p>
              <p class="chat-header__status" :class="{ 'active': assistent.isActive }">
                {{ assistent.isActive ? 'Активный' : 'Заблокирован' }}
              </p>
            </div>
          </div>
          
          <div class="chat-messages" ref="chatContainer">
            <div 
              v-for="message in messages" 
              :key="message.id" 
              :class="['message', message.isUser ? 'message--user' : 'message--assistant']"
            >
              <div class="message__content">
                <p class="message__text">{{ message.text }}</p>
                <span class="message__time">{{ new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
              </div>
            </div>
          </div>
          
          <div class="chat-input">
            <input 
              type="text" 
              v-model="newMessage" 
              placeholder="Напишите сообщение..." 
              @keyup.enter="sendMessage"
            />
            <button @click="sendMessage" :disabled="!newMessage.trim()">
              <span class="icon icon-send"></span>
            </button>
          </div>
        </div>
        
        <div class="chat-empty" v-else>
          <p>Ассистент не найден</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.chat-container-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 16px;
  background-color: $light-grey-color;
  border-radius: 12px;
  overflow: hidden;
}

.chat-sidebar {
  width: 30%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

.chat-content {
  width: 70%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.new-session-button {
  width: 100%;
  height: 48px;
  background-color: $light-color;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  color: $dark-color;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid $border-light;
  box-shadow: $box-shadow-small;
  
  &:hover {
    background-color: darken($light-color, 3%);
  }
}

.sessions-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-radius: 12px;
  background-color: $light-color;
  border: 1px solid $border-light;
}

.session-item {
  width: 100%;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid $border-light;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: rgba($light-grey-color, 0.5);
  }
  
  &.active {
    background-color: rgba($main-color, 0.05);
  }
  
  &__content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  &__title {
    font-size: 14px;
    font-weight: 500;
    color: $dark-color;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  &__meta {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-size: 12px;
    color: $help-color;
  }
  
  &__time {
    font-size: 12px;
    color: $help-color;
  }
}

.chat-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: $light-color;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: $box-shadow-small;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid $border-light;
  
  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 12px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  &__name {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }
  
  &__type {
    font-size: 12px;
    color: $dark-color;
    margin: 0;
  }
  
  &__status {
    font-size: 12px;
    color: $help-color;
    margin: 0;
    
    &.active {
      color: $success-color;
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
}

.message {
  display: flex;
  max-width: 80%;
  
  &__content {
    padding: 12px 16px;
    border-radius: 12px;
    position: relative;
  }
  
  &__text {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
  }
  
  &__time {
    font-size: 10px;
    color: $help-color;
    position: absolute;
    bottom: 4px;
    right: 8px;
  }
  
  &--assistant {
    align-self: flex-start;
    
    .message__content {
      background-color: $light-grey-color;
      border-bottom-left-radius: 4px;
    }
  }
  
  &--user {
    align-self: flex-end;
    
    .message__content {
      background-color: $main-color;
      color: $light-color;
      border-bottom-right-radius: 4px;
    }
    
    .message__time {
      color: rgba($light-color, 0.8);
    }
  }
}

.chat-input {
  display: flex;
  align-items: center;
  padding: 16px;
  border-top: 1px solid $border-light;
  
  input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid $border-light;
    border-radius: 24px;
    font-size: 14px;
    outline: none;
    
    &:focus {
      border-color: $main-color;
    }
  }
  
  button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: $main-color;
    color: $light-color;
    border: none;
    margin-left: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: darken($main-color, 10%);
    }
    
    &:disabled {
      background-color: $light-grey-color;
      cursor: not-allowed;
    }
    
    .icon {
      font-size: 18px;
    }
  }
}

.chat-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 16px;
  color: $help-color;
}

@media (max-width: 768px) {
  .chat-container-wrapper {
    flex-direction: column;
    height: calc(100vh - 150px);
  }
  
  .chat-sidebar {
    width: 100%;
    height: auto;
    max-height: 200px;
  }
  
  .chat-content {
    width: 100%;
  }
}
</style> 