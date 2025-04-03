import apiClient from "../apiClient";

interface UserBalanceResponse {
    balance: number;
}

export const billingService = {
    // получить баланс пользователя
    async getUserBalance(): Promise<UserBalanceResponse> {
        const response = await apiClient.get<UserBalanceResponse>(`/v1/billing/balance`);
        return response.data;
    }
}