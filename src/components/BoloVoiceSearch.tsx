'use client';

import React, { useState } from 'react';
import { Mic, Search } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export default function BoloVoiceSearch({ onSearch }: { onSearch: (q: string) => void }) {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
        console.warn("Browser does not support voice search.");
        return;
    }

    setIsListening(true);
    trackEvent('voice_search_started');

    // @ts-ignore
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-IN'; // Default to Indian English, can be dynamic later

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onSearch(transcript);
      setIsListening(false);
      trackEvent('voice_search_success', { query: transcript });
    };

    recognition.onerror = () => {
      setIsListening(false);
      trackEvent('voice_search_error');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <button
      onClick={startListening}
      className={`p-4 rounded-2xl transition-all flex items-center justify-center relative overflow-hidden ${
        isListening ? 'bg-pink-600 shadow-lg shadow-pink-500/50' : 'bg-slate-800 hover:bg-slate-700'
      }`}
    >
      {isListening && (
        <div className="absolute inset-0 bg-pink-500/20 animate-ping rounded-2xl" />
      )}
      <Mic className={`w-6 h-6 ${isListening ? 'text-white animate-pulse' : 'text-slate-400'}`} />
    </button>
  );
}
