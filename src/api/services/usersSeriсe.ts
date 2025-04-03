import apiClient from "../apiClient";
import type { ProfileUserResponse } from "../types";



export const userUservice = {
  
  // получение профиля пользователя
  async fetchUserProfile(): Promise<ProfileUserResponse> {
    try {
      const response = await apiClient.get<ProfileUserResponse>('/v1/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // обновление профиля пользователя
  async updateProfile(): Promise<ProfileUserResponse>{
    try {
      const response = await apiClient.post<ProfileUserResponse>('/v1/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}