import type { AliveState, BehaviorState } from '../models/types';

export const defaultAliveState: AliveState = {
  behavior: 'idle',
  emotion: 'neutral',
  particles: {
    intensity: 0.3,
    speed: 0.0005,
    color: '#6366f1',
    scale: 1,
  },
  learning: {
    justLearned: false,
    whatLearned: undefined,
    confidence: 0,
  },
  agentCreation: {
    isCreating: false,
    agentName: undefined,
    progress: 0,
  },
};

const behaviorPalette: Record<BehaviorState, { color: string; intensity: number; speed: number }> = {
  idle: { color: '#6366f1', intensity: 0.3, speed: 0.0005 },
  listening: { color: '#34d399', intensity: 0.7, speed: 0.003 },
  thinking: { color: '#0ea5e9', intensity: 0.9, speed: 0.004 },
  speaking: { color: '#f97316', intensity: 0.8, speed: 0.003 },
  excited: { color: '#facc15', intensity: 1, speed: 0.007 },
  confused: { color: '#94a3b8', intensity: 0.5, speed: 0.0015 },
};

export const createAliveState = (behavior: BehaviorState, overrides?: Partial<AliveState>): AliveState => {
  const palette = behaviorPalette[behavior];
  return {
    behavior,
    emotion: overrides?.emotion ?? 'neutral',
    particles: {
      intensity: overrides?.particles?.intensity ?? palette.intensity,
      speed: overrides?.particles?.speed ?? palette.speed,
      color: overrides?.particles?.color ?? palette.color,
      scale: overrides?.particles?.scale ?? (behavior === 'excited' ? 1.2 : 1),
    },
    learning: {
      ...defaultAliveState.learning,
      ...overrides?.learning,
    },
    agentCreation: {
      ...defaultAliveState.agentCreation,
      ...overrides?.agentCreation,
    },
  };
};
