'use client';

import { useState } from 'react';
import { Phone } from 'lucide-react';
import { voiceHandoff } from '@/lib/voiceHandoff';

export default function LeadAction({ merchant }: { merchant: any }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    // Passing mock data since the real auth/DB fetch isn't wired up in the Home component
    await voiceHandoff(
      "I'm interested in your services",
      merchant.id,
      merchant.phone,
      { business_name: merchant.name, current_deal_text: merchant.current_deal_text },
      merchant.distance
    );
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold shadow-md shadow-emerald-500/30 transition-all active:scale-95 flex items-center gap-2"
    >
      <Phone className="w-4 h-4" />
      {isLoading ? 'Connecting...' : 'Connect'}
    </button>
  );
}
