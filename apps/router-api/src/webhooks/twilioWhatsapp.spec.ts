import { describe, it, expect } from 'vitest';
import { createServer } from '../index';
import { computeTwilioSignature } from '../utils/twilioSignature';

describe('POST /webhooks/twilio/whatsapp', () => {
  it('rejects invalid signature with 403', async () => {
    const app = await createServer();
    process.env.TWILIO_AUTH_TOKEN = 'test_token';
    const body = new URLSearchParams({ From: 'whatsapp:+15551234567', To: 'whatsapp:+19998887777' });
    const res = await app.inject({
      method: 'POST',
      url: '/webhooks/twilio/whatsapp',
      payload: body.toString(),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'x-twilio-signature': 'invalid',
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'example.com',
      },
    });
    expect(res.statusCode).toBe(403);
    const json = res.json();
    expect(json).toHaveProperty('error');
    expect(json.error.type).toBe('AUTH');
  });

  it('accepts valid signature and returns empty TwiML', async () => {
    const app = await createServer();
    const auth = 'test_token';
    process.env.TWILIO_AUTH_TOKEN = auth;
    const params = {
      From: 'whatsapp:+15551234567',
      To: 'whatsapp:+19998887777',
      Body: 'Hello',
      NumMedia: '0',
    };
    const body = new URLSearchParams(params);
    const url = 'https://example.com/webhooks/twilio/whatsapp';
    const sig = computeTwilioSignature(auth, url, params);
    const res = await app.inject({
      method: 'POST',
      url: '/webhooks/twilio/whatsapp',
      payload: body.toString(),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'x-twilio-signature': sig,
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'example.com',
      },
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/xml');
    expect(res.body).toBe('<Response></Response>');
  });
});


