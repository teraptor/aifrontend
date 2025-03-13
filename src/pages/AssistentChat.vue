<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAssistentsStore } from '@/stores/useAssistentsStore';
import { useAssistentChatStore } from '@/stores/useAssistentChat';
import Button from '@/components/ui/Button.vue';
import InputField from '@/components/ui/InputField.vue';

const route = useRoute();
const assistentId = route.params.id as string;
const assistentsStore = useAssistentsStore();
const chatStore = useAssistentChatStore();

const newMessage = ref<string>('');
const chatContainer = ref<HTMLElement | null>(null);

const assistent = assistentsStore.userAssistents.find(a => a.id === assistentId) || null;

const sendMessage = () => {
  if (newMessage.value.trim() === '') return;
  
  chatStore.addMessage(newMessage.value, true);
  const userMessage = newMessage.value;
  newMessage.value = '';
  
  setTimeout(() => {
    chatStore.addMessage(`Я получил ваше сообщение: "${userMessage}". Чем еще могу помочь?`, false);
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

onMounted(() => {
  scrollToBottom();
});
</script>

<template>
  <div class="assistent-chat">
    <div class="assistent-chat__container">
      <div class="assistent-chat__sessions">
        <Button
          type="button"
          button-type="light"
          text="Новое задание/вопрос"
          size="large"
          @click="chatStore.createNewSession"
        />
        
        <div class="assistent-chat__session-list">
          <div 
            v-for="session in chatStore.sessions" 
            :key="session.id"
            :class="['session-item', { 'session-item--active': session.isActive }]"
            @click="chatStore.selectSession(session.id)"
          >
            <div class="session-item__content">
              <div class="session-item__title">{{ session.title }}</div>
              <div class="session-item__meta">
                <span class="session-item__time">{{ session.timestamp }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="assistent-chat__chat">
        <div class="assistent-chat__chat-container" v-if="assistent">
          <div class="chat-header">
            <div class="chat-header__avatar">
              <img :src="assistent.image" alt="Аватар ассистента" />
            </div>
            <div class="chat-header__info">
              <h2 class="chat-header__name">{{ assistent.name }}</h2>
              <p class="chat-header__type">{{ assistent.summary || 'Персональный помощник' }}</p>
              <p 
                class="chat-header__status" 
                :class="{ 'chat-header__status--active': assistent.isActive }"
              >
                {{ assistent.isActive ? 'Активный' : 'Заблокирован' }}
              </p>
            </div>
          </div>
          
          <div class="chat-messages" ref="chatContainer">
            <div 
              v-for="message in chatStore.messages" 
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
            <InputField
              v-model="newMessage" 
              type="text"
              placeholder="Напишите сообщение..."
              variant="light"
              @keyup.enter="sendMessage"
              size="large"
            />
            <Button
              type="button"
              button-type="primary"
              icon="icon icon-chevron-up"
              size="curcle"
              @click="sendMessage" 
              :disabled="!newMessage.trim()"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.assistent-chat {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 16px;

  &__container {
    width: 100%;
    height: 100%;
    display: flex;
    gap: 16px;
    background-color: $light-grey-color;
    border-radius: 12px;
    overflow: hidden;
    padding: 16px;
  }

  &__sessions {
    width: 30%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow: hidden;
  }

  &__session-list {
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
      background-color: rgba($light-grey-color, 0.1);
    }
    
    &--active {
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

  &__chat {
    width: 70%;
    height: 100%;
    display: flex;
    flex-direction: column;

    &-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background-color: $light-color;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: $box-shadow-small;
    }
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
      
      &--active {
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
    gap: 16px;
    
    & > *:first-child {
      flex-basis: 90%;
    }
  }
}
</style>