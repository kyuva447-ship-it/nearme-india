import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-950 font-[family-name:var(--font-geist-sans)] text-white p-8">
            <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
                <h1 className="text-3xl font-black mb-6">Privacy Policy</h1>
                <p className="text-gray-400 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
                <div className="space-y-6 text-gray-300">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-2">1. Information Collection</h2>
                        <p>We collect your phone number during QuickAuth for Razorpay checkout verification and WhatsApp routing. No intrusive KYC documents are collected.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold text-white mb-2">2. AI Data Usage</h2>
                        <p>Search queries and voice inputs are processed by our Agentic AI to negotiate local prices. Your exact location is not tracked; we rely on your selected city or pincode.</p>
                    </section>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-800">
                    <Link href="/" className="text-blue-400 hover:text-blue-300 font-bold">Return Home</Link>
                </div>
            </div>
        </div>
    );
}
