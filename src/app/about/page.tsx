import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white py-16 px-4">
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 p-8 sm:p-12 rounded-3xl shadow-2xl space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Bengaluru, Karnataka • Serving Pan-India
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-2">
            About NearMe India
          </h1>
        </div>

        <p className="text-slate-300 leading-relaxed">
          Built in Bengaluru, Karnataka — Now Serving All India. NearMe India is India’s autonomous
          multi-page bill auditing, wholesale price benchmark, and B2B 15/85 escrow platform.
          Our mission is to eliminate hospital and wholesale overcharges while empowering local
          merchants and institutional buyers across 19,300+ Indian pincodes.
        </p>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white">Platform Architecture</h2>
          <p className="text-slate-300 leading-relaxed">
            Built by <strong className="text-white">NearMe India (Bengaluru)</strong>, our
            infrastructure combines unlimited-page streaming PDF/document auditing, IRDAI &amp; NPPA
            claim compliance verification, Mod-36 GSTIN trust checks, and 100% on-site 24/7
            autonomous self-support resolution across 6 Indian languages.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white">Our Technology</h2>
          <p className="text-slate-300 leading-relaxed">
            We leverage Next.js App Router, client-side chunked document streaming, regional mandi
            indexing, and automated 15/85 UPI escrow with a 48-hour refund guarantee so buyers and
            verified suppliers transact directly inside the platform without manual intermediaries.
          </p>
        </div>

        <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-sm">
          <Link href="/contact" className="text-emerald-400 hover:text-emerald-300 font-bold">
            Open 24/7 Self-Support Desk →
          </Link>
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 font-bold">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
