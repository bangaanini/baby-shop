import React from 'react';
import { Metadata } from 'next';
import { Navbar, Footer } from '@/components/layout/NavbarFooter';
import { UserProfileView } from '@/components/user/UserProfileView';

export const metadata: Metadata = {
  title: 'Profil Saya & Pengaturan Akun — BabyKids',
  description: 'Kelola data diri, data anak, dan alamat pengiriman Anda di BabyKids.',
};

export default function UserProfilePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <UserProfileView />
      </main>
      <Footer />
    </div>
  );
}
