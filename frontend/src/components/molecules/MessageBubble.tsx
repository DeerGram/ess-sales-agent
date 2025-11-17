import clsx from 'clsx';
import type { Message } from '../../lib/types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';

  return (
    <div className={clsx('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-xl rounded-3xl border px-5 py-3 text-sm shadow-lg transition',
          isUser
            ? 'rounded-br-sm border-white/10 bg-white/80 text-slate-900'
            : 'rounded-bl-sm border-white/5 bg-slate-900/70 text-white',
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        {message.component && (
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/30 p-4">
            <pre className="overflow-x-auto text-xs text-white/70">
              {JSON.stringify(message.component, null, 2)}
            </pre>
          </div>
        )}
        {message.isStreaming && !isUser && <span className="mt-2 block text-xs text-white/50">…</span>}
      </div>
    </div>
  );
};

export default MessageBubble;
