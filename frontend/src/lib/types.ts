export type Sender = 'user' | 'assistant' | 'system';

export interface MessageComponentPayload {
  code?: string;
  type?: 'react' | 'markdown' | 'html';
  props?: Record<string, unknown>;
}

export interface Message {
  id: string;
  sender: Sender;
  content: string;
  createdAt: number;
  isStreaming?: boolean;
  component?: MessageComponentPayload;
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
  component?: MessageComponentPayload;
  aliveState?: Partial<AliveState>;
  done?: boolean;
}
