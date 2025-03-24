import apiClient from '../apiClient'

interface SendMessageRequest {
  message: string
}

interface MessageResponse {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: string
  metadata?: Record<string, any>
}

class WebhookService {
  async sendMessage(hookId: string, message: string): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      `/v1/webhook/${hookId}/chat`,
      { message }
    )
    return response.data
  }
}

export const webhookService = new WebhookService() 