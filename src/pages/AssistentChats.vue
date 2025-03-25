<template>
  <div class="assistent-chat">
    <div class="assistent-chat__container">
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
                  {{ selectedAssistant.name }} 
                  <span class="status-indicator" :class="{ 'status-indicator--active': selectedAssistant.isActive }"></span>
                  <span class="dropdown-icon">▼</span>
                </h2>
                <p class="assistant-header__description">
                  {{ selectedAssistant.description }}
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
            <textarea 
              ref="messageInput"
              v-model="newMessage" 
              placeholder="Напишите сообщение..." 
              @keyup.enter.exact="sendMessage"
              @input="autoGrow"
              :disabled="chatStore.isLoading"
              rows="1"
            ></textarea>
            <button class="send-button" @click="sendMessage" :disabled="!newMessage.trim() || chatStore.isLoading">
              <span class="arrow-icon">↑</span>
            </button>
          </div>
        </div>
        <div v-else class="no-dialog-selected">
          <p>Выберите ассистента и диалог или создайте новый</p>
        </div>
      </div>

      <div class="assistent-chat__dialogs" v-if="selectedAssistant">
        <div class="dialogs-header">
          <div class="notification-bell-container">
            <div class="notification-bell" :class="{ 'has-notifications': totalUnreadMessages > 0 }" @click="toggleNotificationsMenu" ref="notificationBellTrigger">
              <span class="notification-bell__icon">🔔</span>
              <span v-if="totalUnreadMessages > 0" class="notification-bell__badge">{{ totalUnreadMessages }}</span>
            </div>
            
            <!-- Выпадающий список непрочитанных диалогов -->
            <div class="notifications-dropdown" v-if="isNotificationsMenuOpen" ref="notificationsDropdown">
              <div class="notifications-dropdown__header">
                Непрочитанные сообщения ({{ totalUnreadMessages }})
              </div>
              <div class="notifications-dropdown__list" v-if="unreadDialogs.length > 0">
                <div 
                  v-for="dialog in unreadDialogs" 
                  :key="dialog.id" 
                  class="notifications-dropdown__item"
                  @click="goToUnreadDialog(dialog)"
                >
                  <div class="notifications-dropdown__item-avatar">
                    <div class="assistant-avatar" v-if="getAssistantById(dialog.agentId)">
                      {{ getAssistantById(dialog.agentId)?.name.charAt(0) }}
                    </div>
                  </div>
                  <div class="notifications-dropdown__item-info">
                    <div class="notifications-dropdown__item-title">
                      {{ dialog.title }}
                    </div>
                    <div class="notifications-dropdown__item-assistant" v-if="getAssistantById(dialog.agentId)">
                      {{ getAssistantById(dialog.agentId)?.name }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="notifications-dropdown__empty" v-else>
                Нет непрочитанных сообщений
              </div>
            </div>
          </div>
          
          <div class="assistant-selector" ref="assistantSelectorTrigger" @click="toggleAssistantSelector">
            <div class="assistant-selector__avatar">
              <div class="assistant-avatar" v-if="selectedAssistant">
                {{ selectedAssistant.name.charAt(0) }}
              </div>
              <span v-if="selectedAssistant && getAssistantUnreadCount(selectedAssistant.id) > 0" class="assistant-selector__unread-badge">
                {{ getAssistantUnreadCount(selectedAssistant.id) }}
              </span>
            </div>
            <div class="assistant-selector__name">
              {{ selectedAssistant.name }}
            </div>
            <span class="assistant-selector__dropdown-icon">▼</span>
          </div>
          
          <!-- Выпадающий список ассистентов -->
          <div class="assistant-selector-dropdown" v-if="isAssistantSelectorOpen" ref="assistantSelectorDropdown">
            <div class="assistant-selector-dropdown__header">Ассистенты</div>
            <div class="assistant-selector-dropdown__list">
              <div 
                v-for="assistant in assistants" 
                :key="assistant.id" 
                :class="['assistant-selector-dropdown__item', { 'assistant-selector-dropdown__item--active': selectedAssistant?.id === assistant.id }]"
                @click="selectAssistant(assistant); isAssistantSelectorOpen = false"
              >
                <div class="assistant-selector-dropdown__item-avatar">
                  <div class="assistant-avatar">{{ assistant.name.charAt(0) }}</div>
                </div>
                <div class="assistant-selector-dropdown__item-info">
                  <div class="assistant-selector-dropdown__item-name">{{ assistant.name }}</div>
                  <div class="assistant-selector-dropdown__item-description">{{ assistant.description }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="new-dialog-button" @click="createNewDialog">
            <span>+ Диалог</span>
          </div>
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
                <div class="session-item__menu-icon" @click.stop="toggleDialogMenu(session, $event)">
                  <span class="dots-icon">⋮</span>
                </div>
              </div>
              
              <!-- Выпадающее меню для диалога -->
              <div v-if="dialogMenuOpen === session.id" class="dialog-dropdown" @click.stop ref="dialogMenu">
                <div class="dialog-dropdown__action" @click="startEditingTitle(session); dialogMenuOpen = null">
                  <span class="dialog-dropdown__action-icon">✏️</span>
                  <span class="dialog-dropdown__action-title">Изменить название</span>
                </div>
                <div class="dialog-dropdown__action" @click="deleteDialog(session)">
                  <span class="dialog-dropdown__action-icon">🗑️</span>
                  <span class="dialog-dropdown__action-title">Удалить диалог</span>
                </div>
              </div>
              <div class="session-item__meta">
                <span class="session-item__time">{{ formatDate(session.timestamp) }}</span>
                <span v-if="session.unreadCount > 0" class="session-item__unread-badge">
                  {{ session.unreadCount }}
                </span>
              </div>
            </div>
          </div>
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
import type { IAssistent } from '@/stores/useAssistantsStore'

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
const messageInput = ref<HTMLTextAreaElement | null>(null)
const chatContainer = ref<HTMLElement | null>(null)
const isAssistentMenuOpen = ref(false)
const assistentMenuTrigger = ref<HTMLElement | null>(null)
const assistentMenu = ref<HTMLElement | null>(null)
const editingDialogId = ref<string | null>(null)
const editedDialogTitle = ref('')
const editTitleInput = ref<HTMLInputElement | null>(null)
const selectedAssistant = ref<IAssistent | null>(null)
const dialogMenuOpen = ref<string | null>(null)
const dialogMenu = ref<HTMLElement | null>(null)
const isAssistantSelectorOpen = ref(false)
const assistantSelectorTrigger = ref<HTMLElement | null>(null)
const assistantSelectorDropdown = ref<HTMLElement | null>(null)
const isNotificationsMenuOpen = ref(false)
const notificationBellTrigger = ref<HTMLElement | null>(null)
const notificationsDropdown = ref<HTMLElement | null>(null)

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

// Переход к непрочитанному диалогу
const goToUnreadDialog = (dialog: any) => {
  // Определить ассистента для этого диалога
  const assistantId = dialog.agentId
  const targetAssistant = assistants.value.find(a => a.id === assistantId)
  
  if (targetAssistant && targetAssistant.id !== selectedAssistant.value?.id) {
    // Если требуется сменить ассистента
    selectAssistant(targetAssistant, dialog.id)
  } else {
    // Если ассистент уже выбран, просто переключаем диалог
    selectSession(dialog.id)
  }
  
  isNotificationsMenuOpen.value = false
}

// Выбор ассистента
const selectAssistant = (assistant: IAssistent, sessionIdToSelect?: string) => {
  selectedAssistant.value = assistant
  
  // Сохраняем ID выбранного ассистента в localStorage
  localStorage.setItem('selectedAssistantId', assistant.id)
  
  // Если передан конкретный ID сессии, выбираем её
  if (sessionIdToSelect) {
    selectSession(sessionIdToSelect)
    return
  }
  
  // Проверяем, есть ли сохраненная сессия для этого ассистента
  const lastSessionId = localStorage.getItem(`lastSessionId_${assistant.id}`)
  
  // Проверяем, есть ли сессии для этого ассистента
  const assistantSessions = chatStore.sessions.filter(s => s.agentId === assistant.id)
  
  if (assistantSessions.length > 0) {
    if (lastSessionId && assistantSessions.some(s => s.id === lastSessionId)) {
      // Если есть сохраненная сессия и она существует, выбираем её
      selectSession(lastSessionId)
    } else {
      // Иначе используем новый метод без сброса счетчика
      chatStore.selectAssistantActiveSessions(assistant.id)
      scrollToBottom()
    }
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
  
  // Сохраняем ID активной сессии для текущего ассистента
  if (selectedAssistant.value) {
    localStorage.setItem(`lastSessionId_${selectedAssistant.value.id}`, sessionId)
  }
  
  scrollToBottom()
}

// Создание нового диалога
const createNewDialog = async () => {
  if (!selectedAssistant.value) return
  
  const newSession = await chatStore.createNewSession(selectedAssistant.value.id)
  
  // Сохраняем ID новой сессии как последней активной для этого ассистента
  if (newSession && selectedAssistant.value) {
    localStorage.setItem(`lastSessionId_${selectedAssistant.value.id}`, newSession.id)
  }
  
  scrollToBottom()
}

// Отправка сообщения
const sendMessage = async () => {
  if (!newMessage.value.trim() || chatStore.isLoading || !chatStore.activeSessionId) return
  
  // Сохраняем текст сообщения в переменную
  const messageText = newMessage.value
  
  // Очищаем поле ввода сразу
  newMessage.value = ''
  
  // Отправляем сообщение на сервер
  await chatStore.addMessage(messageText, true, chatStore.activeSessionId)
  
  // Фокус на поле ввода и прокрутка вниз
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
  
  // Закрываем меню
  dialogMenuOpen.value = null
  
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
      // Используем setTimeout для гарантии выполнения после рендеринга
      setTimeout(() => {
        chatContainer.value!.scrollTop = chatContainer.value!.scrollHeight;
      }, 50);
    }
  })
}

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
  
  // Проверяем, есть ли сохраненный ID ассистента
  const savedAssistantId = localStorage.getItem('selectedAssistantId')
  
  // Если есть ассистенты
  if (assistants.value.length > 0) {
    if (savedAssistantId) {
      // Ищем ассистента по сохраненному ID
      const savedAssistant = assistants.value.find(a => a.id === savedAssistantId)
      if (savedAssistant) {
        // Если нашли, выбираем его
        selectAssistant(savedAssistant)
      } else {
        // Если не нашли (возможно, он был удален), выбираем первого
        selectAssistant(assistants.value[0])
      }
    } else {
      // Если нет сохраненного ID, выбираем первого ассистента
      selectAssistant(assistants.value[0])
    }
  }
  
  // Создаем аудио элемент для уведомлений
  createNotificationSound()
  
  // Настраиваем MutationObserver для отслеживания изменений в чате
  if (chatContainer.value) {
    const observer = new MutationObserver((mutations) => {
      // Прокручиваем чат вниз при изменениях содержимого
      scrollToBottom();
    });
    
    observer.observe(chatContainer.value, {
      childList: true,      // наблюдать за добавлением/удалением дочерних элементов
      subtree: true,        // наблюдать за изменениями во всех потомках
      characterData: true,  // наблюдать за изменениями текста
    });
  }
})

