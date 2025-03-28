<template>
  <div class="assistent-chat">
    <div class="assistent-chat__container">
      <div class="assistent-chat__chat">
        <Chat 
          :selected-assistant="selectedAssistant"
          @create-new-dialog="createNewDialog"
          @clear-chat="clearChat"
        />
      </div>

      <div class="assistent-chat__dialogs" v-if="selectedAssistant">
        <div class="assistent-chat__dialogs-container">
          <div class="dialogs-header">
            <div class="notification-bell-container">
              <div class="notification-bell" :class="{ 'has-notifications': totalUnreadMessages > 0 }" @click="toggleNotificationsMenu" ref="notificationBellTrigger">
                <svg class="notification-bell__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span v-if="totalUnreadMessages > 0" class="notification-bell__badge">{{ totalUnreadMessages }}</span>
              </div>
              
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch, onUnmounted } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useAssistentsStore } from '@/stores/useAssistantsStore'
import { useAssistentChatStore } from '@/stores/useAssistantChatStore'
import type { IAssistent } from '@/stores/useAssistantsStore'
import Chat from '@/components/chat/Chat.vue'
import { webSocketService, WebSocketAction } from '@/api/services/webSocketService'

// Инициализация хранилищ
const assistentsStore = useAssistentsStore()
const chatStore = useAssistentChatStore()

// Локальные переменные для UI
const selectedAssistant = ref<IAssistent | null>(null)
const editingDialogId = ref<string | null>(null)
const editedDialogTitle = ref('')
const editTitleInput = ref<HTMLInputElement | null>(null)
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
    }
  } else {
    // Если нет сессий, создаем новую
    createNewDialog()
  }
}

// Выбор диалога
const selectSession = (sessionId: string) => {
  chatStore.selectSession(sessionId)
  
  // Сохраняем ID активной сессии для текущего ассистента
  if (selectedAssistant.value) {
    localStorage.setItem(`lastSessionId_${selectedAssistant.value.id}`, sessionId)
  }
}

// Создание нового диалога
const createNewDialog = async () => {
  if (!selectedAssistant.value) return
  
  const newSession = await chatStore.createNewSession(selectedAssistant.value.id)
  
  // Сохраняем ID новой сессии как последней активной для этого ассистента
  if (newSession && selectedAssistant.value) {
    localStorage.setItem(`lastSessionId_${selectedAssistant.value.id}`, newSession.id)
  }
}

// Очистка чата
const clearChat = () => {
  if (chatStore.activeSessionId) {
    // Очистка истории чата
    const sessionMessages = chatStore.messages.filter(m => m.sessionId === chatStore.activeSessionId)
    if (sessionMessages.length > 0) {
      // Удаляем все сообщения активной сессии
      chatStore.messages = chatStore.messages.filter(m => m.sessionId !== chatStore.activeSessionId)
    }
  }
}

// Форматирование даты
const formatDate = (dateString: string) => {
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

// Получение общего количества непрочитанных сообщений
const totalUnreadMessages = computed(() => {
  return chatStore.totalUnreadCount;
})

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
</script>

<style lang="scss" scoped>
.assistent-chat {
  width: 100%;
  min-height: 100vh;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  position: relative;
  margin-bottom: 100px;

  &__container {
    width: 100%;
    height: calc(100% - 80px);
    display: flex;
    gap: 16px;
    overflow: hidden;
    padding: 16px;
    box-sizing: border-box;
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

    &-container {
      position: fixed;
      height: 82vh;
      scrollbar-width: none;
      -ms-overflow-style: none;
      width: 20%;
      border-radius: 12px;
    }

    &-container::-webkit-scrollbar {
      display: none;
    }
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
      width: 20px;
      height: 20px;
      color: #666;
    }
    
    &.has-notifications &__icon {
      animation: bell-shake 2s infinite;
      color: #1890ff;
    }
    
    &__badge {
      position: absolute;
      top: -3px;
      right: -8px;
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
        min-width: 0;
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

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
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
}
</style>
