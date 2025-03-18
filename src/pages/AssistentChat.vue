<template>
  <div class="assistent-chat">
    <div class="assistent-chat__container">
      <div class="assistent-chat__sessions">
        <Button
          type="button"
          button-type="light"
          text="Новое задание/вопрос"
          size="large"
          @click="createNewDialog"
        />

        <div class="assistent-chat__session-list">
          <div
            v-for="session in chatStore.sessions"
            :key="session.id"
            :class="['session-item', { 'session-item--active': session.isActive }]"
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

              <div class="assistent-dropdown" v-if="isAssistentMenuOpen" ref="assistentMenu">
                <div class="assistent-dropdown__header">Действия</div>
                <div class="assistent-dropdown__actions">
                  <div 
                    v-for="item in menuItems" 
                    :key="item.id"
                    class="assistent-dropdown__action"
                    @click="item.action"
                  >
                    <span :class="['icon', item.icon]"></span>
                    <span class="assistent-dropdown__action-title">{{ item.title }}</span>
                  </div>
                </div>
                
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
              v-for="message in chatStore.sessionMessages"
              :key="message.id"
              :class="['message', message.isUser ? 'message--user' : 'message--assistant']"
            >
              <div class="message__content">
                <p class="message__text">{{ message.text }}</p>
                <span class="message__time">{{ new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
              </div>
            </div>
            
            <!-- Индикатор "печатает ответ" -->
            <div v-if="chatStore.isLoading" class="message message--assistant message--typing">
              <div class="message__content">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p class="message__text typing-text">Печатает ответ...</p>
              </div>
            </div>
          </div>

          <div class="chat-input">
            <InputField
              v-model="newMessage"
              type="text"
              placeholder="Напишите сообщение..."
              variant="light"
              @keyup.enter="!chatStore.isLoading && sendMessage()"
              size="large"
              :disabled="chatStore.isLoading"
            />
            <Button
              type="button"
              button-type="primary"
              icon="icon icon-chevron-up"
              size="curcle"
              @click="sendMessage"
              :disabled="!newMessage.trim() || chatStore.isLoading"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAssistentsStore } from '@/stores/useAssistantsStore';
import { useAssistentChatStore } from '@/stores/useAssistantChatStore';
import Button from '@/components/ui/Button.vue';
import InputField from '@/components/ui/InputField.vue';
import { RouteNames } from '@/router/routes/routeNames';
import { onClickOutside } from '@vueuse/core';

interface MenuItem {
  id: string;
  title: string;
  icon?: string;
  action: () => void;
}

const route = useRoute();
const router = useRouter();
const assistentsStore = useAssistentsStore();
const chatStore = useAssistentChatStore();

const newMessage = ref<string>('');
const chatContainer = ref<HTMLElement | null>(null);
const assistentMenuTrigger = ref<HTMLElement | null>(null);
const assistentMenu = ref<HTMLElement | null>(null);
const isAssistentMenuOpen = ref<boolean>(false);

const assistentId = ref<string>(route.params.id as string);
const assistent = ref(assistentsStore.userAssistents.find(a => a.id === assistentId.value) || null);

// Создаем меню действий
const menuItems = ref<MenuItem[]>([
  {
    id: 'new-dialog',
    title: 'Новый диалог',
    icon: 'icon-plus',
    action: () => {
      createNewDialog();
      isAssistentMenuOpen.value = false;
    }
  },
  {
    id: 'settings',
    title: 'Настройки ассистента',
    icon: 'icon-cog',
    action: () => {
      if (assistent.value) {
        router.push({ name: RouteNames.ASSISTENT_SETTING, params: { id: assistentId.value } });
      }
      isAssistentMenuOpen.value = false;
    }
  },
  {
    id: 'clear-chat',
    title: 'Очистить историю',
    icon: 'icon-trash',
    action: () => {
      if (chatStore.activeSessionId) {
        if (confirm('Вы действительно хотите очистить историю чата?')) {
          chatStore.clearSessionMessages();
          scrollToBottom();
        }
      }
      isAssistentMenuOpen.value = false;
    }
  }
]);

const updateAssistent = () => {
  assistent.value = assistentsStore.userAssistents.find(a => a.id === assistentId.value) || null;
};

// Следим за новыми сообщениями
watch(
  () => route.params.id,
  (newId) => {
    assistentId.value = newId as string;
    updateAssistent();
  }
);

// Отдельный watch для новых сообщений
watch(
  () => chatStore.newMessageReceived,
  (newValue) => {
    if (newValue) {
      scrollToBottom();
      chatStore.resetNewMessageFlag();
    }
  }
);

const sendMessage = async () => {
  if (newMessage.value.trim() === '' || chatStore.isLoading) return;

  await chatStore.addMessage(newMessage.value, true);
  newMessage.value = '';
  scrollToBottom();
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
  if (id !== assistentId.value) {
    router.push({ name: RouteNames.ASSISTENT_CHAT, params: { id: id } });
  }
  isAssistentMenuOpen.value = false;
};

const createNewDialog = () => {
  if (assistentId.value) {
    chatStore.createNewSession(assistentId.value);
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
};

const selectSession = (sessionId: string) => {
  chatStore.selectSession(sessionId);
  scrollToBottom();
};

onClickOutside(assistentMenu, () => {
  if (isAssistentMenuOpen.value) {
    isAssistentMenuOpen.value = false;
  }
});

onMounted(() => {
  scrollToBottom();
  updateAssistent();
  
  if (assistentId.value) {
    if (!chatStore.sessions || chatStore.sessions.length === 0) {
      createNewDialog();
    } else if (!chatStore.activeSessionId) {
      // Если есть сессии, но нет активной, выбираем первую
      selectSession(chatStore.sessions[0].id);
    } else {
      // Если есть активная сессия, прокручиваем к последнему сообщению
      scrollToBottom();
    }
  }
});

</script>

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
    background-color: $grey-background-color;
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
    border: 1px solid rgba($help-color, 0.1);
  }

  .session-item {
    width: 100%;
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid rgba($help-color, 0.1);
    
    &:last-child {
      border-bottom: none;
    }
    
    &:hover {
      background-color: rgba($help-color, 0.05);
    }
    
    &--active {
      background-color: rgba($secondary-color, 0.05);
    }
    
    &__content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    &__title {
      font-size: 14px;
      font-weight: 500;
      color: $dark-secondary-color;
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
    border-bottom: 1px solid rgba($help-color, 0.1);
    
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
        background-color: rgba($main-color, 0.05);
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
      color: $help-color;
    }
    
    &__type {
      font-size: 12px;
      color: $dark-secondary-color;
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
  
  .assistent-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    width: 300px;
    background-color: $light-color;
    border-radius: 8px;
    box-shadow: $box-shadow-large;
    z-index: 10;
    margin-top: 8px;
    overflow: hidden;
    
    &__header {
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 600;
      border-bottom: 1px solid rgba($help-color, 0.1);
    }
    
    &__actions {
      padding: 8px 0;
      border-bottom: 1px solid rgba($help-color, 0.1);
    }
    
    &__action {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      
      &:hover {
        background-color: rgba($help-color, 0.05);
      }
      
      .icon {
        margin-right: 10px;
        font-size: 16px;
        color: $help-color;
      }
      
      &-title {
        font-size: 14px;
        color: $dark-color;
      }
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
      border-bottom: 1px solid rgba($help-color, 0.1);
      
      &:last-child {
        border-bottom: none;
      }
      
      &:hover {
        background-color: rgba($help-color, 0.05);
      }
      
      &--active {
        background-color: rgba($secondary-color, 0.05);
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
        color: $dark-secondary-color;
      }
      
      &-status {
        font-size: 10px;
        color: $help-color;
        
        &--active {
          color: $success-color;
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
      color: $help-color;
      position: absolute;
      bottom: 4px;
      right: 8px;
    }
    
    &--assistant {
      align-self: flex-start;
      
      .message__content {
        background-color: $grey-background-color;
        border-bottom-left-radius: 4px;
      }
    }
    
    &--user {
      align-self: flex-end;
      
      .message__content {
        background-color: $secondary-color;
        color: $light-color;
        border-bottom-right-radius: 4px;
      }
      
      .message__time {
        color: rgba($light-color, 0.8);
      }
    }
    
    &--typing {
      opacity: 0.7;
      
      .message__content {
        padding-bottom: 16px;
      }
    }
  }

  .chat-input {
    display: flex;
    align-items: center;
    padding: 16px;
    border-top: 1px solid rgba($help-color, 0.1);
    gap: 16px;
    
    & > *:first-child {
      flex-basis: 90%;
    }
  }
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  
  span {
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: $help-color;
    border-radius: 50%;
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
  font-size: 12px;
  color: $help-color;
  margin-top: 4px;
}

@keyframes typing {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0);
  }
}
</style>@/stores/useAssistantsStore