import { describe, it, expect } from 'vitest';
import {
  createOrUpsertLeadParams,
  dispatch,
  startSequenceParams,
} from './index';

describe('gemini tools schemas and dispatcher', () => {
  it('validates createOrUpsertLead params', () => {
    const parsed = createOrUpsertLeadParams.safeParse({ email: 'a@b.com', stage: 'warm' });
    expect(parsed.success).toBe(true);
  });

  it('dispatcher enforces auth', async () => {
    await expect(
      dispatch('startSequence', startSequenceParams.parse({ leadEmailOrId: 'id1', sequenceSlug: 'intro' }), {
        actor: 'unknown',
      }),
    ).rejects.toMatchObject({ message: 'Unauthorized' });
  });

  it('dispatcher enforces rate limit', async () => {
    const ctx = { actor: 'owner', apiKey: 'k1' as const };
    await dispatch('startSequence', { leadEmailOrId: 'id1', sequenceSlug: 'intro' }, ctx);
    await expect(
      dispatch('startSequence', { leadEmailOrId: 'id1', sequenceSlug: 'intro' }, ctx),
    ).rejects.toMatchObject({ message: 'Rate limit exceeded' });
  });
});


