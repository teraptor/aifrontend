import apiClient from '../apiClient'
import { push } from 'notivue'

// Типы действий
export enum WebSocketAction {
  CreateRoom = 'createRoom',
  CreatedRoom = 'roomCreated',
  JoinRoom = 'joinRoom',
  JoinedRoom = 'joinedRoom',
  SendMessage = 'sendMessage',
  NewMessage = 'newMessage',
  LeaveRoom = 'leaveRoom',
  LeftRoom = 'leftRoom',
  WelcomeMessage = 'welcomeMessage',
  EditMessage = 'editMessage'
}

// Интерфейс запроса
export interface WebSocketRequest {
  action: WebSocketAction;
  workflowId: string;
  roomId?: string;
  userId?: string;
  message?: string;
  editMessageId?: string;
  messageIdsToDelete?: string[];
}

// Интерфейс ответа
export interface WebSocketResponse {
  action: WebSocketAction;
  roomId: string;
  message?: string;
  workflowId?: string;
  userId?: string;
  timestamp?: string;
  success?: boolean;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: Map<WebSocketAction, ((response: WebSocketResponse) => void)[]> = new Map();
  private reconnectTimeout: number = 5000;
  private isConnecting: boolean = false;
  private messageQueue: WebSocketRequest[] = []; // Очередь сообщений
  private connectionPromise: Promise<void> | null = null;
  private reconnectAttempt: number = 0;
  private wasDisconnected: boolean = true; // Флаг для отслеживания предыдущего состояния

  constructor() {
    this.connect();
  }

  private showNotification(type: 'success' | 'error' | 'warning', message: string) {
    // Показываем success только если ранее было отключение
    if (type === 'success' && !this.wasDisconnected) {
      return;
    }
    push[type](message);
  }

  public async connect(): Promise<void> {
    if (this.isConnecting) {
      return this.connectionPromise!;
    }
    
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.isConnecting = true;
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8088/v1/connection';
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempt = 0;
          this.processMessageQueue();
          this.wasDisconnected = false; // Сбрасываем флаг после успешного подключения
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const response: WebSocketResponse = JSON.parse(event.data);
            const handlers = this.messageHandlers.get(response.action);
            if (handlers) {
              handlers.forEach(handler => handler(response));
            }
          } catch (error) {
          }
        };

        this.ws.onerror = (error) => {
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = (event) => {
          this.isConnecting = false;
          this.connectionPromise = null;
          this.wasDisconnected = true; // Устанавливаем флаг при отключении
          
          if (event.code !== 1000) {
            this.reconnectAttempt++;
            const timeout = this.reconnectTimeout * Math.min(this.reconnectAttempt, 3);
            
            // Показываем уведомление только каждую третью попытку
            if (this.reconnectAttempt % 3 === 0) {
              this.showNotification('warning', `Соединение с чатом потеряно. Попытка переподключения ${this.reconnectAttempt}`);
            }
            
            setTimeout(() => this.connect(), timeout);
          }
          reject(new Error('WebSocket closed'));
        };
      } catch (error) {
        this.isConnecting = false;
        this.connectionPromise = null;
        
        const timeout = this.reconnectTimeout * Math.min(this.reconnectAttempt, 3);
        setTimeout(() => this.connect(), timeout);
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private async processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const request = this.messageQueue.shift();
      if (request && this.ws?.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify(request));
        } catch (error) {
          // Возвращаем сообщение в очередь при ошибке
          this.messageQueue.unshift(request);
          break;
        }
      }
    }
  }

  public async send(request: WebSocketRequest) {

    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(request));
      } catch (error) {
        this.messageQueue.push(request);
      }
    } else {
      this.messageQueue.push(request);
      await this.connect();
    }
  }

  public subscribe(action: WebSocketAction, handler: (response: WebSocketResponse) => void) {
    if (!this.messageHandlers.has(action)) {
      this.messageHandlers.set(action, []);
    }
    this.messageHandlers.get(action)?.push(handler);
  }

  public unsubscribe(action: WebSocketAction, handler: (response: WebSocketResponse) => void) {
    const handlers = this.messageHandlers.get(action);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Нормальное закрытие соединения');
      this.ws = null;
    }
  }
}

export const webSocketService = new WebSocketService();