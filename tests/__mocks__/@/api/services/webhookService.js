export const webhookService = {
    sendMessage: jest.fn().mockResolvedValue({
        id: 'message1',
        text: 'Это ответ от вебхука'
    }),
    getChats: jest.fn().mockResolvedValue([
        {
            id: 'chat1',
            name: 'Тестовый чат 1',
            created_at: '2023-01-01T12:00:00Z'
        },
        {
            id: 'chat2',
            name: 'Тестовый чат 2',
            created_at: '2023-01-02T12:00:00Z'
        }
    ]),
    createChat: jest.fn().mockResolvedValue({
        id: 'new-chat',
        name: 'Новый тестовый чат',
        created_at: '2023-01-03T12:00:00Z'
    }),
    deleteChat: jest.fn().mockResolvedValue({ success: true })
};
