import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { push } from 'notivue'
import { HELP_CHAT } from '@/constants/websocket'

interface Suggestion {
  suggestID: string
  answer: string
}

interface TextResponse {
  chatID: string
  answer: string
  transferToOperator: boolean
  suggestions: Suggestion[]
}

interface Message {
  text: string
  sender: 'Вы' | 'Поддержка'
  createdAt: string
}

interface SockerResponse {
  chatId: string
  text?: TextResponse
  type: string
  createdAt: string
}

interface HelpChatState {
  socket: WebSocket | null
  userId: string | null
  messages: Message[]
  newMessage: string
  isTyping: boolean
  isWebSocketClosed: boolean
  suggestions: Suggestion[]
  areSuggestionsLoaded: boolean
}

export const useHelpChatStore = defineStore('helpChat', {
  state: (): HelpChatState => ({
    socket: null,
    userId: null,
    messages: [
      {
        text: `Добрый день! Чем могу помочь?`,
        sender: 'Поддержка',
        createdAt: new Date().toISOString(),
      },
    ],
    newMessage: '',
    isTyping: false,
    isWebSocketClosed: false,
    suggestions: [],
    areSuggestionsLoaded: false,
  }),

  actions: {
    connectWebSocket() {
      this.socket = new WebSocket(HELP_CHAT)

      this.isWebSocketClosed = false

      this.socket.onmessage = (event: MessageEvent) => {
        this.isTyping = false

        let response: SockerResponse | null = null

        try {
          response = JSON.parse(event.data)
        } catch (e) {
          push.error('Ошибка при получении сообщения от сервера')
          return
        }

        if (response) {
          const { text, createdAt, type, chatId } = response

          if (type === 'init') {
            return
          }

          this.userId = chatId

          let sender: 'Вы' | 'Поддержка' = 'Поддержка'

          if (type === 'message') sender = 'Поддержка'

          if (text && createdAt) {
            const answer = text.answer || 'Без ответа'
            this.addMessage(answer, sender)
            this.areSuggestionsLoaded = true

            if (text.suggestions && text.suggestions.length > 0) {
              this.suggestions = text.suggestions
            }
          }
        }
      }

      this.socket.onerror = (event: Event) => {
        this.isTyping = false
        this.areSuggestionsLoaded = false

        const errorMessage =
          event instanceof ErrorEvent
            ? event.message
            : 'Проверьте интернет или попробуйте позже'

        push.error(`Ошибка соединения: ${errorMessage}`)
      }

      this.socket.onclose = (event: CloseEvent) => {
        this.isTyping = false
        this.areSuggestionsLoaded = false
        this.isWebSocketClosed = true
        if (this.messages.length > 1) {
          this.messages.push({
            text: 'Чат завершен',
            sender: 'Поддержка',
            createdAt: new Date().toISOString(),
          })
        }
      }
    },

    sendMessage() {
      if (this.newMessage.trim()) {
        this.areSuggestionsLoaded = false

        const messageData = {
          UserID: this.userId,
          OperatorID: 'operator1',
          Text: {
            chatInput: this.newMessage,
            sessionID: this.userId,
          },
          CreatedAt: new Date().toISOString(),
        }

        const messageString = JSON.stringify(messageData)
        this.socket?.send(messageString)
        this.addMessage(this.newMessage, 'Вы')
        this.newMessage = ''

        this.isTyping = true
      }
    },

    addMessage(text: string, sender: 'Вы' | 'Поддержка') {
      const newMessage: Message = {
        text,
        sender,
        createdAt: new Date().toISOString(),
      }

      this.messages.push(newMessage)
    },

    closeWebSocket() {
      if (this.socket) {
        this.socket.close()
        this.isWebSocketClosed = true
      }
    },

    formatDate(date: string): string {
      return dayjs(date).format('DD.MM.YYYY, HH:mm')
    },
  },
})
