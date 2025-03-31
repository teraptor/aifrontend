<template>
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
          :class="['session-item', { 'session-item--active': activeSessionId === session.id }]"
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
    <div class="dialog-confirmation" v-if="showConfirmation">
      <div class="dialog-confirmation__overlay"></div>
      <div class="dialog-confirmation__content">
        <div class="dialog-confirmation__title">{{ confirmationTitle }}</div>
        <div class="dialog-confirmation__message">{{ confirmationMessage }}</div>
        <div class="dialog-confirmation__actions">
          <button class="dialog-confirmation__button dialog-confirmation__button--cancel" @click="handleCancel">
            Отмена
          </button>
          <button class="dialog-confirmation__button dialog-confirmation__button--confirm" @click="handleConfirm">
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import type { IAssistent } from '@/stores/useAssistantsStore'
import { useAssistentChatStore } from '@/stores/useAssistantChatStore'
import { agentService } from '@/api/services/agentService'

const props = defineProps<{
  selectedAssistant: IAssistent | null
  assistants: IAssistent[]
  sessions: any[]
  activeSessionId: string | null
  totalUnreadMessages: number
}>()

const emit = defineEmits<{
  (e: 'select-assistant', assistant: IAssistent): void
  (e: 'select-session', sessionId: string): void
  (e: 'create-new-dialog'): void
  (e: 'delete-dialog', session: any): void
  (e: 'update-session-title', sessionId: string, newTitle: string): void
}>()

const assistantChatStore = useAssistentChatStore()

// Локальные переменные для UI
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
const showConfirmation = ref(false)
const confirmationTitle = ref('')
const confirmationMessage = ref('')
let confirmCallback: (() => void) | null = null
let cancelCallback: (() => void) | null = null

// Сортированные диалоги выбранного ассистента
const sortedSessions = computed(() => {
  if (!props.selectedAssistant) return []
  
  return props.sessions
    .filter(s => s.agentId === props.selectedAssistant!.id)
    .sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
})

// Выпадающий список непрочитанных диалогов
const unreadDialogs = computed(() => {
  return props.sessions.filter(s => s.unreadCount > 0)
})

// Получение ассистента по ID
const getAssistantById = (assistantId: string) => {
  return props.assistants.find(a => a.id === assistantId)
}

// Получение количества непрочитанных сообщений для конкретного ассистента
const getAssistantUnreadCount = (assistantId: string) => {
  const assistantSessions = props.sessions.filter(s => s.agentId === assistantId)
  return assistantSessions.reduce((count, session) => count + session.unreadCount, 0)
}

// Переход к непрочитанному диалогу
const goToUnreadDialog = (dialog: any) => {
  const assistantId = dialog.agentId
  const targetAssistant = props.assistants.find(a => a.id === assistantId)
  
  if (targetAssistant && targetAssistant.id !== props.selectedAssistant?.id) {
    emit('select-assistant', targetAssistant)
  }
  emit('select-session', dialog.id)
  isNotificationsMenuOpen.value = false
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
  
  dialogMenuOpen.value = null
  
  nextTick(() => {
    if (editTitleInput.value) {
      editTitleInput.value.focus()
    }
  })
}

// Сохранить отредактированное название диалога
const saveDialogTitle = async () => {
  if (editingDialogId.value && editedDialogTitle.value.trim() && props.selectedAssistant) {
    try {
      const response = await agentService.updateDialogName(
        props.selectedAssistant.id,
        editingDialogId.value,
        editedDialogTitle.value.trim()
      );
      
      
      // Получаем название из ответа
      let newTitle = editedDialogTitle.value.trim();
      
      // Если в ответе есть поле Name, используем его
      if (response && response.dialogName) {
        newTitle = response.dialogName;
      }
      // Также проверяем поле name (с маленькой буквы)
      else if (response && response.name) {
        newTitle = response.name;
      }
      
      console.log('Итоговое название:', newTitle);
      // Обновляем название в хранилище
      assistantChatStore.updateSessionTitle(editingDialogId.value, newTitle);
      
      // Также отправляем событие в родительский компонент для обратной совместимости
      emit('update-session-title', editingDialogId.value, newTitle);
      
      // Если после этого название в UI не обновилось, принудительно обновим текущую сессию
      if (props.selectedAssistant) {
        // Перезагрузим диалоги для текущего ассистента
        setTimeout(() => {
          assistantChatStore.loadDialogs(props.selectedAssistant!.id);
        }, 100);
      }
    } catch (error) {
      console.error('Ошибка при обновлении названия диалога:', error);
    }
  }
  
  // Очищаем состояние редактирования
  editingDialogId.value = null;
}