// Создаем аудио элемент для уведомлений
const notificationSound = ref<HTMLAudioElement | null>(null)

// Функция для создания звукового уведомления
const createNotificationSound = () => {
  notificationSound.value = new Audio()
  notificationSound.value.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAuLi4uLi4uLi4uLi4uLi4uLi44ODg4ODg4ODg4ODg4ODg4ODg4ODg4OD///////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYIAAAAAAAAAbBJFOh7AAAAAAAAAAAAAAAAAAAA/+MYxAANACpgBUDQAAGpACANATc3N/SAN/8T//53/6n/QDf+IAAH/lwPAAAaB58HgCxL/5cHwQDgef2gGPAP/5cDwQZg/+V5+sgN/+Vg+CQZf/lQPgcGX//8sBwDAMfLA8BAP/w/AQDg8P+CDwH/5ID/4IQOAgcZDwEAgHnweBQXPg8AcZ/g8CwM/KAfBgY/LA8Bgv/LAcBAMHg8A4Lg8P/BAODg//BA4Y8mB4Q/h4Q8IcHg/5cPCHiDfKg/A4PB/yoHhDxB/lwfBAMHg8AeIOD/8EB4h//Kg+CMhfyoHwODL/8sB8DgYOWA8CAeB58HgQBw+fB4EAYPn/hDggfPg8CA//D/BA4CD/yYHgcGB/5MDwKB/LAcAwP+VB8EAYPlgPgcGP5YD4HBg//EA4Yf+TA8CgcH/KAWB4Q//lQfA4MP/yoHwOB//5UHwQDf/wQDAAAN/+gAAAAGn+cAAP/4Ph//+gAAAAfQAD//EAtbt3u/5hEz/+MYxCkVItZVVdMAAC7Z736nQzMR+pV+0QzOx9VaHJV3/lBrm//6TOp/X//UyZkpf8okYEnYpf+VxjAEr9ytThcKf+dxF47/5XGLBXl0vw5E4W/rFQqM/+dTMzZPL+Vx1OHxr/92FpGRn2hbtmHzp5f9QVFB//zupLhMTP/nUaMRif+VhgCj/1KAQv/LAsQhL/yiNGAKXf/pQ5MRMP+sTNh9RV/+oKhj/6lXh8Zbf/lYWkwov/KI0QBWf+UxgBE/9SsFQqX/18fEAVH/qEwGIH/y0KiAZH/1CvD40S//qqvDYW//1BUUf+rq8PjPb/8rC4mFF/5RGCAKP/ysKhAeP/UoA8P/lysKE4f+pWCoY//lYXE4xP/UoBMf/8rCoRC//pQ5MxMP/9TD4gCr/1BUMf/6qrw+Mtv/ysLSYUX/lEaIArP/KYwAgAAAAAAAAAP/4xjELxEi1o1V0wAALwBgAKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo='
  notificationSound.value.load()
}

