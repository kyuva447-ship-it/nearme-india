import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, ShieldCheck, ChevronRight, Store, ArrowRight, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';
import LiveActivityTicker from '@/components/LiveTicker';
import CommandHub from '@/components/CommandHub';
import MicroPass from '@/components/MicroPass';

// Simulated DB fetch
async function getCategoryData(slugs: string[]) {
  const city = slugs[0] || 'all-india';
  const category = slugs[1] || 'deals';
  const formattedCity = city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const formattedCategory = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: `Top ${formattedCategory} in ${formattedCity}`,
    description: `Find the best and most affordable ${formattedCategory} services in ${formattedCity}. Verified local merchants with instant AI bargaining.`,
    merchants: [
      { id: 1, name: `Sri Sai ${formattedCategory}`, rating: 4.8, reviews: 124, verified: true, price: '₹' },
      { id: 2, name: `Metro ${formattedCategory} Hub`, rating: 4.5, reviews: 89, verified: true, price: '₹₹' },
      { id: 3, name: `Global ${formattedCategory} Solutions`, rating: 4.9, reviews: 312, verified: true, price: '₹₹₹' },
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

      {/* Header */}
      <header className="w-full flex items-center justify-between p-4 sm:p-6 lg:px-12 border-b border-gray-900 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden sm:block">NearMe<span className="text-blue-500">India</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-full border border-gray-800 text-sm font-medium text-gray-300">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>{data.formattedCity}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">

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
               <TrendingUp className="w-4 h-4" /> High Demand Area
             </div>
             <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
               Best <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{data.formattedCategory}</span> in {data.formattedCity}
             </h1>
             <p className="text-lg text-gray-400 max-w-xl">
               {data.description}
             </p>
             <div className="flex items-center gap-4 text-sm font-medium text-gray-300">
               <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Verified Profiles</div>
               <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Price Protection</div>
             </div>
          </div>
          <div className="flex-1 w-full max-w-md">
             {/* Command Hub embedded for instant conversion */}
             <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-blue-400"/> Instant Bargain</h3>
                <p className="text-sm text-gray-400 mb-6">Skip the directory. Let AI find you the lowest price for {data.formattedCategory} in {data.formattedCity} right now.</p>
                <Link href="/" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                  Open AI Engine <ArrowRight className="w-4 h-4"/>
                </Link>
             </div>
          </div>
        </div>

        <LiveActivityTicker />

        {/* Directory Fallback */}
        <div className="mt-16">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-2"><Store className="w-6 h-6 text-gray-400"/> Top Rated Listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.merchants.map(m => (
              <div key={m.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors group">
                 <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{m.name}</h3>
                    {m.verified && <ShieldCheck className="w-5 h-5 text-blue-500" />}
                 </div>
                 <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold bg-yellow-500/10 px-2 py-1 rounded">
                      <Star className="w-4 h-4 fill-current" /> {m.rating}
                    </div>
                    <span className="text-sm text-gray-500">{m.reviews} reviews</span>
                    <span className="text-sm font-bold text-gray-400 ml-auto">{m.price}</span>
                 </div>
                 <Link href="/" className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                   Get AI Quote <ChevronRight className="w-4 h-4"/>
                 </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <MicroPass />
        </div>

      </main>

      <footer className="w-full bg-gray-950 border-t border-gray-900 py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium text-gray-500">
           <div className="flex gap-6">
             <Link href="/" className="hover:text-white">Home</Link>
           </div>
           <p>&copy; {new Date().getFullYear()} NearMe India. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
