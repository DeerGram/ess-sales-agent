import { describe, it, expect } from 'vitest';
import { runOrchestration } from './orchestrator';

describe('orchestrator', () => {
  it('offloads when budget nearly exhausted', async () => {
    const msg = { from: 'whatsapp:+1', timestamp: new Date().toISOString(), text: 'hi' };
    let calls = 0;
    const now = () => (calls++ === 0 ? 0 : 5600);
    const res = await runOrchestration(msg, { deadlineMs: 6000, now });
    expect(res.offloaded).toBe(true);
    expect(res.actionsExecuted).toEqual([]);
  });
});


