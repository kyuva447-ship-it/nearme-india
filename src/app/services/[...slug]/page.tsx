import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, ShieldCheck, ChevronRight, Store, ArrowRight, Zap, TrendingUp, CheckCircle2, HeartHandshake, Share2, Send } from 'lucide-react';
import LiveActivityTicker from '@/components/LiveTicker';
import CommandHub from '@/components/CommandHub';
import MicroPass from '@/components/MicroPass';

async function getCategoryData(slugs: string[]) {
  const city = slugs[0] || 'all-india';
  const category = slugs[1] || 'deals';
  const formattedCity = city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const formattedCategory = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: `Top ${formattedCategory} in ${formattedCity}`,
    description: `Find the best and most affordable ${formattedCategory} services in ${formattedCity}. Verified local merchants with instant AI bargaining.`,
    merchants: [
      { id: 1, name: `Sri Sai ${formattedCategory}`, rating: 4.8, reviews: 124, verified: true, price: 1500, slashedPrice: 999 },
      { id: 2, name: `Metro ${formattedCategory} Hub`, rating: 4.5, reviews: 89, verified: true, price: 2000, slashedPrice: 1299 },
      { id: 3, name: `Global ${formattedCategory} Solutions`, rating: 4.9, reviews: 312, verified: true, price: 3000, slashedPrice: 1899 },
      { id: 4, name: `Apex ${formattedCategory} Center`, rating: 4.2, reviews: 54, verified: false, price: 1200, slashedPrice: 899 },
    ],
    formattedCity,
    formattedCategory
  };
}

export async function generateMetadata({ params }: { params: { slug: string[] } }): Promise<Metadata> {
  const data = await getCategoryData(params.slug);
  return {
    title: `${data.title} | NearMe India`,
    description: data.description,
  };
}

export default async function CatchAllSEOPage({ params }: { params: { slug: string[] } }) {
  const data = await getCategoryData(params.slug);

  return (
    <div className="min-h-screen bg-gray-950 font-[family-name:var(--font-geist-sans)] text-white">

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-8 uppercase tracking-wider">
          <Link href="/" className="hover:text-gray-300">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-gray-300">{data.formattedCity}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-emerald-400">{data.formattedCategory}</span>
        </div>

        {/* Hero */}
        <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
          <div className="flex-1 space-y-6">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-sm font-bold">
               <TrendingUp className="w-4 h-4" /> Swarm Pricing Active
             </div>
             <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
               AI Negotiated <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{data.formattedCategory}</span> in {data.formattedCity}
             </h1>
             <p className="text-lg text-gray-400 max-w-xl">
               {data.description}
             </p>
          </div>
          <div className="flex-1 w-full max-w-md">
             <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-blue-400"/> Instant AI Deal</h3>
                <p className="text-sm text-gray-400 mb-6">Skip the directory. Let AI find you the lowest price for {data.formattedCategory} right now.</p>
                <Link href={`/search?q=${encodeURIComponent(data.formattedCategory)}&city=${encodeURIComponent(data.formattedCity)}`} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                  Open AI Search Engine <ArrowRight className="w-4 h-4"/>
                </Link>
             </div>
          </div>
        </div>

        <LiveActivityTicker />

        {/* AI Syndicated Directory */}
        <div className="mt-16">
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-2xl font-black flex items-center gap-2"><Store className="w-6 h-6 text-emerald-400"/> Verified AI Pricing</h2>
             <Link href={`/merchant-claim/new`} className="text-sm text-blue-400 hover:text-white font-bold flex items-center gap-1">Broadcast Live Order to {data.formattedCity} Shops <Send className="w-4 h-4"/></Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.merchants.map(m => (
              <div key={m.id} className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-3xl p-6 hover:border-gray-600 transition-colors group flex flex-col">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-950 rounded-xl flex items-center justify-center border border-gray-800 text-emerald-400 shadow-inner">
                           <Store className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{m.name}</h3>
                           <div className="flex items-center gap-2 text-xs">
                               <span className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded"><Star className="w-3 h-3 fill-current"/> {m.rating}</span>
                               <span className="text-gray-500">{m.reviews} reviews</span>
                               {m.verified && <ShieldCheck className="w-4 h-4 text-blue-500 ml-1" />}
                           </div>
                        </div>
                    </div>
                 </div>

                 <div className="mt-auto bg-gray-950 rounded-2xl p-4 border border-gray-800">
                     <div className="flex justify-between items-center mb-4">
                         <span className="text-sm text-gray-500 line-through">₹{m.price}</span>
                         <span className="text-2xl font-black text-emerald-400">₹{m.slashedPrice}</span>
                     </div>
                     <div className="space-y-3">
                         <Link href={`/search?q=${encodeURIComponent(m.name)}`} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                             Book AI Price via UPI (₹{m.slashedPrice}) <ChevronRight className="w-4 h-4"/>
                         </Link>
                         <button className="w-full py-3 bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                             <Share2 className="w-4 h-4"/> Start Pincode Syndicate Pool (Extra 15% Off)
                         </button>
                     </div>
                 </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