// Функция для проигрывания звука уведомления
const playNotificationSound = () => {
  if (notificationSound.value) {
    notificationSound.value.play().catch(error => {
      console.error('Ошибка воспроизведения звука:', error)
    })
  }
}

// Следим за новыми сообщениями и проигрываем звук
watch(
  () => chatStore.newMessageReceived,
  (newValue) => {
    if (newValue) {
      // Если сообщение пришло в активный диалог, прокручиваем чат вниз
      if (chatStore.activeSessionId === chatStore.lastReceivedMessageSessionId) {
        scrollToBottom();
      } else {
        // Если сообщение пришло в неактивный диалог, проигрываем звук
        playNotificationSound();
      }
      
      chatStore.resetNewMessageFlag();
    }
  }
)

// Следим за изменениями в сообщениях и прокручиваем вниз
watch(
  () => chatStore.sessionMessages.length,
  () => {
    scrollToBottom();
  }
)

// Автоматически увеличиваем высоту поля ввода сообщения
const autoGrow = () => {
  if (!messageInput.value) return
  
  // Сбрасываем высоту для корректного расчета
  messageInput.value.style.height = 'auto'
  
  // Устанавливаем высоту на основе содержимого, но не более 150px
  const newHeight = Math.min(messageInput.value.scrollHeight, 150)
  messageInput.value.style.height = `${newHeight}px`
}

