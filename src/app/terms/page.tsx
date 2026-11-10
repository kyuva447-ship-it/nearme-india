import React from 'react';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 sm:p-16 font-sans">
      <div className="max-w-3xl mx-auto space-y-8 bg-gray-900 p-8 sm:p-12 rounded-3xl border border-gray-800 shadow-2xl">
        <div className="flex items-center gap-4 border-b border-gray-800 pb-6">
          <FileText className="w-10 h-10 text-purple-500" />
          <h1 className="text-3xl font-black">Terms of Service</h1>
        </div>
        <div className="prose prose-invert prose-lg text-gray-300">
          <p>
            <strong>NearMe-India Terms of Service.</strong> By using our AI routing platform, you agree to our automated bidding rules.
          </p>
          <p>
            The platform success fee (2% to 20%) is automatically split via Razorpay Route. All 60-second reverse-bids and AI App spawns are automated and final.
          </p>
        </div>
      </div>
    </div>
  );
}