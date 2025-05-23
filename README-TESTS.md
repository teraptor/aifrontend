# Инструкции по запуску тестов API

В проекте реализованы тесты для API модулей, проверяющие основные компоненты взаимодействия с сервером.

## Быстрый старт

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

Это запустит скрипт проверки основных компонентов API и выведет результаты в консоль.

### Пример тестирования apiClient

Для просмотра примера тестирования apiClient выполните:

```bash
npm run test:example
```

Данный скрипт демонстрирует подход к тестированию HTTP-клиента с использованием axios-mock-adapter.

## Детальная информация

### Структура тестов

Тесты организованы следующим образом:

```
tests/
├── unit/                         # Модульные тесты
│   └── api/                      # Тесты API модулей
│       ├── services/             # Тесты сервисов
│       │   ├── authService.spec.ts
│       │   └── agentService.spec.ts
│       ├── apiClient.spec.ts     # Тесты HTTP-клиента
│       ├── cacheManager.spec.ts  # Тесты кэш-менеджера
│       └── errorHandler.spec.ts  # Тесты обработчика ошибок
├── api-test.js                   # Простой тест структуры API
├── example-apiClient-test.js     # Пример теста apiClient
├── setup.ts                      # Настройка тестового окружения
└── API-TESTS.md                  # Документация по тестам
```

### Что тестируется

1. **apiClient** - HTTP-клиент с перехватчиками для авторизации
   - Добавление токена авторизации в заголовки
   - Обработка ошибок (401, 403, 500)
   - Поведение при отсутствии ответа от сервера

2. **cacheManager** - Менеджер кэширования данных
   - Получение и сохранение данных в кэше
   - Проверка актуальности данных
   - Условная загрузка при устаревании данных (staleWhileRevalidate)

3. **errorHandler** - Обработчик ошибок API
   - Обработка разных типов HTTP-ошибок
   - Отображение соответствующих уведомлений

4. **authService** - Сервис авторизации
   - Аутентификация пользователя
   - Регистрация
   - Выход из системы
   - Обновление токена

5. **agentService** - Сервис работы с агентами
   - Получение списка агентов
   - Создание, удаление и обновление агентов
   - Работа с диалогами

### Написание новых тестов

При разработке новых тестов следуйте этим правилам:

1. Все тесты должны находиться в директории `tests/unit/`
2. Файлы тестов должны иметь расширение `.spec.ts`
3. Моки для внешних зависимостей должны находиться в `tests/__mocks__/`
4. Используйте Jest в качестве фреймворка для тестирования
5. Используйте axios-mock-adapter для мокирования HTTP-запросов

### Рекомендации по тестированию API

1. **Изолируйте тесты** - каждый тест должен быть независимым от других
2. **Мокируйте внешние зависимости** - не выполняйте реальные HTTP-запросы в тестах
3. **Проверяйте только одну функциональность в каждом тесте**
4. **Создавайте понятные и информативные сообщения об ошибках**
5. **Следуйте шаблону AAA (Arrange-Act-Assert)** - подготовка, действие, проверка

## Дополнительная информация

Подробная документация по тестированию API находится в файле [tests/API-TESTS.md](./tests/API-TESTS.md).

## Тестирование хранилищ Pinia

Для тестирования хранилищ Pinia используется Vitest и специальная функция настройки, обеспечивающая изоляцию тестов.

### Структура тестов хранилищ

Тесты для хранилищ находятся в директории `tests/unit/stores` и следуют соглашению об именовании:
- `useAuthStore.spec.ts` - тесты для хранилища аутентификации
- `useAssistantsStore.spec.ts` - тесты для хранилища ассистентов
- и т.д.

### Запуск тестов хранилищ

```bash
# Запуск всех тестов
npm test

# Запуск только тестов хранилищ
npm test -- -t "stores"
```

### Мокирование зависимостей

Для изоляции тестов хранилищ используются моки для API-сервисов, находящиеся в директории `tests/__mocks__/@/api/services`. Это позволяет тестировать логику хранилищ независимо от реальных API-вызовов.

Подробную информацию о тестах хранилищ можно найти в файле `tests/unit/stores/README.md`. 