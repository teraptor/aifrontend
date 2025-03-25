import { ApiErrorHandler } from '@/api/errorHandler';
import { notifications } from '@/plugins/notifications';
import router from '@/router';
// Мокаем зависимости
jest.mock('@/plugins/notifications', () => ({
    notifications: {
        error: jest.fn()
    }
}));
jest.mock('@/router', () => ({
    push: jest.fn()
}));
describe('ApiErrorHandler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('handleError', () => {
        it('должен обрабатывать ошибки с ответом сервера (статус 400)', () => {
            // Создаем ошибку с ответом сервера
            const error = {
                response: {
                    status: 400,
                    statusText: 'Bad Request',
                    data: {
                        message: 'Неверные данные'
                    }
                }
            };
            // Вызываем обработчик ошибок
            ApiErrorHandler.handleError(error, 'testMethod');
            // Проверяем, что уведомление было показано с правильным сообщением
            expect(notifications.error).toHaveBeenCalledWith('Неверные данные');
            // Проверяем, что нет перенаправления
            expect(router.push).not.toHaveBeenCalled();
        });
        it('должен обрабатывать ошибки с ответом сервера (статус 401)', () => {
            // Создаем ошибку с ответом сервера
            const error = {
                response: {
                    status: 401,
                    statusText: 'Unauthorized',
                    data: {}
                }
            };
            // Вызываем обработчик ошибок
            ApiErrorHandler.handleError(error, 'testMethod');
            // Проверяем, что уведомление было показано с правильным сообщением
            expect(notifications.error).toHaveBeenCalledWith('Необходима авторизация');
            // Проверяем, что выполнено перенаправление на логин
            expect(router.push).toHaveBeenCalledWith('/login');
        });
        it('должен обрабатывать ошибки с ответом сервера (статус 403)', () => {
            // Создаем ошибку с ответом сервера
            const error = {
                response: {
                    status: 403,
                    statusText: 'Forbidden',
                    data: {}
                }
            };
            // Вызываем обработчик ошибок
            ApiErrorHandler.handleError(error, 'testMethod');
            // Проверяем, что уведомление было показано с правильным сообщением
            expect(notifications.error).toHaveBeenCalledWith('Доступ запрещен');
            // Проверяем, что нет перенаправления
            expect(router.push).not.toHaveBeenCalled();
        });
        it('должен обрабатывать ошибки с ответом сервера (статус 404)', () => {
            // Создаем ошибку с ответом сервера
            const error = {
                response: {
                    status: 404,
                    statusText: 'Not Found',
                    data: {}
                }
            };
            // Вызываем обработчик ошибок
            ApiErrorHandler.handleError(error, 'testMethod');
            // Проверяем, что уведомление было показано с правильным сообщением
            expect(notifications.error).toHaveBeenCalledWith('Ресурс не найден');
        });
        it('должен обрабатывать ошибки с ответом сервера (статус 500)', () => {
            // Создаем ошибку с ответом сервера
            const error = {
                response: {
                    status: 500,
                    statusText: 'Internal Server Error',
                    data: {}
                }
            };
            // Вызываем обработчик ошибок
            ApiErrorHandler.handleError(error, 'testMethod');
            // Проверяем, что уведомление было показано с правильным сообщением
            expect(notifications.error).toHaveBeenCalledWith('Внутренняя ошибка сервера');
        });
        it('должен обрабатывать ошибки с ответом сервера (другой статус)', () => {
            // Создаем ошибку с ответом сервера
            const error = {
                response: {
                    status: 502,
                    statusText: 'Bad Gateway',
                    data: {}
                }
            };
            // Вызываем обработчик ошибок
            ApiErrorHandler.handleError(error, 'testMethod');
            // Проверяем, что уведомление было показано с правильным сообщением
            expect(notifications.error).toHaveBeenCalledWith('Ошибка: Bad Gateway');
        });
        it('должен обрабатывать ошибки без ответа сервера', () => {
            // Создаем ошибку без ответа сервера, но с объектом запроса
            const error = {
                request: {},
                response: undefined
            };
            // Вызываем обработчик ошибок
            ApiErrorHandler.handleError(error, 'testMethod');
            // Проверяем, что уведомление было показано с правильным сообщением
            expect(notifications.error).toHaveBeenCalledWith('Сервер не отвечает');
        });
        it('должен обрабатывать другие ошибки', () => {
            // Создаем ошибку с сообщением
            const error = {
                message: 'Ошибка сети',
                request: undefined,
                response: undefined
            };
            // Вызываем обработчик ошибок
            ApiErrorHandler.handleError(error, 'testMethod');
            // Проверяем, что уведомление было показано с правильным сообщением
            expect(notifications.error).toHaveBeenCalledWith('Ошибка: Ошибка сети');
        });
    });
});
