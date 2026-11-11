import Link from 'next/link';

export default function Terms() {
    return (
        <div className="min-h-screen bg-gray-950 font-[family-name:var(--font-geist-sans)] text-white p-8">
            <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
                <h1 className="text-3xl font-black mb-6">Terms of Service</h1>
                <p className="text-gray-400 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
                <div className="space-y-6 text-gray-300">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-2">1. Autonomous AI Engine</h2>
                        <p>NearMe India utilizes an autonomous Agentic AI to scout and negotiate deals. Prices displayed are locked-in offers from verified local merchants.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold text-white mb-2">2. Payment & Settlements</h2>
                        <p>All payments are securely processed via Razorpay. B2B payouts follow our T+1 automated settlement cycle via the /owner cron job limits.</p>
                    </section>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-800">
                    <Link href="/" className="text-blue-400 hover:text-blue-300 font-bold">Return Home</Link>
                </div>
            </div>
        </div>
    );
}
