export const authService = {
  login: jest.fn().mockResolvedValue({
    user_id: '1',
    email: 'test@example.com',
    access_token: 'mocked-access-token',
    refresh_token: 'mocked-refresh-token',
    expires_in: 3600
  }),
  
  register: jest.fn().mockResolvedValue({
    user_id: '2',
    email: 'new@example.com',
    access_token: 'mocked-access-token',
    refresh_token: 'mocked-refresh-token',
    expires_in: 3600
  }),
  
  logout: jest.fn().mockResolvedValue({}),
  
  refreshToken: jest.fn().mockResolvedValue({
    user_id: '1',
    email: 'test@example.com',
    access_token: 'mocked-new-access-token',
    refresh_token: 'mocked-new-refresh-token',
    expires_in: 3600
  }),
  
  getCurrentUser: jest.fn().mockResolvedValue('test@example.com')
}; 