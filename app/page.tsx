'use client';

import { useState } from 'react';

type Message = { role: 'human' | 'ai'; content: string };

export default function SupportChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionId = 'user-session-123'; // Static local session ID for test

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'human', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:4000/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: userMessage }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'ai', content: data.answer }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: 'ai', content: 'Error communicating with support backend.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-6 bg-gray-50 text-slate-800">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6 flex flex-col h-[80vh]">
        <h1 className="text-xl font-bold mb-4 border-b pb-2">Customer Support AI Assistant</h1>
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.length === 0 && (
            <p className="text-gray-400 text-center mt-20">Ask a question regarding shipping, passwords, or refunds...</p>
          )}
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'human' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-lg text-sm ${m.role === 'human' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div className="text-sm text-gray-400 animate-pulse">Support agent is typing...</div>}
        </div>

        {/* Input Form */}
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your support request..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
            Send
          </button>
        </form>
      </div>
    </main>
  );
}