'use client';

import React, { useState } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AgenticConcierge() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        const city = localStorage.getItem('nearme_city') || 'All India';
        router.push(`/search?q=${encodeURIComponent(input)}&city=${encodeURIComponent(city)}`);
        setIsOpen(false);
        setInput('');
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform z-50 animate-bounce"
            >
                <Bot className="w-6 h-6" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-80 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-fade-in">
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-4 flex justify-between items-center border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm">AI Concierge</h4>
                        <p className="text-xs text-blue-300">Online & Ready</p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>

            <div className="p-4 bg-gray-950 flex-1 min-h-[200px]">
                <div className="bg-gray-800 p-3 rounded-xl rounded-tl-none text-sm text-gray-300 mb-4 shadow-sm border border-gray-700">
                    Hi! I'm the NearMe 4-Agent AI. Tell me what service you need and I'll find you the lowest negotiated price in your city right now.
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-800 bg-gray-900 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g. AC Repair"
                    className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                    autoFocus
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors">
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
