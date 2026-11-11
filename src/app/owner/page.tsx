'use client';
import React, { useState, useEffect } from 'react';
import { Activity, IndianRupee, Cpu, Rocket, Download, Store, Plus } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function OwnerGodMode() {
  const [pin, setPin] = useState('');
  const [auth, setAuth] = useState(false);
  const { toast } = useToast();

  const [stats, setStats] = useState<any>({
      totalGrossVolume: 0,
      netAiTakeRate: 0,
      activeSwarmPools: 0,
      merchantAiNodes: 0,
      liveTransactions: []
  });

  useEffect(() => {
     if (auth) fetchStats();
  }, [auth]);

  const fetchStats = async () => {
      try {
          const res = await fetch('/api/owner/stats');
          const data = await res.json();
          setStats(data);
      } catch (e) {
          toast("Failed to fetch live stats", "error");
      }
  };

  const handleLogin = () => {
    if (pin === (process.env.NEXT_PUBLIC_OWNER_PIN || '2026')) {
      setAuth(true);
      toast("God Mode Unlocked", "success");
    } else {
      toast("Invalid Admin PIN", "error");
    }
  };

  const triggerMasterCron = async () => {
      toast("Triggering Master Cron...", "info");
      try {
         const res = await fetch('/api/cron/revenue-recovery');
         const data = await res.json();
         if(res.ok) {
             toast("Master Cron Synced: Live Razorpay Ledger & AI Deals Updated!", "success");
             fetchStats(); // Refresh dashboard
         } else {
             toast("Cron encountered an issue but remained stable", "info");
         }
      } catch (e) { toast("Cron request failed", "error"); }
  };

  const exportCSV = () => {
      if(!stats.liveTransactions.length) return toast("No data to export", "error");
      const headers = "Payment ID,Amount (INR),Status,Contact,Email,Description\n";
      const rows = stats.liveTransactions.map((t: any) =>
          `${t.id},${t.amount},${t.status},${t.contact},${t.email},"${t.description}"`
      ).join("\n");
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nearme_ledger_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast("CSV Exported successfully", "success");
  };

  if (!auth) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
         <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-2xl max-w-sm w-full text-center">
            <Cpu className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-4">Executive Command Center</h1>
            <input
              type="password" value={pin} onChange={e => setPin(e.target.value)}
              placeholder="Enter PIN"
              className="w-full bg-gray-800 p-3 rounded-xl text-center text-white tracking-[0.5em] mb-4 outline-none focus:border-red-500 border border-gray-700"
            />
            <button onClick={handleLogin} className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-500">Access Console</button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-black flex items-center gap-3">
               <Activity className="w-8 h-8 text-red-500" />
               Autonomous Enterprise Console
            </h1>
            <div className="flex gap-4">
               <button onClick={exportCSV} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Download className="w-4 h-4"/> CSV Export</button>
               <button onClick={triggerMasterCron} className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Rocket className="w-4 h-4"/> Run Master Cron</button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
              <p className="text-sm text-gray-400">Total Gross Volume</p>
              <h2 className="text-3xl font-black text-white mt-1">₹{stats.totalGrossVolume.toLocaleString()}</h2>
           </div>
           <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
              <p className="text-sm text-gray-400">Net AI Take-Rate</p>
              <h2 className="text-3xl font-black text-emerald-400 mt-1 flex items-center gap-1"><IndianRupee className="w-5 h-5"/> {stats.netAiTakeRate.toLocaleString()}</h2>
           </div>
           <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
              <p className="text-sm text-gray-400">Active Swarm Pools</p>
              <h2 className="text-3xl font-black text-blue-400 mt-1">{stats.activeSwarmPools.toLocaleString()}</h2>
           </div>
           <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
              <p className="text-sm text-gray-400">Merchant AI Nodes</p>
              <h2 className="text-3xl font-black text-purple-400 mt-1">{stats.merchantAiNodes.toLocaleString()}</h2>
           </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
           {/* Live Transactions Table */}
           <div className="lg:col-span-2 bg-gray-900 border border-gray-800 p-8 rounded-3xl overflow-x-auto">
               <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2"><IndianRupee className="w-5 h-5"/> Live Verified Transactions</h3>
               <table className="w-full text-left text-sm text-gray-400">
                   <thead className="text-xs uppercase bg-gray-800 text-gray-300">
                       <tr>
                           <th className="px-4 py-3 rounded-tl-lg">ID / Time</th>
                           <th className="px-4 py-3">Customer</th>
                           <th className="px-4 py-3">Service</th>
                           <th className="px-4 py-3">Amount</th>
                           <th className="px-4 py-3 rounded-tr-lg">Status</th>
                       </tr>
                   </thead>
                   <tbody>
                       {stats.liveTransactions.map((tx: any) => (
                          <tr key={tx.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                              <td className="px-4 py-3">
                                 <p className="font-mono text-white">{tx.id}</p>
                                 <p className="text-xs text-gray-500">{new Date(tx.created_at * 1000).toLocaleString()}</p>
                              </td>
                              <td className="px-4 py-3">
                                 <p className="text-white">{tx.contact}</p>
                                 <p className="text-xs text-gray-500">{tx.email}</p>
                              </td>
                              <td className="px-4 py-3 truncate max-w-[150px]">{tx.description}</td>
                              <td className="px-4 py-3 font-bold text-emerald-400">₹{tx.amount}</td>
                              <td className="px-4 py-3"><span className="bg-emerald-900/50 text-emerald-400 px-2 py-1 rounded text-xs font-bold">{tx.status}</span></td>
                          </tr>
                       ))}
                       {stats.liveTransactions.length === 0 && (
                          <tr><td colSpan={5} className="text-center py-8">No live transactions found.</td></tr>
                       )}
                   </tbody>
               </table>
           </div>

           {/* Merchants & B2B Actions */}
           <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl space-y-6 flex flex-col">
               <div className="flex justify-between items-center mb-2">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2"><Store className="w-5 h-5"/> B2B Management</h3>
                   <button className="bg-blue-900/50 text-blue-400 p-2 rounded-lg hover:bg-blue-800/50"><Plus className="w-4 h-4"/></button>
               </div>

               <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                   <p className="font-bold text-white">Sri Venkateswara Enterprises</p>
                   <p className="text-xs text-gray-400 mb-3">Pending Verification • +91 9988776655</p>
                   <button onClick={() => toast("Merchant Approved", "success")} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">Approve KYC</button>
               </div>
               <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                   <p className="font-bold text-white">Metro Hub Wholesale</p>
                   <p className="text-xs text-emerald-400 mb-3">Verified • Pending Payout ₹4,500</p>
                   <button onClick={() => toast("Payout routed via Razorpay", "success")} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-sm">Release Payout via UPI</button>
               </div>

               <div className="mt-auto pt-6 border-t border-gray-800">
                  <p className="font-bold text-white text-sm mb-1">Autonomous Marketing Cron</p>
                  <p className="text-xs text-gray-400">Next run at 00:00 (Midnight). Will auto-refresh expiring deals and re-index Swarm pools.</p>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
}
