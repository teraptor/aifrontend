<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TitleWrapper from '@/components/ui/TitleWrapper.vue'
import SideMenu from '@/components/layout/SideMenu.vue'

interface Message {
  id: number
  text: string
  isAssistant: boolean
  date: string
}

const route = useRoute()
const questionId = Number(route.params.id)

// Имитация данных диалога
const dialog = ref<{
  assistantName: string
  assistantAvatar: string
  question: string
  messages: Message[]
}>({
  assistantName: 'Александр',
  assistantAvatar: '👨🏻‍💼',
  question: 'Как улучшить точность моих ответов на технические вопросы?',
  messages: [
    {
      id: 1,
      text: 'Как улучшить точность моих ответов на технические вопросы?',
      isAssistant: false,
      date: '2024-03-05 10:00'
    },
    {
      id: 2,
      text: 'Здравствуйте! Я помогу вам улучшить точность ответов. Для начала, расскажите, с какими конкретными трудностями вы сталкиваетесь?',
      isAssistant: true,
      date: '2024-03-05 10:01'
    },
    {
      id: 3,
      text: 'Иногда мои ответы слишком общие, и я не всегда уверен в актуальности информации',
      isAssistant: false,
      date: '2024-03-05 10:03'
    },
    {
      id: 4,
      text: 'Понятно. Для улучшения точности ответов рекомендую следующие шаги:\n1) Использовать более точные промпты с конкретными параметрами\n2) Проверять источники данных на актуальность\n3) Регулярно обновлять базу знаний\n4) Запрашивать обратную связь от пользователей',
      isAssistant: true,
      date: '2024-03-05 10:05'
    },
    {
      id: 5,
      text: 'Спасибо! А как лучше составлять промпты для получения более точных ответов?',
      isAssistant: false,
      date: '2024-03-05 10:07'
    },
    {
      id: 6,
      text: 'При составлении промптов важно:\n1) Указывать конкретный контекст задачи\n2) Определять желаемый формат ответа\n3) Устанавливать ограничения и требования\n4) Использовать примеры для иллюстрации\nХотите, я покажу несколько примеров эффективных промптов?',
      isAssistant: true,
      date: '2024-03-05 10:09'
    }
  ]
})

const newMessage = ref('')

const sendMessage = () => {
  if (!newMessage.value.trim()) return

  dialog.value.messages.push({
    id: dialog.value.messages.length + 1,
    text: newMessage.value,
    isAssistant: false,
    date: new Date().toISOString()
  })

  newMessage.value = ''
}

const isHistoryCollapsed = ref(true)

const toggleHistory = () => {
  isHistoryCollapsed.value = !isHistoryCollapsed.value
}

onMounted(() => {
  // Здесь будет загрузка данных диалога по ID
})
</script>

