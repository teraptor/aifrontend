<template>
  <div class="assistent-chat">
    <div class="assistent-chat__container">
      <div class="assistent-chat__sessions">
        <h2>Ассистенты</h2>
        <div class="assistent-chat__session-list">
          <div 
            v-for="assistant in assistants" 
            :key="assistant.id" 
            :class="['session-item', { 'session-item--active': selectedAssistant?.id === assistant.id }]"
            @click="selectAssistant(assistant)"
          >
            <div class="session-item__avatar">
              <div class="assistant-avatar">{{ assistant.name.charAt(0) }}</div>
            </div>
            <div class="session-item__content">
              <div class="session-item__title">{{ assistant.name }}</div>
              <div class="session-item__meta">
                <span class="session-item__description">{{ assistant.description }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="assistent-chat__dialogs" v-if="selectedAssistant">
        <div class="new-dialog-button" @click="createNewDialog">
          <span>+ Диалог</span>
        </div>
        <div class="assistent-chat__session-list">
          <div 
            v-for="session in sortedSessions" 
            :key="session.id" 
            :class="['session-item', { 'session-item--active': chatStore.activeSessionId === session.id }]"
            @click="selectSession(session.id)"
          >
            <div class="session-item__content">
              <div class="session-item__title-container">
                <div v-if="editingDialogId === session.id" class="edit-title-container" @click.stop>
                  <input 
                    ref="editTitleInput"
                    v-model="editedDialogTitle" 
                    type="text"
                    @keyup.enter="saveDialogTitle()"
                    @keyup.esc="cancelEditingTitle()"
                    @blur="saveDialogTitle()"
                  />
                </div>
                <div v-else class="session-item__title">{{ session.title }}</div>
                <div class="session-item__edit-icon" @click.stop="startEditingTitle(session)">
                  <span class="pencil-icon">✏️</span>
                </div>
              </div>
              <div class="session-item__meta">
                <span class="session-item__time">{{ formatDate(session.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="assistent-chat__chat">
        <div class="assistent-chat__chat-container" v-if="selectedAssistant && chatStore.activeSessionId">
          <div class="chat-header">
            <div class="assistant-header" @click="toggleAssistentMenu" ref="assistentMenuTrigger">
              <div class="assistant-header__avatar">
                <div class="assistant-avatar" v-if="selectedAssistant">
                  {{ selectedAssistant.name.charAt(0) }}
                </div>
              </div>
              <div class="assistant-header__info">
                <h2 class="assistant-header__name">
                  {{ selectedAssistant.name }} <span class="dropdown-icon">▼</span>
                </h2>
                <p class="assistant-header__description">
                  {{ selectedAssistant.description }}
                </p>
                <p 
                  class="assistant-header__status"
                  :class="{ 'assistant-header__status--active': selectedAssistant.isActive }"
                >
                  {{ selectedAssistant.isActive ? 'Активный' : 'Заблокирован' }}
                </p>
              </div>
            </div>

            <!-- Выпадающее меню для ассистента -->
            <div class="assistant-dropdown" v-if="isAssistentMenuOpen" ref="assistentMenu">
              <div class="assistant-dropdown__header">Действия</div>
              <div class="assistant-dropdown__actions">
                <div 
                  v-for="item in menuItems" 
                  :key="item.id"
                  class="assistant-dropdown__action"
                  @click="item.action"
                >
                  <span class="assistant-dropdown__action-icon">{{ item.icon }}</span>
                  <span class="assistant-dropdown__action-title">{{ item.title }}</span>
                </div>
              </div>
              
              <div class="assistant-dropdown__header">Мои ассистенты</div>
              <div class="assistant-dropdown__list">
                <div
                  v-for="assistant in assistants"
                  :key="assistant.id"
                  :class="['assistant-dropdown__item', { 'assistant-dropdown__item--active': selectedAssistant?.id === assistant.id }]"
                  @click="switchAssistant(assistant)"
                >
                  <div class="assistant-dropdown__item-avatar">
                    <div class="assistant-avatar">{{ assistant.name.charAt(0) }}</div>
                  </div>
                  <div class="assistant-dropdown__item-info">
                    <div class="assistant-dropdown__item-name">{{ assistant.name }}</div>
                    <div class="assistant-dropdown__item-description">{{ assistant.description }}</div>
                    <div 
                      class="assistant-dropdown__item-status"
                      :class="{ 'assistant-dropdown__item-status--active': assistant.isActive }"
                    >
                      {{ assistant.isActive ? 'Активный' : 'Заблокирован' }}
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
                <p class="message__text" v-html="formattedText(message.text)"></p>
                <span class="message__time">{{ formatTime(message.timestamp) }}</span>
              </div>
            </div>
            
            <!-- Индикатор "печатает ответ" -->
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

          <div class="chat-input">
            <input 
              ref="messageInput"
              v-model="newMessage" 
              type="text"
              placeholder="Напишите сообщение..." 
              @keyup.enter="sendMessage"
              :disabled="chatStore.isLoading"
            />
            <button class="send-button" @click="sendMessage" :disabled="!newMessage.trim() || chatStore.isLoading">
              <span class="arrow-icon">↑</span>
            </button>
          </div>
        </div>
        <div v-else class="no-dialog-selected">
          <p>Выберите ассистента и диалог или создайте новый</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useAssistentsStore } from '@/stores/useAssistantsStore'
import { useAssistentChatStore } from '@/stores/useAssistantChatStore'
import { IAssistent } from '@/stores/useAssistantsStore'

// Интерфейсы для меню
interface MenuItem {
  id: string
  title: string
  icon: string
  action: () => void
}

// Инициализация хранилищ
const assistentsStore = useAssistentsStore()
const chatStore = useAssistentChatStore()

// Локальные переменные для UI
const newMessage = ref('')
const messageInput = ref<HTMLInputElement | null>(null)
const chatContainer = ref<HTMLElement | null>(null)
const isAssistentMenuOpen = ref(false)
const assistentMenuTrigger = ref<HTMLElement | null>(null)
const assistentMenu = ref<HTMLElement | null>(null)
const editingDialogId = ref<string | null>(null)
const editedDialogTitle = ref('')
const editTitleInput = ref<HTMLInputElement | null>(null)
const selectedAssistant = ref<IAssistent | null>(null)

// Вычисляемые свойства из хранилищ
const assistants = computed(() => assistentsStore.sortedAssistents)

// Функция форматирования текста сообщений
const formattedText = (text: string) => {
  if (!text) return ''
  
  // Заменяем переносы строк на <br />
  let formatted = text.replace(/\n/g, '<br />')
  
  // Выделяем жирным текст между ** (как в Markdown)
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
  // Выделяем курсивом текст между * (как в Markdown)
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')
  
  // Форматируем код (однострочный)
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>')
  
  // Добавляем ссылки
  formatted = formatted.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  )
  
  return formatted
}

// Сортированные диалоги выбранного ассистента от самого последнего к первому
const sortedSessions = computed(() => {
  if (!selectedAssistant.value) return []
  
  return chatStore.sessions
    .filter(s => s.agentId === selectedAssistant.value!.id)
    .sort((a, b) => {
      // Сортировка по убыванию времени (новые сверху)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
})

// Выбор ассистента
const selectAssistant = (assistant: IAssistent) => {
  selectedAssistant.value = assistant
  
  // Проверяем, есть ли сессии для этого ассистента
  const assistantSessions = chatStore.sessions.filter(s => s.agentId === assistant.id)
  
  if (assistantSessions.length > 0) {
    // Если есть сессии, выбираем первую
    selectSession(assistantSessions[0].id)
  } else {
    // Если нет сессий, создаем новую
    createNewDialog()
  }
}

// Переключение на другого ассистента из выпадающего меню
const switchAssistant = (assistant: IAssistent) => {
  selectAssistant(assistant)
  isAssistentMenuOpen.value = false
}

// Выбор диалога
const selectSession = (sessionId: string) => {
  chatStore.selectSession(sessionId)
  scrollToBottom()
}

// Создание нового диалога
const createNewDialog = async () => {
  if (!selectedAssistant.value) return
  
  await chatStore.createNewSession(selectedAssistant.value.id)
  scrollToBottom()
}

// Отправка сообщения
const sendMessage = async () => {
  if (!newMessage.value.trim() || chatStore.isLoading || !chatStore.activeSessionId) return
  
  await chatStore.addMessage(newMessage.value, true)
  newMessage.value = ''
  
  // Фокус на поле ввода
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.focus()
    }
    scrollToBottom()
  })
}

// Переключение меню ассистента
const toggleAssistentMenu = () => {
  isAssistentMenuOpen.value = !isAssistentMenuOpen.value
}

// Закрытие меню при клике вне его
onClickOutside(assistentMenu, (event) => {
  if (assistentMenuTrigger.value && !assistentMenuTrigger.value.contains(event.target as Node)) {
    isAssistentMenuOpen.value = false
  }
})

// Форматирование даты
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(date)
}

