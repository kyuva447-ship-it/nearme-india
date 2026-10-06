import React, { useState } from 'react';
import { Briefcase, MapPin, Phone, MessageSquare } from 'lucide-react';

export default function AIBrokerPipeline({ userCoords }) {
  const [jobType, setJobType] = useState('Bulk Order (Manufacturer)');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would push to Supabase custom_jobs table
    // and trigger a broadcast to relevant sellers.
    setTimeout(() => setSubmitted(true), 1000);
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-200 p-6 rounded-2xl text-center space-y-3">
        <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
          <Briefcase className="text-emerald-600 w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-lg">AI Broker Deployed!</h3>
        <p className="text-sm text-slate-600">
          Your requirement has been blasted to the top 10 matched {jobType.split(' ')[0]}s near you. They will contact you shortly.
        </p>
        <button onClick={() => setSubmitted(false)} className="text-emerald-700 font-bold text-sm underline">Post another requirement</button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-black text-slate-900 text-base">High-Value AI Broker</h2>
          <p className="text-xs text-slate-500">Post B2B, Bulk, or Real Estate requirements. We find the sellers.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">I need a...</label>
          <select
            value={jobType}
            onChange={e => setJobType(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option>Bulk Order (Manufacturer)</option>
            <option>Commercial Space (Real Estate Broker)</option>
            <option>Corporate Event Catering</option>
            <option>Agency / IT Project</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Details & Scope</label>
          <textarea
            required
            placeholder="e.g., I need 5,000 cotton t-shirts stitched by next month..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm h-20 resize-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Est. Budget</label>
            <input
              type="text"
              placeholder="e.g., ₹5 Lakhs"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">My Contact No.</label>
            <input
              required
              type="tel"
              placeholder="10-digit number"
              value={contact}
              onChange={e => setContact(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="pt-2">
           <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md active:scale-95">
             🚀 Post & Auto-Match Sellers
           </button>
           <p className="text-center text-[10px] text-slate-400 mt-2">Relevant sellers pay a premium to unlock your contact.</p>
        </div>
      </form>
    </div>
  );
}
