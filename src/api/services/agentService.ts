import apiClient from "../apiClient";
import { CacheManager } from "../cacheManager";
import { ApiErrorHandler } from "../errorHandler";
import type { 
  GetAgentTemplateListResponse, 
  CreateAgentResponse,
  MyAgentsResponse,
  Message
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
            const response = await apiClient.get<GetAgentTemplateListResponse>(`${API_BASE}/agents/templates`);
            return response.data;
          } catch (error) {
            ApiErrorHandler.handleError(error, 'fetchAgentsTemplates');
            // Возвращаем пустой массив вместо выброса исключения
            return { data: [] };
          }
        },
        3600000,
        true
      );
    } catch (error) {
      // Возвращаем пустой массив вместо выброса исключения
      return { data: [] };
    }
  },

  // создание агента
  // GET /v1/agents/create
  async createAgent(): Promise<CreateAgentResponse> {
    const cacheKey = 'createAgent';
    return CacheManager.getOrFetch(
      cacheKey,
      async () => {
        try {
          const response = await apiClient.get<CreateAgentResponse>(`${API_BASE}/agents/create`);
          return response.data;
        } catch (error) {
          ApiErrorHandler.handleError(error, 'createAgent');
          throw error;
        }
      },
      3600000,
      true
    );
  },

  // получение ассистента по id
  // GET /v1/agents/{agentID}
  async getAgentById(agentId: string): Promise<CreateAgentResponse> {
    try {
      const response = await apiClient.get<CreateAgentResponse>(`${API_BASE}/agents/${agentId}`);
      return response.data;
    } catch (error) {
      ApiErrorHandler.handleError(error, 'getAgentById');
      throw error;
    }
  },

  // установка из предустановленных
  // GET /v1/agents/{templateID}/workflow
  async createAgentFromTemplate(templateId: string): Promise<CreateAgentResponse> {
    try {
      const response = await apiClient.get<CreateAgentResponse>(`${API_BASE}/agents/${templateId}/workflow`);
      return response.data;
    } catch (error) {
      ApiErrorHandler.handleError(error, 'createAgentFromTemplate');
      throw error;
    }
  },

  // открыть агента
  // GET /v1/agents/{agentID}
  async openAgent(agentId: string): Promise<CreateAgentResponse> {
    try {
      const response = await apiClient.get<CreateAgentResponse>(`${API_BASE}/agents/${agentId}`);
      return response.data;
    } catch (error) {
      ApiErrorHandler.handleError(error, 'openAgent');
      throw error;
    }
  }, 

  // получить мои агенты
  // GET /v1/agents/my
  async getMyAgents(): Promise<MyAgentsResponse> {
    try {
      const response = await apiClient.get<MyAgentsResponse>(`${API_BASE}/agents/my`);
      return response.data;
    } catch (error) {
      ApiErrorHandler.handleError(error, 'getMyAgents');
      throw error;
    }
  }, 
  
  // удалить ассистента
  // DELETE /v1/agents/{agentID}
  async deleteAgent(agentId: string): Promise<CreateAgentResponse> {
    try {
      const response = await apiClient.delete<CreateAgentResponse>(`${API_BASE}/agents/${agentId}`);
      return response.data;
    } catch (error) {
      ApiErrorHandler.handleError(error, 'deleteAgent');
      throw error;
    }
  },

  // создание нового диалога
  // GET /v1/conversation/{agentID}/new"
  async createDialog(agentId: string): Promise<any> {
    try {
      const response = await apiClient.get<any>(`${API_BASE}/conversation/${agentId}/new`);
      return response.data;
    } catch (error) {
      ApiErrorHandler.handleError(error, 'createDialog');
      throw error;
    }
  },

  // получение диалога
  // GET /v1/conversation/{agentID}/dialog/{conversationID}/messages
  async getDialog(agentId: string, conversationID: string): Promise<any> {
    try {
      const response = await apiClient.get<any>(`${API_BASE}/conversation/${agentId}/dialog/${conversationID}/messages`);
      return response.data;
    } catch (error) {
      ApiErrorHandler.handleError(error, 'getDialog');
      throw error;
    }
  },

  // получение списка диалогов ассистента
  // GET /v1/conversation/{agentID}/dialogs
  async getDialogs(agentId: string): Promise<any> {
    try {
      const response = await apiClient.get<any>(`${API_BASE}/conversation/${agentId}/dialogs`);
      return response.data;
    } catch (error) {
      ApiErrorHandler.handleError(error, 'getDialogs');
      throw error;
    }
  },
  
  // добавление сообщения в диалог
  // POST /v1/conversation/{agentID}/{conversationID}/reply
  async addMessageToDialog(agentId: string, conversationID: string, data: any = {}): Promise<Message> {
    try {
      const response = await apiClient.post<Message>(
        `${API_BASE}/conversation/${agentId}/${conversationID}/reply`,
         data
      );
      return response.data;
    } catch (error) {
      ApiErrorHandler.handleError(error, 'addMessageToDialog');
      throw error;
    }
  },

  // обновление ассистента
  // PUT /v1/agents/{agentID}
  async updateAgent(agentId: string, data: any): Promise<any> {
    try {
      const response = await apiClient.post<any>(`${API_BASE}/agents/${agentId}`, data);
      return response.data;
    } catch (error) {
      ApiErrorHandler.handleError(error, 'updateAgent');
      throw error;
    }
  },

  // обновление названия диалога
  // POST /v1/conversation/{agentID}/dialogs/{conversationID}
  async updateDialogName(agentId: string, conversationId: string, name: string): Promise<any> {
    try {
      const changeName = {
        Name: name
      };
      
      const response = await apiClient.post<any>(
        `${API_BASE}/conversation/${agentId}/dialogs/${conversationId}`,
        changeName
      );
      
      // Возвращаем объект с обновленным названием
      return {
        dialogName: response.data?.Name || response.data?.name || name
      };
    } catch (error) {
      ApiErrorHandler.handleError(error, 'updateDialogName');
      throw error;
    }
  }
}