// Форматирование времени
const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(date)
}

// Начать редактирование названия диалога
const startEditingTitle = (session: any) => {
  editingDialogId.value = session.id
  editedDialogTitle.value = session.title
  
  nextTick(() => {
    if (editTitleInput.value) {
      editTitleInput.value.focus()
    }
  })
}

// Сохранить отредактированное название диалога
const saveDialogTitle = () => {
  if (editingDialogId.value && editedDialogTitle.value.trim()) {
    const session = chatStore.sessions.find(s => s.id === editingDialogId.value)
    if (session) {
      session.title = editedDialogTitle.value.trim()
    }
  }
  editingDialogId.value = null
}

// Отменить редактирование названия диалога
const cancelEditingTitle = () => {
  editingDialogId.value = null
}

// Прокрутка чата вниз
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// Следим за новыми сообщениями
watch(
  () => chatStore.newMessageReceived,
  (newValue) => {
    if (newValue) {
      scrollToBottom()
      chatStore.resetNewMessageFlag()
    }
  }
)

// Создаем меню действий
const menuItems = ref<MenuItem[]>([
  {
    id: 'new-dialog',
    title: 'Новый диалог',
    icon: '+',
    action: () => {
      createNewDialog()
      isAssistentMenuOpen.value = false
    }
  },
  {
    id: 'settings',
    title: 'Настройки ассистента',
    icon: '⚙️',
    action: () => {
      // Здесь будет логика для перехода к настройкам ассистента
      isAssistentMenuOpen.value = false
    }
  },
  {
    id: 'clear-chat',
    title: 'Очистить историю',
    icon: '🗑️',
    action: () => {
      if (chatStore.activeSessionId && confirm('Вы действительно хотите очистить историю чата?')) {
        // Очистка истории чата
        const sessionMessages = chatStore.messages.filter(m => m.sessionId === chatStore.activeSessionId)
        if (sessionMessages.length > 0) {
          // Удаляем все сообщения активной сессии
          chatStore.messages = chatStore.messages.filter(m => m.sessionId !== chatStore.activeSessionId)
        }
      }
      isAssistentMenuOpen.value = false
    }
  }
])

