import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import ChatInterface from '../components/organisms/ChatInterface';
import ParticleHero from '../components/organisms/ParticleHero';
import ChatInput from '../components/molecules/ChatInput';
import { useChatStream } from '../hooks/useChatStream';
import { useAliveState } from '../hooks/useAliveState';
import type { Message, StreamChunk } from '../lib/types';
import { useEmberStore, type Theme } from '../lib/store';

const createMessageId = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { aliveState, updateAliveState, isCelebrating } = useAliveState();
  const { sendMessage } = useChatStream();
  const theme = useEmberStore((state) => state.theme);
  const setTheme = useEmberStore((state) => state.setTheme);
  const addPendingAgent = useEmberStore((state) => state.addPendingAgent);
  const pendingAgents = useEmberStore((state) => state.pendingAgents);
  const setLastSettingChange = useEmberStore((state) => state.setLastSettingChange);
  const lastSettingChange = useEmberStore((state) => state.lastSettingChange);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (aliveState.learning.justLearned && aliveState.learning.whatLearned?.toLowerCase().includes('dark')) {
      setTheme('dark');
    }
  }, [aliveState.learning.justLearned, aliveState.learning.whatLearned, setTheme]);

  const handleEventChunk = useCallback(
    (chunk: StreamChunk) => {
      if (!chunk.eventType) {
        return;
      }

      if (chunk.eventType === 'setting_change' && chunk.payload) {
        const key = String(chunk.payload.key ?? '');
        const value = chunk.payload.value;
        const confidence = Number(chunk.payload.confidence ?? 0);
        setLastSettingChange({ key, value, confidence });

        if (key === 'theme' && (value === 'dark' || value === 'light')) {
          setTheme(value as Theme);
        }

        if (chunk.content) {
          setMessages((prev) => [
            ...prev,
            {
              id: createMessageId(),
              sender: 'system',
              content: chunk.content,
              createdAt: Date.now(),
            },
          ]);
        }
      }

      if (chunk.eventType === 'agent_created' && chunk.payload) {
        addPendingAgent({
          id: String(chunk.payload.id ?? createMessageId()),
          name: String(chunk.payload.name ?? 'New Agent'),
          status: String(chunk.payload.status ?? 'scheduled'),
          description: chunk.payload.reason as string | undefined,
        });

        setMessages((prev) => [
          ...prev,
          {
            id: createMessageId(),
            sender: 'system',
            content: `Spawning agent ${chunk.payload.name ?? ''}`.trim(),
            createdAt: Date.now(),
          },
        ]);
      }

      if (chunk.eventType === 'learning_update' && chunk.content) {
        setMessages((prev) => [
          ...prev,
          {
            id: createMessageId(),
            sender: 'system',
            content: chunk.content,
            createdAt: Date.now(),
          },
        ]);
      }
    },
    [addPendingAgent, setLastSettingChange, setMessages, setTheme],
  );

  const handleSendMessage = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: createMessageId(),
      sender: 'user',
      content: trimmed,
      createdAt: Date.now(),
    };

    const assistantMessageId = createMessageId();
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      sender: 'assistant',
      content: '',
      createdAt: Date.now(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setInputValue('');
    setIsLoading(true);

    try {
      await sendMessage(
        {
          conversationId: 'demo',
          content: trimmed,
        },
        {
          onChunk: (chunk) => {
              if (chunk.eventType) {
                handleEventChunk(chunk);
              }

            if (chunk.aliveState) {
              updateAliveState(chunk.aliveState);
            }

            if (chunk.content || chunk.component) {
              setMessages((prev) =>
                prev.map((message) => {
                  if (message.id !== assistantMessageId) {
                    return message;
                  }

                  return {
                    ...message,
                    content: `${message.content}${chunk.content ?? ''}`,
                    component: chunk.component ?? message.component,
                  };
                }),
              );
            }

            if (chunk.done) {
              setMessages((prev) =>
                prev.map((message) =>
                  message.id === assistantMessageId
                    ? {
                        ...message,
                        isStreaming: false,
                        createdAt: Date.now(),
                      }
                    : message,
                ),
              );
            }
          },
          onError: (error) => {
            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantMessageId
                  ? {
                      ...message,
                      isStreaming: false,
                      content:
                        message.content ||
                        'I hit a snag while generating your response. Please try again.',
                    }
                  : message,
              ),
            );
            console.error(error);
          },
          onComplete: () => {
            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantMessageId
                  ? {
                      ...message,
                      isStreaming: false,
                    }
                  : message,
              ),
            );
          },
        },
      );
    } finally {
      setIsLoading(false);
    }
  }, [handleEventChunk, inputValue, isLoading, sendMessage, updateAliveState]);

  const statusText = useMemo(() => {
    if (isCelebrating) {
      return aliveState.learning.whatLearned ?? 'EMBER just learned something new';
    }
    if (pendingAgents.length > 0) {
      const agent = pendingAgents[pendingAgents.length - 1];
      return `Spawning ${agent.name}…`;
    }
    if (aliveState.agentCreation.isCreating) {
      return `Spawning ${aliveState.agentCreation.agentName ?? 'new agent'}…`;
    }
    if (lastSettingChange) {
      return `Adjusting ${lastSettingChange.key} preferences`;
    }
    switch (aliveState.behavior) {
      case 'listening':
        return 'Listening closely';
      case 'thinking':
        return 'Considering the best response';
      case 'speaking':
        return 'Responding in real time';
      case 'excited':
        return 'Excited energy detected';
      case 'confused':
        return 'Clarifying the context';
      default:
        return 'Standing by';
    }
  }, [aliveState, isCelebrating, lastSettingChange, pendingAgents]);

  const containerClass = useMemo(
    () =>
      clsx('flex min-h-screen flex-col text-white transition-colors duration-500', {
        'bg-[radial-gradient(circle_at_top,_#0f172a,_#020617)] dark theme-winter': theme === 'dark',
        'bg-[radial-gradient(circle_at_top,_#1a103d,_#050312)] theme-spring': theme === 'light',
      }),
    [theme],
  );

  return (
    <div className={containerClass}>
      <div className="relative h-[60vh] w-full overflow-hidden">
        <ParticleHero aliveState={aliveState} statusText={statusText} />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-6 p-6">
        <ChatInterface messages={messages} isStreaming={isLoading} />
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          disabled={isLoading}
          placeholder="Ask EMBER anything…"
        />
      </div>
    </div>
  );
};

export default ChatPage;
