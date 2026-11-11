import Link from 'next/link';

export default function RefundPolicy() {
    return (
        <div className="min-h-screen bg-gray-950 font-[family-name:var(--font-geist-sans)] text-white p-8">
            <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
                <h1 className="text-3xl font-black mb-6">Refund Policy</h1>
                <div className="space-y-6 text-gray-300">
                    <p>Micro-Passes and AI Deal locks are immediately provisioned and shared with local merchants.</p>
                    <p>Refunds are only issued if the verified merchant fails to honor the AI-negotiated price upon arrival. Contact support within 24 hours of checkout.</p>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-800">
                    <Link href="/" className="text-blue-400 hover:text-blue-300 font-bold">Return Home</Link>
                </div>
            </div>
        </div>
    );
}
