'use client';

import React from 'react';
import { Store, Mail, Phone, Clock, FileText, Sparkles, Megaphone, Link2, Eye } from 'lucide-react';

export interface StoreProfileData {
  storeName: string;
  tagline: string;
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

const DEFAULT_ANNOUNCEMENT_TEXT = '\uD83C\uDF89 Gratis Ongkir s/d Rp 20.000 ke Seluruh Indonesia Belanja Min. Rp 100.000!';

export function ProfileSettingsTab({ profile, setProfile, announcement, setAnnouncement, onChange }: ProfileSettingsTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Profil & Identitas Brand NBusiness
              </h2>
              <p className="text-xs text-slate-500">
                Informasi nama bisnis, slogan toko, kontak layanan pelanggan, dan jam kerja
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Identitas Resmi</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Nama Toko</label>
            <input
              type="text"
              value={profile.storeName}
              onChange={(e) => {
                setProfile({ ...profile, storeName: e.target.value });
                onChange();
              }}
              placeholder="NBusiness"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-slate-800"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Slogan / Tagline</label>
            <input
              type="text"
              value={profile.tagline}
              onChange={(e) => {
                setProfile({ ...profile, tagline: e.target.value });
                onChange();
              }}
              placeholder="Marketplace Kebutuhan Anak Terlengkap #1 di Indonesia"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-slate-800"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
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
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-slate-800"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Nomor WhatsApp Bisnis</span>
            </label>
            <input
              type="text"
              value={profile.whatsappNumber}
              onChange={(e) => {
                setProfile({ ...profile, whatsappNumber: e.target.value });
                onChange();
              }}
              placeholder="+62 812-3456-7890"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-slate-800"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Jam Operasional Toko</span>
            </label>
            <input
              type="text"
              value={profile.operationalHours}
              onChange={(e) => {
                setProfile({ ...profile, operationalHours: e.target.value });
                onChange();
              }}
              placeholder="Senin - Minggu, 08:00 - 21:00 WIB"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-slate-800"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Deskripsi Singkat Bisnis NBusiness</span>
            </label>
            <textarea
              rows={3}
              value={profile.storeDescription}
              onChange={(e) => {
                setProfile({ ...profile, storeDescription: e.target.value });
                onChange();
              }}
              placeholder="Tuliskan gambaran umum toko Anda, komitmen kualitas produk anak, dan keunggulan belanja di NBusiness..."
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 leading-relaxed text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Announcement Bar Configuration - Claymorphism + Vibrant Block */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FFE8D6] shadow-md space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF9F43] to-[#EE8A2B] text-white flex items-center justify-center font-bold border-2 border-[#F38C26] shadow-[0_4px_10px_rgba(255,159,67,0.3)]">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-heading font-bold text-slate-800">
                Banner Pengumuman Header
              </h2>
              <p className="text-xs font-body text-slate-500">
                Atur banner promosi yang muncul di atas navbar seluruh halaman toko
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8F0] text-[#FF9F43] text-xs font-body font-bold border-2 border-[#FFE8D6]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Banner Atas</span>
          </span>
        </div>

        <div className="space-y-5">
          {/* Toggle Aktifkan / Sembunyikan */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFF8F0] border-2 border-[#FFE8D6]">
            <div className="flex-1">
              <p className="text-sm font-heading font-bold text-slate-800">Aktifkan / Sembunyikan Banner Pengumuman Atas</p>
              <p className="text-xs font-body text-slate-500 mt-0.5">
                {announcement.enabled ? 'Banner sedang ditampilkan di atas navbar' : 'Banner disembunyikan dari pengunjung'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={announcement.enabled}
              onClick={() => {
                setAnnouncement((prev) => ({ ...prev, enabled: !prev.enabled }));
                onChange();
              }}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 ${announcement.enabled ? 'bg-[#FF9F43] border-[#F38C26]' : 'bg-slate-200 border-slate-300'}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${announcement.enabled ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>

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
              <Link2 className="w-3.5 h-3.5 text-[#87CEEB]" />
              <span>Tautan / Link Tujuan</span>
              <span className="text-[10px] font-body font-medium text-slate-400">(opsional)</span>
            </label>
            <input
              type="text"
              maxLength={255}
              value={announcement.link}
              onChange={(e) => {
                setAnnouncement((prev) => ({ ...prev, link: e.target.value }));
                onChange();
              }}
              placeholder="Contoh: /katalog?promo=gratis-ongkir"
              className="w-full px-4 py-2.5 text-sm font-body rounded-2xl border-2 border-[#FFE8D6] bg-white focus:outline-none focus:border-[#87CEEB] focus:ring-4 focus:ring-[#87CEEB]/20 text-slate-800 placeholder-slate-400 transition-all"
            />
            <p className="text-[11px] font-body text-slate-400 mt-1">Kosongkan jika banner tidak perlu diklik. Gunakan path internal (mis. /katalog) atau URL penuh.</p>
          </div>

          {/* Live Preview */}
          <div>
            <p className="text-xs font-heading font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>Live Preview</span>
            </p>
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
