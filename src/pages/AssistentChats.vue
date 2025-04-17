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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAssistentsStore } from '@/stores/useAssistantsStore'
import { useAssistentChatStore } from '@/stores/useAssistantChatStore'
import type { IAssistent } from '@/stores/useAssistantsStore'
import { webSocketService, WebSocketAction } from '@/api/services/webSocketService'
import Chat from '@/components/chat/Chat.vue'
import Dialogs from '@/components/chat/dialogs/Dialogs.vue'
import PublicChat from '@/components/chat/PublicChat.vue'

// Инициализация хранилищ
const assistentsStore = useAssistentsStore()
const chatStore = useAssistentChatStore()

// Локальные переменные для UI
const selectedAssistant = ref<IAssistent | null>(null)

// Вычисляемые свойства из хранилищ
const assistants = computed(() => assistentsStore.sortedAssistents)


// Выбор ассистента
const selectAssistant = async (assistant: IAssistent, sessionIdToSelect?: string) => {
  selectedAssistant.value = assistant
  localStorage.setItem('selectedAssistantId', assistant.id)
  
  try {
    // Загружаем диалоги ассистента
    await chatStore.loadDialogs(assistant.id)
    
    if (sessionIdToSelect) {
      await selectSession(sessionIdToSelect)
      return
    }
    
    const lastSessionId = localStorage.getItem(`lastSessionId_${assistant.id}`)
    const assistantSessions = chatStore.sessions.filter(s => s.agentId === assistant.id)
    
    if (assistantSessions.length > 0) {
      if (lastSessionId && assistantSessions.some(s => s.id === lastSessionId)) {
        await selectSession(lastSessionId)
      } else {
        await chatStore.selectAssistantActiveSessions(assistant.id)
      }
    } else {
      await createNewDialog()
    }
  } catch (error) {
  }
}

// Выбор диалога
const selectSession = async (sessionId: string) => {
  try {
    await chatStore.selectSession(sessionId)
    
    // Сохраняем ID активной сессии для текущего ассистента
    if (selectedAssistant.value) {
      localStorage.setItem(`lastSessionId_${selectedAssistant.value.id}`, sessionId)
    }
  } catch (error) {
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
  // Используем метод из хранилища для обновления названия
  chatStore.updateSessionTitle(sessionId, newTitle);
}

// Загрузка данных при монтировании
onMounted(async () => {
  try {
    await assistentsStore.getMyAssistents()
    
    const savedAssistantId = localStorage.getItem('selectedAssistantId')
    
    if (assistants.value.length > 0) {
      if (savedAssistantId) {
        const savedAssistant = assistants.value.find(a => a.id === savedAssistantId)
        if (savedAssistant) {
          await selectAssistant(savedAssistant)
        } else {
          await selectAssistant(assistants.value[0])
        }
      } else {
        await selectAssistant(assistants.value[0])
      }
    }
  } catch (error) {
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
  padding: 13px 20px;
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
    width: 74%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}
</style>
