import React from 'react';
import { RefreshCcw } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 sm:p-16 font-sans">
      <div className="max-w-3xl mx-auto space-y-8 bg-gray-900 p-8 sm:p-12 rounded-3xl border border-gray-800 shadow-2xl">
        <div className="flex items-center gap-4 border-b border-gray-800 pb-6">
          <RefreshCcw className="w-10 h-10 text-orange-500" />
          <h1 className="text-3xl font-black">Cancellation & Refund Policy</h1>
        </div>
        <div className="prose prose-invert prose-lg text-gray-300">
          <p>
            <strong>Refunds for Automated AI Passes:</strong> Since all NearMe-India passes and QR codes are digitally delivered in real-time, cancellations are only permitted within 5 minutes of booking if the merchant has not yet scanned the pass.
          </p>
          <p>
            Approved refunds will be processed automatically back to the original UPI payment method within 5-7 business days via Razorpay Route. AI App generation fees (₹99) are strictly non-refundable once the app code is spawned.
          </p>
        </div>
      </div>
    </div>
  );
}
