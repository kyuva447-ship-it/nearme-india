import Link from 'next/link';

export default function RefundPolicy() {
    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
                <h1 className="text-3xl font-black">Cancellation &amp; Refund Policy</h1>
                <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                    <p>Digital audit unlocks and AI trade passes are provisioned immediately inside your NearMe India session upon successful checkout.</p>
                    <p>All 15/85 Protected Wholesale UPI Escrow locks are covered by our automated 48-Hour Refund Guarantee. If a verified supplier does not fulfill delivery confirmation within the SLA, submit your Escrow ID directly inside our <Link href="/contact" className="text-emerald-400 font-bold hover:underline">24/7 On-Site Self-Support Desk</Link> for instant voucher issuance.</p>
                </div>
                <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-sm">
                    <Link href="/contact" className="text-emerald-400 hover:text-emerald-300 font-bold">Open 24/7 Self-Support →</Link>
                    <Link href="/" className="text-cyan-400 hover:text-cyan-300 font-bold">Return Home</Link>
                </div>
            </div>
        </div>
    );
}
