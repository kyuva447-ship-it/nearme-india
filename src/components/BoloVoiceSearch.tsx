'use client';
import { useState } from 'react';
import { Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BoloVoiceSearch({ onResult }: { onResult: (t: string) => void }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = () => {
    const SpeechRecognition =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    let latestTranscript = '';

    recognition.onstart = () => setIsListening(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const currentTranscript = event.results[current][0].transcript;
      latestTranscript = currentTranscript;
      setTranscript(currentTranscript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (latestTranscript.trim()) {
        onResult(latestTranscript.trim());
        setTranscript('');
      }
    };

    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={startListening}
        className="w-full bg-gradient-to-br from-amber-400 to-orange-500 p-6 rounded-3xl shadow-xl shadow-orange-500/20 hover:scale-105 transition-all flex flex-col items-center gap-3"
      >
        <div
          className={`w-16 h-16 bg-white/20 rounded-full backdrop-blur flex items-center justify-center ${
            isListening ? 'animate-pulse' : ''
          }`}
        >
          <Mic className="w-8 h-8 text-white" />
        </div>
        <span className="font-black tracking-wider text-white">BOLO</span>
      </button>

      <AnimatePresence>
        {isListening && transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-16 left-0 right-0 bg-white text-black p-3 rounded-xl shadow-2xl text-center text-sm font-bold z-50"
          >
            &quot;{transcript}&quot;
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
