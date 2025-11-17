import { expect, test } from 'vitest';
import { z } from 'zod';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:5000';

const integrationStartSchema = z.object({
  url: z.string().url(),
  state: z.string().min(10),
});

const integrationCompleteSchema = z.object({
  data: z.object({
    id: z.string(),
    service: z.string(),
    status: z.string(),
    auth: z.object({ accessToken: z.string() }),
  }),
});

test.describe('Integration contract', () => {
  test('returns a typed response for OAuth start', async () => {
    let response: Awaited<ReturnType<typeof fetch>>;
    try {
      response = await fetch(`${API_BASE_URL}/api/integrations/oauth/notion/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirectUri: 'http://localhost:3000/oauth/notion' }),
      });
    } catch (error) {
      test.skip(`API not reachable: ${(error as Error).message}`);
      return;
    }

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(() => integrationStartSchema.parse(payload)).not.toThrow();
  });

  test('completes OAuth callback contract', async () => {
    let startResponse: Awaited<ReturnType<typeof fetch>>;
    try {
      startResponse = await fetch(`${API_BASE_URL}/api/integrations/oauth/notion/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirectUri: 'http://localhost:3000/oauth/notion' }),
      });
    } catch (error) {
      test.skip(`API not reachable: ${(error as Error).message}`);
      return;
    }
    const startPayload = (await startResponse.json()) as { state: string };

    const callbackResponse = await fetch(`${API_BASE_URL}/api/integrations/oauth/notion/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: startPayload.state, code: 'contract-code', redirectUri: 'http://localhost:3000/oauth/notion' }),
    });

    expect(callbackResponse.status).toBe(200);
    const callbackPayload = await callbackResponse.json();
    expect(() => integrationCompleteSchema.parse(callbackPayload)).not.toThrow();
  });
});
