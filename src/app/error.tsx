'use client';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log to an enterprise monitoring system
    console.error('NearMe India Edge Error:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-6 py-24">
      <div className="text-center max-w-xl bg-white p-12 rounded-3xl shadow-xl border border-slate-100">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4">System Fault Detected</h1>
        <p className="text-slate-600 mb-8">
          Our SI routing network encountered an unexpected anomaly while processing your request.
          Please attempt to reload the workflow milestone.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all"
        >
          <RefreshCcw className="w-5 h-5" /> Retry Connection
        </button>
      </div>
    </div>
  );
}
