import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { paymentService } from '@/server/services/payment.service';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await paymentService.getStoreSettings();

  const titleDefault =
    settings.seo_meta_title ||
    'NBusiness — Toko Kebutuhan Anak & Perlengkapan Terlengkap';
  const description =
    settings.seo_meta_description ||
    'Pusat belanja perlengkapan bayi, pakaian anak, dan mainan edukasi terstandar SNI di NBusiness.';
  const keywords = settings.seo_keywords
    ? settings.seo_keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : undefined;
  const ogImages = settings.seo_og_image ? [settings.seo_og_image] : undefined;

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    ),
    title: {
      default: titleDefault,
      template: '%s — NBusiness',
    },
    description,
    keywords,
    verification: {
      google: settings.seo_google_verification || undefined,
    },
    openGraph: {
      title: titleDefault,
      description,
      siteName: 'NBusiness',
      locale: 'id_ID',
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: titleDefault,
      description,
      images: ogImages,
    },
  };
}

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

