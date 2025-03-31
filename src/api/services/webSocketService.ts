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
  LeftRoom = 'leftRoom',
  WelcomeMessage = 'welcomeMessage'
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
  private reconnectTimeout: number = 5000;
  private isConnecting: boolean = false;
  private messageQueue: WebSocketRequest[] = []; // Очередь сообщений
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    console.log('WebSocketService: Инициализация...')
    this.connect();
  }

  private async connect(): Promise<void> {
    if (this.isConnecting) {
      console.log('WebSocketService: Соединение уже устанавливается...')
      return this.connectionPromise!;
    }
    
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.isConnecting = true;
        console.log('WebSocketService: Попытка подключения к', import.meta.env.VITE_WS_URL || 'ws://localhost:8088/v1/connection')
        
        this.ws = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:8088/v1/connection');
        
        this.ws.onopen = () => {
          console.log('WebSocketService: Соединение успешно установлено')
          this.isConnecting = false;
          this.processMessageQueue(); // Обрабатываем очередь после подключения
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const response: WebSocketResponse = JSON.parse(event.data);
            console.log('WebSocketService: Получено сообщение:', response)
            const handlers = this.messageHandlers.get(response.action);
            if (handlers) {
              handlers.forEach(handler => handler(response));
            }
          } catch (error) {
            console.error('WebSocketService: Ошибка при обработке сообщения:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocketService: Ошибка соединения:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log(`WebSocketService: Соединение закрыто с кодом ${event.code}:`, event.reason);
          this.isConnecting = false;
          this.connectionPromise = null;
          
          if (event.code !== 1000) {
            console.log(`WebSocketService: Попытка переподключения через ${this.reconnectTimeout}мс...`);
            setTimeout(() => this.connect(), this.reconnectTimeout);
          }
          reject(new Error('WebSocket closed'));
        };
      } catch (error) {
        console.error('WebSocketService: Ошибка при подключении:', error);
        this.isConnecting = false;
        this.connectionPromise = null;
        setTimeout(() => this.connect(), this.reconnectTimeout);
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private async processMessageQueue() {
    console.log('WebSocketService: Обработка очереди сообщений:', this.messageQueue.length)
    while (this.messageQueue.length > 0) {
      const request = this.messageQueue.shift();
      if (request && this.ws?.readyState === WebSocket.OPEN) {
        try {
          console.log('WebSocketService: Отправка отложенного сообщения:', request)
          this.ws.send(JSON.stringify(request));
        } catch (error) {
          console.error('WebSocketService: Ошибка при отправке отложенного сообщения:', error);
          // Возвращаем сообщение в очередь при ошибке
          this.messageQueue.unshift(request);
          break;
        }
      }
    }
  }

  public async send(request: WebSocketRequest) {
    console.log('WebSocketService: Состояние соединения перед отправкой:', {
      readyState: this.ws?.readyState,
      readyStateText: this.ws ? ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][this.ws.readyState] : 'NO_CONNECTION'
    })

    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        console.log('WebSocketService: Отправка сообщения:', request)
        this.ws.send(JSON.stringify(request));
      } catch (error) {
        console.error('WebSocketService: Ошибка при отправке сообщения:', error);
        this.messageQueue.push(request);
      }
    } else {
      console.log('WebSocketService: Добавление сообщения в очередь:', request);
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

  public disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Нормальное закрытие соединения');
      this.ws = null;
    }
  }
}

export const webSocketService = new WebSocketService();