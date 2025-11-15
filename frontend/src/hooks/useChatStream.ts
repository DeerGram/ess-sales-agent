import { useCallback, useRef } from 'react';
import type { StreamChunk } from '../lib/types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

interface SendMessageInput {
  conversationId?: string;
  content: string;
  metadata?: Record<string, unknown>;
}

interface StreamHandlers {
  onChunk?: (chunk: StreamChunk) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export const useChatStream = () => {
  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const sendMessage = useCallback(
    async (payload: SendMessageInput, handlers: StreamHandlers) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch(`${API_URL}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Chat request failed: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('Readable stream not supported in this environment.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          let newlineIndex = buffer.indexOf('\n');

          while (newlineIndex !== -1) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);

            if (line.length > 0) {
              try {
                const chunk: StreamChunk = JSON.parse(line);
                handlers.onChunk?.(chunk);
              } catch (error) {
                console.error('Failed to parse stream chunk', error);
              }
            }

            newlineIndex = buffer.indexOf('\n');
          }
        }

        if (buffer.trim()) {
          try {
            const chunk: StreamChunk = JSON.parse(buffer.trim());
            handlers.onChunk?.(chunk);
          } catch (error) {
            console.error('Failed to parse final stream chunk', error);
          }
        }

        handlers.onComplete?.();
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }

        handlers.onError?.(error as Error);
        throw error;
      }
    },
    [],
  );

  return { sendMessage, cancel };
};
