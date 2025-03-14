<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAssistentsStore } from '@/stores/useAssistentsStore';
import { useAssistentChatStore } from '@/stores/useAssistentChat';
import Button from '@/components/ui/Button.vue';
import InputField from '@/components/ui/InputField.vue';

const route = useRoute();
const router = useRouter();
const assistentId = route.params.id as string;
const assistentsStore = useAssistentsStore();
const chatStore = useAssistentChatStore();

const newMessage = ref<string>('');
const chatContainer = ref<HTMLElement | null>(null);
const assistentMenuTrigger = ref<HTMLElement | null>(null);
const assistentMenu = ref<HTMLElement | null>(null);
const isAssistentMenuOpen = ref<boolean>(false);

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

const toggleAssistentMenu = () => {
  isAssistentMenuOpen.value = !isAssistentMenuOpen.value;
};

const switchAssistent = (id: string) => {
  if (id !== assistentId) {
    router.push(`/assistents-chat/${id}`);
  }
  isAssistentMenuOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (
    isAssistentMenuOpen.value && 
    assistentMenu.value && 
    assistentMenuTrigger.value && 
    !assistentMenu.value.contains(event.target as Node) && 
    !assistentMenuTrigger.value.contains(event.target as Node)
  ) {
    isAssistentMenuOpen.value = false;
  }
};

onMounted(() => {
  scrollToBottom();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
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
            <div class="chat-header__info" @click="toggleAssistentMenu" ref="assistentMenuTrigger">
              <h2 class="chat-header__name">{{ assistent.name }} <span class="chat-header__dropdown-icon">▼</span></h2>
              <p class="chat-header__type">{{ assistent.summary || 'Персональный помощник' }}</p>
              <p 
                class="chat-header__status" 
                :class="{ 'chat-header__status--active': assistent.isActive }"
              >
                {{ assistent.isActive ? 'Активный' : 'Заблокирован' }}
              </p>
              
              <!-- Выпадающее меню с ассистентами -->
              <div class="assistent-dropdown" v-if="isAssistentMenuOpen" ref="assistentMenu">
                <div class="assistent-dropdown__header">Мои ассистенты</div>
                <div class="assistent-dropdown__list">
                  <div 
                    v-for="item in assistentsStore.userAssistents" 
                    :key="item.id"
                    :class="['assistent-dropdown__item', { 'assistent-dropdown__item--active': item.id === assistentId }]"
                    @click="switchAssistent(item.id)"
                  >
                    <div class="assistent-dropdown__item-avatar">
                      <img :src="item.image" alt="Аватар ассистента" />
                    </div>
                    <div class="assistent-dropdown__item-info">
                      <div class="assistent-dropdown__item-name">{{ item.name }}</div>
                      <div class="assistent-dropdown__item-summary">{{ item.summary }}</div>
                      <div 
                        class="assistent-dropdown__item-status"
                        :class="{ 'assistent-dropdown__item-status--active': item.isActive }"
                      >
                        {{ item.isActive ? 'Активный' : 'Заблокирован' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
    background-color: #f5f5f5;
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
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
  }

  .session-item {
    width: 100%;
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid #e0e0e0;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:hover {
      background-color: rgba(245, 245, 245, 0.1);
    }
    
    &--active {
      background-color: rgba(0, 123, 255, 0.05);
    }
    
    &__content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    &__title {
      font-size: 14px;
      font-weight: 500;
      color: #333333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    &__meta {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 12px;
      color: #777777;
    }
    
    &__time {
      font-size: 12px;
      color: #777777;
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
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  .chat-header {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #e0e0e0;
    
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
      position: relative;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 8px;
      
      &:hover {
        background-color: rgba(245, 245, 245, 0.5);
      }
    }
    
    &__name {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    &__dropdown-icon {
      font-size: 10px;
      color: #777777;
    }
    
    &__type {
      font-size: 12px;
      color: #333333;
      margin: 0;
    }
    
    &__status {
      font-size: 12px;
      color: #777777;
      margin: 0;
      
      &--active {
        color: #28a745;
      }
    }
  }
  
  .assistent-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    width: 300px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    z-index: 10;
    margin-top: 8px;
    overflow: hidden;
    
    &__header {
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 600;
      border-bottom: 1px solid #e0e0e0;
    }
    
    &__list {
      max-height: 300px;
      overflow-y: auto;
    }
    
    &__item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid #e0e0e0;
      
      &:last-child {
        border-bottom: none;
      }
      
      &:hover {
        background-color: rgba(245, 245, 245, 0.5);
      }
      
      &--active {
        background-color: rgba(0, 123, 255, 0.05);
      }
      
      &-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 12px;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      &-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      
      &-name {
        font-size: 14px;
        font-weight: 500;
      }
      
      &-summary {
        font-size: 12px;
        color: #333333;
      }
      
      &-status {
        font-size: 10px;
        color: #777777;
        
        &--active {
          color: #28a745;
        }
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
      color: #777777;
      position: absolute;
      bottom: 4px;
      right: 8px;
    }
    
    &--assistant {
      align-self: flex-start;
      
      .message__content {
        background-color: #f5f5f5;
        border-bottom-left-radius: 4px;
      }
    }
    
    &--user {
      align-self: flex-end;
      
      .message__content {
        background-color: #007bff;
        color: #ffffff;
        border-bottom-right-radius: 4px;
      }
      
      .message__time {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }

  .chat-input {
    display: flex;
    align-items: center;
    padding: 16px;
    border-top: 1px solid #e0e0e0;
    gap: 16px;
    
    & > *:first-child {
      flex-basis: 90%;
    }
  }
}
</style>