export type RetryOptions = {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs?: number;
  timeoutMs?: number;
  isRetryable?: (resOrErr: ResponseLike | Error) => boolean;
  jitter?: boolean;
};

export type ResponseLike = { status: number };
export type FetchLike = (input: string | URL, init?: { signal?: AbortSignal } & Record<string, unknown>) => Promise<ResponseLike>;

export async function retryFetch(
  fetchImpl: FetchLike,
  input: string | URL,
  init: Record<string, unknown> & { signal?: AbortSignal },
  options: RetryOptions,
): Promise<ResponseLike> {
  const {
    maxRetries,
    initialDelayMs,
    maxDelayMs = 10_000,
    timeoutMs = 8_000,
    isRetryable = defaultIsRetryable,
    jitter = true,
  } = options;

  let attempt = 0;
  let delay = initialDelayMs;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetchImpl(input, { ...(init ?? {}), signal: controller.signal });
      clearTimeout(timer);
      if (!isRetryable(res) || attempt >= maxRetries) return res;
      // fallthrough to retry
    } catch (err) {
      if (!(err instanceof Error) || !isRetryable(err) || attempt >= maxRetries) {
        throw err;
      }
    }

    attempt += 1;
    const sleepMs = jitter ? jittered(delay) : delay;
    // eslint-disable-next-line no-await-in-loop
    await sleep(sleepMs);
    delay = Math.min(maxDelayMs, Math.floor(delay * 2));
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function jittered(base: number): number {
  const r = 0.5 + Math.random();
  return Math.floor(base * r);
}

function defaultIsRetryable(resOrErr: ResponseLike | Error): boolean {
  if (resOrErr instanceof Error) return true; // network/timeouts
  if (resOrErr.status >= 500 || resOrErr.status === 429) return true;
  return false;
}