// Получение общего количества непрочитанных сообщений
const totalUnreadMessages = computed(() => {
  return chatStore.totalUnreadCount;
});

// Убираем автоматический выбор диалогов с непрочитанными сообщениями при смене ассистента
watch(
  () => selectedAssistant.value,
  (newAssistant, oldAssistant) => {
    if (newAssistant && newAssistant.id !== oldAssistant?.id) {
      // Больше не выбираем автоматически диалоги с непрочитанными сообщениями
      // Пользователь должен сам кликнуть на диалог, чтобы сбросить счетчик
      // const assistantSessions = chatStore.sessions.filter(s => s.agentId === newAssistant.id);
      // const sessionsWithUnread = assistantSessions.filter(s => s.unreadCount > 0);
      // 
      // if (sessionsWithUnread.length > 0) {
      //   selectSession(sessionsWithUnread[0].id);
      // }
    }
  }
)

// Переключение меню диалога
const toggleDialogMenu = (session: any, event?: Event) => {
  // Останавливаем всплытие события
  event?.stopPropagation()
  
  // Если текущее меню уже открыто, закрываем его
  if (dialogMenuOpen.value === session.id) {
    dialogMenuOpen.value = null
  } else {
    // Иначе открываем новое
    dialogMenuOpen.value = session.id
  }
}

