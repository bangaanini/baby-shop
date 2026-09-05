'use client';

import React, { useState, Suspense } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFF8F0]/50 text-slate-800 flex flex-col antialiased selection:bg-[#FF9F43]/30 selection:text-[#D96B00]">
      <Suspense fallback={<div className="hidden md:block w-64 bg-slate-900 fixed inset-y-0 z-30" />}>
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </Suspense>

      {/* Main Content Wrap with Left Offset on Desktop */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        <Suspense fallback={<header className="h-16 bg-white border-b border-slate-200" />}>
          <AdminHeader onOpenSidebar={() => setSidebarOpen(true)} />
        </Suspense>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
