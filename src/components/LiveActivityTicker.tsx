'use client';
import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

const activities = [
  "⚡ Srikanth in Indiranagar just slashed ₹1,200 on Dental Care • 14s ago",
  "🏪 A2B Partner in 560001 just claimed a ₹850 Swarm Order • 2m ago",
  "⚡ Priya from Jayanagar locked a 1.5T AC Deal for ₹29,000 • 5m ago",
  "🏪 Metro Plumbers just joined the Auto-Bidder Network • 12m ago"
];

export default function LiveActivityTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activities.length);
        setVisible(true);
      }, 500); // 500ms fade out transition
    }, 6000); // Rotate every 6 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`fixed bottom-6 left-6 z-[90] max-w-sm transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
       <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700/50 shadow-2xl rounded-full py-2 px-4 flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center animate-pulse shrink-0">
             <Zap className="w-3 h-3 text-white" />
          </div>
          <p className="text-xs font-medium text-gray-300 line-clamp-1">{activities[currentIndex]}</p>
       </div>
    </div>
  );
}
