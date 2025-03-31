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
        
        // Устанавливаем состояние загрузки
        this.isLoading = true;
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
        
        // Устанавливаем состояние загрузки
        this.isLoading = true;
        
        const response = await agentService.getConversation(agentId, conversationId);
        
        // Обновляем название диалога, если оно пришло в ответе
        if (response && (response.Name || response.name || response.title)) {
          const session = this.sessions.find(s => s.id === conversationId);
          if (session) {
            session.title = response.Name || response.name || response.title;
          }
        }
        
        // Проверяем, есть ли сообщения в ответе
        if (response?.messages && Array.isArray(response.messages)) {
          try {
            // Преобразуем и валидируем сообщения из API
            const messages = response.messages
              .filter((msg: any) => {
                // Проверяем наличие обязательных полей
                const hasRequiredFields = msg && 
                  (msg.id || msg.ID) && 
                  (msg.content || msg.Content) && 
                  (msg.role || msg.Role) &&
                  (msg.created_at || msg.CreatedAt);
                
                if (!hasRequiredFields) {
                  console.warn('Пропущено невалидное сообщение:', msg);
                }
                return hasRequiredFields;
              })
              .map((msg: any) => ({
                id: msg.id || msg.ID || `${Date.now()}-${Math.random()}`,
                text: msg.content || msg.Content || '',
                isUser: (msg.role || msg.Role)?.toLowerCase() === 'user',
                timestamp: msg.created_at || msg.CreatedAt || new Date().toISOString(),
                sessionId: conversationId
              }))
              .sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          
            // Очищаем существующие сообщения для этой сессии
            this.messages = this.messages.filter(m => m.sessionId !== conversationId);
            
            // Добавляем новые сообщения
            this.messages.push(...messages);
            this.newMessageReceived = true;
          } catch (error) {
            throw new Error('Ошибка при обработке сообщений');
          }
        } else {
          // Очищаем существующие сообщения для этой сессии, так как с сервера пришел пустой список
          this.messages = this.messages.filter(m => m.sessionId !== conversationId);
        }
      } catch (error) {
        throw error;
      } finally {
        // Сбрасываем состояние загрузки в любом случае
        this.isLoading = false;
      }
    },

    // сброс флага нового сообщения
    resetNewMessageFlag() {
      this.newMessageReceived = false;
    },

    // загрузка диалогов ассистента
    async loadDialogs(agentId: string) {
      try {
        const response = await agentService.getDialogs(agentId);
        console.log('loadDialogs: response', response);
        if (response && Array.isArray(response)) {
          // Удаляем старые диалоги этого ассистента
          this.sessions = this.sessions.filter(session => session.agentId !== agentId);
          
          // Добавляем новые диалоги
          const sessions = response.map(dialog => ({
            id: dialog.ID || dialog.id,
            title: dialog.Name || dialog.name || dialog.title || `Диалог ${dialog.ID || dialog.id}`,
            timestamp: dialog.created_at || new Date().toISOString(),
            isActive: false,
            agentId,
            unreadCount: dialog.unread_count || 0
          }));
          this.sessions.push(...sessions);
        }
      } catch (error) {
        console.error(`Ошибка при загрузке диалогов для ассистента ${agentId}:`, error);
      }
    },

    // обновление названия диалога в хранилище
    updateSessionTitle(sessionId: string, newTitle: string) {
      const session = this.sessions.find(s => s.id === sessionId);
      console.log('Обновляем название диалога:', newTitle);
      if (session) {
        session.title = newTitle;
      }
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