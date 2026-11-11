import './globals.css';
import { Inter } from 'next/font/google';
import AutonomousSupportOrb from '@/components/AutonomousSupportOrb';
import ReferralTracker from '@/components/ReferralTracker';
import { ToastProvider } from '@/components/Toast';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'NearMe India | 100% Autonomous National Super-Engine',
  description: 'The world\'s first completely autonomous platform powered by AI. No searching, no scrolling, zero employees.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen flex flex-col`}>
        <ToastProvider>
          <ReferralTracker />
          <div className="flex-1">
            {children}
          </div>

          <footer className="border-t border-gray-800 py-8 text-center text-sm text-gray-500 bg-gray-950">
            <div className="flex justify-center gap-6 mb-4 flex-wrap px-4">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/refund-policy" className="hover:text-white transition-colors">Cancellation & Refunds</Link>
              <Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping & Delivery</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/owner" className="hover:text-emerald-400 transition-colors">Owner Console</Link>
            </div>
            <p className="mb-2">© {new Date().getFullYear()} NearMe India. Made in India | For Every City, Every Colony, Every Shop</p>
            <p className="text-xs text-gray-600">Operating Address: Level 1, NearMe Tech Hub, Bengaluru, Karnataka, India 560001</p>
          </footer>

          <AutonomousSupportOrb />
        </ToastProvider>
      </body>
    </html>
  );
}
