import { Metadata } from 'next';
import Link from 'next/link';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { city: string, category: string } }): Promise<Metadata> {
  const title = `${decodeURIComponent(params.category)} Services in ${decodeURIComponent(params.city)}`;
  const description = `Find the best verified ${decodeURIComponent(params.category)} professionals in ${decodeURIComponent(params.city)}. Connect instantly via WhatsApp on NearMe India.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.nearme-india.org/services/${params.city}/${params.category}`,
      siteName: 'NearMe India',
      type: 'website',
      images: [
        {
          url: 'https://www.nearme-india.org/icon-512.png',
          width: 512,
          height: 512,
          alt: 'NearMe India — Verified Hyper-Local Business Directory',
        }
      ],
    },
    alternates: {
      canonical: `https://www.nearme-india.org/services/${params.city}/${params.category}`
    }
  };
}

export default function CityCategoryPage({ params }: { params: { city: string, category: string } }) {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-600/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto bg-white p-12 rounded-3xl shadow-lg border border-slate-100">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-6 inline-block">
             Verified Directory
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 capitalize leading-tight">
              Top {decodeURIComponent(params.category)} in {decodeURIComponent(params.city)}
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              Connect with verified local businesses instantly via WhatsApp. NearMe India is the fastest way to get local services and claim flash deals.
          </p>
          <div className="flex justify-center">
              <Link href="/" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg shadow-emerald-600/30 transition-all">
                Explore Live Map
              </Link>
          </div>
      </div>
    </div>
  );
}
