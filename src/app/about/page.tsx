export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-6 bg-white p-12 rounded-3xl shadow-lg">
        <h1 className="text-4xl font-black text-slate-900 mb-6">About NearMe India</h1>
        <p className="text-slate-600 mb-6">
          NearMe India is India’s premier verified hyper-local business directory and B2B procurement SaaS platform.
          Our mission is to bridge the gap between local consumers and verified service professionals, while empowering
          businesses with a seamless digital trade workflow.
        </p>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Leadership</h2>
        <p className="text-slate-600 mb-6">
          Operated by <strong>Beerangi Kartheek Kumar</strong> as a Proprietorship, NearMe India is dedicated to digital
          transformation for the unorganized local commerce sector across Bengaluru and India at large.
        </p>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Our Technology</h2>
        <p className="text-slate-600">
          We leverage Next.js Edge routing, PostGIS geospatial mapping, and secure B2B workflows to deliver
          instant connections. Our unique WhatsApp handoff mechanism ensures real-time context-aware communication
          between buyers and verified sellers.
        </p>
      </div>
    </div>
  );
}
