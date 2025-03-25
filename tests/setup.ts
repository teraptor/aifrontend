// Настройка Jest для тестирования
import { config } from 'dotenv';
import { TextEncoder, TextDecoder } from 'util';
import '@jest/globals';

// Загрузка переменных окружения из .env
config();

// Мок для localStorage
class LocalStorageMock implements Storage {
  private store: Record<string, string> = {};
  length: number = 0;

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
    this.length = Object.keys(this.store).length;
  }

  removeItem(key: string): void {
    delete this.store[key];
    this.length = Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
    this.length = 0;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] || null;
  }
}

// Установка глобальных объектов
global.TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;
global.localStorage = new LocalStorageMock();

// Мок для window
global.window = {
  ...global.window,
  localStorage: new LocalStorageMock()
} as any;

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