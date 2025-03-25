import { jest } from '@jest/globals';
import { CacheManager } from '@/api/cacheManager';

interface TestData {
  test: string;
}

describe('CacheManager', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Очищаем кэш перед каждым тестом
    CacheManager.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('get', () => {
    it('должен возвращать null для отсутствующего ключа', () => {
      expect(CacheManager.get<TestData>('non-existent')).toBeNull();
    });

    it('должен возвращать сохраненные данные', () => {
      const testData: TestData = { test: 'data' };
      CacheManager.set<TestData>('test-key', testData);
      expect(CacheManager.get<TestData>('test-key')).toEqual(testData);
    });
  });

  describe('set и delete', () => {
    it('должен устанавливать и удалять значения', () => {
      const testData: TestData = { test: 'data' };
      
      // Устанавливаем значение
      CacheManager.set<TestData>('test-key', testData);
      expect(CacheManager.get<TestData>('test-key')).toEqual(testData);
      
      // Удаляем значение
      CacheManager.delete('test-key');
      expect(CacheManager.get<TestData>('test-key')).toBeNull();
    });
  });

  describe('isFresh', () => {
    it('должен проверять актуальность данных', () => {
      const testData: TestData = { test: 'data' };
      CacheManager.set<TestData>('test-key', testData);

      // Проверяем с большим TTL - данные должны быть свежими
      expect(CacheManager.isFresh('test-key', 1000)).toBe(true);

      // Проверяем с малым TTL - данные должны быть устаревшими после задержки
      jest.advanceTimersByTime(100);
      expect(CacheManager.isFresh('test-key', 50)).toBe(false);
    });
  });

  describe('getOrFetch', () => {
    it('должен запрашивать новые данные, если кэш пуст', async () => {
      const testData: TestData = { test: 'data' };
      const fetchFn = jest.fn<() => Promise<TestData>>().mockImplementation(
        () => Promise.resolve(testData)
      );

      const result = await CacheManager.getOrFetch<TestData>('test-key', fetchFn, 1000);
      expect(result).toEqual(testData);
      expect(fetchFn).toHaveBeenCalled();
    });

    it('должен возвращать данные из кэша, если они свежие', async () => {
      const testData: TestData = { test: 'data' };
      const newData: TestData = { test: 'new-data' };
      const fetchFn = jest.fn<() => Promise<TestData>>().mockImplementation(
        () => Promise.resolve(newData)
      );

      // Устанавливаем данные в кэш
      CacheManager.set<TestData>('test-key', testData);

      const result = await CacheManager.getOrFetch<TestData>('test-key', fetchFn, 1000);
      expect(result).toEqual(testData);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('должен запрашивать новые данные, если кэш устарел', async () => {
      const testData: TestData = { test: 'data' };
      const newData: TestData = { test: 'new-data' };
      const fetchFn = jest.fn<() => Promise<TestData>>().mockImplementation(
        () => Promise.resolve(newData)
      );

      // Устанавливаем данные в кэш
      CacheManager.set<TestData>('test-key', testData);

      // Продвигаем время вперед
      jest.advanceTimersByTime(1100);

      const result = await CacheManager.getOrFetch<TestData>('test-key', fetchFn, 1000);
      expect(result).toEqual(newData);
      expect(fetchFn).toHaveBeenCalled();
    });

    it('должен возвращать устаревшие данные и обновлять кэш при staleWhileRevalidate', async () => {
      const testData: TestData = { test: 'data' };
      const newData: TestData = { test: 'new-data' };
      const fetchFn = jest.fn<() => Promise<TestData>>().mockImplementation(
        () => Promise.resolve(newData)
      );

      // Устанавливаем данные в кэш
      CacheManager.set<TestData>('test-key', testData);

      // Продвигаем время вперед
      jest.advanceTimersByTime(1100);

      const result = await CacheManager.getOrFetch<TestData>('test-key', fetchFn, 1000, true);
      expect(result).toEqual(testData);
      expect(fetchFn).toHaveBeenCalled();

      // Проверяем, что кэш обновился
      await Promise.resolve(); // Ждем выполнения промиса
      expect(CacheManager.get<TestData>('test-key')).toEqual(newData);
    });
  });
}); 