import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 sm:p-16 font-sans">
      <div className="max-w-3xl mx-auto space-y-8 bg-gray-900 p-8 sm:p-12 rounded-3xl border border-gray-800 shadow-2xl">
        <div className="flex items-center gap-4 border-b border-gray-800 pb-6">
          <ShieldAlert className="w-10 h-10 text-emerald-500" />
          <h1 className="text-3xl font-black">Privacy Policy</h1>
        </div>
        <div className="prose prose-invert prose-lg text-gray-300">
          <p>
            <strong>NearMe-India Privacy Policy.</strong> We collect local pin code data, audio queries, and bills solely to route your requests to nearby merchants for reverse-bidding and price auditing.
          </p>
          <p>
            Payments are processed securely via Razorpay. We do not sell your data.
          </p>
        </div>
      </div>
    </div>
  );
}