export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-6 bg-white p-12 rounded-3xl shadow-lg prose prose-slate max-w-none">
        <h1 className="text-4xl font-black text-slate-900 mb-6">Cancellation & Refund Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Digital Goods and Services</h2>
        <p>
          NearMe India provides digital SaaS directory listings and lead wallet credits. Because these are digital products
          activated instantaneously, standard physical return policies do not apply.
        </p>

        <h2>2. Cancellation Requests</h2>
        <p>
          Merchants may request a cancellation and refund for unused wallet credits or duplicate transactions within
          <strong> 24 hours</strong> of the purchase. Once wallet credits have been consumed (e.g., via WhatsApp lead handoffs),
          they are non-refundable.
        </p>

        <h2>3. Refund Processing</h2>
        <p>
          Approved refunds will be processed back to the original payment method (via Razorpay) within
          <strong> 5 to 7 working days</strong>.
        </p>

        <h2>4. Contact for Refunds</h2>
        <p>
          To request a refund, please email us at <strong>contact@nearme-india.org</strong> with your transaction ID and
          registered phone number.
        </p>
      </div>
    </div>
  );
}
