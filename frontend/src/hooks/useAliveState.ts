import { useCallback, useMemo, useState } from 'react';
import type { AliveState } from '../lib/types';

const defaultAliveState: AliveState = {
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

export const useAliveState = () => {
  const [aliveState, setAliveState] = useState<AliveState>(defaultAliveState);

  const updateAliveState = useCallback((partial: Partial<AliveState>) => {
    setAliveState((prev) => ({
      behavior: partial.behavior ?? prev.behavior,
      emotion: partial.emotion ?? prev.emotion,
      particles: {
        ...prev.particles,
        ...partial.particles,
      },
      learning: {
        ...prev.learning,
        ...partial.learning,
      },
      agentCreation: {
        ...prev.agentCreation,
        ...partial.agentCreation,
      },
    }));
  }, []);

  const isCelebrating = useMemo(() => aliveState.learning.justLearned && aliveState.learning.confidence > 0.8, [aliveState.learning]);

  return { aliveState, updateAliveState, isCelebrating };
};
