export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-6 bg-white p-12 rounded-3xl shadow-lg prose prose-slate max-w-none">
        <h1 className="text-4xl font-black text-slate-900 mb-6">Shipping & Delivery Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Delivery of Digital Services</h2>
        <p>
          NearMe India delivers 100% digital SaaS directory listings and lead wallet credits. We do not sell or ship
          any physical goods.
        </p>

        <h2>2. Delivery Timeline</h2>
        <p>
          Upon successful payment confirmation via our payment gateway partner, all digital services, subscriptions,
          and wallet credits are activated <strong>instantaneously (within 0–5 minutes)</strong> on the merchant dashboard.
        </p>

        <h2>3. Shipping Charges</h2>
        <p>
          Because our services are entirely digital, there are <strong>no physical shipping or handling charges</strong>.
        </p>

        <h2>4. Support</h2>
        <p>
          If your digital wallet or subscription is not activated within the stated timeframe, please contact our
          support team immediately at contact@nearme-india.org.
        </p>
      </div>
    </div>
  );
}
