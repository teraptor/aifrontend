<template>
  <div class="assistent-chat">
    <div class="assistent-chat__container">
      <div class="assistent-chat__config">
        <h2 class="config-header">Настройка ассистента</h2>
        <div class="config-chat">
          <div class="config-messages" ref="configChatContainer">
            <div
              v-for="(message, index) in configMessages"
              :key="index"
              :class="['config-message', message.isUser ? 'config-message--user' : 'config-message--system']"
            >
              <div class="config-message__content">
                <p class="config-message__text">{{ message.text }}</p>
                <span class="config-message__time">{{ new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
              </div>
            </div>
            
            <!-- Индикатор "печатает ответ" -->
            <div v-if="isConfigLoading" class="config-message config-message--system config-message--typing">
              <div class="config-message__content">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p class="config-message__text typing-text">Печатает ответ...</p>
              </div>
            </div>
          </div>
          
          <div class="config-input">
            <InputField
              v-model="configMessageText"
              type="text"
              placeholder="Опишите, каким должен быть ваш ассистент..."
              variant="light"
              @keyup.enter="!isConfigLoading && sendConfigMessage()"
              size="large"
              :disabled="isConfigLoading"
            />
            <Button
              type="button"
              button-type="secondary"
              icon="icon icon-chevron-up"
              size="curcle"
              @click="sendConfigMessage"
              :disabled="!configMessageText.trim() || isConfigLoading"
            />
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
import { ref, onMounted, watch, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAssistentsStore } from '@/stores/useAssistantsStore';
import { useAssistentChatStore } from '@/stores/useAssistantChatStore';
import Button from '@/components/ui/Button.vue';
import InputField from '@/components/ui/InputField.vue';
import { RouteNames } from '@/router/routes/routeNames';

const route = useRoute();
const router = useRouter();
const assistentsStore = useAssistentsStore();
const chatStore = useAssistentChatStore();

const newMessage = ref<string>('');
const chatContainer = ref<HTMLElement | null>(null);
const configChatContainer = ref<HTMLElement | null>(null);
const assistentId = ref<string>(route.params.id as string);
const assistent = ref(assistentsStore.userAssistents.find(a => a.id === assistentId.value) || null);

// Конфигурация ассистента для LLM-настройки
const assistentConfig = reactive({
  name: assistent.value?.name || 'Новый ассистент',
  summary: assistent.value?.summary || '',
  systemPrompt: assistent.value?.instructions || '',
  model: assistent.value?.call_name || 'gpt-3.5-turbo',
});

// Чат для настройки ассистента
interface ConfigMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const configMessageText = ref<string>('');
const isConfigLoading = ref<boolean>(false);
const configMessages = ref<ConfigMessage[]>([
  {
    text: 'Привет! Я помогу вам настроить вашего ассистента. Расскажите, каким вы хотите его видеть и какие задачи он должен выполнять?',
    isUser: false,
    timestamp: new Date()
  }
]);

const sendConfigMessage = async () => {
  if (configMessageText.value.trim() === '' || isConfigLoading.value) return;
  
  // Сохраняем текст сообщения в переменную
  const messageText = configMessageText.value;
  
  // Очищаем поле ввода сразу
  configMessageText.value = '';
  
  // Добавляем сообщение пользователя
  configMessages.value.push({
    text: messageText,
    isUser: true,
    timestamp: new Date()
  });
  
  scrollConfigToBottom();
  
  // Имитируем загрузку ответа
  isConfigLoading.value = true;
  
  setTimeout(() => {
    // Анализируем сообщение и обновляем конфигурацию ассистента
    updateAssistentConfigFromMessage(messageText);
    
    // Формируем ответ в зависимости от содержания сообщения
    let responseText = '';
    
    if (messageText.toLowerCase().includes('имя') || messageText.toLowerCase().includes('назван')) {
      responseText = `Отлично! Я установил имя ассистента: "${assistentConfig.name}". Что ещё вы хотели бы настроить? Может быть, опишите, какие задачи он должен выполнять?`;
    } else if (messageText.toLowerCase().includes('задач') || messageText.toLowerCase().includes('умеет') || messageText.toLowerCase().includes('делает')) {
      responseText = `Я обновил описание вашего ассистента. Теперь он будет специализироваться на задачах, которые вы указали. Хотите настроить системный промпт для более точной работы?`;
    } else if (messageText.toLowerCase().includes('промпт') || messageText.toLowerCase().includes('инструкц')) {
      responseText = `Системный промпт обновлен! Это поможет ассистенту лучше понимать ваши запросы. Хотите выбрать модель для вашего ассистента? Доступны GPT-4, GPT-3.5 Turbo и Claude 3.`;
    } else if (messageText.toLowerCase().includes('модель') || messageText.toLowerCase().includes('gpt') || messageText.toLowerCase().includes('claude')) {
      responseText = `Модель успешно выбрана! Ваш ассистент настроен и готов к работе. Вы можете продолжить настройку или посмотреть, как он будет работать, в окне справа.`;
    } else {
      responseText = `Я обновил настройки вашего ассистента на основе ваших пожеланий. Что бы вы хотели настроить ещё? Вы можете указать имя, описание задач, системный промпт или выбрать модель.`;
    }
    
    // Добавляем ответ системы
    configMessages.value.push({
      text: responseText,
      isUser: false,
      timestamp: new Date()
    });
    
    isConfigLoading.value = false;
    scrollConfigToBottom();
    
    // Применяем изменения к ассистенту
    applyConfig();
  }, 1500);
};

const updateAssistentConfigFromMessage = (message: string) => {
  // Простой алгоритм извлечения информации из сообщения пользователя
  
  // Обновляем имя, если в сообщении есть ключевые слова об имени
  if (message.toLowerCase().includes('имя') || message.toLowerCase().includes('назван')) {
    const nameMatch = message.match(/["']([^"']+)["']/);
    if (nameMatch && nameMatch[1]) {
      assistentConfig.name = nameMatch[1];
    } else {
      // Если нет явного указания имени в кавычках, пробуем извлечь имя после ключевых слов
      const words = message.split(' ');
      const nameIndex = words.findIndex(word => 
        word.toLowerCase().includes('имя') || 
        word.toLowerCase().includes('назван') || 
        word.toLowerCase().includes('зовут')
      );
      
      if (nameIndex >= 0 && words[nameIndex + 1]) {
        assistentConfig.name = words.slice(nameIndex + 1, nameIndex + 3).join(' ');
      }
    }
  }
  
  // Обновляем описание, если сообщение о задачах
  if (message.toLowerCase().includes('задач') || message.toLowerCase().includes('умеет') || message.toLowerCase().includes('делает')) {
    assistentConfig.summary = message;
  }
  
  // Обновляем системный промпт
  if (message.toLowerCase().includes('промпт') || message.toLowerCase().includes('инструкц')) {
    assistentConfig.systemPrompt = message;
  }
  
  // Обновляем модель
  if (message.toLowerCase().includes('gpt-4')) {
    assistentConfig.model = 'gpt-4';
  } else if (message.toLowerCase().includes('gpt-3') || message.toLowerCase().includes('gpt3')) {
    assistentConfig.model = 'gpt-3.5-turbo';
  } else if (message.toLowerCase().includes('claude')) {
    assistentConfig.model = 'claude-3';
  }
};

const scrollConfigToBottom = () => {
  setTimeout(() => {
    if (configChatContainer.value) {
      const container = configChatContainer.value;
      container.scrollTop = container.scrollHeight;
    }
  }, 100);
};

const applyConfig = () => {
  // Здесь будет код для применения настроек к ассистенту
  if (assistent.value) {
    // Обновляем настройки ассистента
    assistentsStore.updateAssistent(assistent.value.id, {
      ...assistent.value,
      name: assistentConfig.name,
      summary: assistentConfig.summary,
      systemPrompt: assistentConfig.systemPrompt,
      model: assistentConfig.model
    });
    
    // Обновляем локальный объект ассистента
    updateAssistent();
  }
};

const resetConfig = () => {
  // Сбрасываем настройки к исходным значениям
  if (assistent.value) {
    assistentConfig.name = assistent.value.name;
    assistentConfig.summary = assistent.value.summary || '';
    assistentConfig.systemPrompt = assistent.value.instructions || '';
    assistentConfig.model = assistent.value.call_name || 'gpt-3.5-turbo';
  }
};

const updateAssistent = () => {
  assistent.value = assistentsStore.userAssistents.find(a => a.id === assistentId.value) || null;
  
  // Обновляем конфигурацию при смене ассистента
  if (assistent.value) {
    assistentConfig.name = assistent.value.name;
    assistentConfig.summary = assistent.value.summary || '';
    assistentConfig.systemPrompt = assistent.value.instructions || '';
    assistentConfig.model = assistent.value.call_name || 'gpt-3.5-turbo';
  }
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

  // Сохраняем текст сообщения в переменную
  const messageText = newMessage.value;
  
  // Очищаем поле ввода сразу
  newMessage.value = '';
  
  // Отправляем сообщение
  await chatStore.addMessage(messageText, true);
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

onMounted(() => {
  scrollToBottom();
  scrollConfigToBottom();
  updateAssistent();
  
  if (assistentId.value) {
    if (!chatStore.sessions || chatStore.sessions.length === 0) {
      chatStore.createNewSession(assistentId.value);
    } else if (!chatStore.activeSessionId) {
      // Если есть сессии, но нет активной, выбираем первую
      chatStore.selectSession(chatStore.sessions[0].id);
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

  &__config {
    width: 40%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: $light-color;
    border-radius: 12px;
    box-shadow: $box-shadow-small;
    overflow: hidden;
  }

  .config-header {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    padding: 16px;
    border-bottom: 1px solid rgba($help-color, 0.1);
  }

  .config-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: calc(100% - 60px);
  }

  .config-messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .config-message {
    display: flex;
    max-width: 85%;
    
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
    
    &--system {
      align-self: flex-start;
      
      .config-message__content {
        background-color: $grey-background-color;
        border-bottom-left-radius: 4px;
      }
    }
    
    &--user {
      align-self: flex-end;
      
      .config-message__content {
        background-color: $main-color;
        color: $light-color;
        border-bottom-right-radius: 4px;
      }
      
      .config-message__time {
        color: rgba($light-color, 0.8);
      }
    }
    
    &--typing {
      opacity: 0.7;
      
      .config-message__content {
        padding-bottom: 16px;
      }
    }
  }

  .config-input {
    display: flex;
    align-items: center;
    padding: 16px;
    border-top: 1px solid rgba($help-color, 0.1);
    gap: 16px;
    
    & > *:first-child {
      flex-basis: 90%;
    }
  }

  &__chat {
    width: 60%;
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
    }
    
    &__name {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 4px;
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
</style>