getDialogs: jest.fn().mockResolvedValue([
  {
    id: 'dialog1',
    name: 'Dialog 1',
    created_at: '2024-01-01T00:00:00Z',
    unread_count: 0
  }
]),
getConversation: jest.fn().mockResolvedValue({
  id: 'dialog1',
  name: 'Dialog 1',
  messages: [
    {
      id: 'msg1',
      content: 'Hello',
      role: 'user',
      created_at: '2024-01-01T00:00:00Z'
    }
  ]
}), 