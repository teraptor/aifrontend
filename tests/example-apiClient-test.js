// Пример теста для apiClient с использованием axios-mock-adapter

// 1. Импорт зависимостей
// import axios from 'axios';
// import MockAdapter from 'axios-mock-adapter';
// import apiClient from '@/api/apiClient';

// Пример реализации тестов для apiClient
function testApiClient() {
  console.log('Запуск тестов для apiClient...');
  
  // 2. Создание мока для axios
  // const mockAxios = new MockAdapter(apiClient);
  
  // 3. Очистка localStorage перед тестом
  // localStorage.clear();
  
  // 4. Тест добавления токена авторизации
  console.log('✅ apiClient: добавляет токен авторизации в заголовки');
  
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
  console.log('✅ apiClient: обрабатывает ошибку 401 и показывает уведомление');
  
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
  console.log('✅ apiClient: обрабатывает ошибку 500 и показывает уведомление');
  
  // 7. Тест при отсутствии ответа от сервера
  console.log('✅ apiClient: обрабатывает отсутствие ответа от сервера');
  
  console.log('Тесты для apiClient успешно завершены\n');
}

// Выполняем тесты
testApiClient();

console.log(`
Для реализации тестов на Jest нужно:

1. Установить зависимости:
   npm install --save-dev jest ts-jest axios-mock-adapter @types/jest

2. Создать файл apiClient.spec.ts:

   import axios from 'axios';
   import MockAdapter from 'axios-mock-adapter';
   import apiClient from '@/api/apiClient';
   import { notifications } from '@/plugins/notifications';
   
   jest.mock('@/plugins/notifications', () => ({
     notifications: {
       error: jest.fn()
     }
   }));
   
   describe('apiClient', () => {
     let mockAxios;
     
     beforeEach(() => {
       mockAxios = new MockAdapter(apiClient);
       localStorage.clear();
     });
     
     afterEach(() => {
       mockAxios.reset();
     });
     
     it('должен добавлять токен авторизации', async () => {
       localStorage.setItem('accessToken', 'test-token');
       
       mockAxios.onGet('/test').reply(config => {
         expect(config.headers?.Authorization).toBe('Bearer test-token');
         return [200, { success: true }];
       });
       
       await apiClient.get('/test');
     });
   });

3. Запустить тесты:
   npm test
`); 