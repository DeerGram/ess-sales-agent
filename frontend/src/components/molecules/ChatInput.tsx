import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface ChatInputProps {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

const ChatInput = ({ value, onChange, onSend, disabled = false, placeholder, maxLength = 4000 }: ChatInputProps) => {
  const [isListening, setIsListening] = useState(false);

  const remaining = useMemo(() => Math.max(maxLength - value.length, 0), [value.length, maxLength]);

  const handleVoiceToggle = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice capture is not supported in this browser yet.');
      return;
    }

    // Placeholder toggle for UI feedback; wire actual recognition later.
    setIsListening((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        onSend();
      }
    },
    [onSend],
  );

  return (
    <motion.div
      className="relative w-full rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between pb-2 text-xs text-white/70">
        <span>EMBER speaks best when you do.</span>
        <span className={clsx('font-mono', remaining < 200 && 'text-amber-300')}>{remaining}</span>
      </div>
      <textarea
        className="h-28 w-full resize-none rounded-2xl bg-white/5 p-4 text-base text-white outline-none placeholder:text-white/40"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={maxLength}
      />
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          className={clsx(
            'inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm transition',
            isListening ? 'bg-rose-500/20 text-rose-200' : 'bg-white/5 text-white/70 hover:bg-white/10',
          )}
          onClick={handleVoiceToggle}
        >
          {isListening ? 'Listening…' : 'Hold to speak'}
        </button>
        <motion.button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl bg-white/90 px-6 py-3 text-slate-900 shadow-lg shadow-white/20"
          onClick={onSend}
          whileTap={{ scale: disabled ? 1 : 0.97 }}
          disabled={disabled}
        >
          Send
          <span aria-hidden>↗</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ChatInput;
