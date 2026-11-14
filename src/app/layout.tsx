import type { Metadata, Viewport } from 'next';
import './globals.css';
import Script from 'next/script';
import { ToastProvider } from '@/components/Toast';
import AgenticConcierge from '@/components/AgenticConcierge';
import TelemetryBar from '@/components/TelemetryBar';

const siteUrl = 'https://www.nearme-india.org';
const siteTitle =
  'NearMe India — Strip Overcharges & Lock Wholesale Prices Across India';
const siteDescription =
  'Audit 1 to 500+ page hospital ICU bills, wholesale BOQs, and pharmacy packs in 60s. Lock 15/85 UPI escrow deals, GST Mod-36 trust, and 24/7 AI self-support.';

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NearMe India',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'NearMe India',
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
  },
};

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'NearMe India',
    url: siteUrl,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    description: siteDescription,
    offers: {
      '@type': 'Offer',
      price: '49',
      priceCurrency: 'INR',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Unlimited-Page Hospital & Wholesale Bill Auditor',
    description:
      'Audits 1 to 500+ page hospital ICU discharge bills and contractor BOQs against NPPA, CGHS, and regional wholesale ceilings.',
    brand: {
      '@type': 'Brand',
      name: 'NearMe India',
    },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '49',
      highPrice: '199',
      priceCurrency: 'INR',
      offerCount: '2',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How many pages can the NearMe India Bill Stripper audit?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The client-side File.slice() streaming indexer supports 1 to 500+ page PDFs, Excel/CSV ledgers, and multi-photo bills without payload crashes.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the 15/85 UPI Escrow and 48-Hour Refund Guarantee work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '15% is held as platform audit escrow and 85% settles to verified merchants on 6-digit Delivery OTP confirmation, backed by an automated 48-hour refund guarantee.',
        },
      },
    ],
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap"
        />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="antialiased bg-slate-950 text-white min-h-screen flex flex-col">
        <ToastProvider>
          <TelemetryBar />
          <div className="flex-1">{children}</div>
          <AgenticConcierge />
        </ToastProvider>
      </body>
    </html>
  );
}
