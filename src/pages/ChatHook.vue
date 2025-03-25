<template>
  <div class="main">
    <h1>Чат #{{ chatId }}</h1>
    <div v-if="isLoading">
      Загрузка...
    </div>
    <div v-else-if="!chatData">
      <p>Чат не найден или произошла ошибка загрузки.</p>
      <AssistentsList />
    </div>
    <div v-else class="chat-container">
      <div class="chat-messages" ref="messagesContainer">
        <div v-for="(message, index) in chatStore.messages" :key="index" 
             :class="['message', message.sender === 'user' ? 'message-user' : 'message-bot']">
          <div class="message-avatar">
            {{ message.sender === 'user' ? 'Вы' : 'Бот' }}
          </div>
          <div class="message-content">
            {{ message.text }}
            <div class="message-time">{{ message.time }}</div>
          </div>
        </div>
        <div v-if="chatStore.isLoading" class="message-loading">
          <span>Бот печатает</span>
          <span class="dot">.</span>
          <span class="dot">.</span>
          <span class="dot">.</span>
        </div>
      </div>
      
      <div class="chat-input">
        <textarea 
          v-model="newMessage" 
          placeholder="Введите сообщение..." 
          @keydown.enter.prevent="sendChatMessage"
          :disabled="chatStore.isLoading"
        ></textarea>
        <button 
          @click="sendChatMessage" 
          :disabled="!newMessage.trim() || chatStore.isLoading"
        >
          Отправить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, nextTick } from 'vue';
  import { useRoute } from 'vue-router';
  import AssistentsList from '@/components/Assistents/AssistentsList.vue';
  import { useWebhookChatStore } from '@/stores/useWebhookChatStore';
  
  const route = useRoute();
  const chatId = ref(route.params.id as string);
  const isLoading = ref(true);
  const chatData = ref<{ id: string; title: string } | null>(null);
  const newMessage = ref('');
  const messagesContainer = ref<HTMLElement | null>(null);
  
  const chatStore = useWebhookChatStore();
  
  // Прокрутка к последнему сообщению
  const scrollToBottom = async () => {
    await nextTick();
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  };
  
  // Следим за изменениями в сообщениях и прокручиваем вниз
  watch(() => chatStore.messages.length, () => {
    scrollToBottom();
  });
  
  // Автоматическая прокрутка вниз при смене чата
  watch(() => chatId.value, () => {
    setTimeout(scrollToBottom, 100);
  });
  
  // Отправка сообщения через store
  function sendChatMessage() {
    if (!newMessage.value.trim() || chatStore.isLoading) return;
    
    chatStore.sendMessage(chatId.value, newMessage.value);
    newMessage.value = '';
  }

  onMounted(async () => {
    console.log('Загружен чат с ID:', chatId.value);
    try {
      isLoading.value = true;
      
      // Имитация загрузки данных чата
      setTimeout(() => {
        chatData.value = { id: chatId.value, title: 'Тестовый чат' };
        
        // Добавляем приветственное сообщение через store
        chatStore.addWelcomeMessage(chatId.value);
        
        isLoading.value = false;
      }, 1000);
    } catch (error) {
      console.error('Ошибка при загрузке чата:', error);
      chatData.value = null;
    } finally {
      isLoading.value = false;
    }
  });
</script>

<style lang="scss" scoped>
  .main {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 40px;
  }
  
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 70vh;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .chat-messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background-color: #f9f9f9;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .message {
    display: flex;
    max-width: 70%;
    
    &-user {
      align-self: flex-end;
      flex-direction: row-reverse;
      
      .message-content {
        background-color: #dcf8c6;
        border-radius: 18px 0 18px 18px;
      }
    }
    
    &-bot {
      align-self: flex-start;
      
      .message-content {
        background-color: white;
        border-radius: 0 18px 18px 18px;
      }
    }
    
    &-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      margin: 0 8px;
    }
    
    &-content {
      padding: 12px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    &-time {
      font-size: 12px;
      color: #888;
      text-align: right;
      margin-top: 4px;
    }
  }
  
  .message-loading {
    align-self: flex-start;
    margin-left: 56px;
    font-style: italic;
    color: #888;
    
    .dot {
      display: inline-block;
      animation: dotAnimation 1.5s infinite;
      
      &:nth-child(2) {
        animation-delay: 0.5s;
      }
      
      &:nth-child(3) {
        animation-delay: 1s;
      }
    }
  }
  
  @keyframes dotAnimation {
    0%, 100% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
  }
  
  .chat-input {
    display: flex;
    padding: 16px;
    background-color: white;
    border-top: 1px solid #eaeaea;
    
    textarea {
      flex: 1;
      height: 50px;
      border: 1px solid #ddd;
      border-radius: 24px;
      padding: 12px 16px;
      resize: none;
      outline: none;
      
      &:focus {
        border-color: #0084ff;
      }
      
      &:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
      }
    }
    
    button {
      margin-left: 12px;
      padding: 0 24px;
      background-color: #0084ff;
      color: white;
      border: none;
      border-radius: 24px;
      cursor: pointer;
      font-weight: bold;
      
      &:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
      
      &:hover:not(:disabled) {
        background-color: #0077e6;
      }
    }
  }
</style>