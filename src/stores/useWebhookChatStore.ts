import { defineStore } from 'pinia'
import { ref } from 'vue'
import { webhookService } from '@/api/services/webhookService'

interface Message {
  id?: string
  text: string
  sender: 'user' | 'bot'
  time: string
}

export const useWebhookChatStore = defineStore('webhookChat', () => {
  const messages = ref<Message[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  function getCurrentTime(): string {
    const now = new Date()
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
  }

  async function sendMessage(hookId: string, text: string) {
    if (!text.trim()) return
    
    // Добавляем сообщение пользователя в список
    const userMessage: Message = {
      text,
      sender: 'user',
      time: getCurrentTime()
    }
    messages.value.push(userMessage)
    
    // Запрос к API
    isLoading.value = true
    error.value = null
    
    try {
      const response = await webhookService.sendMessage(hookId, text)
      
      // Добавляем ответ от бота
      const botMessage: Message = {
        id: response.id,
        text: response.text,
        sender: 'bot',
        time: getCurrentTime()
      }
      
      messages.value.push(botMessage)
    } catch (err) {
      console.error('Ошибка при отправке сообщения:', err)
      error.value = 'Не удалось получить ответ'
      
      // Добавляем сообщение об ошибке
      messages.value.push({
        text: 'Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте позже.',
        sender: 'bot',
        time: getCurrentTime()
      })
    } finally {
      isLoading.value = false
    }
  }

  function addWelcomeMessage(chatId: string) {
    messages.value = [{
      text: `Добро пожаловать в чат #${chatId}!`,
      sender: 'bot',
      time: getCurrentTime()
    }]
  }

  function clearMessages() {
    messages.value = []
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    addWelcomeMessage,
    clearMessages
  }
}) 