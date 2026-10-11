import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nearme-india.org'),
  title: {
    default: 'NearMe India — Verified Local Services, Live Deals & B2B Marketplace',
    template: '%s | NearMe India',
  },
  description: 'NearMe India is a verified hyper-local marketplace and B2B procurement network. Connect instantly with trusted local merchants via WhatsApp, claim live flash deals, and track B2B orders across India.',
  keywords: ['hyper-local', 'business directory', 'B2B procurement', 'India', 'merchants', 'flash deals'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'NearMe India — Verified Local Services, Live Deals & B2B Marketplace',
    description: 'NearMe India is a verified hyper-local marketplace and B2B procurement network. Connect instantly with trusted local merchants via WhatsApp, claim live flash deals, and track B2B orders across India.',
    url: 'https://www.nearme-india.org',
    siteName: 'NearMe India',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NearMe India — Verified Local Services, Live Deals & B2B Marketplace',
    description: 'NearMe India is a verified hyper-local marketplace and B2B procurement network. Connect instantly with trusted local merchants via WhatsApp, claim live flash deals, and track B2B orders across India.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://www.nearme-india.org/#website",
        "url": "https://www.nearme-india.org",
        "name": "NearMe India",
        "description": "NearMe India is India’s verified hyper-local business directory and B2B procurement SaaS platform."
      },
      {
        "@type": "Organization",
        "@id": "https://www.nearme-india.org/#organization",
        "name": "NearMe India",
        "url": "https://www.nearme-india.org",
        "logo": "https://www.nearme-india.org/icon",
        "founder": {
          "@type": "Person",
          "name": "NearMe India"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-8247831885",
          "email": "contact@nearme-india.org",
          "contactType": "customer service"
        }
      }
    ]
  };

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased text-slate-900 bg-slate-50 flex flex-col min-h-screen`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
