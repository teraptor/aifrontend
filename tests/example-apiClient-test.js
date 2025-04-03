// Пример теста для apiClient с использованием axios-mock-adapter

// 1. Импорт зависимостей
// import axios from 'axios';
// import MockAdapter from 'axios-mock-adapter';
// import apiClient from '@/api/apiClient';

// Пример реализации тестов для apiClient
function testApiClient() {
  
  // 2. Создание мока для axios
  // const mockAxios = new MockAdapter(apiClient);
  
  // 3. Очистка localStorage перед тестом
  // localStorage.clear();
  
  // 4. Тест добавления токена авторизации
  
  // Пример кода:
  /*
  // Установка токена в localStorage
  localStorage.setItem('accessToken', 'test-token');
  
  // Настройка мока для ответа
  mockAxios.onGet('/test').reply(config => {
    // Проверка наличия токена в заголовке
    expect(config.headers?.Authorization).toBe('Bearer test-token');
    return [200, { success: true }];
  });
  
  // Выполнение запроса
  await apiClient.get('/test');
  */
  
  // 5. Тест обработки ошибки 401
  
  // Пример кода:
  /*
  // Настройка мока для ошибки 401
  mockAxios.onGet('/test').reply(401);
  
  try {
    await apiClient.get('/test');
  } catch (error) {
    // Проверка вызова уведомления об ошибке
    expect(notifications.error).toHaveBeenCalled();
    
    // Проверка удаления токенов
    expect(localStorage.getItem('accessToken')).toBeNull();
  }
  */
  
  // 6. Тест обработки ошибки 500
  
  // 7. Тест при отсутствии ответа от сервера
}

// Выполняем тесты
testApiClient();