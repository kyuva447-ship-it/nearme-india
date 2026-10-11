export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-6 bg-white p-12 rounded-3xl shadow-lg prose prose-slate max-w-none">
        <h1 className="text-4xl font-black text-slate-900 mb-6">Terms and Conditions</h1>
        <p className="text-sm text-slate-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Introduction</h2>
        <p>
          Welcome to NearMe India. These Terms and Conditions govern your use of the NearMe India website and platform,
          which is an IT/SaaS directory and lead-generation service operated by NearMe India (Proprietorship).
        </p>

        <h2>2. Services Provided</h2>
        <p>
          NearMe India provides a digital directory connecting consumers with local service providers and facilitates
          B2B SaaS workflow tracking. We do not provide the underlying physical services (e.g., plumbing, electrical work)
          and are not liable for the quality of services rendered by third-party merchants listed on our platform.
        </p>

        <h2>3. Payments and Wallet Credits</h2>
        <p>
          Merchants may purchase lead wallet credits or SaaS subscriptions via our authorized payment gateway (Razorpay).
          Wallet credits are consumed on a pay-as-you-go basis (e.g., ₹2 per WhatsApp lead handoff).
        </p>

        <h2>4. User Obligations</h2>
        <p>
          Merchants must provide accurate business information. We reserve the right to suspend or terminate accounts
          that provide false information or engage in fraudulent activities.
        </p>

        <h2>5. Governing Law and Jurisdiction</h2>
        <p>
          These terms are governed by the laws of India. Any disputes arising out of or in connection with these terms
          shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.
        </p>
      </div>
    </div>
  );
}