// Загрузка данных при монтировании
onMounted(async () => {
  // Загружаем список ассистентов
  await assistentsStore.getMyAssistents()
  
  // Если есть ассистенты, выбираем первого
  if (assistants.value.length > 0) {
    selectAssistant(assistants.value[0])
  }
})
</script>

<style lang="scss" scoped>
.assistent-chat {
  width: 100%;
  height: 90vh;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;

  &__container {
    width: 100%;
    height: 100%;
    display: flex;
    gap: 16px;
    background-color: #f5f7fa;
    overflow: hidden;
    padding: 16px;
    border-radius: 12px;
  }

  &__sessions {
    width: 25%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow: hidden;

    h2 {
      margin: 0;
      margin: 7px;
      padding: 0 0 12px 0;
      font-size: 18px;
      font-weight: 600;
      height: 45px; /* Высота соответствует высоте кнопки в центральной колонке */
      display: flex;
      align-items: center;
    }
  }

  &__dialogs {
    width: 25%;
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
    border: 1px solid rgba(#999, 0.1);
  }

  .session-item {
    width: 100%;
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid rgba(#999, 0.1);
    display: flex;
    align-items: center;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:hover {
      background-color: rgba(#999, 0.05);
    }
    
    &--active {
      background-color: rgba(#1890ff, 0.05);
    }

    &__avatar {
      margin-right: 12px;
    }
    
    &__content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }
    
    &__title-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
    
    &__title {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }
    
    &__edit-icon {
      opacity: 0;
      transition: opacity 0.2s;
      margin-left: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .pencil-icon {
        font-size: 14px;
      }
      
      &:hover {
        opacity: 1;
      }
    }
    
    &:hover {
      .session-item__edit-icon {
        opacity: 0.5;
      }
    }

    &__meta {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 12px;
      color: #999;
    }
    
    &__time {
      font-size: 12px;
      color: #999;
    }

    &__description {
      font-size: 12px;
      color: #666;
    }
  }

  &__chat {
    width: 50%;
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
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .chat-header {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid rgba(#999, 0.1);
    position: relative;
  }

  .assistant-header {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    width: 100%;
    
    &:hover {
      background-color: rgba(#1890ff, 0.05);
    }
    
    &__avatar {
      margin-right: 12px;
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
      
      .dropdown-icon {
        font-size: 10px;
        color: #999;
      }
    }
    
    &__description {
      font-size: 12px;
      color: #666;
      margin: 0;
    }
    
    &__status {
      font-size: 12px;
      color: #999;
      margin: 0;
    }
  }

  .assistant-dropdown {
    position: absolute;
    top: 100%;
    left: 16px;
    width: 300px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    margin-top: 8px;
    overflow: hidden;
    
    &__header {
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 500;
      color: #333;
      border-bottom: 1px solid rgba(#999, 0.1);
    }
    
    &__actions {
      padding: 8px 0;
      border-bottom: 1px solid rgba(#999, 0.1);
    }
    
    &__action {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      cursor: pointer;
      
      &:hover {
        background-color: rgba(#999, 0.05);
      }
      
      &-icon {
        margin-right: 12px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      }
      
      &-title {
        font-size: 14px;
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
      border-bottom: 1px solid rgba(#999, 0.1);
      
      &:last-child {
        border-bottom: none;
      }
      
      &:hover {
        background-color: rgba(#999, 0.05);
      }
      
      &--active {
        background-color: rgba(#1890ff, 0.05);
      }
      
      &-avatar {
        margin-right: 12px;
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
      
      &-description {
        font-size: 12px;
        color: #666;
      }
      
      &-status {
        font-size: 10px;
        color: #999;
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
      
      :deep(a) {
        color: #1890ff;
        text-decoration: underline;
      }
      
      :deep(code) {
        background-color: rgba(0, 0, 0, 0.05);
        padding: 2px 4px;
        border-radius: 4px;
        font-family: monospace;
      }
      
      :deep(strong) {
        font-weight: bold;
      }
      
      :deep(em) {
        font-style: italic;
      }
    }
    
    &__time {
      font-size: 10px;
      color: #999;
      position: absolute;
      bottom: 4px;
      right: 8px;
    }
    
    &--assistant {
      align-self: flex-start;
      
      .message__content {
        background-color: #f5f7fa;
        border-bottom-left-radius: 4px;
      }
    }
    
    &--user {
      align-self: flex-end;
      
      .message__content {
        background-color: #1890ff;
        color: #ffffff;
        border-bottom-right-radius: 4px;
      }
      
      .message__time {
        color: rgba(#ffffff, 0.8);
      }
    }
    
    &--typing {
      opacity: 0.8;
      
      .message__content {
        padding-bottom: 8px;
      }
    }
  }

  .chat-input {
    display: flex;
    align-items: center;
    padding: 16px;
    border-top: 1px solid rgba(#999, 0.1);
    
    input {
      flex: 1;
      padding: 12px 16px;
      border: none;
      border-radius: 30px;
      background-color: #f5f7fa;
      font-family: inherit;
      font-size: 14px;
      height: 44px;
      
      &:focus {
        outline: none;
        background-color: #edf1f7;
      }
      
      &::placeholder {
        color: #999;
      }
    }
    
    .send-button {
      width: 44px;
      height: 44px;
      min-width: 44px;
      border-radius: 50%;
      background-color: #40c4dd;
      color: white;
      border: none;
      cursor: pointer;
      margin-left: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: #33b5ce;
      }
      
      &:disabled {
        background-color: #d9d9d9;
        cursor: not-allowed;
      }
      
      .arrow-icon {
        font-size: 18px;
      }
    }
  }
}

.assistant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.new-dialog-button {
  width: 100%;
  padding: 12px;
  text-align: center;
  background-color: #40c4dd;
  border-radius: 12px;
  cursor: pointer;
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  height: 45px; /* Фиксированная высота, чтобы соответствовать заголовку в левой колонке */
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #33b5ce;
  }
}

.no-dialog-selected {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 16px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.edit-title-container {
  flex: 1;
  
  input {
    width: 100%;
    padding: 4px 8px;
    font-size: 14px;
    font-weight: 500;
    border: 1px solid #1890ff;
    border-radius: 4px;
    outline: none;
  }
}

.typing-indicator {
  background-color: #f5f7fa;
  border-bottom-left-radius: 4px;
}

.typing-dots {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  
  span {
    display: inline-block;
    width: 7px;
    height: 7px;
    background-color: #999;
    border-radius: 50%;
    opacity: 0.6;
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
  font-size: 14px;
  color: #666;
  margin: 4px 0 0 0;
}

@keyframes typing {
  0% {
    transform: translateY(0);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-5px);
    opacity: 1;
  }
  100% {
    transform: translateY(0);
    opacity: 0.6;
  }
}

// Адаптивный дизайн для мобильных устройств
@media (max-width: 768px) {
  .assistent-chat {
    padding: 8px;

    &__container {
      flex-direction: column;
      padding: 8px;
    }

    &__sessions, 
    &__dialogs, 
    &__chat {
      width: 100%;
    }
    
    &__sessions,
    &__dialogs {
      height: auto;
    }
  }
}
</style>