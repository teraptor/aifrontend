import apiClient from '../apiClient';
import type { AuthUserResponse } from '../types';
import type { LoginUserRequest } from '../types';
import type { RegisterUserRequest } from '../types';



export const authService = {
    // авторизация
    async login(credentials: LoginUserRequest): Promise<AuthUserResponse> {
        const response = await apiClient.post<AuthUserResponse>('/v1/auth/login', credentials);
        return response.data
    },
    // регистрация
    async register(credentials: RegisterUserRequest): Promise<AuthUserResponse> {
        const response = await apiClient.post<AuthUserResponse>('/v1/auth/register', credentials);
        return response.data;
    },
    // сделать логаут
    async logout(): Promise<void> {
        await apiClient.post('/auth/logout');
    },
    //рефрешнуть токен
    async refreshToken(): Promise<AuthUserResponse> {
        const response = await apiClient.post<AuthUserResponse>('/v1/auth/refresh');
        return response.data;
    },
    // получить пользовательские данные
    async getCurrentUser(): Promise<AuthUserResponse['email']> {
        const response = await apiClient.get<AuthUserResponse['email']>('/v1/auth/me');
        return response.data;
    },

}


