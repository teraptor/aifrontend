// Настройка Jest для тестирования
import * as dotenv from 'dotenv';
import { TextEncoder, TextDecoder } from 'util';
import 'jest';

// Загрузка переменных окружения из .env
dotenv.config();

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
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

// Мок для объектов window
global.localStorage = new LocalStorageMock();

// Мок для TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Мок для router и notifications
global.jest = jest;

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