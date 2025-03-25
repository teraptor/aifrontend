import type { NumberLiteralType } from "typescript";

interface CacheOptions {
    ttl: number;
    staleWhileRevalidate?: boolean;
}

interface CacheData<T> {
    data: T;
    timestamp: number;
}

export class CacheManager {
    private static cache = new Map<string, CacheData<any>>();

    // получение данных из кэша
    static get<T>(key: string): T | null {
        const item = this.cache.get(key);
        return item ? item.data : null;
    }
    
    // проверка актуальности данных
    static isFresh(key: string, ttl: number): boolean {
        const item = this.cache.get(key);
        if (!item) return false;
        return Date.now() - item.timestamp <= ttl;
    }

    // сохранение данных в кэш
    static set<T>(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
    
    // удаление данных из кэша
    static delete(key: string): void {
        this.cache.delete(key);
    }

    // очистка всего кэша
    static clear(): void {
        this.cache.clear();
    }

    // получение данных с учетом кэша
    static async getOrFetch<T>(
        key: string,
        fetchFn: () => Promise<T>,
        ttl: number,
        staleWhileRevalidate = false
    ): Promise<T> {
        const cached = this.cache.get(key) as CacheData<T> | undefined;
        const isFresh = cached && this.isFresh(key, ttl);

        if (isFresh) {
            return cached.data;
        }

        if (staleWhileRevalidate && cached) {
            // Запускаем обновление в фоне
            fetchFn().then(newData => this.set(key, newData));
            return cached.data;
        }

        const newData = await fetchFn();
        this.set(key, newData);
        return newData;
    }

    // запрос данных и обновление кэша
    private static async fetchAndUpdateCache<T>(
        key: string,
        fetchFn: () => Promise<T>,
    ): Promise<T> {
        try {
            const data = await fetchFn();
            this.set(key, data);
            return data;           
        } catch (error) {
            throw error;
        }
    }
}