import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useWebhookChatStore } from '@/stores/useWebhookChatStore';
import { webhookService } from '@/api/services/webhookService';
import { setupPiniaForTesting } from './setup';

// Мокируем модули
vi.mock('@/api/services/webhookService');

describe('useWebhookChatStore', () => {
  // Подготавливаем хранилище перед каждым тестом
  beforeEach(() => {
    // Устанавливаем Pinia
    setupPiniaForTesting();
    
    // Очищаем моки
    vi.clearAllMocks();
    
    // Мокируем текущее время для последовательных тестов
    vi.spyOn(Date.prototype, 'getHours').mockReturnValue(12);
    vi.spyOn(Date.prototype, 'getMinutes').mockReturnValue(30);
  });
  
  afterEach(() => {
    // Очищаем все привязки после каждого теста
    vi.restoreAllMocks();
  });
  
  describe('sendMessage', () => {
    it('должен отправлять сообщение и получать ответ', async () => {
      // Мокируем ответ от сервиса
      const mockResponse = {
        id: 'message1',
        text: 'Это ответ от вебхука'
      };
      
      (webhookService.sendMessage as any).mockResolvedValue(mockResponse);
      
      // Получаем хранилище
      const webhookStore = useWebhookChatStore();
      
      // Выполняем действие
      await webhookStore.sendMessage('hook123', 'Привет!');
      
      // Проверяем, что сервис был вызван с правильными параметрами
      expect(webhookService.sendMessage).toHaveBeenCalledWith('hook123', 'Привет!');
      
      // Проверяем, что сообщения добавлены
      expect(webhookStore.messages.length).toBe(2);
      
      // Проверяем сообщение пользователя
      expect(webhookStore.messages[0].text).toBe('Привет!');
      expect(webhookStore.messages[0].sender).toBe('user');
      expect(webhookStore.messages[0].time).toBe('12:30');
      
      // Проверяем сообщение бота
      expect(webhookStore.messages[1].text).toBe('Это ответ от вебхука');
      expect(webhookStore.messages[1].sender).toBe('bot');
      expect(webhookStore.messages[1].time).toBe('12:30');
      expect(webhookStore.messages[1].id).toBe('message1');
      
      // Проверяем, что состояние загрузки сброшено
      expect(webhookStore.isLoading).toBe(false);
      
      // Проверяем, что ошибок нет
      expect(webhookStore.error).toBeNull();
    });
    
    it('должен обрабатывать ошибки при отправке сообщения', async () => {
      // Создаем ошибку
      const mockError = new Error('Ошибка связи');
      
      // Мокируем ответ от сервиса с ошибкой
      (webhookService.sendMessage as any).mockRejectedValue(mockError);
      
      // Получаем хранилище
      const webhookStore = useWebhookChatStore();
      
      // Выполняем действие
      await webhookStore.sendMessage('hook123', 'Привет!');
      
      // Проверяем, что сервис был вызван с правильными параметрами
      expect(webhookService.sendMessage).toHaveBeenCalledWith('hook123', 'Привет!');
      
      // Проверяем, что сообщения добавлены
      expect(webhookStore.messages.length).toBe(2);
      
      // Проверяем сообщение пользователя
      expect(webhookStore.messages[0].text).toBe('Привет!');
      expect(webhookStore.messages[0].sender).toBe('user');
      
      // Проверяем сообщение об ошибке
      expect(webhookStore.messages[1].text).toContain('Произошла ошибка');
      expect(webhookStore.messages[1].sender).toBe('bot');
      
      // Проверяем, что состояние загрузки сброшено
      expect(webhookStore.isLoading).toBe(false);
      
      // Проверяем, что ошибка установлена
      expect(webhookStore.error).toBe('Не удалось получить ответ');
    });
    
    it('не должен отправлять пустое сообщение', async () => {
      // Получаем хранилище
      const webhookStore = useWebhookChatStore();
      
      // Выполняем действие с пустым сообщением
      await webhookStore.sendMessage('hook123', '   ');
      
      // Проверяем, что сервис не был вызван
      expect(webhookService.sendMessage).not.toHaveBeenCalled();
      
      // Проверяем, что сообщения не добавлены
      expect(webhookStore.messages.length).toBe(0);
    });
  });
  
  describe('addWelcomeMessage', () => {
    it('должен добавлять приветственное сообщение', () => {
      // Получаем хранилище
      const webhookStore = useWebhookChatStore();
      
      // Добавляем некоторые сообщения
      webhookStore.messages = [
        {
          text: 'Старое сообщение',
          sender: 'user',
          time: '12:00'
        }
      ];
      
      // Выполняем действие
      webhookStore.addWelcomeMessage('test-chat');
      
      // Проверяем, что старые сообщения удалены и добавлено приветственное
      expect(webhookStore.messages.length).toBe(1);
      expect(webhookStore.messages[0].text).toBe('Добро пожаловать в чат #test-chat!');
      expect(webhookStore.messages[0].sender).toBe('bot');
      expect(webhookStore.messages[0].time).toBe('12:30');
    });
  });
  
  describe('clearMessages', () => {
    it('должен очищать все сообщения', () => {
      // Получаем хранилище
      const webhookStore = useWebhookChatStore();
      
      // Добавляем некоторые сообщения
      webhookStore.messages = [
        {
          text: 'Сообщение 1',
          sender: 'user',
          time: '12:00'
        },
        {
          text: 'Сообщение 2',
          sender: 'bot',
          time: '12:01'
        }
      ];
      
      // Выполняем действие
      webhookStore.clearMessages();
      
      // Проверяем, что сообщения очищены
      expect(webhookStore.messages.length).toBe(0);
    });
  });
});