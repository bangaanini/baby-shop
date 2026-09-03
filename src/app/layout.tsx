import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BabyKids — Toko Kebutuhan Anak, Perlengkapan, Pakaian & Mainan',
  description: 'Marketplace online kebutuhan anak terlengkap di Indonesia. Menjual perlengkapan bayi, baju anak modis, dan mainan edukatif terpercaya dengan pengiriman ke seluruh Indonesia.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-800">{children}</body>
    </html>
  );
}
