import { describe, it, expect } from 'vitest';
import { ConvertKitClient } from './convertkit';
import type { ResponseLike } from '@ess/shared';

function client() {
  return new ConvertKitClient({ apiKey: 'k' });
}

describe('ConvertKit client', () => {
  it('applyTag ok', async () => {
    const c = client();
    const res = await c.applyTag({ email: 'a@b.com', tag: 'warm' });
    expect(res.ok).toBe(true);
  });

  it('startSequence ok', async () => {
    const c = client();
    const res = await c.startSequence({ email: 'a@b.com', sequenceSlug: 'intro' });
    expect(res.ok).toBe(true);
  });

  it('fails validation on invalid email', async () => {
    const c = client();
    await expect(c.applyTag({ email: 'not-email', tag: 'x' } as any)).rejects.toBeTruthy();
  });

  it('retries on transient failure then succeeds (applyTag)', async () => {
    let call = 0;
    const failingFetch = (async () => {
      call += 1;
      if (call < 3) {
        return { status: 500 } as ResponseLike;
      }
      return { status: 200 } as ResponseLike;
    }) as any;
    const c = new ConvertKitClient({ apiKey: 'k', fetchImpl: failingFetch });
    const res = await c.applyTag({ email: 'a@b.com', tag: 'warm' });
    expect(res.ok).toBe(true);
  });
});


