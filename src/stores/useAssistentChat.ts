import { defineStore } from 'pinia';

export const useAssistentChatStore = defineStore('assistentChat', {
  state: () => ({
    messages: [
      { id: 1, text: 'Привет! Чем я могу помочь?', isUser: false, timestamp: new Date().toISOString() },
      { id: 2, text: 'Расскажи о своих возможностях', isUser: true, timestamp: new Date(Date.now() - 60000).toISOString() },
      { id: 3, text: 'Я могу помочь вам с различными задачами: ответить на вопросы, написать текст, проанализировать данные, помочь с кодом и многое другое. Просто опишите, что вам нужно, и я постараюсь помочь!', isUser: false, timestamp: new Date(Date.now() - 30000).toISOString() }
    ],
    sessions: [
      { 
        id: 'new', 
        title: 'Новое задание/вопрос', 
        timestamp: new Date().toISOString(),
        isActive: true 
      },
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `session-${i + 1}`,
        title: i === 0 ? 'объясни как работает данны...' : 
               i === 1 ? 'объясни как n8n хранит work...' :
               i === 2 ? 'придумай 10 доменных име...' :
               i === 3 ? 'mongo docker compose local...' :
               i === 4 ? 'Дано описание агента. Соста...' :
               i === 5 ? 'объясни коротко что такое б...' :
               i === 6 ? 'Bounded Contexts - объясни ...' :
               i === 7 ? 'задай вопросы по ТЗ: ### Ав...' :
               i === 8 ? 'создай оргструктуру компан...' :
               i === 9 ? 'архитектура битрикс24 марк...' : '',
        timestamp: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
        isActive: false
      }))
    ]
  }),

  actions: {
    addMessage(text: string, isUser: boolean) {
      this.messages.push({
        id: Date.now(),
        text,
        isUser,
        timestamp: new Date().toISOString()
      });
    },

    createNewSession() {
      this.sessions.forEach(session => {
        session.isActive = false;
      });

      const newSession = {
        id: `session-${Date.now()}`,
        title: 'Новое задание/вопрос',
        timestamp: new Date().toISOString(),
        isActive: true
      };

      this.sessions.unshift(newSession);
      this.messages = [
        { id: 1, text: 'Привет! Чем я могу помочь?', isUser: false, timestamp: new Date().toISOString() },
        { id: 2, text: 'Расскажи о своих возможностях', isUser: true, timestamp: new Date(Date.now() - 60000).toISOString() },
        { id: 3, text: 'Я могу помочь вам с различными задачами: ответить на вопросы, написать текст, проанализировать данные, помочь с кодом и многое другое. Просто опишите, что вам нужно, и я постараюсь помочь!', isUser: false, timestamp: new Date(Date.now() - 30000).toISOString() }
      ];
    },

    selectSession(sessionId: string) {
      this.sessions.forEach(session => {
        session.isActive = session.id === sessionId;
      });

      if (sessionId === 'new') {
        this.messages = [
          { id: 1, text: 'Привет! Чем я могу помочь?', isUser: false, timestamp: new Date().toISOString() },
          { id: 2, text: 'Расскажи о своих возможностях', isUser: true, timestamp: new Date(Date.now() - 60000).toISOString() },
          { id: 3, text: 'Я могу помочь вам с различными задачами: ответить на вопросы, написать текст, проанализировать данные, помочь с кодом и многое другое. Просто опишите, что вам нужно, и я постараюсь помочь!', isUser: false, timestamp: new Date(Date.now() - 30000).toISOString() }
        ];
      } else {
        this.messages = [
          { id: 1, text: 'Привет! Чем я могу помочь?', isUser: false, timestamp: new Date().toISOString() },
          { id: 2, text: 'Расскажи о своих возможностях', isUser: true, timestamp: new Date(Date.now() - 60000).toISOString() },
          { id: 3, text: 'Я могу помочь вам с различными задачами: ответить на вопросы, написать текст, проанализировать данные, помочь с кодом и многое другое. Просто опишите, что вам нужно, и я постараюсь помочь!', isUser: false, timestamp: new Date(Date.now() - 30000).toISOString() },
          { id: 4, text: `Это история сессии ${sessionId}`, isUser: false, timestamp: new Date().toISOString() }
        ];
      }
    }
  },

  getters: {
    activeSession: (state) => {
      return state.sessions.find(session => session.isActive);
    },
    lastMessage: (state) => {
      return state.messages[state.messages.length - 1];
    }
  }
});