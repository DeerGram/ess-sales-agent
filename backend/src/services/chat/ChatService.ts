import type { StreamChunk } from '../../models/types';
import { createAliveState } from '../../utils/aliveState';

interface ProcessMessageInput {
  userId: string;
  conversationId: string;
  content: string;
}

export class ChatService {
  async *streamResponse({ content }: ProcessMessageInput): AsyncGenerator<StreamChunk> {
    const sentences = this.chunkContent(content);

    yield {
      aliveState: createAliveState('thinking', {
        emotion: 'empathetic',
      }),
    };

    for (const sentence of sentences) {
      await this.delay(350);
      yield {
        content: ` ${sentence}`,
        aliveState: createAliveState('speaking', {
          particles: { speed: 0.004 + Math.random() * 0.002, intensity: 0.8 },
        }),
      };
    }

    if (content.length > 80) {
      yield {
        aliveState: createAliveState('thinking', {
          learning: {
            justLearned: true,
            whatLearned: 'Preference: detailed context',
            confidence: 0.82,
          },
        }),
      };
    }

    yield { done: true, aliveState: createAliveState('idle') };
  }

  private chunkContent(content: string): string[] {
    const reflections = [
      'Here is how I interpret that.',
      'I am synthesizing your intent in real-time.',
      'Let me share an actionable plan.',
    ];

    return [
      reflections[Math.floor(Math.random() * reflections.length)],
      content.length > 120
        ? 'I will follow up with sub-agent suggestions once this stream ends.'
        : 'Let me know if you want me to spawn an agent for this routine.',
      'Done. I am back to an idle state.',
    ];
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
