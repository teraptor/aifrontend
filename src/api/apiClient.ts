import axios from 'axios';
import { notifications } from '@/plugins/notifications';

// базовый axios
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BASE_API_URL || 'http://localhost:8088',
    timeout: 1500000000,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    notifications.error('Логин или пароль неверный');
                    break;
                case 403:
                    notifications.error('Доступ запрещен');
                    break;
                case 500:
                    notifications.error('Внутренняя ошибка сервера');
                    break;
                default:
                    notifications.error('Произошла ошибка');
            }
        } else if (error.request) {
            notifications.error('Сервер не отвечает');
        } else {
            notifications.error('Произошла ошибка');
        }
        return Promise.reject(error);
    }
)

export default apiClient;
