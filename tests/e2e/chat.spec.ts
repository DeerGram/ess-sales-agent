import { test, expect } from '@playwright/test';

const conversationId = `e2e-${Date.now()}`;

const ndjsonToArray = (payload: string) =>
  payload
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));

test.describe('Chat streaming API', () => {
  test('streams AliveState aware chunks', async ({ request, baseURL }) => {
    test.skip(!baseURL, 'API base URL is required');

    let response;
    try {
      response = await request.post('/api/chat', {
        headers: { 'Content-Type': 'application/json' },
        data: {
          conversationId,
          content: 'Give me a one sentence update about EMBER.',
        },
      });
    } catch (error) {
      test.skip(`API not reachable: ${(error as Error).message}`);
      return;
    }

    expect(response.ok()).toBeTruthy();

    const payload = await response.text();
    const chunks = ndjsonToArray(payload);
    const finalChunk = chunks[chunks.length - 1];

    expect(finalChunk.done).toBe(true);
    expect(chunks.some((chunk) => chunk.aliveState)).toBe(true);
  });
});