// Удаление диалога
const deleteDialog = (session: any) => {
  if (confirm('Вы действительно хотите удалить этот диалог?')) {
    // Удаляем сессию из хранилища
    chatStore.sessions = chatStore.sessions.filter(s => s.id !== session.id)
    
    // Удаляем все сообщения этой сессии
    chatStore.messages = chatStore.messages.filter(m => m.sessionId !== session.id)
    
    // Если удаляемая сессия была активной, сбрасываем activeSessionId
    if (chatStore.activeSessionId === session.id) {
      chatStore.activeSessionId = null
      
      // Если есть другие сессии для этого ассистента, выбираем первую
      const otherSessions = sortedSessions.value
      if (otherSessions.length > 0) {
        selectSession(otherSessions[0].id)
      }
    }
    
    // Проверяем, является ли удаляемая сессия сохраненной в localStorage
    if (selectedAssistant.value) {
      const lastSessionId = localStorage.getItem(`lastSessionId_${selectedAssistant.value.id}`)
      if (lastSessionId === session.id) {
        // Удаляем сохраненную сессию из localStorage
        localStorage.removeItem(`lastSessionId_${selectedAssistant.value.id}`)
      }
    }
    
    dialogMenuOpen.value = null
  }
}

// Закрытие меню диалога при клике вне его
onClickOutside(dialogMenu, (event) => {
  // Проверяем, что клик был не по иконке меню
  const clickedElement = event.target as HTMLElement
  const menuIcon = clickedElement.closest('.session-item__menu-icon')
  
  // Если клик не по иконке меню, закрываем его
  if (!menuIcon) {
    dialogMenuOpen.value = null
  }
})

// Закрываем меню диалога при клике в любом месте документа
onMounted(() => {
  document.addEventListener('click', (event) => {
    const clickedElement = event.target as HTMLElement
    
    // Если клик был не по меню и не по иконке меню
    if (!clickedElement.closest('.dialog-dropdown') && !clickedElement.closest('.session-item__menu-icon')) {
      dialogMenuOpen.value = null
    }
  })
})

// Следим за изменениями активной сессии
watch(
  () => chatStore.activeSessionId,
  (newSessionId) => {
    if (newSessionId) {
      // Прокрутка вниз с небольшой задержкой после загрузки сообщений
      setTimeout(scrollToBottom, 100);
    }
  }
)

// Переключение выпадающего списка ассистентов
const toggleAssistantSelector = () => {
  isAssistantSelectorOpen.value = !isAssistantSelectorOpen.value
}

