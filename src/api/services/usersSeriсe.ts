import apiClient from "../apiClient";



export const userUservice = {

  // получение профиля пользователя
  async fetchUserProfile(): Promise<ProfileResponse> {
    try {
      const response = await apiClient.get<ProfileResponse>('/v1/profile');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении профиля пользователя:', error);
      throw error;
    }
  },

  // обновление профиля пользователя
  async updateProfile(): Promise<ProfileResponse>{
    try {
      const response = await apiClient.post<ProfileResponse>('/v1/profile');
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении профиля пользователя:', error);
      throw error;
    }
  }
}