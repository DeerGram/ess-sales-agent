import { randomUUID } from 'node:crypto';

interface AgentConfig {
  name: string;
  description: string;
  schedule?: string;
}

export class AgentService {
  async createAgent(userId: string, config: AgentConfig) {
    return {
      id: randomUUID(),
      userId,
      ...config,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };
  }

  async detectPatterns(_userId: string) {
    return [];
  }
}
