// авторизация
export interface LoginUserRequest {
    email: string;
    password: string;
}  

// ответ авторизации
export interface AuthUserResponse {
    user_id: string;
    email: string;
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

// регистрация
export interface RegisterUserRequest {
    email: string;
    password: string;
}

// список ассистентов для предустановки
export interface GetAgentTemplateListResponse {
    data: AgentTemplate[];
}
// список ассистентов для предустановки
export interface AgentTemplate {
    id: string,
    name: string,
    status: number,
    description: string,
}
  
// созданеи нового агента
export interface CreateAgentResponse {
    id: string,
    name: string,
    status: number,
    description: string,
    instructions: string,
}

// Новый агент (альтернативный формат ответа)
export interface CreateAgentV2Response {
    id: string,
    agent_id: string,
    status: string,
    description: string,
}

export interface Message {
    ID: string,
    Content: string,
    conversation_id: boolean,
    ReplyID: string,
    Role: string,
    CreatedAt: string,
}

// Ответ со списком моих агентов
export interface MyAgentsResponse {
  assistants: Array<{
    id: string;
    name: string;
    description?: string;
    image?: string;
    status: boolean;
    created_at?: string;
    business?: boolean;
    author_id?: string;
  }>;
}

// ответ профиля
export interface ProfileUserResponse {
    data: {
      email: string,
      user_id: string;
      balance: number;
    };
}

export interface ToolsListResponse {
    tools: Tool[];
}
export interface Tool {
    id: string,
    name: string,
    description: string,
    icon: string,
}
  
