import Link from 'next/link';

export default function ShippingPolicy() {
    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
                <h1 className="text-3xl font-black">Shipping &amp; Delivery Policy</h1>
                <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                    <p>NearMe India provides digital bill audits, wholesale benchmark access passes, and 15/85 Protected Wholesale UPI Escrow lock confirmations. Physical dispatch of wholesale goods is fulfilled directly by verified B2B suppliers.</p>
                    <p>Digital audit ledgers, IRDAI rebuttal notices, and 6-digit Delivery OTP release codes are provisioned immediately on-site after checkout and remain recoverable anytime via our <Link href="/contact" className="text-emerald-400 font-bold hover:underline">24/7 On-Site Self-Support Desk</Link>.</p>
                </div>
                <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-sm">
                    <Link href="/contact" className="text-emerald-400 hover:text-emerald-300 font-bold">Open 24/7 Self-Support →</Link>
                    <Link href="/" className="text-cyan-400 hover:text-cyan-300 font-bold">Return Home</Link>
                </div>
            </div>
        </div>
    );
}
