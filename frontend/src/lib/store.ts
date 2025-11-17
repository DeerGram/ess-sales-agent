import { create } from 'zustand';

export type Theme = 'light' | 'dark';

export interface AgentSummary {
  id: string;
  name: string;
  status: string;
  description?: string;
}

interface SettingChangeState {
  key: string;
  value: unknown;
  confidence: number;
}

interface EmberState {
  theme: Theme;
  pendingAgents: AgentSummary[];
  lastSettingChange?: SettingChangeState;
  setTheme: (theme: Theme) => void;
  addPendingAgent: (agent: AgentSummary) => void;
  resolveAgent: (agentId: string) => void;
  setLastSettingChange: (change: SettingChangeState) => void;
}

export const useEmberStore = create<EmberState>((set) => ({
  theme: 'dark',
  pendingAgents: [],
  lastSettingChange: undefined,
  setTheme: (theme) => set({ theme }),
  addPendingAgent: (agent) =>
    set((state) => ({
      pendingAgents: [...state.pendingAgents.filter((a) => a.id !== agent.id), agent],
    })),
  resolveAgent: (agentId) =>
    set((state) => ({
      pendingAgents: state.pendingAgents.filter((agent) => agent.id !== agentId),
    })),
  setLastSettingChange: (change) => set({ lastSettingChange: change }),
}));
