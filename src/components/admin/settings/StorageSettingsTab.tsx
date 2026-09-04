'use client';

import React from 'react';
import { Cloud, HardDrive, ShieldCheck, CheckCircle2, Copy, Check, ExternalLink } from 'lucide-react';

export interface R2StorageInfoData {
  isConfigured: boolean;
  bucketName: string;
  publicUrl: string;
  accountId: string;
  region: string;
  protocol: string;
  maxUploadSize: string;
}

interface StorageSettingsTabProps {
  r2Info: R2StorageInfoData;
  copyToClipboard: (text: string, key: string) => void;
  copiedKey: string | null;
}

export function StorageSettingsTab({ r2Info, copyToClipboard, copiedKey }: StorageSettingsTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Penyimpanan Gambar Produk (Cloudflare R2 Storage)
              </h2>
              <p className="text-xs text-slate-500">
                Infrastruktur object storage global S3-compatible berkecepatan tinggi tanpa biaya egress
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              r2Info.isConfigured
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{r2Info.isConfigured ? '🟢 Live Production R2 Terhubung' : '🟡 Mode Lokal Pratinjau Aktif'}</span>
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">Nama Bucket R2</span>
            <strong className="text-xs font-mono text-slate-800">{r2Info.bucketName}</strong>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">Protokol Storage</span>
            <strong className="text-xs text-slate-800">{r2Info.protocol}</strong>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">Batas Ukuran Upload</span>
            <strong className="text-xs text-slate-800">{r2Info.maxUploadSize}</strong>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">Public CDN URL Endpoint</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={r2Info.publicUrl}
              className="flex-1 px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-700 select-all"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(r2Info.publicUrl, 'r2_url')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              {copiedKey === 'r2_url' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'r2_url' ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
