import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NBusiness - Perlengkapan Bayi & Anak',
    short_name: 'NBusiness',
    description: 'Pusat belanja perlengkapan bayi, pakaian anak, dan mainan edukasi terstandar aman SNI dengan harga terjangkau.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF8F0',
    theme_color: '#FF9F43',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