// Закрытие выпадающего списка ассистентов при клике вне его
onClickOutside(assistantSelectorDropdown, (event) => {
  if (assistantSelectorTrigger.value && !assistantSelectorTrigger.value.contains(event.target as Node)) {
    isAssistantSelectorOpen.value = false
  }
})

// Получение количества непрочитанных сообщений для конкретного ассистента
const getAssistantUnreadCount = (assistantId: string) => {
  const assistantSessions = chatStore.sessions.filter(s => s.agentId === assistantId)
  return assistantSessions.reduce((count, session) => count + session.unreadCount, 0)
}

// Переключение меню уведомлений
const toggleNotificationsMenu = () => {
  isNotificationsMenuOpen.value = !isNotificationsMenuOpen.value
}

// Закрытие выпадающего списка уведомлений при клике вне его
onClickOutside(notificationsDropdown, (event) => {
  if (notificationBellTrigger.value && !notificationBellTrigger.value.contains(event.target as Node)) {
    isNotificationsMenuOpen.value = false
  }
})

// Выпадающий список непрочитанных диалогов
const unreadDialogs = computed(() => {
  return chatStore.sessions.filter(s => s.unreadCount > 0)
})

// Получение ассистента по ID
const getAssistantById = (assistantId: string) => {
  return assistants.value.find(a => a.id === assistantId)
}
</script>

