import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createServer } from '../server';

describe('POST /api/chat', () => {
  it('returns a newline-delimited stream of chunks', async () => {
    const app = createServer();

    const response = await request(app)
      .post('/api/chat')
      .send({ conversationId: 'conversation-1', content: 'Tell me something inspiring' })
      .expect(200);

    const lines = response.text.trim().split('\n');
    expect(lines.length).toBeGreaterThan(1);

    const lastChunk = JSON.parse(lines[lines.length - 1]);
    expect(lastChunk.done).toBe(true);
  });

  it('validates input', async () => {
    const app = createServer();

    const response = await request(app).post('/api/chat').send({ content: '' }).expect(400);
    expect(response.body.error.message).toBeDefined();
  });
});
