export const agentService = {
  fetchAgentsTemplates: jest.fn().mockResolvedValue({
    data: [
      {
        id: 'template1',
        name: 'Template 1',
        status: 1,
        description: 'Description for template 1'
      },
      {
        id: 'template2',
        name: 'Template 2',
        status: 1,
        description: 'Description for template 2'
      }
    ]
  }),
  
  createAgent: jest.fn().mockResolvedValue({
    id: 'agent1',
    name: 'New Agent',
    status: 1,
    description: 'Description for new agent',
    instructions: 'Instructions for new agent'
  }),
  
  getAgentById: jest.fn().mockResolvedValue({
    id: 'agent1',
    name: 'Agent 1',
    status: 1,
    description: 'Description for agent 1',
    instructions: 'Instructions for agent 1'
  }),
  
  createAgentFromTemplate: jest.fn().mockResolvedValue({
    id: 'agent2',
    name: 'Agent from Template',
    status: 1,
    description: 'Description for agent from template',
    instructions: 'Instructions for agent from template'
  }),
  
  getMyAgents: jest.fn().mockResolvedValue({
    assistants: [
      {
        id: 'agent1',
        name: 'My Agent 1',
        description: 'Description for my agent 1',
        created_at: '2023-01-01T00:00:00Z',
        isActive: true
      },
      {
        id: 'agent2',
        name: 'My Agent 2',
        description: 'Description for my agent 2',
        created_at: '2023-01-02T00:00:00Z',
        isActive: false
      }
    ]
  }),
  
  deleteAgent: jest.fn().mockResolvedValue({ success: true }),
  
  createDialog: jest.fn().mockResolvedValue({
    ID: 'dialog1',
    id: 'dialog1' 
  }),
  
  getDialogs: jest.fn().mockResolvedValue([
    {
      ID: 'dialog1',
      id: 'dialog1',
      title: 'Dialog 1',
      created_at: '2023-01-01T00:00:00Z',
      unread_count: 2
    },
    {
      ID: 'dialog2',
      id: 'dialog2',
      title: 'Dialog 2',
      created_at: '2023-01-02T00:00:00Z',
      unread_count: 0
    }
  ]),
  
  getDialog: jest.fn().mockResolvedValue({
    messages: [
      {
        id: 'message1',
        content: 'Hello from user',
        role: 'user',
        created_at: '2023-01-01T00:00:00Z'
      },
      {
        id: 'message2',
        content: 'Hello from assistant',
        role: 'assistant',
        created_at: '2023-01-01T00:00:01Z'
      }
    ]
  }),
  
  addMessageToDialog: jest.fn().mockResolvedValue({
    ID: 'message3',
    Content: 'This is a response from the agent',
    conversation_id: true,
    ReplyID: '',
    Role: 'assistant',
    CreatedAt: '2023-01-01T00:00:02Z'
  }),
  
  updateAgent: jest.fn().mockResolvedValue({
    id: 'agent1',
    name: 'Updated Agent',
    status: 1,
    description: 'Updated description',
    instructions: 'Updated instructions'
  })
}; 