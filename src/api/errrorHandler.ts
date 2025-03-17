import { notifications } from "@/plugins/notifications";
import router from "@/router";

export class ApiErrorHandler {
    static parseError(error: any) {
        if (error.response) {
            const { status, data } = error.response;

            return {
                code: `HTTP_${status}`,
                message: data.message || this.getDefaultMessageForStatus(status),
                details: data
            };
        } else if (error.request) {
            return {
                code: 'NETWORK_ERROR',
                message: 'Сетевая ошибка. Попробуйте позже.',
                details: null
            };
        } else {
            return {
                code: 'REQUEST_SETUP_ERROR',
                message: error.message || 'Ошибка при настройке запроса',
                details: null
            };
        }
    }

    static getDefaultMessageForStatus(status: number): string {
        switch (status) {
            case 400:
                return 'Неверный запрос. Попробуйте снова.';
            case 401:
                return 'Не авторизован. Попробуйте снова.';
            case 403:
                return 'Доступ запрещен. Попробуйте снова.';
            case 404:
                return 'Не найдено. Попробуйте снова.';
            case 422:
                return 'Неверные данные. Попробуйте снова.';
            case 500:
                return 'Внутренняя ошибка сервера. Попробуйте снова позже.';
            default:
                return 'Произошла ошибка. Попробуйте снова позже.';
        }
    }

    static handleError(error: any, context: string = '') {
        const apiError = this.parseError(error);
        notifications.error(apiError.message);
        if (apiError.code === 'HTTP_401') {
            // перенаправить на страницу авторизации
            router.push('/login');
        }
        return apiError;
    }
}
