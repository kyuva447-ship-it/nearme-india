import React from 'react';
import { Mail } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 flex flex-col items-center justify-center font-sans">
      <div className="max-w-2xl text-center space-y-6 bg-gray-900 p-12 rounded-3xl border border-gray-800 shadow-2xl">
        <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h1 className="text-4xl font-black">Contact NearMe-India</h1>
        <p className="text-lg text-gray-400 leading-relaxed">
          For all support, merchant onboarding, or payment inquiries, email us 24/7 at:
        </p>
        <a href="mailto:contact@nearme-india.org" className="inline-block text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
          contact@nearme-india.org
        </a>
        <p className="text-sm text-gray-500 mt-8">
          We operate a 100% autonomous 6-Engine AI platform.
        </p>
      </div>
    </div>
  );
}