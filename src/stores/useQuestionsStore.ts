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

interface IQuestionsStore {
  messageList: IMessageList[]
}

export const useQuestionsStore = defineStore('questions', {
  state: ():IQuestionsStore => ({
    messageList: [
      {
        id: '1',
        image: avatarImage,
        name: 'Иван1',
        lastMessage: 'Последнее сообщение 1',
        isAnswered: false,
        dateLastMessage: "2024-03-02T18:15:00Z"
      },
      {
        id: '2',
        image: avatarImage,
        name: 'Иван2',
        lastMessage: 'Последнее сообщение 2',
        isAnswered: false,
        dateLastMessage: "2024-03-25T18:15:00Z"
      },
      {
        id: '3',
        image: avatarImage,
        name: 'Иван3',
        lastMessage: 'Последнее сообщение 3',
        isAnswered: true,
        dateLastMessage: "2024-03-08T18:15:00Z"
      },
      {
        id: '4',
        image: avatarImage,
        name: 'Иван4',
        lastMessage: 'Последнее сообщение 4',
        isAnswered: false,
        dateLastMessage: "2024-03-02T18:15:00Z"
      },
      {
        id: '5',
        image: avatarImage,
        name: 'Иван5',
        lastMessage: 'Последнее сообщение 5',
        isAnswered: true,
        dateLastMessage: "2024-03-01T18:15:00Z"
      },
      {
        id: '6',
        image: avatarImage,
        name: 'Иван6',
        lastMessage: 'Последнее сообщение 6',
        isAnswered: false,
        dateLastMessage: "2024-03-04T18:15:00Z"
      }
    ]
  })
})