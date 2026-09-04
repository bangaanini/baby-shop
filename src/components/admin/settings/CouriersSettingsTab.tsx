'use client';

import React from 'react';
import { Truck, Calculator, Radio, Scale, Box, Package, Activity, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export interface CourierSettingsData {
  sicepat: boolean;
  jne: boolean;
  jnt: boolean;
  anteraja: boolean;
  cargo: boolean;
}

export interface BiteshipInfoData {
  isConfigured: boolean;
  origin: {
    postalCode: string;
    city: string;
    province: string;
  };
  apiKeyMasked: string;
}

export interface ShippingCalculationResult {
  rates: any[];
  totalWeightGram: number;
  totalVolumeWeightGram: number;
  chargeableWeightKg: number;
  isLiveBiteship: boolean;
}

interface CouriersSettingsTabProps {
  couriers: CourierSettingsData;
  setCouriers: React.Dispatch<React.SetStateAction<CourierSettingsData>>;
  biteshipInfo: BiteshipInfoData;
  // Tester states
  testCity: string;
  setTestCity: (v: string) => void;
  testPostalCode: string;
  setTestPostalCode: (v: string) => void;
  testWeightGram: number;
  setTestWeightGram: (v: number) => void;
  testLengthCm: number;
  setTestLengthCm: (v: number) => void;
  testWidthCm: number;
  setTestWidthCm: (v: number) => void;
  testHeightCm: number;
  setTestHeightCm: (v: number) => void;
  testItemName: string;
  setTestItemName: (v: string) => void;
  testSelectedPresetId: string;
  handleApplyPreset: (id: string) => void;
  handleApplyQuickDestination: (dest: { city: string; postalCode: string }) => void;
  isTestingRates: boolean;
  testError: string | null;
  testResult: ShippingCalculationResult | null;
  handleRunShippingTest: () => void;
  sampleProducts: any[];
  quickDestinations: any[];
  formatRupiah: (v: number) => string;
  getCourierBadgeStyle: (code: string) => any;
  onChange: () => void;
}

export function CouriersSettingsTab({
  couriers,
  setCouriers,
  biteshipInfo,
  testCity,
  setTestCity,
  testPostalCode,
  setTestPostalCode,
  testWeightGram,
  setTestWeightGram,
  testLengthCm,
  setTestLengthCm,
  testWidthCm,
  setTestWidthCm,
  testHeightCm,
  setTestHeightCm,
  testItemName,
  setTestItemName,
  testSelectedPresetId,
  handleApplyPreset,
  handleApplyQuickDestination,
  isTestingRates,
  testError,
  testResult,
  handleRunShippingTest,
  sampleProducts,
  quickDestinations,
  formatRupiah,
  getCourierBadgeStyle,
  onChange,
}: CouriersSettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* Kurir Aktif */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Pilihan Ekspedisi & Jasa Kurir Pengiriman
              </h2>
              <p className="text-xs text-slate-500">
                Aktifkan opsi kurir ekspres yang dapat dipilih oleh pembeli saat checkout
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[
            {
              id: 'sicepat',
              name: 'SiCepat Ekspres',
              desc: 'Layanan REG & Cargo GOKIL',
              badge: 'Populer',
              color: 'border-red-200 bg-red-50/20',
            },
            {
              id: 'jne',
              name: 'JNE Express',
              desc: 'Layanan Reguler & YES 24 Jam',
              badge: 'Terpercaya',
              color: 'border-blue-200 bg-blue-50/20',
            },
            {
              id: 'jnt',
              name: 'J&T Express',
              desc: 'Layanan EZ Jangkauan Luas',
              badge: 'Cepat',
              color: 'border-rose-200 bg-rose-50/20',
            },
            {
              id: 'anteraja',
              name: 'Anteraja',
              desc: 'Layanan Reguler & Next Day',
              badge: 'Ekonomis',
              color: 'border-fuchsia-200 bg-fuchsia-50/20',
            },
            {
              id: 'cargo',
              name: 'Cargo Paket Besar',
              desc: 'Khusus barang berat > 5 kg (Stroller/Kursi)',
              badge: 'Hemat Berat',
              color: 'border-amber-200 bg-amber-50/20',
            },
          ].map((c) => {
            const isChecked = couriers[c.id as keyof CourierSettingsData];
            return (
              <label
                key={c.id}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  isChecked ? c.color + ' border-rose-400 shadow-xs' : 'border-slate-100 bg-slate-50/50 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-slate-800">{c.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {c.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{c.desc}</p>
                </div>

                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    setCouriers({ ...couriers, [c.id]: e.target.checked });
                    onChange();
                  }}
                  className="w-4 h-4 rounded accent-rose-500 mt-1 cursor-pointer"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Biteship Live Rate Tester */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Uji Cek Tarif Kurir Live (Biteship API Tester)
              </h2>
              <p className="text-xs text-slate-500">
                Simulasi penghitungan tarif ongkos kirim real-time berdasarkan berat fisik dan berat volumetrik paket
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              biteshipInfo.isConfigured
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{biteshipInfo.isConfigured ? '🟢 Live Biteship Terhubung' : '🟡 Smart Fallback Aktif'}</span>
          </span>
        </div>

        {/* Preset Produk & Kota */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              1. Pilih Contoh Paket Produk Anak:
            </label>
            <div className="flex flex-wrap gap-2">
              {sampleProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleApplyPreset(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    testSelectedPresetId === p.id
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p.name} ({p.badge})
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Kota Tujuan</label>
              <input
                type="text"
                value={testCity}
                onChange={(e) => setTestCity(e.target.value)}
                placeholder="Contoh: Surabaya"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Kode Pos Tujuan</label>
              <input
                type="text"
                value={testPostalCode}
                onChange={(e) => setTestPostalCode(e.target.value)}
                placeholder="60189"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Berat Fisik (Gram)</label>
              <input
                type="number"
                value={testWeightGram}
                onChange={(e) => setTestWeightGram(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Dimensi P x L x T (cm)</label>
              <div className="grid grid-cols-3 gap-1">
                <input
                  type="number"
                  value={testLengthCm}
                  onChange={(e) => setTestLengthCm(Number(e.target.value))}
                  placeholder="P"
                  className="px-2 py-2 text-xs rounded-xl border border-slate-200 text-center"
                />
                <input
                  type="number"
                  value={testWidthCm}
                  onChange={(e) => setTestWidthCm(Number(e.target.value))}
                  placeholder="L"
                  className="px-2 py-2 text-xs rounded-xl border border-slate-200 text-center"
                />
                <input
                  type="number"
                  value={testHeightCm}
                  onChange={(e) => setTestHeightCm(Number(e.target.value))}
                  placeholder="T"
                  className="px-2 py-2 text-xs rounded-xl border border-slate-200 text-center"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
              Pilihan Cepat Kota Tujuan:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickDestinations.map((d) => (
                <button
                  key={d.postalCode}
                  type="button"
                  onClick={() => handleApplyQuickDestination(d)}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleRunShippingTest}
              disabled={isTestingRates}
              className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isTestingRates ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
                  <span>Sedang Menghubungi API Kurir...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-3.5 h-3.5 text-rose-400" />
                  <span>Cek Tarif Pengiriman Real-Time</span>
                </>
              )}
            </button>
          </div>

          {testError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{testError}</span>
            </div>
          )}

          {/* Test Results */}
          {testResult && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 pb-2 border-b border-slate-200">
                <div>
                  Berat Aktual: <strong>{(testResult.totalWeightGram / 1000).toFixed(2)} kg</strong> | Volumetrik:{' '}
                  <strong>{(testResult.totalVolumeWeightGram / 1000).toFixed(2)} kg</strong>
                </div>
                <div>
                  Dikenakan Beban Biaya:{' '}
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    {testResult.chargeableWeightKg} kg
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {testResult.rates.map((r, idx) => {
                  const style = getCourierBadgeStyle(r.courierCode);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold text-white ${style.pillBg}`}>
                          {style.logo}
                        </span>
                        <div>
                          <strong className="text-slate-800">{r.courierName}</strong> —{' '}
                          <span className="text-slate-600">{r.serviceName}</span>
                          <span className="text-slate-400 block text-[11px]">Estimasi: {r.etd || r.estimatedDays}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <strong className="text-sm text-slate-900 block">{formatRupiah(r.cost || r.price)}</strong>
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          {testResult.isLiveBiteship ? '🟢 Live Rates' : '🟡 Smart Fallback'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
