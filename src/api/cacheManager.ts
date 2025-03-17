import type { NumberLiteralType } from "typescript";

interface CacheOptions {
    ttl: number;
    staleWhileRevalidate?: boolean;
}

interface CacheItem<T> {
    value: T;
    expiresAt: number;
}

export class CacheManager {
    private static cache = new Map<string, CacheItem<any>>();

    // получение данных из кэша
    static get<T>(key: string): T | null {
        const item = this.cache.get(key);

        if (!item) {
            return null;
        }

        return item.value;
    }
    
    // проверка актуальности данных
    static isFresh(key: string, ttl: number): boolean {
        const item = this.cache.get(key);

        if (!item) {
            return false;
        }

        const now = Date.now();
        return now - item.expiresAt < ttl;
    }

    // сохранение данных в кэш
    static set<T>(key: string, data: T):void {
        this.cache.set(key, {
            value: data,
            expiresAt: Date.now(),
        })
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
        options: CacheOptions
    ): Promise<T> {
        const cachedData = this.get<T>(key);
        const isFresh = this.isFresh(key, options.ttl);

        // если данные есть и они актуальны, то возвращаем их
        if (cachedData && isFresh) {
            return cachedData;
        }

        if (cachedData && options.staleWhileRevalidate) {
            this.fetchAndUpdateCache(key, fetchFn);
            return cachedData;
        }

        // если данные нет или они не актуальны, то запрашиваем их
        return this.fetchAndUpdateCache(key, fetchFn);
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