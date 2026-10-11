export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-6 bg-white p-12 rounded-3xl shadow-lg prose prose-slate max-w-none">
        <h1 className="text-4xl font-black text-slate-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Information We Collect</h2>
        <p>
          We collect information necessary to provide our directory and lead-generation services. This includes business
          names, contact numbers (e.g., WhatsApp numbers), location data (for hyper-local matching), and platform usage analytics.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          Information is used to connect consumers with local merchants, process wallet transactions via third-party
          payment processors (Razorpay), and improve our B2B SaaS workflow tools.
        </p>

        <h2>3. Data Protection and Compliance</h2>
        <p>
          We employ industry-standard security measures to protect your data. This policy is compliant with the Indian
          Information Technology Act, 2000, and the Digital Personal Data Protection (DPDP) Act, 2023.
        </p>

        <h2>4. Grievance Officer</h2>
        <p>
          In accordance with the Information Technology Act, 2000, the name and contact details of the Grievance Officer are provided below:
        </p>
        <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 mt-4">
          <p className="m-0 font-bold text-slate-800">Name: Grievance & Compliance Officer — NearMe India</p>
          <p className="m-0 text-slate-600">Email: contact@nearme-india.org</p>
          <p className="m-0 text-slate-600">Phone: +91 8247831885</p>
          <p className="m-0 text-slate-600 mt-2 font-semibold">Resolution Timeline: Within 48 hours</p>
        </div>
      </div>
    </div>
  );
}
