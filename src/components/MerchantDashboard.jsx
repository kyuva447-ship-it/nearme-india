import React, { useState } from 'react';
import { Settings, BarChart2, Zap, Save, CheckCircle } from 'lucide-react';

const MerchantDashboard = ({ sellers, setSellers, loggedInSellerId, onClose }) => {
  const seller = sellers.find(s => s.id === loggedInSellerId);
  const [dealText, setDealText] = useState(seller?.current_deal_text || '');
  const [isAvailable, setIsAvailable] = useState(seller?.is_currently_available || false);
  const [saved, setSaved] = useState(false);

  if (!seller) return null;

  const handleSave = () => {
    setSellers(prev => prev.map(s => {
      if (s.id === seller.id) {
        return {
          ...s,
          current_deal_text: dealText,
          is_currently_available: isAvailable,
          deal_expiry_time: dealText ? new Date(Date.now() + 7200000).toISOString() : null
        };
      }
      return s;
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-black text-slate-900 text-xl flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" /> Merchant Control
          </h3>
          <button onClick={onClose} className="text-slate-400 font-bold text-xl hover:text-slate-600 transition-colors">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-blue-800">Total Leads</span>
              <BarChart2 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-blue-900">{seller.totalLeadsReceived || 0}</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-emerald-800">Wallet</span>
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-900">₹{seller.walletBalance?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-slate-100">
          <h4 className="font-bold text-slate-800 text-sm">Real-time Status Updates</h4>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Active Flash Deal</label>
            <input
              type="text"
              value={dealText}
              onChange={e => setDealText(e.target.value)}
              className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"
              placeholder="e.g. 20% off all items today!"
            />
            <p className="text-[10px] text-slate-400 mt-1">Leave blank to remove.</p>
          </div>

          <label className="flex items-center justify-between cursor-pointer p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <span className="text-sm font-bold text-slate-800">🟢 Live Ping Availability</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Show users you are ready to engage now.</p>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`} onClick={() => setIsAvailable(!isAvailable)}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isAvailable ? 'transform translate-x-6' : ''}`}></div>
            </div>
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={saved}
          className={`w-full font-bold py-3.5 rounded-xl text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 ${
            saved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
          }`}
        >
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved Successfully</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>

      </div>
    </div>
  );
};

export default MerchantDashboard;
