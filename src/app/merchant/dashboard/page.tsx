'use client';
import { motion } from 'framer-motion';
import { Store, LogOut, LayoutDashboard, MessageSquare, TrendingUp, Settings, Wallet, Image, Phone, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function MerchantDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col fixed h-full z-10 hidden lg:flex">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl text-slate-900 tracking-tight">Merchant</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutDashboard />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<MessageSquare />} label="Active Leads" badge="3" active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} />
          <NavItem icon={<Wallet />} label="Wallet & Billing" active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} />
          <NavItem icon={<Image />} label="Catalog" active={activeTab === 'catalog'} onClick={() => setActiveTab('catalog')} />
          <NavItem icon={<TrendingUp />} label="Performance" active={activeTab === 'performance'} onClick={() => setActiveTab('performance')} />
          <NavItem icon={<Settings />} label="Store Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-slate-500 hover:text-red-500 font-bold p-3 rounded-xl hover:bg-red-50 transition-all mt-auto"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Welcome back, {session?.user?.name || 'Merchant'}! 👋</h1>
            <p className="text-slate-500 font-medium">Here is what's happening with your store today.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 hidden sm:block">
              <span className="text-xs font-bold text-emerald-600 block uppercase">Wallet Balance</span>
              <span className="text-xl font-black text-slate-900">₹ 450.00</span>
            </div>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/20">
              Top Up
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Leads (Today)" value="12" trend="+15%" positive={true} />
          <StatCard title="Amount Spent" value="₹ 36.00" trend="₹ 3/lead" positive={false} />
          <StatCard title="Store Views" value="342" trend="+5%" positive={true} />
        </div>

        {/* Availability Toggle - The Live Ping feature */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8 flex items-center justify-between">
           <div>
              <h3 className="font-bold text-slate-900 text-lg">Availability Status (Live Ping)</h3>
              <p className="text-slate-500 text-sm">Toggle this when you are ready to dispatch or take immediate requests.</p>
           </div>
           <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
        </div>

        {/* Flash Deals Settings */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
          <h3 className="font-bold text-slate-900 text-lg mb-4">Live Flash Deal</h3>
          <div className="grid gap-4">
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Current Deal Text</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-4 py-2" placeholder="e.g. 20% OFF today only" />
             </div>
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Expiry Time (Hours from now)</label>
                <input type="number" className="w-full border border-slate-200 rounded-lg px-4 py-2" placeholder="2" />
             </div>
             <button className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg w-fit mt-2">Update Deal</button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6">Recent Customer Connections</h2>
          <div className="space-y-4">
            <LeadItem name="Rahul S." query="Needs Plumber for pipe leak" time="10 mins ago" distance="0.8 km" />
            <LeadItem name="Priya M." query="Asking for drill machine price" time="1 hour ago" distance="1.2 km" />
            <LeadItem name="Amit K." query="Electrical repair urgently" time="2 hours ago" distance="2.5 km" />
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, badge, active, onClick }: { icon: React.ReactNode, label: string, badge?: string, active?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3 rounded-xl font-bold transition-all ${
        active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={active ? 'text-emerald-600' : 'text-slate-400'}>{icon}</span>
        {label}
      </div>
      {badge && (
        <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-md">{badge}</span>
      )}
    </button>
  );
}

function StatCard({ title, value, trend, positive }: { title: string, value: string, trend: string, positive: boolean }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-slate-500 font-bold text-sm mb-2">{title}</h3>
      <div className="flex items-end gap-3">
        <span className="text-3xl font-black text-slate-900">{value}</span>
        <span className={`text-sm font-bold mb-1 ${positive ? 'text-emerald-600' : 'text-slate-500'}`}>{trend}</span>
      </div>
    </div>
  );
}

function LeadItem({ name, query, time, distance }: { name: string, query: string, time: string, distance: string }) {
  return (
    <div className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
        <Phone className="w-5 h-5 text-slate-500 group-hover:text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-black text-slate-900 text-lg truncate">{name}</h4>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{time}</span>
        </div>
        <p className="text-slate-600 font-medium text-sm mb-2">{query}</p>
        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
          <MapPin className="w-3 h-3" /> {distance} away
        </div>
      </div>
    </div>
  );
}
