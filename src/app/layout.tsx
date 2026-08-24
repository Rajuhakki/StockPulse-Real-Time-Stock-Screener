import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StockPulse – Real-Time Stock Screener',
  description: 'Production-quality stock screener application built with Next.js 14, TypeScript, Tailwind CSS, and Zustand.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-emerald-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
