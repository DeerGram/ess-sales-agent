import { z } from 'zod';
import { retryFetch, type FetchLike } from '@ess/shared';

export const synthesizeParams = z.object({
  voiceId: z.string().min(1),
  scriptText: z.string().min(1),
  maxCharsPerChunk: z.number().int().positive().default(400),
  concurrency: z.number().int().positive().default(2),
});

export const synthesizeResult = z.object({ audioUrl: z.string().url() });

export type ElevenLabsClientOptions = {
  apiKey: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

export class ElevenLabsClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: ElevenLabsClientOptions) {
    this.apiKey = opts.apiKey;
    this.baseUrl = opts.baseUrl ?? 'https://api.elevenlabs.io';
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  async synthesize(input: z.infer<typeof synthesizeParams>) {
    const params = synthesizeParams.parse(input);
    const chunks = chunkText(params.scriptText, params.maxCharsPerChunk);
    // Simulate parallel synthesis with concurrency limit
    const results: string[] = [];
    await promisePool(chunks, params.concurrency, async (text) => {
      // Stub: would POST to ElevenLabs API and return a signed URL
      if (this.fetchImpl) {
        const f = this.fetchImpl as unknown as FetchLike;
        await retryFetch(f, new URL('/v1/tts', this.baseUrl), { method: 'POST' }, { maxRetries: 2, initialDelayMs: 50 });
      }
      const url = `https://example.com/audio/${hash(text)}.mp3`;
      results.push(url);
    });
    // Stub: in real impl, would stitch audio and return a single URL (GCS signed URL)
    // For scaffold, return first chunk URL
    return synthesizeResult.parse({ audioUrl: results[0] });
  }
}

export function chunkText(text: string, maxChars: number): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(text.length, i + maxChars);
    chunks.push(text.slice(i, end));
    i = end;
  }
  return chunks;
}

async function promisePool<T>(items: T[], concurrency: number, worker: (item: T) => Promise<void>) {
  let index = 0;
  const runners: Promise<void>[] = [];
  for (let c = 0; c < Math.min(concurrency, items.length); c++) {
    runners.push(run());
  }
  await Promise.all(runners);

  async function run() {
    while (index < items.length) {
      const current = items[index];
      index += 1;
      if (current === undefined) continue;
      // eslint-disable-next-line no-await-in-loop
      await worker(current);
    }
  }
}

function hash(v: string): string {
  let h = 0;
  for (let i = 0; i < v.length; i++) h = (h * 31 + v.charCodeAt(i)) >>> 0;
  return h.toString(16);
}


