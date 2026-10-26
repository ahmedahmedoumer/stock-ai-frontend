'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

type Message = { role: 'human' | 'ai'; content: string; live?: boolean };

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionId = 'user-session-123';
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, loading, open]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'human', content: userMessage }]);
    setLoading(true);

    try {
      const data = await api<{ answer: string; usedLiveData?: boolean }>(
        '/chat/message',
        {
          method: 'POST',
          body: JSON.stringify({ sessionId, message: userMessage }),
        },
      );
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: data.answer, live: Boolean(data.usedLiveData) },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'Error communicating with support backend.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open ? (
        <div className="fixed bottom-24 right-4 z-40 flex h-[min(520px,70vh)] w-[min(380px,calc(100vw-2rem))] flex-col rounded-xl border border-slate-200 bg-white text-slate-800 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="text-sm font-bold">Customer Support</h2>
              <p className="text-xs text-slate-500">Ask about stock, sales, or shipping</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
              aria-label="Close support chat"
            >
              Close
            </button>
          </div>
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 ? (
              <p className="mt-10 text-center text-sm text-slate-400">
                Ask about products, warehouses, purchases, sales, shipping, or refunds.
              </p>
            ) : null}
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'human' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    message.role === 'human'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.content}
                  {message.live ? (
                    <p className="mt-2 text-[11px] text-slate-500">Live inventory from the APIs</p>
                  ) : null}
                </div>
              </div>
            ))}
            {loading ? (
              <div className="animate-pulse text-sm text-gray-400">
                Support agent is typing...
              </div>
            ) : null}
          </div>
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-200 p-3">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your support request..."
              className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed right-4 bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
        aria-label={open ? 'Hide support chat' : 'Open support chat'}
        aria-expanded={open}
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16v10H7l-3 3V6z" />
          </svg>
        )}
      </button>
    </>
  );
}
