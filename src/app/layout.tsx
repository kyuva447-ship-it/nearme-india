import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nearme-india.org'),
  title: {
    default: 'NearMe India - Cheapest Shops Near You | Kirana, Food, Medical Near Me',
    template: '%s | NearMe India',
  },
  description: 'Find cheapest Kirana, Food, Medical, Mobile shops near you in any city in India. Bargain, Auction, Group Buy. Made in India.',
  icons: {
    icon: [
      { url: '/favicon.ico?v=5', sizes: '48x48', type: 'image/x-icon' },
      { url: '/icon-192.png?v=5', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png?v=5', sizes: '512x512', type: 'image/png' },
      { url: '/icon.svg?v=5', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico?v=5',
    apple: [
      { url: '/apple-touch-icon.png?v=5', sizes: '180x180', type: 'image/png' },
    ],
  },
  keywords: ['hyper-local', 'business directory', 'B2B procurement', 'India', 'merchants', 'flash deals'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'NearMe India - Cheapest Shops Near You | Kirana, Food, Medical Near Me',
    description: 'Find cheapest Kirana, Food, Medical, Mobile shops near you in any city in India. Bargain, Auction, Group Buy. Made in India.',
    url: 'https://www.nearme-india.org',
    siteName: 'NearMe India',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NearMe India - Cheapest Shops Near You | Kirana, Food, Medical Near Me',
    description: 'Find cheapest Kirana, Food, Medical, Mobile shops near you in any city in India. Bargain, Auction, Group Buy. Made in India.',
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
        "description": "Find cheapest Kirana, Food, Medical, Mobile shops near you in any city in India. Bargain, Auction, Group Buy. Made in India."
      },
      {
        "@type": "Organization",
        "@id": "https://www.nearme-india.org/#organization",
        "name": "NearMe India",
        "url": "https://www.nearme-india.org",
        "logo": "https://www.nearme-india.org/icon-512.png",
        "founder": {
          "@type": "Person",
          "name": "NearMe India"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "Phone number protected",
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
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm font-medium pb-24 md:pb-8">
           NearMe India - Cheapest Shops Near You - From Tirupati To Whole India<br/>
           Made in India | For Every City, Every Colony, Every Shop<br/>
           contact@nearme-india.org
        </footer>
      </body>
    </html>
  );
}
