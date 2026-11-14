import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
                <h1 className="text-3xl font-black">Privacy Policy</h1>
                <p className="text-slate-400 text-xs">Operated in Bengaluru, Karnataka · DPDP Act Compliant</p>
                <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                    <section>
                        <h2 className="text-lg font-bold text-white mb-1">1. Information Collection</h2>
                        <p>We process your optional phone number or Order/Escrow ID solely for on-site OTP authentication, checkout verification, and 24/7 autonomous self-support lookups. Personal founder or customer contact numbers are never exposed publicly.</p>
                    </section>
                    <section>
                        <h2 className="text-lg font-bold text-white mb-1">2. Document &amp; AI Data Usage</h2>
                        <p>Uploaded bills, PDFs, and support queries are streamed securely to audit overcharges, verify GSTIN checksums, and resolve escrow SLA requests directly inside this website.</p>
                    </section>
                </div>
                <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-sm">
                    <Link href="/contact" className="text-emerald-400 hover:text-emerald-300 font-bold">Open 24/7 Self-Support →</Link>
                    <Link href="/" className="text-cyan-400 hover:text-cyan-300 font-bold">Return Home</Link>
                </div>
            </div>
        </div>
    );
}
