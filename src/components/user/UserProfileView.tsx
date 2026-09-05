'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Home, ChevronRight, AlertCircle, LogIn } from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';
import { UserSidebar, UserAccountTab } from '@/components/user/UserSidebar';
import { BiodataTab } from '@/components/user/tabs/BiodataTab';
import { AddressesTab } from '@/components/user/tabs/AddressesTab';
import { OrdersTab } from '@/components/user/tabs/OrdersTab';
import { SecurityTab } from '@/components/user/tabs/SecurityTab';

export interface UserProfileViewProps {
  initialTab?: UserAccountTab;
}

const TAB_TITLES: Record<UserAccountTab, string> = {
  biodata: 'Biodata Diri',
  alamat: 'Daftar Alamat',
  transaksi: 'Daftar Transaksi',
  keamanan: 'Keamanan Akun',
};

const VALID_TABS: UserAccountTab[] = ['biodata', 'alamat', 'transaksi', 'keamanan'];

export function UserProfileView({ initialTab }: UserProfileViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();

  const user = session?.user as
    | {
        id?: string;
        name?: string;
        email?: string;
        role?: string;
        phone?: string;
        image?: string;
        emailVerified?: boolean;
      }
    | undefined;

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Tab resolution logic: search params > initialTab > default ('biodata')
  const tabParam = searchParams.get('tab') as UserAccountTab | null;
  const resolvedTab: UserAccountTab =
    tabParam && VALID_TABS.includes(tabParam)
      ? tabParam
      : initialTab && VALID_TABS.includes(initialTab)
      ? initialTab
      : 'biodata';

  const [activeTab, setActiveTab] = useState<UserAccountTab>(resolvedTab);

  // Synchronize activeTab if URL query param changes
  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: UserAccountTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.set('tab', tab);
    router.push(`/user/profil?${params.toString()}`, { scroll: false });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/auth/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Loading skeleton while session is pending
  if (isPending) {
    return (
      <div className="py-4 space-y-6 animate-pulse" aria-label="Memuat data profil">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 bg-slate-200 rounded-md w-16" />
          <div className="h-3 w-3 bg-slate-200 rounded-full" />
          <div className="h-4 bg-slate-200 rounded-md w-20" />
          <div className="h-3 w-3 bg-slate-200 rounded-full" />
          <div className="h-4 bg-slate-200 rounded-md w-24" />
        </div>

        {/* 2-Column Responsive Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-4 bg-slate-200 rounded-full w-24 mt-1" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="h-4 bg-slate-200 rounded w-full" />
              </div>
            </div>
            <div className="bg-white rounded-3xl p-3 border border-slate-100 shadow-xs space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
              <div className="h-6 bg-slate-200 rounded w-48" />
              <div className="space-y-4">
                <div className="h-12 bg-slate-100 rounded-2xl" />
                <div className="h-12 bg-slate-100 rounded-2xl" />
                <div className="h-12 bg-slate-100 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Clean Breadcrumb Navigation */}
      <nav
        className="flex items-center gap-2 text-xs font-heading font-bold text-[#D96B00] mb-6 overflow-x-auto pb-1 scrollbar-none"
        aria-label="Breadcrumb"
      >
        <Link
          href="/"
          className="hover:text-[#FF9F43] transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Beranda</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link
          href="/user/profil"
          className="hover:text-[#FF9F43] transition-colors shrink-0"
        >
          Akun Saya
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-heading font-black text-slate-800 shrink-0">
          {TAB_TITLES[activeTab] || 'Biodata Diri'}
        </span>
      </nav>

      {/* Guest Notice (If session is empty / unauthenticated) */}
      {!user && (
        <div className="mb-6 p-5 rounded-3xl bg-[#FFF8F0] border-2 border-[#FFE8D6] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#FF9F43] shrink-0" />
            <span className="font-body font-semibold">
              Anda saat ini belum masuk ke akun. Silakan masuk untuk mengakses fitur akun, pesanan, dan alamat pengiriman Anda secara tersimpan.
            </span>
          </div>
          <Link
            href="/auth/login"
            className="clay-btn-orange px-4 py-2 text-xs text-white shrink-0"
          >
            <LogIn className="w-4 h-4 mr-1.5" />
            <span>Masuk Akun</span>
          </Link>
        </div>
      )}

      {/* Tokopedia 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (3/12 or w-72 on desktop): Sidebar Akun */}
        <div className="lg:col-span-4 xl:col-span-3">
          <UserSidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            user={user}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />
        </div>

        {/* Right Column (9/12 or flex-1): Konten Tab */}
        <div className="lg:col-span-8 xl:col-span-9 min-w-0">
          {activeTab === 'biodata' && (
            <BiodataTab user={user} userId={user?.id} />
          )}

          {activeTab === 'alamat' && (
            <AddressesTab userId={user?.id} />
          )}

          {activeTab === 'transaksi' && (
            <OrdersTab userId={user?.id} />
          )}

          {activeTab === 'keamanan' && (
            <SecurityTab
              user={user}
              onLogout={handleLogout}
              isLoggingOut={isLoggingOut}
            />
          )}
        </div>
      </div>
    </div>
  );
}