<style lang="scss" scoped>
.assistent-chat {
  width: 100%;
  height: 95vh;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;

  &__container {
    width: 100%;
    height: 100%;
    display: flex;
    gap: 16px;
    // background-color: #f5f7fa;
    overflow: hidden;
    padding: 5px;
    border-radius: 12px;
  }

  &__chat {
    width: 65%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  &__dialogs {
    width: 35%;
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
    position: relative;
    
    &--collapsed {
      justify-content: center;
      padding: 8px;
    }
    
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
      position: relative;
      
      .session-item--collapsed & {
        margin-right: 0;
      }
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
    
    &__menu-icon {
      opacity: 0;
      transition: opacity 0.2s;
      margin-left: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .dots-icon {
        font-size: 14px;
      }
      
      &:hover {
        opacity: 1;
      }
    }
    
    &:hover {
      .session-item__menu-icon {
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

    &__unread-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      background-color: #40c4dd;
      color: white;
      border-radius: 10px;
      font-size: 10px;
      font-weight: bold;
      margin-left: 8px;
      padding: 0 6px;
    }

    &__description {
      font-size: 12px;
      color: #666;
    }
  }

  &__chat {
    width: 100%;
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
    padding: 4px;
    border-radius: 6px;
    width: 100%;
    
    &:hover {
      background-color: rgba(#1890ff, 0.05);
    }
    
    &__avatar {
      margin-right: 8px;
      
      .assistant-avatar {
        width: 24px;
        height: 24px;
        min-width: 24px;
        font-size: 12px;
      }
    }
    
    &__info {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    
    &__name {
      font-size: 14px;
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 4px;
      
      .dropdown-icon {
        font-size: 8px;
        color: #999;
        margin-left: 4px;
      }
      
      .status-indicator {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #ff4d4f;
        display: inline-block;
        
        &--active {
          background-color: #52c41a;
        }
      }
    }
    
    &__description {
      font-size: 10px;
      color: #666;
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
    align-items: flex-end;
    padding: 16px;
    border-top: 1px solid rgba(#999, 0.1);
    
    textarea {
      flex: 1;
      padding: 12px 16px;
      border: none;
      border-radius: 20px;
      background-color: #f5f7fa;
      font-family: inherit;
      font-size: 14px;
      min-height: 44px;
      max-height: 150px;
      resize: none;
      overflow-y: auto;
      line-height: 1.5;
      
      &:focus {
        outline: none;
        background-color: #edf1f7;
      }
      
      &::placeholder {
        color: #999;
      }
      
      // Стили для скроллбара
      &::-webkit-scrollbar {
        width: 4px;
      }
      
      &::-webkit-scrollbar-thumb {
        background-color: #c0c0c0;
        border-radius: 2px;
      }
      
      &::-webkit-scrollbar-track {
        background-color: transparent;
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
  padding: 4px 12px;
  text-align: center;
  background-color: #40c4dd;
  border-radius: 6px;
  cursor: pointer;
  color: #ffffff;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  
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

    &__dialogs, 
    &__chat {
      width: 100%;
    }
    
    &__dialogs {
      height: auto;
    }
  }
}

.assistant-unread-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  background-color: #ff4d4f;
  color: white;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
  padding: 0 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  animation: pulse 1.5s infinite;
}

.dialogs-header {
  display: flex;
  align-items: center;
  height: 45px;
  position: relative;
  margin-bottom: 16px;
  gap: 12px;
}

.assistant-selector {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  background-color: rgba(#1890ff, 0.05);
  border: 1px solid rgba(#999, 0.1);
  flex-grow: 1;
  
  &:hover {
    background-color: rgba(#1890ff, 0.1);
  }
  
  &__avatar {
    margin-right: 8px;
    position: relative;
    
    .assistant-avatar {
      width: 28px;
      height: 28px;
      min-width: 28px;
      font-size: 14px;
    }
  }
  
  &__unread-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    background-color: #ff4d4f;
    color: white;
    border-radius: 9px;
    font-size: 10px;
    font-weight: bold;
    padding: 0 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    animation: pulse 1.5s infinite;
  }
  
  &__name {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }
  
  &__dropdown-icon {
    font-size: 10px;
    color: #999;
    margin-left: 4px;
  }
}

.assistant-selector-dropdown {
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
      position: relative;
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
  }
}

.assistant-dialogs-counter {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  background-color: #40c4dd;
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  padding: 0 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  animation: pulse 1.5s infinite;
}

.dialog-dropdown {
  position: absolute;
  right: 8px;
  top: 30px;
  width: 200px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: hidden;
  
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
}

.notification-bell-container {
  position: relative;
}

.notification-bell {
  position: relative;
  cursor: pointer;
  margin-right: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(#1890ff, 0.05);
  border: 1px solid rgba(#999, 0.1);
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(#1890ff, 0.1);
  }
  
  &__icon {
    font-size: 18px;
  }
  
  &.has-notifications &__icon {
    animation: bell-shake 2s infinite;
  }
  
  &__badge {
    position: absolute;
    top: -6px;
    right: -6px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    background-color: #ff4d4f;
    color: white;
    border-radius: 9px;
    font-size: 10px;
    font-weight: bold;
    padding: 0 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    animation: pulse 1.5s infinite;
  }
}

@keyframes bell-shake {
  0% { transform: rotate(0); }
  2% { transform: rotate(10deg); }
  4% { transform: rotate(-10deg); }
  6% { transform: rotate(10deg); }
  8% { transform: rotate(0); }
  100% { transform: rotate(0); }
}

.notifications-dropdown {
  position: absolute;
  top: 45px;
  left: 0;
  width: 300px;
  min-width: 300px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: hidden;
  
  &__header {
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    border-bottom: 1px solid rgba(#999, 0.1);
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
    
    &-avatar {
      margin-right: 12px;
      
      .assistant-avatar {
        width: 30px;
        height: 30px;
        min-width: 30px;
        font-size: 14px;
      }
    }
    
    &-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      min-width: 0; /* Это нужно для корректной работы text-overflow */
    }
    
    &-title {
      font-size: 14px;
      font-weight: 500;
      display: flex;
      justify-content: space-between;
      align-items: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    &-assistant {
      font-size: 12px;
      color: #666;
      display: flex;
      align-items: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      
      &::before {
        content: "👤";
        margin-right: 4px;
        font-size: 10px;
        flex-shrink: 0;
      }
    }
  }
  
  &__empty {
    padding: 16px;
    text-align: center;
    color: #999;
    font-size: 14px;
  }
}
</style>