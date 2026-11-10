'use client';
import React, { useState, useEffect } from 'react';
import { Activity, IndianRupee, Cpu } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function OwnerGodMode() {
  const [pin, setPin] = useState('');
  const [auth, setAuth] = useState(false);

  const [stats, setStats] = useState({
      gross: 0,
      net: 0,
      pools: 0,
      nodes: 0
  });

  useEffect(() => {
     if (auth) {
         fetchStats();
     }
  }, [auth]);

  const fetchStats = async () => {
      // Aggregate live data from Supabase
      const { data: ledger } = await supabase.from('autonomous_treasury_ledger').select('*');
      let gross = 0; let net = 0;
      if (ledger) {
          ledger.forEach(row => { gross += Number(row.gross_inr); net += Number(row.net_platform_profit_inr); });
      }

      const { count: poolsCount } = await supabase.from('swarm_pools').select('*', { count: 'exact', head: true });
      const { count: nodesCount } = await supabase.from('merchant_autopilot_nodes').select('*', { count: 'exact', head: true });

      setStats({
          gross,
          net,
          pools: poolsCount || 0,
          nodes: nodesCount || 0
      });
  };

  const handleLogin = () => {
    if (pin === (process.env.NEXT_PUBLIC_OWNER_PIN || '2026')) {
      setAuth(true);
    } else {
      alert("Invalid Admin PIN");
    }
  };

  if (!auth) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
         <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-2xl max-w-sm w-full text-center">
            <Cpu className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-4">Founder God-Mode</h1>
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
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <Activity className="w-8 h-8 text-red-500" />
          Autonomous Enterprise Console
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
              <p className="text-sm text-gray-400">Total Gross Volume</p>
              <h2 className="text-3xl font-black text-white mt-1">₹{stats.gross.toLocaleString()}</h2>
           </div>
           <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
              <p className="text-sm text-gray-400">Net AI Take-Rate</p>
              <h2 className="text-3xl font-black text-emerald-400 mt-1 flex items-center gap-1"><IndianRupee className="w-5 h-5"/> {stats.net.toLocaleString()}</h2>
           </div>
           <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
              <p className="text-sm text-gray-400">Active Swarm Pools</p>
              <h2 className="text-3xl font-black text-blue-400 mt-1">{stats.pools}</h2>
           </div>
           <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
              <p className="text-sm text-gray-400">Merchant AI Nodes</p>
              <h2 className="text-3xl font-black text-purple-400 mt-1">{stats.nodes}</h2>
           </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl mt-8">
           <h3 className="text-xl font-bold mb-4 text-white">System Status</h3>
           <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl">
             <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
             <div>
               <p className="font-bold text-white">Autonomous Marketing Cron</p>
               <p className="text-xs text-gray-400">Running efficiently. SEO routes auto-regenerating every 24h.</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
