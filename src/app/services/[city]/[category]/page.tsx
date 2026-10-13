import { Metadata } from 'next';
import { MapPin, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// ISG (Incremental Static Regeneration) Revalidation time (seconds)
export const revalidate = 3600; // Revalidate these pages every hour to protect the database

interface Props {
  params: {
    city: string;
    category: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Format strings for presentation
  const city = params.city.charAt(0).toUpperCase() + params.city.slice(1).replace('-', ' ');
  const category = params.category.charAt(0).toUpperCase() + params.category.slice(1).replace('-', ' ');

  return {
    title: `Verified ${category} in ${city} — NearMe India`,
    description: `Connect instantly with trusted ${category} professionals in ${city}. Claim live flash deals and verified B2B procurement connections on NearMe India.`,
    alternates: {
      canonical: `https://www.nearme-india.org/services/${params.city}/${params.category}`
    },
    openGraph: {
      title: `Verified ${category} in ${city} — NearMe India`,
      description: `Connect instantly with trusted ${category} professionals in ${city}. Claim live flash deals and verified B2B procurement connections on NearMe India.`,
      url: `https://www.nearme-india.org/services/${params.city}/${params.category}`,
      siteName: 'NearMe India',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Verified ${category} in ${city} — NearMe India`,
      description: `Connect instantly with trusted ${category} professionals in ${city}. Claim live flash deals and verified B2B procurement connections on NearMe India.`,
    }
  };
}

// Generate static params at build time to pre-render the most popular routes
export async function generateStaticParams() {
  return [
    { city: 'bengaluru', category: 'plumbers' },
    { city: 'bengaluru', category: 'electricians' },
    { city: 'mumbai', category: 'plumbers' },
    { city: 'delhi', category: 'b2b-suppliers' },
    { city: 'hyderabad', category: 'contractors' },
  ];
}

export default function SEOProgrammaticPage({ params }: Props) {
  const city = params.city.charAt(0).toUpperCase() + params.city.slice(1).replace('-', ' ');
  const category = params.category.charAt(0).toUpperCase() + params.category.slice(1).replace('-', ' ');

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden pt-12">
      {/* Background Element */}
      <div className="absolute top-0 right-0 w-1/2 h-[600px] bg-gradient-to-bl from-emerald-100/50 to-transparent blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-widest mb-6">
            <ShieldCheck className="w-4 h-4" /> Verified Local Services
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-indigo-600">{category}</span> <br/>
            in {city}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl">
            NearMe India connects you directly with the highest-rated {category.toLowerCase()} in {city}. Skip the wait and instantly handoff your requirements via WhatsApp.
          </p>
        </header>

        {/* Lead Capture Fallback UI directly on the SEO page */}
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-indigo-500" />

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <MapPin className="w-8 h-8 text-orange-500" />
                Get Matched Instantly
              </h2>
              <p className="text-slate-600 mb-8">
                We are currently expanding our network of verified {category.toLowerCase()} in {city}. Enter your WhatsApp number and our SI routing engine will securely broadcast your requirement to the top 3 nearest professionals.
              </p>

              <form className="space-y-4">
                <input
                  type="tel"
                  required
                  placeholder="Your WhatsApp Number (e.g., 9876543210)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  Broadcast Requirement <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Visual Value Prop */}
            <div className="hidden md:block">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 font-bold">1</div>
                  <div>
                    <h4 className="font-bold text-slate-900">Zero Trust Verification</h4>
                    <p className="text-sm text-slate-500">Every merchant passes our rigorous KYC.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 font-bold">2</div>
                  <div>
                    <h4 className="font-bold text-slate-900">Live Ping Availability</h4>
                    <p className="text-sm text-slate-500">Only matched with pros who are ready right now.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 font-bold">3</div>
                  <div>
                    <h4 className="font-bold text-slate-900">Direct WhatsApp Handoff</h4>
                    <p className="text-sm text-slate-500">No middleman calling. Chat directly.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center pb-24">
          <Link href="/" className="text-emerald-600 font-bold hover:underline">
            &larr; Return to Central Map
          </Link>
        </div>
      </div>
    </div>
  );
}
