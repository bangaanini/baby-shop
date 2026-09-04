'use client';

import React from 'react';
import { Store, Mail, Phone, Clock, FileText, Sparkles } from 'lucide-react';

export interface StoreProfileData {
  storeName: string;
  tagline: string;
  customerServiceEmail: string;
  whatsappNumber: string;
  operationalHours: string;
  storeDescription: string;
}

interface ProfileSettingsTabProps {
  profile: StoreProfileData;
  setProfile: React.Dispatch<React.SetStateAction<StoreProfileData>>;
  onChange: () => void;
}

export function ProfileSettingsTab({ profile, setProfile, onChange }: ProfileSettingsTabProps) {
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

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Nama Brand / Toko <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={profile.storeName}
                onChange={(e) => {
                  setProfile({ ...profile, storeName: e.target.value });
                  onChange();
                }}
                placeholder="NBusiness"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Tagline / Slogan Bisnis
              </label>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                placeholder="support@nbusiness.id"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Nomor WhatsApp Toko</span>
              </label>
              <input
                type="text"
                value={profile.whatsappNumber}
                onChange={(e) => {
                  setProfile({ ...profile, whatsappNumber: e.target.value });
                  onChange();
                }}
                placeholder="+62 812-3456-7890"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-slate-800 font-mono"
              />
            </div>
          </div>

          <div>
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

          <div>
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
    </div>
  );
}
