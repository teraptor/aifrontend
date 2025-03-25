# Тестирование API модуля

В данном документе описаны модульные тесты для API компонентов проекта, их структура и инструкции по запуску.

## Структура API модулей

API модули организованы следующим образом:

```
src/api/
├── apiClient.ts - HTTP клиент с перехватчиками для авторизации
├── cacheManager.ts - Управление кешированием данных
├── errorHandler.ts - Обработка ошибок API
├── types.ts - Типы данных для API
└── services/
    ├── authService.ts - Авторизация, регистрация и работа с токенами
    ├── agentService.ts - Управление агентами (получение, создание, удаление)
    ├── webhookService.ts - Работа с вебхуками
    └── userService.ts - Управление пользователями
```

## Тесты API

Для каждого модуля разработаны тесты, проверяющие его функциональность:

### 1. CacheManager

Тесты для `cacheManager.ts` проверяют:
- Получение и установку данных в кэш
- Проверку актуальности данных по TTL
- Условную подгрузку данных при устаревании кэша
- Стратегию staleWhileRevalidate для обновления кэша

### 2. ApiClient

Тесты для `apiClient.ts` проверяют:
- Добавление токена авторизации в заголовки
- Обработку ошибок авторизации (401)
- Обработку других ошибок (403, 500)
- Поведение при отсутствии ответа от сервера

### 3. ErrorHandler

Тесты для `errorHandler.ts` проверяют:
- Обработку HTTP ошибок с разными статус-кодами (400, 401, 403, 404, 500)
- Обработку сетевых ошибок без ответа от сервера
- Показ соответствующих уведомлений

### 4. Сервисы API

#### AuthService

Тесты проверяют:
- Функцию авторизации (login)
- Функцию регистрации (register)
- Функцию выхода (logout)
- Функцию обновления токена (refreshToken)
- Получение данных пользователя (getCurrentUser)

#### AgentService

Тесты проверяют:
- Получение шаблонов агентов (fetchAgentsTemplates)
- Создание агента (createAgent)
- Получение агента по ID (getAgentById)
- Создание агента из шаблона (createAgentFromTemplate)
- Получение списка агентов пользователя (getMyAgents)
- Удаление агента (deleteAgent)
- Работу с диалогами (createDialog, getDialog, addMessageToDialog)

## Запуск тестов

### Установка зависимостей

Перед запуском тестов установите необходимые зависимости:

```bash
npm install
```

### Запуск базовых тестов

Для запуска базовых тестов API выполните:

```bash
npm test
```

Это запустит скрипт, который проверит структуру API и выведет результаты тестирования.

### Тестирование с покрытием кода

Для запуска полных тестов с отчетом о покрытии:

```bash
npm run test:coverage
```

После выполнения команды будет создана директория `coverage` с отчетом о покрытии кода.

## Примеры тестов

### Пример теста для CacheManager

```typescript
import { CacheManager } from '@/api/cacheManager';

describe('CacheManager', () => {
  beforeEach(() => {
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
});
```

### Пример теста для AuthService

```typescript
import { authService } from '@/api/services/authService';

describe('authService', () => {
  describe('login', () => {
    it('должен отправить запрос на логин и вернуть данные пользователя', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password'
      };
      
      // Настройка мока для ответа
      // ...
      
      const result = await authService.login(credentials);
      
      // Проверяем результат
      expect(result).toEqual(/* ожидаемый ответ */);
    });
  });
});
```

## Дополнительная информация

При разработке новых модулей API рекомендуется следовать TDD (Test-Driven Development) подходу, сначала написав тесты, а затем реализуя функционал до соответствия тестам.

Для добавления новых тестов создайте файл с именем `*.spec.ts` в соответствующей директории в `tests/unit/api/`. 