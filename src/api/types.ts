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
export interface CreateAgentRespose {
    id: string,
    name: string,
    status: number,
    description: string,
}

// Новый агент (для совместимости)
export interface NewAgentRespose {
    id: string,
    AgentID: string,
    Cost: number,
    CreatedAt: Date,
}

// ответ профиля
export interface ProfileUserResponse {
    data: {
      email: string,
      user_id: string;
    };
}