import apiClient from "../apiClient";
import { CacheManager } from "../cacheManager";
import { ApiErrorHandler } from "../errrorHandler";
import type { 
  GetAgentTemplateListResponse, 
  CreateAgentRespose,
  NewAgentRespose,
} from "../types";

const API_BASE = '/v1'

export const agentService = {
  // получение списка агентов
  // GET /v1/agents/templates
  async fetchAgentsTemplates(): Promise<GetAgentTemplateListResponse> {
    const cacheKey = 'agentsTemplates';
    try {
      return await CacheManager.getOrFetch(
        cacheKey,
        async () => {
          try {
            console.log('Fetching agent templates from API...');
            const response = await apiClient.get<GetAgentTemplateListResponse>(`${API_BASE}/agents/templates`);
            console.log('API response:', response.data);
            return response.data;
          } catch (error) {
            console.error('Error in fetchAgentsTemplates inner function:', error);
            ApiErrorHandler.handleError(error, 'fetchAgentsTemplates');
            // Возвращаем пустой массив вместо выброса исключения
            return { data: [] };
          }
        },
        { ttl: 3600000, staleWhileRevalidate: true }
      );
    } catch (error) {
      console.error('Error in fetchAgentsTemplates outer function:', error);
      // Возвращаем пустой массив вместо выброса исключения
      return { data: [] };
    }
  },

  // создание агента
  // GET /v1/agents/create
  async createAgent(): Promise<NewAgentRespose> {
    const cacheKey = 'createAgent';
    return CacheManager.getOrFetch (
      cacheKey,
      async () => {
        try {
          const response = await apiClient.get<NewAgentRespose>(`${API_BASE}/agents/create`);
          return response.data;
        } catch (error) {
          ApiErrorHandler.handleError(error, 'createAgent');
          throw error;
        }
      },
      { ttl: 3600000, staleWhileRevalidate: true }
    );
  },

  // установка из предустановленных
  // GET /v1/agents/{templateID}/workflow
  async createAgentFromTemplate(templateId: string): Promise<NewAgentRespose> {
    try {
      const response = await apiClient.get<NewAgentRespose>(`${API_BASE}/agents/${templateId}/workflow`);
      return response.data;
    } catch (error) {
      ApiErrorHandler.handleError(error, 'createAgentFromTemplate');
      throw error;
    }

  },

  // открыть агента
  // GET /v1/agents/{agentID}
  async openAgent(agentId: string): Promise<NewAgentRespose> {
    try {
      const response = await apiClient.get<NewAgentRespose>(`${API_BASE}/agents/${agentId}`);
      return response.data;
    } catch (error) {
      ApiErrorHandler.handleError(error, 'openAgent');
      throw error;
    }
  }, 

  // открыть агента
  // GET /v1/agents/my
  async getMyAgents(): Promise<NewAgentRespose> {
    try {
      const response = await apiClient.get<NewAgentRespose>(`${API_BASE}/agents/my`);
      return response.data;
    } catch (error) {
      ApiErrorHandler.handleError(error, 'getMyAgents');
      throw error;
    }
  }, 
  
  // удалить ассистента
  // DELETE /v1/agents/{agentID}
  async deleteAgent(agentId: string): Promise<NewAgentRespose> {
    try {
      const response = await apiClient.delete<NewAgentRespose>(`${API_BASE}/agents/${agentId}`);
      return response.data;
    } catch (error) {
      ApiErrorHandler.handleError(error, 'deleteAgent');
      throw error;
    }
  },

  // создание нового диалога
  // GET /v1/conversation/{agentID}/new"
  async createDialog(agentId: string): Promise<NewAgentRespose> {
    try {
      const response = await apiClient.get<NewAgentRespose>(`${API_BASE}/conversation/${agentId}/new`);
      return response.data;
    } catch (error) {
      ApiErrorHandler.handleError(error, 'createDialog');
      throw error;
    }
  },

  // получение диалога
  // GET /v1/conversation/{agentID}/dialog/{conversationID}/messages
  async getDialog(dialogId: string, conversationID: string): Promise<NewAgentRespose> {
    try {
      const response = await apiClient.get<NewAgentRespose>(`${API_BASE}/conversation/${dialogId}/dialog/${conversationID}/messages`);
      return response.data;
    } catch (error) {
      ApiErrorHandler.handleError(error, 'getDialog');
      throw error;
    }
  },
  // добавление сообщения в диалог
  // POST /v1/conversation/{agentID}/{conversationID}/reply
  async addMessageToDialog(dialogId: string, conversationID: string, data: null): Promise<NewAgentRespose> {
    try {
      const response = await apiClient.get<NewAgentRespose>(
        `${API_BASE}/conversation/${dialogId}/${conversationID}/reply`,
         data || {}
      );
      return response.data;
    } catch (error) {
      ApiErrorHandler.handleError(error, 'addMessageToDialog');
      throw error;
    }
  }
}