<template>
  <div class="dialog-page">
    <SideMenu />
    
    <div class="dialog-main">
      <TitleWrapper 
        title="Диалог"
        :subtitle="dialog.question"
      />
      
      <div class="dialog-container">
        <div 
          class="dialog-history"
          :class="{ 'dialog-history--collapsed': isHistoryCollapsed }"
        >
          <div 
            class="dialog-history__header"
            @click="toggleHistory"
          >
            <div class="dialog-history__title">
              История диалога
              <span class="dialog-history__title-arrow">↓</span>
            </div>
          </div>
          <div class="dialog-history__date">
            {{ new Date(dialog.messages[0].date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) }}
          </div>
          <div class="dialog-history__messages">
            <div 
              v-for="message in dialog.messages" 
              :key="message.id"
              class="dialog-history__message"
              :class="{ 'dialog-history__message--assistant': message.isAssistant }"
            >
              <div class="dialog-history__message-author">
                {{ message.isAssistant ? `Ассистент ${dialog.assistantName}` : 'Пользователь' }}
              </div>
              <div class="dialog-history__message-text">{{ message.text }}</div>
              <div class="dialog-history__message-time">
                {{ new Date(message.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) }}
              </div>
            </div>
          </div>
        </div>

        <div class="messages-list">
          <div 
            v-for="message in dialog.messages" 
            :key="message.id"
            class="message"
            :class="{ 'message--assistant': message.isAssistant }"
          >
            <div class="message__avatar" v-if="message.isAssistant">
              {{ dialog.assistantAvatar }}
            </div>
            <div class="message__content">
              <div class="message__name" v-if="message.isAssistant">
                Ассистент {{ dialog.assistantName }}
              </div>
              <div class="message__text">{{ message.text }}</div>
              <div class="message__date">
                {{ new Date(message.date).toLocaleString('ru-RU') }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-container">
          <div class="assistant-info">
            <div class="assistant-avatar">{{ dialog.assistantAvatar }}</div>
            <div class="assistant-name">{{ dialog.assistantName }}</div>
          </div>
          
          <div class="message-form">
            <textarea
              v-model="newMessage"
              placeholder="Введите ваш ответ..."
              class="message-input"
              rows="2"
            ></textarea>
            <button 
              class="send-button"
              @click="sendMessage"
              :disabled="!newMessage.trim()"
            >
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dialog-page {
  width: 100%;
  min-height: 100vh;
  display: flex;
}

.dialog-main {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #F9FAFB;
  min-height: 100vh;
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

.dialog-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border-radius: 12px;
  padding-bottom: 120px;
  position: relative;
}

.dialog-history {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(243, 244, 246, 0.5);
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &--collapsed {
    .dialog-history__messages,
    .dialog-history__date {
      display: none;
    }
    
    .dialog-history__title-arrow {
      transform: rotate(-90deg);
    }
  }
}

.dialog-history__header {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.dialog-history__title {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dialog-history__title-arrow {
  font-size: 20px;
  transition: transform 0.3s ease;
}

.dialog-history__date {
  font-size: 16px;
  color: #6B7280;
  padding-bottom: 16px;
  border-bottom: 1px solid #E5E7EB;
}

.dialog-history__messages {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dialog-history__message {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  width: 50%;
  align-self: flex-end;
}

.dialog-history__message--assistant {
  align-self: flex-start;
  background: #F3F4F6;
}

.dialog-history__message-author {
  font-size: 14px;
  font-weight: 600;
  color: #6B7280;
}

.dialog-history__message-text {
  font-size: 16px;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
}

.dialog-history__message-time {
  font-size: 12px;
  color: #9CA3AF;
  align-self: flex-end;
}

.messages-list {
  padding: 20px;
  padding-bottom: 120px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  width: 50%;

  &--assistant {
    align-self: flex-start;
  }

  &:not(.message--assistant) {
    align-self: flex-end;
    flex-direction: row-reverse;
  }
}

.message__avatar {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F3F4F6;
  border-radius: 50%;
  font-size: 24px;
  flex-shrink: 0;
}

.message__content {
  flex: 1;
  background: rgba(243, 244, 246, 0.8);
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(8px);
}

.message__name {
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  margin-bottom: 4px;
}

.message:not(.message--assistant) .message__content {
  background: rgba(228, 167, 162, 0.8);
  color: white;
  box-shadow: 0 1px 2px rgba(228, 167, 162, 0.2);
  backdrop-filter: blur(8px);
}

.message__text {
  margin-bottom: 4px;
  line-height: 1.5;
}

.message__date {
  font-size: 12px;
  color: #6B7280;
}

.message:not(.message--assistant) .message__date {
  color: rgba(255, 255, 255, 0.8);
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #F9FAFB;
  padding: 16px 20px;
}

.assistant-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
}

.assistant-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F3F4F6;
  border-radius: 50%;
  font-size: 28px;
}

.assistant-name {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.message-form {
  padding: 8px;
  display: flex;
  gap: 12px;
}

.message-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: #E4A7A2;
  }
}

.send-button {
  padding: 0 16px;
  background: #E4A7A2;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(228, 167, 162, 0.9);
  }

  &:disabled {
    background: #D1D5DB;
    cursor: not-allowed;
  }
}
</style> 