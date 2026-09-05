'use client';

import React, { useState, useRef } from 'react';
import {
  Store,
  Mail,
  Phone,
  Clock,
  FileText,
  Sparkles,
  Megaphone,
  Link2,
  Eye,
  Image as ImageIcon,
  Upload,
  Loader2,
  Layers,
} from 'lucide-react';

export interface StoreProfileData {
  storeName: string;
  tagline: string;
  logo: string;
  favicon: string;
  headerLogoDisplay: 'both' | 'logo_only';
  customerServiceEmail: string;
  whatsappNumber: string;
  operationalHours: string;
  storeDescription: string;
}

export interface AnnouncementData {
  enabled: boolean;
  text: string;
  link: string;
}

interface ProfileSettingsTabProps {
  profile: StoreProfileData;
  setProfile: React.Dispatch<React.SetStateAction<StoreProfileData>>;
  announcement: AnnouncementData;
  setAnnouncement: React.Dispatch<React.SetStateAction<AnnouncementData>>;
  onChange: () => void;
}

const DEFAULT_ANNOUNCEMENT_TEXT =
  '🎉 Gratis Ongkir s/d Rp 20.000 ke Seluruh Indonesia Belanja Min. Rp 100.000!';

export function ProfileSettingsTab({
  profile,
  setProfile,
  announcement,
  setAnnouncement,
  onChange,
}: ProfileSettingsTabProps) {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (
    file: File,
    type: 'logo' | 'favicon'
  ) => {
    const isLogo = type === 'logo';
    if (isLogo) setIsUploadingLogo(true);
    else setIsUploadingFavicon(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        if (isLogo) {
          setProfile((prev) => ({ ...prev, logo: data.url }));
        } else {
          setProfile((prev) => ({ ...prev, favicon: data.url }));
        }
        onChange();
      } else {
        alert(data.error || 'Gagal mengunggah gambar');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat upload');
    } finally {
      if (isLogo) setIsUploadingLogo(false);
      else setIsUploadingFavicon(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Profil & Identitas Brand */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FFE8D6] shadow-[0_8px_20px_rgba(255,159,67,0.08)] space-y-6">
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#FFE8D6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF2E5] text-[#FF9F43] border-2 border-[#FFD4B2] flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-heading font-black text-slate-800">
                Profil & Identitas Brand Toko
              </h2>
              <p className="text-xs font-body text-slate-500">
                Atur nama website, slogan, logo header, favicon, dan kontak layanan pelanggan
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-heading font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Identitas Resmi</span>
          </span>
        </div>

        {/* Input Nama Toko & Slogan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-heading font-bold text-slate-700 block mb-1.5">
              Nama Toko / Website
            </label>
            <input
              type="text"
              value={profile.storeName}
              onChange={(e) => {
                setProfile({ ...profile, storeName: e.target.value });
                onChange();
              }}
              placeholder="NBusiness"
              className="w-full px-4 py-2.5 text-xs font-body rounded-2xl border-2 border-[#FFE8D6] focus:outline-none focus:border-[#FF9F43] text-slate-800 bg-[#FFF8F0]"
            />
          </div>
          <div>
            <label className="text-xs font-heading font-bold text-slate-700 block mb-1.5">
              Slogan / Tagline
            </label>
            <input
              type="text"
              value={profile.tagline}
              onChange={(e) => {
                setProfile({ ...profile, tagline: e.target.value });
                onChange();
              }}
              placeholder="Kebutuhan & Mainan Anak Terlengkap"
              className="w-full px-4 py-2.5 text-xs font-body rounded-2xl border-2 border-[#FFE8D6] focus:outline-none focus:border-[#FF9F43] text-slate-800 bg-[#FFF8F0]"
            />
          </div>
        </div>

        {/* Logo & Favicon Management */}
        <div className="pt-4 border-t-2 border-[#FFE8D6] grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Upload Logo Toko */}
          <div className="space-y-3">
            <label className="text-xs font-heading font-bold text-slate-700 block flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#FF9F43]" />
                <span>Logo Header Website</span>
              </span>
              <span className="text-[10px] font-body text-slate-400">Rekomendasi PNG/WebP transparan</span>
            </label>

            <div className="flex items-center gap-3">
              {profile.logo ? (
                <div className="w-14 h-14 rounded-2xl bg-[#FFF8F0] border-2 border-[#FFE8D6] p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={profile.logo} alt="Logo Toko" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF9F43] to-[#EE8A2B] text-white flex items-center justify-center font-heading font-black text-xl border-2 border-[#F38C26] shadow-xs shrink-0">
                  <Store className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  value={profile.logo}
                  onChange={(e) => {
                    setProfile({ ...profile, logo: e.target.value });
                    onChange();
                  }}
                  placeholder="URL Logo (https://... atau upload)"
                  className="w-full px-3.5 py-2 text-xs font-body rounded-xl border-2 border-[#FFE8D6] focus:outline-none focus:border-[#FF9F43] bg-[#FFF8F0]"
                />
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file, 'logo');
                  }}
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  className="px-3 py-1.5 bg-white hover:bg-[#FFF2E5] border border-[#FFD4B2] text-[#D96B00] rounded-xl text-xs font-heading font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUploadingLogo ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengunggah Logo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah Logo Baru</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Pilihan Mode Tampilan Logo Header */}
            <div className="pt-2">
              <label className="text-xs font-heading font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0E678E]" />
                <span>Mode Tampilan Header</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setProfile({ ...profile, headerLogoDisplay: 'both' });
                    onChange();
                  }}
                  className={`p-2.5 rounded-2xl border-2 text-xs font-heading font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                    profile.headerLogoDisplay === 'both'
                      ? 'border-[#FF9F43] bg-[#FFF2E5] text-[#D96B00] shadow-xs'
                      : 'border-[#FFE8D6] hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <span>Logo + Nama Toko</span>
                  {profile.headerLogoDisplay === 'both' && <span className="text-[#FF9F43]">✓</span>}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfile({ ...profile, headerLogoDisplay: 'logo_only' });
                    onChange();
                  }}
                  className={`p-2.5 rounded-2xl border-2 text-xs font-heading font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                    profile.headerLogoDisplay === 'logo_only'
                      ? 'border-[#FF9F43] bg-[#FFF2E5] text-[#D96B00] shadow-xs'
                      : 'border-[#FFE8D6] hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <span>Logo Saja</span>
                  {profile.headerLogoDisplay === 'logo_only' && <span className="text-[#FF9F43]">✓</span>}
                </button>
              </div>
            </div>
          </div>

          {/* Upload Favicon Toko */}
          <div className="space-y-3">
            <label className="text-xs font-heading font-bold text-slate-700 block flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF9F43]" />
                <span>Favicon Browser (.ico / .png)</span>
              </span>
              <span className="text-[10px] font-body text-slate-400">Ikon tab browser (32x32 px)</span>
            </label>

            <div className="flex items-center gap-3">
              {profile.favicon ? (
                <div className="w-14 h-14 rounded-2xl bg-[#FFF8F0] border-2 border-[#FFE8D6] p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={profile.favicon} alt="Favicon" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border-2 border-slate-200 text-slate-500 flex items-center justify-center font-heading font-bold text-xs shrink-0">
                  Default
                </div>
              )}

              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  value={profile.favicon}
                  onChange={(e) => {
                    setProfile({ ...profile, favicon: e.target.value });
                    onChange();
                  }}
                  placeholder="URL Favicon (https://... atau upload)"
                  className="w-full px-3.5 py-2 text-xs font-body rounded-xl border-2 border-[#FFE8D6] focus:outline-none focus:border-[#FF9F43] bg-[#FFF8F0]"
                />
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/x-icon,image/png,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file, 'favicon');
                  }}
                />
                <button
                  type="button"
                  onClick={() => faviconInputRef.current?.click()}
                  disabled={isUploadingFavicon}
                  className="px-3 py-1.5 bg-white hover:bg-[#FFF2E5] border border-[#FFD4B2] text-[#D96B00] rounded-xl text-xs font-heading font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUploadingFavicon ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengunggah Favicon...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah Favicon</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Header Logo Preview Box */}
            <div className="p-3 bg-[#FFF8F0] rounded-2xl border border-[#FFE8D6]">
              <span className="text-[11px] font-heading font-bold text-[#D96B00] block mb-2">
                Pratinjau Logo di Header:
              </span>
              <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-[#FFE8D6]">
                {profile.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.logo}
                    alt="Logo"
                    className={`${profile.headerLogoDisplay === 'logo_only' ? 'h-9 w-auto' : 'w-8 h-8 p-0.5 rounded-lg border border-[#FFE8D6]'} object-contain`}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF9F43] to-[#EE8A2B] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <Store className="w-4 h-4" />
                  </div>
                )}
                {profile.headerLogoDisplay === 'both' && (
                  <div>
                    <span className="text-sm font-heading font-black text-[#D96B00] tracking-tight block leading-tight">
                      {profile.storeName || 'NBusiness'}
                    </span>
                    <span className="text-[10px] font-body text-slate-400 block -mt-0.5">
                      {profile.tagline || 'Kebutuhan & Mainan Anak'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kontak & Jam Operasional */}
        <div className="pt-4 border-t-2 border-[#FFE8D6] grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="text-xs font-heading font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email Layanan Pelanggan</span>
            </label>
            <input
              type="email"
              value={profile.customerServiceEmail}
              onChange={(e) => {
                setProfile({ ...profile, customerServiceEmail: e.target.value });
                onChange();
              }}
              placeholder="halo@nbusiness.id"
              className="w-full px-4 py-2.5 text-xs font-body rounded-2xl border-2 border-[#FFE8D6] focus:outline-none focus:border-[#FF9F43] text-slate-800 bg-[#FFF8F0]"
            />
          </div>
          <div>
            <label className="text-xs font-heading font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Nomor WhatsApp CS</span>
            </label>
            <input
              type="tel"
              value={profile.whatsappNumber}
              onChange={(e) => {
                setProfile({ ...profile, whatsappNumber: e.target.value });
                onChange();
              }}
              placeholder="0812-3456-7890"
              className="w-full px-4 py-2.5 text-xs font-body rounded-2xl border-2 border-[#FFE8D6] focus:outline-none focus:border-[#FF9F43] text-slate-800 bg-[#FFF8F0]"
            />
          </div>
          <div>
            <label className="text-xs font-heading font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Jam Operasional Layanan</span>
            </label>
            <input
              type="text"
              value={profile.operationalHours}
              onChange={(e) => {
                setProfile({ ...profile, operationalHours: e.target.value });
                onChange();
              }}
              placeholder="Senin - Minggu: 08:00 - 21:00 WIB"
              className="w-full px-4 py-2.5 text-xs font-body rounded-2xl border-2 border-[#FFE8D6] focus:outline-none focus:border-[#FF9F43] text-slate-800 bg-[#FFF8F0]"
            />
          </div>
        </div>

        {/* Deskripsi Toko */}
        <div className="pt-2">
          <label className="text-xs font-heading font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Deskripsi Singkat Toko</span>
          </label>
          <textarea
            rows={3}
            value={profile.storeDescription}
            onChange={(e) => {
              setProfile({ ...profile, storeDescription: e.target.value });
              onChange();
            }}
            placeholder="Tuliskan deskripsi lengkap tentang toko Anda..."
            className="w-full px-4 py-2.5 text-xs font-body rounded-2xl border-2 border-[#FFE8D6] focus:outline-none focus:border-[#FF9F43] leading-relaxed text-slate-800 bg-[#FFF8F0]"
          />
        </div>
      </div>

      {/* 2. Banner Pengumuman Atas (Announcement Bar) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FFE8D6] shadow-[0_8px_20px_rgba(255,159,67,0.08)] space-y-6">
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#FFE8D6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF2E5] text-[#FF9F43] border-2 border-[#FFD4B2] flex items-center justify-center font-bold">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-heading font-black text-slate-800">
                Banner Pengumuman Atas (Announcement Bar)
              </h2>
              <p className="text-xs font-body text-slate-500">
                Badge berjalan di atas header untuk menampilkan promo gratis ongkir, voucher, atau pengumuman penting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-heading font-bold text-slate-600">
              {announcement.enabled ? 'Aktif' : 'Nonaktif'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={announcement.enabled}
              onClick={() => {
                setAnnouncement((prev) => ({ ...prev, enabled: !prev.enabled }));
                onChange();
              }}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                announcement.enabled ? 'bg-[#FF9F43]' : 'bg-slate-200'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  announcement.enabled ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Teks Pengumuman */}
          <div>
            <label className="text-xs font-heading font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-[#FF9F43]" />
              <span>Teks Pengumuman Header</span>
              <span className="text-[10px] font-body font-medium text-slate-400">(maks. 255 karakter)</span>
            </label>
            <input
              type="text"
              maxLength={255}
              value={announcement.text}
              onChange={(e) => {
                setAnnouncement((prev) => ({ ...prev, text: e.target.value }));
                onChange();
              }}
              placeholder={DEFAULT_ANNOUNCEMENT_TEXT}
              className="w-full px-4 py-2.5 text-sm font-body rounded-2xl border-2 border-[#FFE8D6] bg-[#FFF8F0] focus:outline-none focus:border-[#FF9F43] focus:ring-4 focus:ring-[#FF9F43]/20 text-slate-800 placeholder-slate-400 transition-all"
            />
            <p className="text-[11px] font-body text-slate-400 mt-1 text-right">{announcement.text.length}/255 karakter</p>
          </div>

          {/* Link Tujuan */}
          <div>
            <label className="text-xs font-heading font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Tautan / Link Tujuan (Opsional)</span>
              <span className="text-[10px] font-body font-medium text-slate-400">mis. /katalog atau https://...</span>
            </label>
            <input
              type="text"
              value={announcement.link}
              onChange={(e) => {
                setAnnouncement((prev) => ({ ...prev, link: e.target.value }));
                onChange();
              }}
              placeholder="Contoh: /katalog?sort=rekomendasi"
              className="w-full px-4 py-2.5 text-xs font-body rounded-2xl border-2 border-[#FFE8D6] bg-[#FFF8F0] focus:outline-none focus:border-[#FF9F43] text-slate-800 placeholder-slate-400 transition-all"
            />
          </div>

          {/* Pratinjau Tampilan Banner */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-heading font-bold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#FF9F43]" />
                <span>Pratinjau Tampilan Banner (Live Preview)</span>
              </label>
            </div>

            {announcement.enabled ? (
              announcement.link ? (
                <a
                  href={announcement.link}
                  target={announcement.link.startsWith('http') ? '_blank' : undefined}
                  rel={announcement.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="block bg-gradient-to-r from-[#FF9F43] via-[#FFAF60] to-[#87CEEB] text-white text-xs py-2.5 px-4 text-center font-heading font-bold tracking-wide rounded-2xl border-2 border-[#FFE8D6] shadow-md hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-200 shrink-0" />
                    <span>{announcement.text || DEFAULT_ANNOUNCEMENT_TEXT}</span>
                  </span>
                </a>
              ) : (
                <div className="bg-gradient-to-r from-[#FF9F43] via-[#FFAF60] to-[#87CEEB] text-white text-xs py-2.5 px-4 text-center font-heading font-bold tracking-wide rounded-2xl border-2 border-[#FFE8D6] shadow-md">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-200 shrink-0" />
                    <span>{announcement.text || DEFAULT_ANNOUNCEMENT_TEXT}</span>
                  </span>
                </div>
              )
            ) : (
              <div className="text-center py-3 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                <p className="text-xs font-body text-slate-400">Banner disembunyikan — aktifkan toggle di atas untuk melihat preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
