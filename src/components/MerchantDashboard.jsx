import React, { useState, useRef } from 'react';
import { Settings, BarChart2, Zap, Save, CheckCircle, QrCode, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const MerchantDashboard = ({ sellers, setSellers, loggedInSellerId, onClose }) => {
  const seller = sellers.find(s => s.id === loggedInSellerId);
  const qrRef = useRef(null);
  const [dealText, setDealText] = useState(seller?.current_deal_text || '');
  const [isAvailable, setIsAvailable] = useState(seller?.is_currently_available || false);
  const [saved, setSaved] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!seller) return null;

  const handleDownloadQR = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Make the canvas large enough for a high-quality print
    canvas.width = 1000;
    canvas.height = 1200;

    img.onload = () => {
      // Draw background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Header
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 60px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(seller.shopName, canvas.width/2, 120);

      // Draw Subheader
      ctx.fillStyle = "#10b981";
      ctx.font = "bold 40px Inter, sans-serif";
      ctx.fillText("Scan for Local Deals & Direct Chat", canvas.width/2, 180);

      // Draw QR Code
      ctx.drawImage(img, (canvas.width - 600)/2, 250, 600, 600);

      // Draw Footer
      ctx.fillStyle = "#64748b";
      ctx.font = "30px Inter, sans-serif";
      ctx.fillText("Powered by NearMe India", canvas.width/2, 950);
      ctx.fillText("nearme-india.org", canvas.width/2, 1000);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${seller.shopName.replace(/\s+/g, '_')}_QR_Poster.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

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

        <div className="flex gap-2">
          <button
            onClick={() => setShowQR(false)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg ${!showQR ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setShowQR(true)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 ${showQR ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <QrCode className="w-4 h-4" /> QR Storefront
          </button>
        </div>

        {!showQR ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
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
        ) : (
          <div className="space-y-6 flex flex-col items-center text-center animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <h4 className="font-black text-slate-900 text-lg">Your Print-Ready Storefront</h4>
              <p className="text-xs text-slate-500 max-w-[250px] mx-auto">Print this poster and stick it on your shop door. Customers who scan it bypass search and go straight to your profile.</p>
            </div>

            <div className="p-4 bg-white border-2 border-slate-100 shadow-sm rounded-2xl relative" ref={qrRef}>
              <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-2xl opacity-20 blur-sm"></div>
              <div className="relative bg-white p-4 rounded-xl">
                <QRCodeSVG
                  value={`https://nearme-india.org/?shop=${seller.id}`}
                  size={200}
                  bgColor={"#ffffff"}
                  fgColor={"#0f172a"}
                  level={"Q"}
                  includeMargin={false}
                />
              </div>
            </div>

            <button
              onClick={handleDownloadQR}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Download HD Poster (PNG)
            </button>
            <p className="text-[10px] text-slate-400 font-semibold">Auto-generates an A4 print-ready poster.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default MerchantDashboard;
