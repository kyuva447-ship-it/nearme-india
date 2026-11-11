import Link from 'next/link';

export default function ShippingPolicy() {
    return (
        <div className="min-h-screen bg-gray-950 font-[family-name:var(--font-geist-sans)] text-white p-8">
            <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
                <h1 className="text-3xl font-black mb-6">Shipping & Delivery</h1>
                <div className="space-y-6 text-gray-300">
                    <p>NearMe India provides digital passes and hyper-local service bookings. No physical goods are shipped by our platform.</p>
                    <p>Digital receipts and booking confirmations are instantly delivered via WhatsApp upon successful Razorpay checkout.</p>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-800">
                    <Link href="/" className="text-blue-400 hover:text-blue-300 font-bold">Return Home</Link>
                </div>
            </div>
        </div>
    );
}
