import { defineStore } from "pinia";
import avatarImage from '@/assets/cl1_45.png';

export interface IMessageList {
  id: string;
  image: string;
  name: string;
  lastMessage: string;
  isAnswered: boolean;
  dateLastMessage: string;
}

export interface IMessageDetail {
  id: string;
  assistantName?: string;
  assistanImage?: string;
  messages: {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    timestamp: string;
  }[];
}

export type FilterOption = 'all' | 'answered' | 'unanswered';

interface IQuestionsStore {
  messageList: IMessageList[];
  messageDetail: IMessageDetail[];
  activeFilter: FilterOption;
}

export const useQuestionsStore = defineStore('questions', {
  state: (): IQuestionsStore => ({
    messageList: [
      {
        id: '1',
        image: avatarImage,
        name: 'Иван1',
        lastMessage: 'Последнее сообщение 1',
        isAnswered: false,
        dateLastMessage: "2024-03-02T18:15:00Z",
      },
      {
        id: '2',
        image: avatarImage,
        name: 'Иван2',
        lastMessage: 'Последнее сообщение 2',
        isAnswered: false,
        dateLastMessage: "2024-03-25T18:15:00Z",
      },
      {
        id: '3',
        image: avatarImage,
        name: 'Иван3',
        lastMessage: 'Последнее сообщение 3',
        isAnswered: true,
        dateLastMessage: "2024-03-08T18:15:00Z",
      },
      {
        id: '4',
        image: avatarImage,
        name: 'Иван4',
        lastMessage: 'Последнее сообщение 4',
        isAnswered: false,
        dateLastMessage: "2024-03-02T18:15:00Z",
      },
      {
        id: '5',
        image: avatarImage,
        name: 'Иван5',
        lastMessage: 'Последнее сообщение 5',
        isAnswered: true,
        dateLastMessage: "2024-03-01T18:15:00Z",
      },
      {
        id: '6',
        image: avatarImage,
        name: 'Иван6',
        lastMessage: 'Последнее сообщение 6',
        isAnswered: false,
        dateLastMessage: "2024-03-04T18:15:00Z",
      },
    ],
    messageDetail: [
      {
        id: '1',
        messages: [
          {
            id: '1-1',
            sender: 'user',
            text: 'Привет, как дела?1',
            timestamp: "2024-03-02T18:15:00Z",
          },
          {
            id: '1-2',
            sender: 'assistant',
            text: 'Привет! Все отлично, спасибо!1',
            timestamp: "2024-03-02T18:16:00Z",
          },
        ],
      },
      {
        id: '2',
        messages: [
          {
            id: '2-1',
            sender: 'user',
            text: 'Привет, как дела?2',
            timestamp: "2024-03-02T18:15:00Z",
          },
          {
            id: '2-2',
            sender: 'assistant',
            text: 'Привет! Все отлично, спасибо!2',
            timestamp: "2024-03-02T18:16:00Z",
          },
          {
            id: '2-1',
            sender: 'user',
            text: 'Привет, как дела?2',
            timestamp: "2024-03-02T18:15:00Z",
          },
          {
            id: '2-2',
            sender: 'assistant',
            text: 'Привет! Все отлично, спасибо!2',
            timestamp: "2024-03-02T18:16:00Z",
          },
          {
            id: '2-1',
            sender: 'user',
            text: 'Привет, как дела?2',
            timestamp: "2024-03-02T18:15:00Z",
          },
          {
            id: '2-2',
            sender: 'assistant',
            text: 'Привет! Все отлично, спасибо!2',
            timestamp: "2024-03-02T18:16:00Z",
          },
        ],
      },
      {
        id: '3',
        messages: [
          {
            id: '3-1',
            sender: 'user',
            text: 'Привет, как дела?3',
            timestamp: "2024-03-02T18:15:00Z",
          },
          {
            id: '3-2',
            sender: 'assistant',
            text: 'Привет! Все отлично, спасибо!3',
            timestamp: "2024-03-02T18:16:00Z",
          },
        ],
      },
      {
        id: '4',
        messages: [
          {
            id: '4-1',
            sender: 'user',
            text: 'Привет, как дела?4',
            timestamp: "2024-03-02T18:15:00Z",
          },
          {
            id: '4-2',
            sender: 'assistant',
            text: 'Привет! Все отлично, спасибо!4',
            timestamp: "2024-03-02T18:16:00Z",
          },
        ],
      },
      {
        id: '5',
        messages: [
          {
            id: '5-1',
            sender: 'user',
            text: 'Привет, как дела?5',
            timestamp: "2024-03-02T18:15:00Z",
          },
          {
            id: '5-2',
            sender: 'assistant',
            text: 'Привет! Все отлично, спасибо!5',
            timestamp: "2024-03-02T18:16:00Z",
          },
        ],
      },
      {
        id: '6',
        messages: [
          {
            id: '6-1',
            sender: 'user',
            text: 'Привет, как дела?6',
            timestamp: "2024-03-02T18:15:00Z",
          },
          {
            id: '6-2',
            sender: 'assistant',
            text: 'Привет! Все отлично, спасибо!6',
            timestamp: "2024-03-02T18:16:00Z",
          },
        ],
      },
    ],
    activeFilter: 'all',
  }),
  actions: {
    setActiveFilter(filter: FilterOption) {
      this.activeFilter = filter;
    },

    addMessage(messageId: string, sender: 'user' | 'assistant', text: string) {
      const detail = this.messageDetail.find((item) => item.id === messageId);
      if (detail) {
        detail.messages.push({
          id: `${messageId}-${detail.messages.length + 1}`,
          sender,
          text,
          timestamp: new Date().toISOString(),
        });
      }
    },
  },
  getters: {
    filteredQuestions(state): IMessageList[] {
      const filterMap: Record<FilterOption, (item: IMessageList) => boolean> = {
        all: () => true,
        answered: (item) => item.isAnswered,
        unanswered: (item) => !item.isAnswered,
      };

      return state.messageList.filter(filterMap[state.activeFilter]);
    },

    getMessageDetailById: (state) => (id: string) => {
      return state.messageDetail.find((item) => item.id === id);
    },

    getMessageDetailWithName: (state) => (id: string) => {
      const detail = state.messageDetail.find((item) => item.id === id);
      const message = state.messageList.find((item) => item.id === id);

      if (detail && message) {
        return {
          ...detail,
          assistantName: message.name,
          assistanImage: message.image
        };
      }

      return null;
    },
  },
});