// Отменить редактирование названия диалога
const cancelEditingTitle = () => {
  editingDialogId.value = null
}

// Переключение меню диалога
const toggleDialogMenu = (session: any, event?: Event) => {
  event?.stopPropagation()
  
  if (dialogMenuOpen.value === session.id) {
    dialogMenuOpen.value = null
  } else {
    dialogMenuOpen.value = session.id
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

// Добавляем watch для selectedAssistant
watch(() => props.selectedAssistant, async (newAssistant) => {
  if (newAssistant) {
    await assistantChatStore.loadDialogs(newAssistant.id)
  }
}, { immediate: true })

// Добавляем загрузку диалогов при монтировании компонента
onMounted(async () => {
  document.addEventListener('click', (event) => {
    const clickedElement = event.target as HTMLElement
    
    if (!clickedElement.closest('.dialog-dropdown') && !clickedElement.closest('.session-item__menu-icon')) {
      dialogMenuOpen.value = null
    }
  })

  // Загружаем диалоги при монтировании, если есть выбранный ассистент
  if (props.selectedAssistant) {
    await assistantChatStore.loadDialogs(props.selectedAssistant.id)
  }

  window.addEventListener('show-confirmation', ((event: CustomEvent) => {
    showConfirmation.value = true
    confirmationTitle.value = event.detail.title
    confirmationMessage.value = event.detail.message
    confirmCallback = event.detail.onConfirm
    cancelCallback = event.detail.onCancel
  }) as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('show-confirmation', (() => {}) as EventListener)
})

// Добавляем недостающие методы
const selectAssistant = async (assistant: IAssistent) => {
  emit('select-assistant', assistant)
  // Загружаем диалоги для выбранного ассистента
  await assistantChatStore.loadDialogs(assistant.id)
}

const createNewDialog = () => {
  emit('create-new-dialog')
}

const selectSession = (sessionId: string) => {
  emit('select-session', sessionId)
}

const deleteDialog = (session: any) => {
  // Создаем кастомное событие для подтверждения удаления
  const event = new CustomEvent('show-confirmation', {
    detail: {
      title: 'Подтвердите действие на localhost:5173',
      message: 'Вы уверены, что хотите удалить этот диалог?',
      onConfirm: async () => {
        try {
          await agentService.deleteDialog(session.agentId, session.id);
          emit('delete-dialog', session);
          dialogMenuOpen.value = null;
          
          // Перезагружаем список диалогов после успешного удаления
          if (props.selectedAssistant) {
            await assistantChatStore.loadDialogs(props.selectedAssistant.id);
          }
        } catch (error) {
          console.error('Ошибка при удалении диалога:', error);
          // Здесь можно добавить показ уведомления об ошибке
        }
      },
      onCancel: () => {
        dialogMenuOpen.value = null;
      }
    }
  });
  window.dispatchEvent(event);
}

const handleConfirm = () => {
  if (confirmCallback) {
    confirmCallback()
  }
  showConfirmation.value = false
}

const handleCancel = () => {
  if (cancelCallback) {
    cancelCallback()
  }
  showConfirmation.value = false
}
</script>

<style lang="scss" scoped>
.assistent-chat__dialogs {
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
    border-radius: 8px;
    background: #fff;
    border: 1px solid #eaeaea;
  }

  &-container::-webkit-scrollbar {
    display: none;
  }
}

.assistent-chat__session-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  background-color: #ffffff;
}

.session-item {
  width: 100%;
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f5f5f5;
  
  &:hover {
    background-color: #fafafa;
  }
  
  &--active {
    background-color: #f0f7ff;
    border-left: 2px solid #40c4dd;
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
    padding: 4px;
    border-radius: 4px;
    
    .dots-icon {
      font-size: 14px;
      color: #666;
    }
    
    &:hover {
      opacity: 1;
      background-color: #f5f5f5;
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
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
    margin-left: 8px;
    padding: 0 6px;
  }
}

.assistant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #40c4dd;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 18px;
}

.new-dialog-button {
  padding: 8px 16px;
  text-align: center;
  background-color: #40c4dd;
  border-radius: 4px;
  cursor: pointer;
  color: #ffffff;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.2s;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  
  &:hover {
    background-color: #33b5ce;
  }
}

.dialogs-header {
  display: flex;
  align-items: center;
  height: 45px;
  position: relative;
  margin-bottom: 16px;
  gap: 12px;
  padding: 0 16px;
  border-bottom: 1px solid #eaeaea;
}

.assistant-selector {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #f5f5f5;
  flex-grow: 1;
  border: 1px solid transparent;
  
  &:hover {
    border-color: #eaeaea;
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
  top: calc(100% + 4px);
  left: 16px;
  width: calc(100% - 32px);
  background-color: #ffffff;
  border-radius: 4px;
  border: 1px solid #eaeaea;
  z-index: 100;
  overflow: hidden;
  
  &__header {
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    border-bottom: 1px solid #eaeaea;
    background-color: #fafafa;
  }
  
  &__list {
    // max-height: 300px;
  }
  
  &__item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid #f5f5f5;
    
    &:hover {
      background-color: #fafafa;
    }
    
    &--active {
      background-color: #f0f7ff;
      border-left: 2px solid #40c4dd;
    }
    
    &-avatar {
      margin-right: 12px;
      position: relative;
    }
    
    &-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    &-name {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }
    
    &-description {
      font-size: 13px;
      color: #666;
    }
  }
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
  background-color: #f5f5f5;
  border-radius: 4px;
  transition: all 0.2s;
  border: 1px solid transparent;
  
  &:hover {
    border-color: #eaeaea;
  }
  
  &__icon {
    width: 20px;
    height: 20px;
    color: #666;
  }
  
  &.has-notifications &__icon {
    animation: bell-shake 2s infinite;
    color: #40c4dd;
  }
  
  &__badge {
    position: absolute;
    top: -3px;
    right: -3px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    background-color: #ff4d4f;
    color: white;
    border-radius: 2px;
    font-size: 10px;
    font-weight: 500;
    padding: 0 4px;
  }
}

.notifications-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 300px;
  background-color: #ffffff;
  border-radius: 4px;
  border: 1px solid #eaeaea;
  z-index: 100;
  overflow: hidden;
  
  &__header {
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    border-bottom: 1px solid #eaeaea;
    background-color: #fafafa;
  }
  
  &__list {
    max-height: 300px;
    // overflow-y: auto;
  }
  
  &__item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid #f5f5f5;
    
    &:hover {
      background-color: #fafafa;
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
      gap: 4px;
      flex: 1;
      min-width: 0;
    }
    
    &-title {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    &-assistant {
      font-size: 13px;
      color: #666;
      display: flex;
      align-items: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      
      &::before {
        content: "👤";
        margin-right: 4px;
        font-size: 12px;
      }
    }
  }
  
  &__empty {
    padding: 16px;
    text-align: center;
    color: #999;
    font-size: 14px;
    background-color: #fafafa;
  }
}

.dialog-dropdown {
  position: absolute;
  right: 16px;
  top: 100%;
  width: 200px;
  background-color: #ffffff;
  border-radius: 4px;
  border: 1px solid #eaeaea;
  z-index: 100;
  overflow: hidden;
  
  &__action {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid #f5f5f5;
    
    &:hover {
      background-color: #fafafa;
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
      color: #333;
    }

    &:last-child {
      border-bottom: none;
    }
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

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.dialog-confirmation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }

  &__content {
    position: relative;
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-width: 400px;
    width: 90%;
  }

  &__title {
    font-size: 18px;
    font-weight: 500;
    color: #333;
    margin-bottom: 16px;
  }

  &__message {
    font-size: 14px;
    color: #666;
    margin-bottom: 24px;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  &__button {
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &--cancel {
      background-color: #f5f5f5;
      color: #666;
      border: 1px solid #eaeaea;

      &:hover {
        background-color: #eaeaea;
      }
    }

    &--confirm {
      background-color: #40c4dd;
      color: white;
      border: none;

      &:hover {
        background-color: #33b5ce;
      }
    }
  }
}
</style>

