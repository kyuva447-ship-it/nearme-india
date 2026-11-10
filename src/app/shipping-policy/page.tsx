import React from 'react';
import { Truck } from 'lucide-react';

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 sm:p-16 font-sans">
      <div className="max-w-3xl mx-auto space-y-8 bg-gray-900 p-8 sm:p-12 rounded-3xl border border-gray-800 shadow-2xl">
        <div className="flex items-center gap-4 border-b border-gray-800 pb-6">
          <Truck className="w-10 h-10 text-blue-500" />
          <h1 className="text-3xl font-black">Shipping & Delivery Policy</h1>
        </div>
        <div className="prose prose-invert prose-lg text-gray-300">
          <p>
            <strong>Instant Digital Delivery:</strong> NearMe-India is a 100% digital marketplace. All bookings, Swarm Pool passes, and AI Apps are delivered instantly via in-app QR code and automated WhatsApp fulfillment.
          </p>
          <p>
            Physical goods are fulfilled directly by the local merchant at their registered location. NearMe-India does not physically ship products. Please present your Digital QR Pass to the merchant for physical redemption.
          </p>
        </div>
      </div>
    </div>
  );
}
