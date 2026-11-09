import React from 'react';
import TelemetryBar from '@/components/TelemetryBar';
import CommandHub from '@/components/CommandHub';
import LiveTicker from '@/components/LiveTicker';
import MicroPass from '@/components/MicroPass';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 font-sans text-slate-200">
      <TelemetryBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-20 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            The Autonomous <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              National Super-Engine
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mb-12">
            No searching. No scrolling. Speak what you need, scan bills to slash prices, and unlock real-time local discounts driven entirely by AI.
          </p>

          <CommandHub />
        </div>

        <LiveTicker />
        <MicroPass />
      </div>
    </main>
  );
}