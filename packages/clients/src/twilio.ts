import * as crypto from 'node:crypto';
import { z } from 'zod';
import { retryFetch, type FetchLike } from '@ess/shared';

export const sendWhatsAppParams = z
  .object({
    to: z.string().min(5),
    text: z.string().optional(),
    mediaUrl: z.string().url().optional(),
  })
  .refine((v) => Boolean(v.text || v.mediaUrl), {
    message: 'Either text or mediaUrl is required',
    path: ['text'],
  });

export const sendWhatsAppResult = z.object({ messageSid: z.string().min(1) });

export const placeVoiceCallParams = z.object({
  to: z.string().min(5),
  audioUrl: z.string().url(),
  callerId: z.string().min(5).optional(),
});

export const placeVoiceCallResult = z.object({ callSid: z.string().min(1) });

export type TwilioClientOptions = {
  accountSid: string;
  authToken: string;
  messagingSid?: string;
  voiceCallerId?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

export class TwilioClient {
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly messagingSid: string | undefined;
  private readonly voiceCallerId: string | undefined;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: TwilioClientOptions) {
    this.accountSid = opts.accountSid;
    this.authToken = opts.authToken;
    this.messagingSid = opts.messagingSid;
    this.voiceCallerId = opts.voiceCallerId;
    this.baseUrl = opts.baseUrl ?? 'https://api.twilio.com';
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  async sendWhatsApp(input: z.infer<typeof sendWhatsAppParams>) {
    const params = sendWhatsAppParams.parse(input);
    // Network with retry/backoff (stub URL until real integration)
    if (this.fetchImpl) {
      const f = this.fetchImpl as unknown as FetchLike;
      await retryFetch(
        f,
        new URL('/2010-04-01/Accounts/AC/messages.json', this.baseUrl),
        { method: 'POST' },
        { maxRetries: 2, initialDelayMs: 50 },
      );
    }
    const messageSid = `SM_${randomId()}`;
    return sendWhatsAppResult.parse({ messageSid });
  }

  async placeVoiceCall(input: z.infer<typeof placeVoiceCallParams>) {
    const params = placeVoiceCallParams.parse({ callerId: this.voiceCallerId, ...input });
    if (this.fetchImpl) {
      const f = this.fetchImpl as unknown as FetchLike;
      await retryFetch(
        f,
        new URL('/2010-04-01/Accounts/AC/calls.json', this.baseUrl),
        { method: 'POST' },
        { maxRetries: 2, initialDelayMs: 50 },
      );
    }
    const callSid = `CA_${randomId()}`;
    return placeVoiceCallResult.parse({ callSid });
  }
}

export function computeTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
): string {
  const concatenated =
    url +
    Object.keys(params)
      .sort()
      .map((k) => `${k}${params[k] ?? ''}`)
      .join('');
  const hmac = crypto.createHmac('sha1', authToken);
  hmac.update(Buffer.from(concatenated, 'utf8'));
  return hmac.digest('base64');
}

export function verifyTwilioSignature(options: {
  authToken: string;
  url: string;
  params: Record<string, string>;
  headerSignature: string | undefined;
}): boolean {
  const { authToken, url, params, headerSignature } = options;
  if (!headerSignature) return false;
  const expected = computeTwilioSignature(authToken, url, params);
  const a = Buffer.from(expected);
  const b = Buffer.from(headerSignature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function randomId(): string {
  return Math.random().toString(36).slice(2);
}


