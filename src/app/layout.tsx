import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NearMe India V2 | Dual Engine Marketplace',
  description: 'AI-Native Local Commerce for Consumers & B2B Procurement',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://www.nearme-india.org/" />
      </head>
      <body className={`${inter.className} antialiased text-slate-900 bg-slate-50`}>{children}</body>
    </html>
  );
}
