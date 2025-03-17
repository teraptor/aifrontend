import { defineStore } from 'pinia';
import { agentService } from '@/api/services/agentService';

interface Session {
  id: string;
  title: string;
  timestamp: string;
  isActive: boolean;
  agentId: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  sessionId: string;
}

export const useAssistentChatStore = defineStore('assistentChat', {
  state: () => ({
    sessions: [] as Session[],
    messages: [] as Message[],
    activeSessionId: null as string | null,
    newMessageReceived: false,
    isLoading: false,
  }),

  actions: {
    async addMessage(text: string, isUser: boolean) {
      if (!this.activeSessionId) return;
      
      const session = this.sessions.find(s => s.id === this.activeSessionId);
      if (!session) return;
      
      // Создаем сообщение
      const message: Message = {
        id: Date.now().toString(),
        text,
        isUser,
        timestamp: new Date().toISOString(),
        sessionId: this.activeSessionId
      };
      
      // Добавляем сообщение в локальный массив
      this.messages.push(message);
      
      // Если это сообщение от пользователя, отправляем его на сервер
      if (isUser) {
        try {
          // Устанавливаем состояние загрузки
          this.isLoading = true;
          
          // Отправляем сообщение через API
          console.log('Sending message to dialog:', session.agentId, this.activeSessionId, text);
          const response = await agentService.addMessageToDialog(
            session.agentId,
            this.activeSessionId,
            { message: text }
          );
          
          // Если есть ответ от сервера, добавляем его как сообщение от ассистента
          if (response) {
            // Здесь можно добавить обработку ответа от сервера
            // Например, если сервер возвращает текст ответа в поле response.text
            // this.addMessage(response.text, false);
            
            // Пока просто добавим заглушку для демонстрации
            setTimeout(() => {
              console.log('Response from server:', response);
              this.addMessage(`${response.Content}`, false);
              // Сбрасываем состояние загрузки
              this.isLoading = false;
            }, 1000);
          }
        } catch (error) {
          console.error('Ошибка при отправке сообщения:', error);
          // Сбрасываем состояние загрузки в случае ошибки
          this.isLoading = false;
        }
      }

      this.newMessageReceived = true;
      return message;
    },

    async createNewSession(agentId: string) {
      try {
        const response = await agentService.createDialog(agentId);
        console.log('New session created:', response);
        // Создаем новую сессию
        const newSession: Session = {
          id: response.ID || response.id || Date.now().toString(),
          title: `Новый диалог ${this.sessions.length + 1}`,
          timestamp: new Date().toISOString(),
          isActive: true,
          agentId
        };
        
        console.log('New session:', newSession);
        // Добавляем сессию в список
        this.sessions.push(newSession);
        
        // Устанавливаем новую сессию как активную
        this.selectSession(newSession.id);
        
        return newSession;
      } catch (error) {
        console.error('Ошибка при создании нового диалога:', error);
        throw error;
      }
    },

    selectSession(sessionId: string) {
      console.log('Selecting session:', sessionId);
      console.log('Sessions:', this.sessions);
      // Сначала деактивируем все сессии
      this.sessions.forEach(session => {
        session.isActive = false;
      });
      
      // Сбрасываем состояние загрузки при переключении диалога
      this.isLoading = false;
      
      // Находим и активируем выбранную сессию
      const session = this.sessions.find(s => s.id === sessionId);
      if (session) {
        session.isActive = true;
        this.activeSessionId = sessionId;
        
        // Загружаем сообщения диалога, если их нет
        this.loadDialogMessages(session.agentId, sessionId);
      }
    },

    async loadDialogMessages(agentId: string, conversationId: string) {
      try {
        // Проверяем, есть ли уже сообщения для этого диалога
        const existingMessages = this.messages.filter(m => m.sessionId === conversationId);
        
        // Если сообщений нет, загружаем их с сервера
        if (existingMessages.length === 0) {
          // Устанавливаем состояние загрузки
          this.isLoading = true;
          
          const response = await agentService.getDialog(agentId, conversationId);
          
          // Проверяем, есть ли сообщения в ответе
          if (response && response.messages && Array.isArray(response.messages)) {
            // Преобразуем сообщения из API в наш формат
            const messages = response.messages.map((msg: any) => ({
              id: msg.id || Date.now().toString() + Math.random().toString(),
              text: msg.content || '',
              isUser: msg.role === 'user',
              timestamp: msg.created_at || new Date().toISOString(),
              sessionId: conversationId
            }));
            
            // Добавляем сообщения в хранилище
            this.messages.push(...messages);
            this.newMessageReceived = true;
          }
          
          // Сбрасываем состояние загрузки
          this.isLoading = false;
        }
      } catch (error) {
        console.error('Ошибка при загрузке сообщений диалога:', error);
        // Сбрасываем состояние загрузки в случае ошибки
        this.isLoading = false;
      }
    },

    resetNewMessageFlag() {
      this.newMessageReceived = false;
    }
  },

  getters: {
    activeSession: (state) => {
      return state.sessions.find(session => session.id === state.activeSessionId);
    },
    
    sessionMessages: (state) => {
      return state.messages.filter(message => message.sessionId === state.activeSessionId);
    },
    
    lastMessage: (state) => {
      const sessionMessages = state.messages.filter(message => message.sessionId === state.activeSessionId);
      return sessionMessages.length > 0 ? sessionMessages[sessionMessages.length - 1] : null;
    }
  },
  
  persist: true,
});