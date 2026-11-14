'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ArrowUpDown,
  Filter,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  RotateCcw,
} from 'lucide-react';
import type { SeededEscrowRecord } from '@/lib/seeded-marketplace';

interface EscrowDashboardOrder {
  id: string;
  buyer: string;
  value: number;
  fee: number;
  status: 'MILESTONE_PENDING' | 'MILESTONE_COMPLETED';
  delivery: string;
}

type StatusFilter = 'ALL' | 'PENDING' | 'COMPLETED';
type SortOption = 'VALUE_DESC' | 'VALUE_ASC' | 'STATUS_PENDING' | 'STATUS_COMPLETED';

const DEFAULT_WORKFLOW_ORDERS: EscrowDashboardOrder[] = [
  {
    id: 'ORD-992',
    buyer: 'TechPark Pvt Ltd',
    value: 1500000,
    fee: 30000,
    status: 'MILESTONE_PENDING',
    delivery: 'Pending IoT Ping',
  },
  {
    id: 'ORD-414',
    buyer: 'Metro Builders',
    value: 850000,
    fee: 17000,
    status: 'MILESTONE_COMPLETED',
    delivery: 'Verified',
  },
];

export default function OrderWorkflowDashboard() {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'TRACKING'>('ACTIVE');
  const [orders, setOrders] = useState<EscrowDashboardOrder[]>(DEFAULT_WORKFLOW_ORDERS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('VALUE_DESC');
  const [milestoneRequested, setMilestoneRequested] = useState(false);

  useEffect(() => {
    fetch('/api/escrow')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.escrows || !Array.isArray(data.escrows) || data.escrows.length === 0) return;
        const liveMapped: EscrowDashboardOrder[] = (data.escrows as SeededEscrowRecord[]).map(
          (esc) => ({
            id: esc.id,
            buyer: `${esc.buyer_name} → ${esc.merchant_name}`,
            value: esc.total_amount_inr,
            fee: esc.owner_net_profit_inr,
            status:
              esc.status === 'ESCROW_LOCKED_15_85' ? 'MILESTONE_PENDING' : 'MILESTONE_COMPLETED',
            delivery:
              esc.status === 'RELEASED_TO_MERCHANT'
                ? 'Verified via 6-Digit Delivery OTP'
                : esc.status === 'REFUNDED_48HR_GUARANTEE'
                  ? '48h Escrow Guarantee Refunded'
                  : `Pending Delivery OTP (${esc.delivery_otp})`,
          })
        );
        setOrders([...liveMapped, ...DEFAULT_WORKFLOW_ORDERS]);
      })
      .catch(() => {});
  }, []);

  const counts = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'MILESTONE_PENDING').length;
    const completed = orders.filter((o) => o.status === 'MILESTONE_COMPLETED').length;
    return { all: orders.length, pending, completed };
  }, [orders]);

  const filteredAndSortedOrders = useMemo(() => {
    const filtered = orders.filter((o) => {
      if (statusFilter === 'PENDING') return o.status === 'MILESTONE_PENDING';
      if (statusFilter === 'COMPLETED') return o.status === 'MILESTONE_COMPLETED';
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'VALUE_DESC') return b.value - a.value;
      if (sortBy === 'VALUE_ASC') return a.value - b.value;
      if (sortBy === 'STATUS_PENDING') {
        if (a.status !== b.status) {
          return a.status === 'MILESTONE_PENDING' ? -1 : 1;
        }
        return b.value - a.value;
      }
      if (sortBy === 'STATUS_COMPLETED') {
        if (a.status !== b.status) {
          return a.status === 'MILESTONE_COMPLETED' ? -1 : 1;
        }
        return b.value - a.value;
      }
      return 0;
    });
  }, [orders, statusFilter, sortBy]);

  const resetFilters = () => {
    setStatusFilter('ALL');
    setSortBy('VALUE_DESC');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Shield className="w-9 h-9 sm:w-10 sm:h-10 text-emerald-500 shrink-0" />
            B2B Order Milestone Tracker & Digital Trade Workflow
          </h1>
          <p className="text-slate-400 mt-2">NearMe India provides digital B2B milestone tracking and workflow software. All payments are settled directly via RBI-authorized payment gateway partners.</p>
        </header>

        <div className="flex gap-4 mb-6 border-b border-slate-800 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`font-bold px-4 py-2 rounded-lg transition-colors ${activeTab === 'ACTIVE' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Active Orders
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TRACKING')}
            className={`font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'TRACKING' ? 'bg-amber-500/20 text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <TrendingUp className="w-4 h-4" /> Milestone Analytics
          </button>
        </div>

        {activeTab === 'ACTIVE' && (
          <div className="space-y-6">
            {/* Filter & Sort Controls */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Status Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mr-1">
                  <Filter className="w-3.5 h-3.5 text-emerald-400" /> Status:
                </span>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    statusFilter === 'ALL'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  All ({counts.all})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    statusFilter === 'PENDING'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  Pending ({counts.pending})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('COMPLETED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    statusFilter === 'COMPLETED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  Completed ({counts.completed})
                </button>
              </div>

              {/* Sort Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mr-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" /> Sort By:
                </span>
                <button
                  type="button"
                  onClick={() => setSortBy('VALUE_DESC')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 ${
                    sortBy === 'VALUE_DESC'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <ArrowDownWideNarrow className="w-3.5 h-3.5" /> Contract Value: High → Low
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('VALUE_ASC')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 ${
                    sortBy === 'VALUE_ASC'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <ArrowUpNarrowWide className="w-3.5 h-3.5" /> Contract Value: Low → High
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('STATUS_PENDING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    sortBy === 'STATUS_PENDING'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  Status: Pending First
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('STATUS_COMPLETED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    sortBy === 'STATUS_COMPLETED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  Status: Completed First
                </button>
                {(statusFilter !== 'ALL' || sortBy !== 'VALUE_DESC') && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 inline-flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>
                Showing <strong className="text-white">{filteredAndSortedOrders.length}</strong> of{' '}
                <strong className="text-white">{orders.length}</strong> escrow orders
              </span>
              <span className="font-mono text-emerald-400">
                {sortBy === 'VALUE_DESC'
                  ? 'Sorted: Contract Value (High → Low)'
                  : sortBy === 'VALUE_ASC'
                    ? 'Sorted: Contract Value (Low → High)'
                    : sortBy === 'STATUS_PENDING'
                      ? 'Sorted: Status (Pending First)'
                      : 'Sorted: Status (Completed First)'}
              </span>
            </div>

            {filteredAndSortedOrders.length === 0 ? (
              <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-3">
                <p className="text-sm font-bold text-slate-300">
                  No escrow orders match the selected status filter.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Show All Orders
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredAndSortedOrders.map((e) => (
                  <motion.div
                    key={e.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-emerald-500/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-slate-800 text-slate-400 text-xs font-black px-2 py-1 rounded">{e.id}</span>
                        <span className={`text-xs font-black px-2 py-1 rounded flex items-center gap-1 ${e.status === 'MILESTONE_PENDING' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {e.status === 'MILESTONE_PENDING' ? <Lock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {e.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white">{e.buyer}</h3>
                      <p className="text-sm text-slate-500 mt-1">Delivery Status: <span className="font-semibold text-slate-300">{e.delivery}</span></p>
                    </div>

                    <div className="text-right w-full md:w-auto bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <p className="text-xs text-slate-500 font-bold uppercase mb-1">Contract Value</p>
                      <p className="text-2xl font-black text-emerald-400 tabular-nums">₹{e.value.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-slate-500 mt-2 flex items-center justify-end gap-1 tabular-nums">
                        Platform SaaS Fee: <span className="text-emerald-500 font-bold">₹{e.fee.toLocaleString('en-IN')}</span>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'TRACKING' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 border border-amber-500/30 rounded-3xl p-8"
          >
            <div className="flex items-start gap-4 mb-8">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <AlertCircle className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Milestone Analytics Engine</h2>
                <p className="text-slate-400 mt-1 max-w-xl">Track your B2B supply chain milestones securely. Our software logs immutable state changes for full transparency between you and the buyer.</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-sm font-bold">Current Value Tracked (ORD-992)</p>
                <p className="text-3xl font-black text-white mt-1">₹15,00,000</p>
              </div>
              <ArrowRight className="w-6 h-6 text-slate-600" />
              <div className="text-right">
                <p className="text-amber-500 text-sm font-bold">Milestone Target Status</p>
                <p className="text-3xl font-black text-amber-400 mt-1">
                  {milestoneRequested ? 'Approval Queued' : '75% Complete'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMilestoneRequested(true)}
              disabled={milestoneRequested}
              className="w-full mt-6 bg-amber-500 hover:bg-amber-400 disabled:bg-emerald-600 disabled:text-white text-slate-950 font-black py-4 rounded-xl transition-all shadow-lg shadow-amber-500/20"
            >
              {milestoneRequested ? 'Milestone Approval Logged ✓' : 'Request Milestone Approval'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
