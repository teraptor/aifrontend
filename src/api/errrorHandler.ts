import router from "@/router";
import { notifications } from "@/plugins/notifications";

export class ApiErrorHandler {
    static handleError(error: any, methodName: string) {
        console.error(`API Error in ${methodName}:`, error);
        
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const status = error.response.status;
            const statusText = error.response.statusText;
            const data = error.response.data;
            
            // Handle specific status codes
            switch (status) {
                case 400:
                    notifications.error(data.message || "Неверный запрос");
                    break;
                case 401:
                    notifications.error("Необходима авторизация");
                    // Handle authentication errors, maybe redirect to login
                    break;
                case 403:
                    notifications.error("Доступ запрещен");
                    break;
                case 404:
                    notifications.error("Ресурс не найден");
                    break;
                case 500:
                    notifications.error("Внутренняя ошибка сервера");
                    break;
                default:
                    notifications.error(`Ошибка: ${data.message || statusText}`);
            }
        } else if (error.request) {
            // The request was made but no response was received
            notifications.error("Сервер не отвечает");
        } else {
            // Something happened in setting up the request that triggered an Error
            notifications.error(`Ошибка: ${error.message}`);
        }
        
        // Optionally, redirect to an error page for serious errors
        if (error.response && error.response.status === 401) {
            // Redirect to login
            router.push('/login');
        }
    }
}
