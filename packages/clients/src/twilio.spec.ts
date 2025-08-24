import { describe, it, expect } from 'vitest';
import { TwilioClient, computeTwilioSignature, verifyTwilioSignature } from './twilio';
import type { ResponseLike } from '@ess/shared';

function client() {
  return new TwilioClient({ accountSid: 'AC_x', authToken: 'token', messagingSid: 'MG_x' });
}

describe('Twilio client', () => {
  it('sendWhatsApp returns messageSid', async () => {
    const c = client();
    const res = await c.sendWhatsApp({ to: 'whatsapp:+1555', text: 'hi' });
    expect(res.messageSid).toMatch(/^SM_/);
  });

  it('placeVoiceCall returns callSid', async () => {
    const c = client();
    const res = await c.placeVoiceCall({ to: '+1999', audioUrl: 'https://example.com/a.mp3' });
    expect(res.callSid).toMatch(/^CA_/);
  });

  it('retries on transient failure then succeeds (sendWhatsApp)', async () => {
    let call = 0;
    const failingFetch = (async () => {
      call += 1;
      if (call < 3) {
        return { status: 500 } as ResponseLike;
      }
      return { status: 200 } as ResponseLike;
    }) as any;
    const c = new TwilioClient({ accountSid: 'AC_x', authToken: 'token', messagingSid: 'MG_x', fetchImpl: failingFetch });
    const res = await c.sendWhatsApp({ to: 'whatsapp:+1555', text: 'hi' });
    expect(res.messageSid).toMatch(/^SM_/);
  });
});

describe('Twilio signature helpers', () => {
  it('verifies a valid signature', () => {
    const token = 'secret';
    const url = 'https://example.com/webhooks/twilio/whatsapp';
    const params = { From: 'a', To: 'b' };
    const sig = computeTwilioSignature(token, url, params);
    expect(verifyTwilioSignature({ authToken: token, url, params, headerSignature: sig })).toBe(true);
  });
});


