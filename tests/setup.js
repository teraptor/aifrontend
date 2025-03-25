// Настройка Jest для тестирования
import { config } from 'dotenv';
import { TextEncoder, TextDecoder } from 'util';
import '@jest/globals';
// Загрузка переменных окружения из .env
config();
// Мок для localStorage
class LocalStorageMock {
    constructor() {
        this.store = {};
        this.length = 0;
    }
    getItem(key) {
        return this.store[key] || null;
    }
    setItem(key, value) {
        this.store[key] = String(value);
        this.length = Object.keys(this.store).length;
    }
    removeItem(key) {
        delete this.store[key];
        this.length = Object.keys(this.store).length;
    }
    clear() {
        this.store = {};
        this.length = 0;
    }
    key(index) {
        return Object.keys(this.store)[index] || null;
    }
}
// Установка глобальных объектов
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.localStorage = new LocalStorageMock();
// Мок для window
global.window = {
    ...global.window,
    localStorage: new LocalStorageMock()
};
// Мок для import.meta
Object.defineProperty(globalThis, 'import', {
    value: {
        meta: {
            env: {
                VITE_BASE_API_URL: 'http://localhost:8088',
            }
        }
    }
});
