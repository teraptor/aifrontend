import { defineStore } from 'pinia';
import { agentService } from '@/api/services/agentService';
import { notifications } from '@/plugins/notifications';

interface Session {
  id: string;
  title: string;
  timestamp: string;
  isActive: boolean;
  agentId: string;
  unreadCount: number;
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
    lastReceivedMessageSessionId: null as string | null,
    pendingResponses: [] as {sessionId: string, agentId: string}[]
  }),

  actions: {
    // добавление сообщения в диалог
    async addMessage(text: string, isUser: boolean, targetSessionId: string | null = null) {
      const sessionId = targetSessionId || this.activeSessionId;
      if (!sessionId) return;
      
      const session = this.sessions.find(s => s.id === sessionId);
      if (!session) return;
      
      // Создаем сообщение
      const message: Message = {
        id: Date.now().toString(),
        text,
        isUser,
        timestamp: new Date().toISOString(),
        sessionId: sessionId
      };
      
      // Добавляем сообщение в локальный массив
      this.messages.push(message);
      
      // Обновляем счетчик непрочитанных сообщений, если сообщение не от пользователя
      // и это не активный диалог или пользователь переключился на другой диалог
      if (!isUser && sessionId !== this.activeSessionId) {
        session.unreadCount = (session.unreadCount || 0) + 1;
      }
      
      // Сохраняем ID сессии и ID ассистента, куда должен прийти ответ
      if (isUser) {
        this.lastReceivedMessageSessionId = sessionId;
        
        // Добавляем ожидающий ответ в список
        this.pendingResponses.push({
          sessionId: sessionId,
          agentId: session.agentId
        });
      }
      
      // Если это сообщение от пользователя, отправляем его на сервер
      if (isUser) {
        try {
          // Устанавливаем состояние загрузки
          this.isLoading = true;
          
          // Сохраняем ID сессии для ответа в локальной переменной
          const targetSession = sessionId;
          const targetAgentId = session.agentId;
          
          const response = await agentService.addMessageToDialog(
            session.agentId,
            sessionId,
            { message: text }
          );
          
          // Если есть ответ от сервера, добавляем его как сообщение от ассистента
          if (response) {
            // Используем замыкание, чтобы сохранить правильный ID сессии для ответа
            setTimeout(() => {
              console.log('Response from server:', response);
              console.log('Sending response to session:', targetSession);
              
              // Отправляем ответ в тот же диалог, из которого пришло сообщение
              this.addMessage(`${response.Content}`, false, targetSession);
              
              // Удаляем запрос из списка ожидающих ответов
              this.pendingResponses = this.pendingResponses.filter(
                pr => !(pr.sessionId === targetSession && pr.agentId === targetAgentId)
              );
              
              // Сбрасываем состояние загрузки только если нет других ожидающих ответов
              if (this.pendingResponses.length === 0) {
                this.isLoading = false;
              }
            }, 1000);
          }
        } catch (error) {
          // Удаляем запрос из списка ожидающих ответов в случае ошибки
          this.pendingResponses = this.pendingResponses.filter(
            pr => !(pr.sessionId === sessionId && pr.agentId === session.agentId)
          );
          
          // Сбрасываем состояние загрузки в случае ошибки, только если нет других ожидающих ответов
          if (this.pendingResponses.length === 0) {
            this.isLoading = false;
          }
        }
      }

      this.newMessageReceived = true;
      return message;
    },

    // создание нового диалога
    async createNewSession(agentId: string) {
      try {
        const response = await agentService.createDialog(agentId);
        // Создаем новую сессию
        const newSession: Session = {
          id: response.ID || response.id || Date.now().toString(),
          title: `Новый диалог ${this.sessions.length + 1}`,
          timestamp: new Date().toISOString(),
          isActive: true,
          agentId,
          unreadCount: 0
        };
        
        // Добавляем сессию в список
        this.sessions.push(newSession);
        
        // Устанавливаем новую сессию как активную
        this.selectSession(newSession.id);
        
        return newSession;
      } catch (error) {
        throw error;
      }
    },

    // выбор диалога
    selectSession(sessionId: string) {
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
        
        // Сбрасываем счетчик непрочитанных сообщений при открытии диалога
        session.unreadCount = 0;
        
        // Загружаем сообщения диалога, если их нет
        this.loadDialogMessages(session.agentId, sessionId);
      }
    },

    // выбор или переключение на ассистента без сброса счетчика непрочитанных сообщений
    selectAssistantActiveSessions(agentId: string) {
      // Деактивируем все сессии
      this.sessions.forEach(session => {
        session.isActive = false;
      });
      
      // Находим сессии данного ассистента
      const assistantSessions = this.sessions.filter(s => s.agentId === agentId);
      
      // Если есть сессии, выбираем одну из них без сброса счетчика непрочитанных сообщений
      if (assistantSessions.length > 0) {
        // Найдем последнюю активную или последнюю по времени
        const activeSession = assistantSessions.find(s => s.id === this.activeSessionId) || 
                              assistantSessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
        activeSession.isActive = true;
        this.activeSessionId = activeSession.id;
        
        // Загружаем сообщения диалога, если их нет
        this.loadDialogMessages(activeSession.agentId, activeSession.id);
      } else {
        this.activeSessionId = null;
      }
    },

    // загрузка сообщений диалога
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
        // Сбрасываем состояние загрузки в случае ошибки
        this.isLoading = false;
      }
    },

    // сброс флага нового сообщения
    resetNewMessageFlag() {
      this.newMessageReceived = false;
    },

    // Показ уведомления о новом сообщении
    showNewMessageNotification(dialogTitle: string, messageText: string) {
      const shortMessage = messageText.length > 50 
        ? messageText.substring(0, 50) + '...' 
        : messageText;
        
      notifications.info(`Новое сообщение в "${dialogTitle}": ${shortMessage}`);
    }
  },

  getters: {
    // получение активной сессии
    activeSession: (state) => {
      return state.sessions.find(session => session.id === state.activeSessionId);
    },
    
    // получение сообщений активной сессии
    sessionMessages: (state) => {
      return state.messages.filter(message => message.sessionId === state.activeSessionId);
    },

    // получение последнего сообщения активной сессии
    lastMessage: (state) => {
      const sessionMessages = state.messages.filter(message => message.sessionId === state.activeSessionId);
      return sessionMessages.length > 0 ? sessionMessages[sessionMessages.length - 1] : null;
    },
    
    // получение количества непрочитанных сообщений для ассистента
    getUnreadCountByAssistantId: (state) => (assistantId: string) => {
      const assistantSessions = state.sessions.filter(session => session.agentId === assistantId);
      return assistantSessions.reduce((total, session) => total + (session.unreadCount || 0), 0);
    },
    
    // получение общего количества непрочитанных сообщений во всех диалогах
    totalUnreadCount: (state) => {
      return state.sessions.reduce((total, session) => total + (session.unreadCount || 0), 0);
    }
  },
  
  persist: true,
});