import Link from 'next/link';
import BrandLogo from './BrandLogo';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <BrandLogo className="mb-4 grayscale opacity-70" />
            <p className="text-sm mt-2 font-medium text-slate-300">
              NearMe India — Operated by Beerangi Kartheek Kumar
            </p>
            <p className="text-xs mt-1">
              (Proprietorship / Digital SaaS & Directory Platform)
            </p>
            <div className="mt-4 text-xs space-y-1">
              <p>Email: contact@nearme-india.org</p>
              <p>Phone: +91 8247831885</p>
              <p>Address: Bengaluru, Karnataka, India</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
              <li><Link href="/pricing" className="hover:text-emerald-400 transition-colors">Pricing</Link></li>
              <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-emerald-400 transition-colors">Cancellation & Refund Policy</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-emerald-400 transition-colors">Shipping & Delivery Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-xs text-center">
          &copy; {new Date().getFullYear()} NearMe India. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
