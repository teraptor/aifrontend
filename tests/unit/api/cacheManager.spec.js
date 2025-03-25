import { jest } from '@jest/globals';
import { CacheManager } from '@/api/cacheManager';
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
            expect(CacheManager.get('non-existent')).toBeNull();
        });
        it('должен возвращать сохраненные данные', () => {
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
            CacheManager.set('test-key', testData);
            // Проверяем с большим TTL - данные должны быть свежими
            expect(CacheManager.isFresh('test-key', 1000)).toBe(true);
            // Проверяем с малым TTL - данные должны быть устаревшими после задержки
            jest.advanceTimersByTime(100);
            expect(CacheManager.isFresh('test-key', 50)).toBe(false);
        });
    });
    describe('getOrFetch', () => {
        it('должен запрашивать новые данные, если кэш пуст', async () => {
            const testData = { test: 'data' };
            const fetchFn = jest.fn().mockImplementation(() => Promise.resolve(testData));
            const result = await CacheManager.getOrFetch('test-key', fetchFn, 1000);
            expect(result).toEqual(testData);
            expect(fetchFn).toHaveBeenCalled();
        });
        it('должен возвращать данные из кэша, если они свежие', async () => {
            const testData = { test: 'data' };
            const newData = { test: 'new-data' };
            const fetchFn = jest.fn().mockImplementation(() => Promise.resolve(newData));
            // Устанавливаем данные в кэш
            CacheManager.set('test-key', testData);
            const result = await CacheManager.getOrFetch('test-key', fetchFn, 1000);
            expect(result).toEqual(testData);
            expect(fetchFn).not.toHaveBeenCalled();
        });
        it('должен запрашивать новые данные, если кэш устарел', async () => {
            const testData = { test: 'data' };
            const newData = { test: 'new-data' };
            const fetchFn = jest.fn().mockImplementation(() => Promise.resolve(newData));
            // Устанавливаем данные в кэш
            CacheManager.set('test-key', testData);
            // Продвигаем время вперед
            jest.advanceTimersByTime(1100);
            const result = await CacheManager.getOrFetch('test-key', fetchFn, 1000);
            expect(result).toEqual(newData);
            expect(fetchFn).toHaveBeenCalled();
        });
        it('должен возвращать устаревшие данные и обновлять кэш при staleWhileRevalidate', async () => {
            const testData = { test: 'data' };
            const newData = { test: 'new-data' };
            const fetchFn = jest.fn().mockImplementation(() => Promise.resolve(newData));
            // Устанавливаем данные в кэш
            CacheManager.set('test-key', testData);
            // Продвигаем время вперед
            jest.advanceTimersByTime(1100);
            const result = await CacheManager.getOrFetch('test-key', fetchFn, 1000, true);
            expect(result).toEqual(testData);
            expect(fetchFn).toHaveBeenCalled();
            // Проверяем, что кэш обновился
            await Promise.resolve(); // Ждем выполнения промиса
            expect(CacheManager.get('test-key')).toEqual(newData);
        });
    });
});
