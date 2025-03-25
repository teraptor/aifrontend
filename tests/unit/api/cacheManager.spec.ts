import { CacheManager } from '@/api/cacheManager';

describe('CacheManager', () => {
  beforeEach(() => {
    // Очищаем кэш перед каждым тестом
    CacheManager.clear();
  });

  describe('get', () => {
    it('должен возвращать null для отсутствующего ключа', () => {
      expect(CacheManager.get('non-existent-key')).toBeNull();
    });

    it('должен возвращать значение для существующего ключа', () => {
      const testData = { test: 'data' };
      CacheManager.set('test-key', testData);
      expect(CacheManager.get('test-key')).toEqual(testData);
    });
  });

  describe('set и delete', () => {
    it('должен устанавливать и удалять значения', () => {
      const testData = { test: 'data' };
      
      // Устанавливаем значение
      CacheManager.set('test-key', testData);
      expect(CacheManager.get('test-key')).toEqual(testData);
      
      // Удаляем значение
      CacheManager.delete('test-key');
      expect(CacheManager.get('test-key')).toBeNull();
    });
  });

  describe('isFresh', () => {
    it('должен проверять актуальность данных', () => {
      const testData = { test: 'data' };
      
      // Устанавливаем данные
      CacheManager.set('test-key', testData);
      
      // Проверяем свежесть с большим TTL - данные должны быть свежими
      expect(CacheManager.isFresh('test-key', 10000)).toBe(true);
      
      // Проверяем с малым TTL - данные должны быть устаревшими после задержки
      jest.advanceTimersByTime(100);
      expect(CacheManager.isFresh('test-key', 50)).toBe(false);
    });
  });

  describe('getOrFetch', () => {
    it('должен возвращать кэшированные данные, если они свежие', async () => {
      const testData = { test: 'data' };
      const fetchFn = jest.fn().mockResolvedValue({ test: 'new-data' });
      
      // Устанавливаем данные в кэш
      CacheManager.set('test-key', testData);
      
      // Запрашиваем данные с большим TTL
      const result = await CacheManager.getOrFetch('test-key', fetchFn, { ttl: 10000 });
      
      // Ожидаем, что вернутся кэшированные данные
      expect(result).toEqual(testData);
      
      // Проверяем, что fetchFn не вызывался
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('должен запрашивать новые данные, если кэш устарел', async () => {
      const testData = { test: 'data' };
      const newData = { test: 'new-data' };
      const fetchFn = jest.fn().mockResolvedValue(newData);
      
      // Устанавливаем данные в кэш
      CacheManager.set('test-key', testData);
      
      // Запрашиваем данные с маленьким TTL
      const result = await CacheManager.getOrFetch('test-key', fetchFn, { ttl: 0 });
      
      // Ожидаем, что вернутся новые данные
      expect(result).toEqual(newData);
      
      // Проверяем, что fetchFn вызывался
      expect(fetchFn).toHaveBeenCalled();
    });

    it('должен возвращать устаревшие данные и обновлять кэш при staleWhileRevalidate', async () => {
      const testData = { test: 'data' };
      const newData = { test: 'new-data' };
      const fetchFn = jest.fn().mockResolvedValue(newData);
      
      // Устанавливаем данные в кэш
      CacheManager.set('test-key', testData);
      
      // Запрашиваем данные с маленьким TTL и staleWhileRevalidate
      const result = await CacheManager.getOrFetch('test-key', fetchFn, { 
        ttl: 0, 
        staleWhileRevalidate: true 
      });
      
      // Ожидаем, что вернутся старые данные
      expect(result).toEqual(testData);
      
      // Проверяем, что fetchFn вызывался
      expect(fetchFn).toHaveBeenCalled();
      
      // После обновления кэша, данные должны измениться
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(CacheManager.get('test-key')).toEqual(newData);
    });
  });
}); 