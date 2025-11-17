import { useEffect, useRef } from 'react';
import type { Message } from '../../lib/types';
import MessageBubble from '../molecules/MessageBubble';

interface ChatInterfaceProps {
  messages: Message[];
  isStreaming?: boolean;
}

const ChatInterface = ({ messages, isStreaming = false }: ChatInterfaceProps) => {
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isStreaming && (
          <div className="text-sm text-white/60">EMBER is shaping a response…</div>
        )}
        <div ref={scrollAnchorRef} />
      </div>
    </div>
  );
};

export default ChatInterface;
