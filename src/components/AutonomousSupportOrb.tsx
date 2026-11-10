'use client';
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export default function AutonomousSupportOrb() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'agent', text: string}[]>([
    { role: 'agent', text: 'Hello! I am the Autonomous Engine. Enter your phone number or ask me about a refund, order, or swarm.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(p => [...p, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/support/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText, phone: localStorage.getItem('nearme_user_phone') })
      });
      const data = await res.json();
      setMessages(p => [...p, { role: 'agent', text: data.reply }]);
    } catch (e) {
      setMessages(p => [...p, { role: 'agent', text: 'Connection error. I am autonomously attempting a reboot.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:scale-110 transition-transform z-50 group"
      >
        <MessageSquare className="w-7 h-7 text-white" />
        <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping group-hover:hidden"></div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden z-[100] flex flex-col font-sans h-[500px]">
      <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="font-bold text-white text-sm">24/7 Autonomous AI Agent</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto bg-gray-950">
        {messages.map((m, i) => (
           <div key={i} className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'agent' ? 'bg-gray-800 text-gray-300 rounded-tl-none self-start border border-gray-700' : 'bg-blue-600 text-white rounded-tr-none self-end'}`}>
             {m.text}
           </div>
        ))}
        {loading && <div className="text-xs text-gray-500 animate-pulse self-start">Agent is analyzing vault...</div>}
      </div>

      <div className="p-4 bg-gray-800 border-t border-gray-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-full px-4 text-sm text-white outline-none focus:border-indigo-500"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
