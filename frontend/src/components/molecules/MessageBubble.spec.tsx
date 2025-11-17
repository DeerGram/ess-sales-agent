import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import MessageBubble from './MessageBubble';
import type { Message } from '../../lib/types';

const baseMessage: Message = {
  id: '1',
  sender: 'assistant',
  content: 'Hello world',
  createdAt: Date.now(),
};

afterEach(() => {
  cleanup();
});

describe('MessageBubble', () => {
  it('renders message text', () => {
    render(<MessageBubble message={baseMessage} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders user styling', () => {
    render(<MessageBubble message={{ ...baseMessage, sender: 'user' }} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });
});
