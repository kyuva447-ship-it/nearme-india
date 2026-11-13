import Link from 'next/link';

export default function Contact() {
    return (
        <div className="min-h-screen bg-gray-950 font-[family-name:var(--font-geist-sans)] text-white p-8">
            <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
                <h1 className="text-3xl font-black mb-6">Contact Support</h1>
                <div className="space-y-6 text-gray-300">
                    <p>For immediate B2B or customer support, our AI agents seamlessly route queries to our WhatsApp syndicate.</p>
                    <p>Email: <span className="font-bold text-emerald-400">kartheekkumar740@gmail.com</span> • Phone: <span className="font-bold text-white">+918247831885</span></p>
                    <a href="https://wa.me/918247831885" className="inline-block mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors">Chat on WhatsApp</a>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-800">
                    <Link href="/" className="text-blue-400 hover:text-blue-300 font-bold">Return Home</Link>
                </div>
            </div>
        </div>
    );
}
