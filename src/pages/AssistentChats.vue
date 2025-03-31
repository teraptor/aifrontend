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

      <Dialogs
        :selected-assistant="selectedAssistant"
        :assistants="assistants"
        :sessions="chatStore.sessions"
        :active-session-id="chatStore.activeSessionId"
        :total-unread-messages="chatStore.totalUnreadCount"
        @select-assistant="selectAssistant"
        @select-session="selectSession"
        @create-new-dialog="createNewDialog"
        @delete-dialog="deleteDialog"
        @update-session-title="updateSessionTitle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAssistentsStore } from '@/stores/useAssistantsStore'
import { useAssistentChatStore } from '@/stores/useAssistantChatStore'
import type { IAssistent } from '@/stores/useAssistantsStore'
import Chat from '@/components/chat/Chat.vue'
import Dialogs from '@/components/chat/Dialogs.vue'

// Инициализация хранилищ
const assistentsStore = useAssistentsStore()
const chatStore = useAssistentChatStore()

// Локальные переменные для UI
const selectedAssistant = ref<IAssistent | null>(null)

// Вычисляемые свойства из хранилищ
const assistants = computed(() => assistentsStore.sortedAssistents)

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
      const otherSessions = chatStore.sessions.filter(s => s.agentId === selectedAssistant.value?.id)
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
  }
}

// Обновление названия диалога
const updateSessionTitle = (sessionId: string, newTitle: string) => {
  const session = chatStore.sessions.find(s => s.id === sessionId)
  if (session) {
    session.title = newTitle
  }
}

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
}
</style>
