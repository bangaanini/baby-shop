import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { paymentService } from '@/server/services/payment.service';
import './globals.css';

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
      className={`${nunitoHeading.variable} ${quicksandBody.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-body bg-[#FFF8F0] text-slate-800 selection:bg-[#FF9F43]/30 selection:text-[#E07A1E]">{children}</body>
    </html>
  );
}

