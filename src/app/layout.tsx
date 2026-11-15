import type { Metadata, Viewport } from 'next';
import './globals.css';
import Script from 'next/script';
import { ToastProvider } from '@/components/Toast';
import AgenticConcierge from '@/components/AgenticConcierge';
import TelemetryBar from '@/components/TelemetryBar';

const siteUrl = 'https://www.nearme-india.org';
const siteTitle =
  'NearMe India — Local Services, Verified Pros & Bill Audits';
const siteDescription =
  'Find trusted Plumbers, Electricians, Tailors & Diagnostic Labs across India, audit hospital bills in 60s, and protect payments via 15/85 UPI Escrow.';

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: '%s | NearMe India',
  },
  description: siteDescription,
  keywords: [
    'NearMe India',
    'nearme-india.org',
    'local services near me India',
    'plumber near me',
    'electrician near me',
    'tailor near me',
    'diagnostic labs India',
    'hospital bill audit India',
    'Madanapalle local services',
    'Bengaluru verified pros',
    '15/85 UPI escrow',
  ],
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
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
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: 'NearMe India',
    alternateName: 'NearMe India Marketplace',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#localbusiness`,
    name: 'NearMe India',
    url: siteUrl,
    description: siteDescription,
    priceRange: '₹49 - ₹999',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bengaluru',
      addressRegion: 'KA',
      postalCode: '560001',
      addressCountry: 'IN',
    },
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    sameAs: [siteUrl],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'NearMe India Key Services',
    itemListElement: [
      {
        '@type': 'SiteNavigationElement',
        position: 1,
        name: 'Search Services',
        description: 'Find verified plumbers, electricians, tailors, diagnostic labs, and wholesale hubs.',
        url: `${siteUrl}/search`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 2,
        name: 'Register Business',
        description: 'Claim your local business profile free and get 2 complimentary customer leads.',
        url: `${siteUrl}/claim`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 3,
        name: 'Verified Deals',
        description: 'Compare pre-audited diagnostic labs, hospital bill audits, and wholesale rates.',
        url: `${siteUrl}/services/bengaluru/diagnostic-labs`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 4,
        name: 'Merchant Login',
        description: 'Access your NearMe India Merchant Dashboard, lead wallet, and escrow milestones.',
        url: `${siteUrl}/login`,
      },
    ],
  },
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
      highPrice: '299',
      priceCurrency: 'INR',
      offerCount: '3',
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
