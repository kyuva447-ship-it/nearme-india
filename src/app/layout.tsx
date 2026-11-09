import './globals.css';
import { Inter } from 'next/font/google';
import AutonomousSupportOrb from '@/components/AutonomousSupportOrb';

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
      <body className={inter.className}>
        {children}
        <AutonomousSupportOrb />
      </body>
    </html>
  );
}
