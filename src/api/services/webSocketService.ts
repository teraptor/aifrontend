import apiClient from '../apiClient'

// Типы действий
export enum WebSocketAction {
  CreateRoom = 'createRoom',
  CreatedRoom = 'roomCreated',
  JoinRoom = 'joinRoom',
  JoinedRoom = 'joinedRoom',
  SendMessage = 'sendMessage',
  NewMessage = 'newMessage',
  LeaveRoom = 'leaveRoom',
  LeftRoom = 'leftRoom'
}

// Интерфейс запроса
export interface WebSocketRequest {
  action: WebSocketAction;
  workflowId: string;
  roomId?: string;
  userId?: string;
  message?: string;
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
  private reconnectTimeout: number = 5000; // 5 секунд для переподключения
  private isConnecting: boolean = false;

  constructor() {
    this.connect();
  }

  private async connect() {
    if (this.isConnecting) return;
    
    try {
      this.isConnecting = true;
      
      // Используем URL из переменных окружения
      this.ws = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:8088/v1/connection');
      
      this.ws.onopen = () => {
        console.log('WebSocket соединение установлено');
        this.isConnecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const response: WebSocketResponse = JSON.parse(event.data);
          const handlers = this.messageHandlers.get(response.action);
          if (handlers) {
            handlers.forEach(handler => handler(response));
          }
        } catch (error) {
          console.error('Ошибка при обработке WebSocket сообщения:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket ошибка:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = (event) => {
        console.log(`WebSocket соединение закрыто с кодом ${event.code}:`, event.reason);
        this.isConnecting = false;
        
        // Переподключаемся только если соединение было разорвано не намеренно
        if (event.code !== 1000) { // 1000 - нормальное закрытие
          console.log(`Попытка переподключения через ${this.reconnectTimeout}мс...`);
          setTimeout(() => this.connect(), this.reconnectTimeout);
        }
      };
    } catch (error) {
      console.error('Ошибка при подключении к WebSocket:', error);
      this.isConnecting = false;
      setTimeout(() => this.connect(), this.reconnectTimeout);
    }
  }

  public send(request: WebSocketRequest) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(request));
      } catch (error) {
        console.error('Ошибка при отправке WebSocket сообщения:', error);
      }
    } else {
      console.error('WebSocket не подключен, состояние:', this.ws?.readyState);
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

  public disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Нормальное закрытие соединения');
      this.ws = null;
    }
  }
}

export const webSocketService = new WebSocketService();