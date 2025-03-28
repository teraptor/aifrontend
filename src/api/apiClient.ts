import axios from 'axios';
import { notifications } from '@/plugins/notifications';
import router from '@/router';
import { RouteNames } from '@/router/routes/routeNames';

// базовый axios
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BASE_API_URL || 'http://localhost:8088',
    timeout: 150,
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

// Добавляем индикатор, чтобы избежать множественных уведомлений
let isRefreshing = false;

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // Если это ошибка авторизации при обычном запросе
                    if (!isRefreshing) {
                        isRefreshing = true;
                        try {
                            // Проверяем, не делаем ли мы уже запрос на refresh
                            const isRefreshRequest = error.config.url.includes('/v1/auth/refresh');
                            const isLoginRequest = error.config.url.includes('/v1/auth/login');
                            
                            // Если это не запрос на refresh и не запрос на логин, то это значит токен истек
                            if (!isRefreshRequest && !isLoginRequest) {
                                notifications.error('Сессия истекла, войдите снова');
                                
                                // Разлогиниваем пользователя
                                localStorage.removeItem('accessToken');
                                localStorage.removeItem('refreshToken');
                                
                                // Получаем хранилище auth через динамический импорт для избежания циклической зависимости
                                const { useAuthStore } = await import('@/stores/useAuthStore');
                                const authStore = useAuthStore();
                                authStore.logout();
                                
                                // Перенаправляем на главную страницу
                                router.push(RouteNames.MAIN.name);
                            } else {
                                notifications.error('Логин или пароль неверный');
                            }
                        } finally {
                            isRefreshing = false;
                        }
                    }
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
