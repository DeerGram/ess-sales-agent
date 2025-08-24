import { describe, it, expect } from 'vitest';
import { ElevenLabsClient, chunkText } from './elevenlabs';
import type { ResponseLike } from '@ess/shared';

describe('ElevenLabs chunking', () => {
  it('splits text by max chars', () => {
    const text = 'abcdefghij';
    const chunks = chunkText(text, 3);
    expect(chunks).toEqual(['abc', 'def', 'ghi', 'j']);
  });
});

describe('ElevenLabs synthesize', () => {
  it('returns first chunk audio URL and respects concurrency', async () => {
    let call = 0;
    const failingFetch = (async () => {
      call += 1;
      if (call < 3) {
        return { status: 500 } as ResponseLike;
      }
      return { status: 200 } as ResponseLike;
    }) as any;
    const client = new ElevenLabsClient({ apiKey: 'k', fetchImpl: failingFetch });
    const text = 'a'.repeat(1000);
    const res = await client.synthesize({ voiceId: 'v1', scriptText: text, maxCharsPerChunk: 200, concurrency: 3 });
    expect(res.audioUrl).toMatch(/^https:\/\/example.com\/audio\//);
  });
});


