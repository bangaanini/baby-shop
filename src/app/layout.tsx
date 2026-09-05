import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { paymentService } from '@/server/services/payment.service';
import { FloatingWhatsApp } from '@/components/layout/FloatingWhatsApp';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FF9F43',
};

const nunitoHeading = localFont({
  src: [
    {
      path: '../../public/font/Nunito/static/Nunito-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/font/Nunito/static/Nunito-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/font/Nunito/static/Nunito-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-heading',
  display: 'swap',
});

const quicksandBody = localFont({
  src: [
    {
      path: '../../public/font/Quicksand/static/Quicksand-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/font/Quicksand/static/Quicksand-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/font/Quicksand/static/Quicksand-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/font/Quicksand/static/Quicksand-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-body',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await paymentService.getStoreSettings();

  const storeName = settings.store_name || 'NBusiness';
  const titleDefault =
    settings.seo_meta_title ||
    `${storeName} — Toko Kebutuhan Anak & Perlengkapan Terlengkap`;
  const description =
    settings.seo_meta_description ||
    settings.store_description ||
    'Pusat belanja perlengkapan bayi, pakaian anak, dan mainan edukasi terstandar SNI.';
  const keywords = settings.seo_keywords
    ? settings.seo_keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : ['toko anak', 'perlengkapan bayi', 'baju anak', 'mainan edukasi SNI'];

  const ogImageUrl = settings.seo_og_image || settings.store_logo || null;
  const ogImages = ogImageUrl
    ? [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: titleDefault,
        },
      ]
    : undefined;

  const faviconUrl = settings.store_favicon || null;

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    ),
    title: {
      default: titleDefault,
      template: `%s — ${storeName}`,
    },
    description,
    keywords,
    icons: faviconUrl
      ? {
          icon: [{ url: faviconUrl }],
          shortcut: [{ url: faviconUrl }],
          apple: [{ url: faviconUrl }],
        }
      : undefined,
    verification: {
      google: settings.seo_google_verification || undefined,
    },
    openGraph: {
      title: titleDefault,
      description,
      siteName: storeName,
      locale: 'id_ID',
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: titleDefault,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings = null;
  try {
    settings = await paymentService.getStoreSettings();
  } catch {
    // fallback default
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const storeName = settings?.store_name || 'NBusiness';

  // Schema.org Structured Data for Marketplace/Store
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: storeName,
    url: appUrl,
    description: settings?.store_description || 'Toko online kebutuhan anak & perlengkapan terlengkap.',
    telephone: settings?.store_phone || '+6281234567890',
    email: settings?.store_email || 'halo@babykids.id',
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings?.store_address || 'Jakarta',
      addressLocality: settings?.store_city || 'Jakarta Selatan',
      postalCode: settings?.store_postal_code || '12160',
      addressCountry: 'ID',
    },
    currenciesAccepted: 'IDR',
    paymentAccepted: 'QRIS, Virtual Account Bank, E-Wallet, Cash on Delivery',
  };

  return (
    <html
      lang="id"
      className={`${nunitoHeading.variable} ${quicksandBody.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-body bg-[#FFF8F0] text-slate-800 selection:bg-[#FF9F43]/30 selection:text-[#E07A1E] max-w-full pb-16 md:pb-0">
        {children}
        <FloatingWhatsApp />
        <MobileBottomNav />
      </body>
    </html>
  );
}
