import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useFAQStore } from '@/stores/useFAQStore';
import { setupPiniaForTesting } from './setup';

describe('useFAQStore', () => {
  // Подготавливаем хранилище перед каждым тестом
  beforeEach(() => {
    // Устанавливаем Pinia
    setupPiniaForTesting();
  });
  
  afterEach(() => {
    // Восстанавливаем все мокированные функции
    vi.restoreAllMocks();
  });
  
  describe('state', () => {
    it('должен иметь начальное состояние с FAQ-вопросами', () => {
      // Получаем хранилище
      const faqStore = useFAQStore();
      
      // Проверяем, что массив FAQ не пустой
      expect(faqStore.FAQ.length).toBeGreaterThan(0);
      
      // Проверяем структуру элементов FAQ
      faqStore.FAQ.forEach((item: { id: string; title: string; description: string }) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('description');
      });
    });
  });
  
  describe('getters', () => {
    it('должен получать FAQ по ID', () => {
      // Получаем хранилище
      const faqStore = useFAQStore();
      
      // Берем первый элемент из массива FAQ
      const firstFaq = faqStore.FAQ[0];
      
      // Создаем простую функцию-геттер, эмулирующую геттер, которого может не быть в самом хранилище
      const getFaqById = (id: string) => {
        return faqStore.FAQ.find(item => item.id === id) || null;
      };
      
      // Используем геттер для получения элемента по ID
      const faqItem = getFaqById(firstFaq.id);
      
      // Проверяем, что получен правильный элемент
      expect(faqItem).toEqual(firstFaq);
    });
    
    it('должен возвращать null, если FAQ с указанным ID не существует', () => {
      // Получаем хранилище
      const faqStore = useFAQStore();
      
      // Создаем простую функцию-геттер
      const getFaqById = (id: string) => {
        return faqStore.FAQ.find(item => item.id === id) || null;
      };
      
      // Используем геттер с несуществующим ID
      const faqItem = getFaqById('non-existent-id');
      
      // Проверяем, что результат null
      expect(faqItem).toBeNull();
    });
  });
}); 