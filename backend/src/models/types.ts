export interface MessagePayload {
  id: string;
  userId: string;
  content: string;
  conversationId: string;
  createdAt: number;
}

export type BehaviorState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'excited'
  | 'confused';

export interface AliveState {
  behavior: BehaviorState;
  emotion: 'neutral' | 'positive' | 'empathetic' | 'excited' | 'confused';
  particles: {
    intensity: number;
    speed: number;
    color: string;
    scale: number;
  };
  learning: {
    justLearned: boolean;
    whatLearned?: string;
    confidence: number;
  };
  agentCreation: {
    isCreating: boolean;
    agentName?: string;
    progress: number;
  };
}

export interface StreamChunk {
  content?: string;
  aliveState?: Partial<AliveState>;
  done?: boolean;
  eventType?: 'setting_change' | 'agent_created' | 'learning_update';
  payload?: Record<string, unknown>;
}
