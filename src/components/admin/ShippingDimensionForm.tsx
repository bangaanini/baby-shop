'use client';

import React from 'react';
import {
  Truck,
  Scale,
  Box,
  HelpCircle,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export interface ShippingDimensions {
  weightGram: number;
  dimensionLength: number;
  dimensionWidth: number;
  dimensionHeight: number;
}

export interface ShippingDimensionFormProps {
  weightGram: number;
  dimensionLength: number;
  dimensionWidth: number;
  dimensionHeight: number;
  onChange: (dimensions: ShippingDimensions) => void;
  disabled?: boolean;
}

export function ShippingDimensionForm({
  weightGram = 500,
  dimensionLength = 10,
  dimensionWidth = 10,
  dimensionHeight = 10,
  onChange,
  disabled = false,
}: ShippingDimensionFormProps) {
  // Calculations
  const safeWeight = Math.max(1, Number(weightGram) || 0);
  const safeLength = Math.max(1, Number(dimensionLength) || 0);
  const safeWidth = Math.max(1, Number(dimensionWidth) || 0);
  const safeHeight = Math.max(1, Number(dimensionHeight) || 0);

  const actualKg = safeWeight / 1000;
  const volumetricKg = (safeLength * safeWidth * safeHeight) / 6000;
  const chargeableKg = Math.max(actualKg, volumetricKg);
  const isVolumetricHeavier = volumetricKg > actualKg;

  const handleFieldChange = (field: keyof ShippingDimensions, value: number) => {
    const safeVal = isNaN(value) || value < 1 ? 1 : Math.round(value);
    onChange({
      weightGram: field === 'weightGram' ? safeVal : safeWeight,
      dimensionLength: field === 'dimensionLength' ? safeVal : safeLength,
      dimensionWidth: field === 'dimensionWidth' ? safeVal : safeWidth,
      dimensionHeight: field === 'dimensionHeight' ? safeVal : safeHeight,
    });
  };

  const applyPreset = (preset: { weight: number; l: number; w: number; h: number }) => {
    onChange({
      weightGram: preset.weight,
      dimensionLength: preset.l,
      dimensionWidth: preset.w,
      dimensionHeight: preset.h,
    });
  };

  return (
    <div className="space-y-5">
      {/* Quick Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Preset Ukuran Cepat:
          </label>
          <span className="text-[11px] text-slate-400">Klik untuk mengisi otomatis</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => applyPreset({ weight: 200, l: 20, w: 15, h: 3 })}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-rose-400 bg-slate-50 hover:bg-rose-50/40 text-left transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="font-bold text-[11px] text-slate-800">👕 Baju / Pakaian</div>
            <div className="text-[10px] text-slate-500 mt-0.5">200g • 20x15x3 cm</div>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => applyPreset({ weight: 450, l: 22, w: 16, h: 10 })}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-rose-400 bg-slate-50 hover:bg-rose-50/40 text-left transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="font-bold text-[11px] text-slate-800">👟 Sepatu / Sandal</div>
            <div className="text-[10px] text-slate-500 mt-0.5">450g • 22x16x10 cm</div>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => applyPreset({ weight: 800, l: 25, w: 20, h: 15 })}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-rose-400 bg-slate-50 hover:bg-rose-50/40 text-left transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="font-bold text-[11px] text-slate-800">🍼 Perlengkapan Bayi</div>
            <div className="text-[10px] text-slate-500 mt-0.5">800g • 25x20x15 cm</div>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => applyPreset({ weight: 4500, l: 60, w: 45, h: 35 })}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-rose-400 bg-slate-50 hover:bg-rose-50/40 text-left transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="font-bold text-[11px] text-slate-800">📦 Paket Besar / Stroller</div>
            <div className="text-[10px] text-slate-500 mt-0.5">4.5kg • 60x45x35 cm</div>
          </button>
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Berat Paket (Gram) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-rose-500" />
            Berat Paket <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="100000"
              disabled={disabled}
              value={safeWeight}
              onChange={(e) => handleFieldChange('weightGram', parseInt(e.target.value) || 0)}
              className="w-full pl-3.5 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              placeholder="500"
              required
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400 pointer-events-none">
              Gram
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Setara {(actualKg).toFixed(2)} kg</p>
        </div>

        {/* Dimensi Panjang (cm) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-slate-400" />
            Panjang (P) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="500"
              disabled={disabled}
              value={safeLength}
              onChange={(e) => handleFieldChange('dimensionLength', parseInt(e.target.value) || 0)}
              className="w-full pl-3.5 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              placeholder="10"
              required
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400 pointer-events-none">
              cm
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Panjang kemasan luar</p>
        </div>

        {/* Dimensi Lebar (cm) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-slate-400" />
            Lebar (L) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="500"
              disabled={disabled}
              value={safeWidth}
              onChange={(e) => handleFieldChange('dimensionWidth', parseInt(e.target.value) || 0)}
              className="w-full pl-3.5 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              placeholder="10"
              required
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400 pointer-events-none">
              cm
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Lebar kemasan luar</p>
        </div>

        {/* Dimensi Tinggi (cm) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-slate-400" />
            Tinggi (T) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="500"
              disabled={disabled}
              value={safeHeight}
              onChange={(e) => handleFieldChange('dimensionHeight', parseInt(e.target.value) || 0)}
              className="w-full pl-3.5 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              placeholder="10"
              required
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400 pointer-events-none">
              cm
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Tinggi kemasan luar</p>
        </div>
      </div>

      {/* Live Volumetric Calculation & Comparison Badge */}
      <div
        className={`rounded-2xl p-4 border transition-all ${
          isVolumetricHeavier
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isVolumetricHeavier ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {isVolumetricHeavier ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider">
                  Kalkulasi Beban Ekspedisi Kurir
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isVolumetricHeavier
                      ? 'bg-amber-200 text-amber-800'
                      : 'bg-emerald-200 text-emerald-800'
                  }`}
                >
                  {isVolumetricHeavier ? 'Beban Volumetrik Lebih Berat' : 'Beban Aktual Standar'}
                </span>
              </div>

              <p className="text-xs font-medium">
                Berat Aktual: <strong>{actualKg.toFixed(2)} kg</strong> | Berat Volumetrik:{' '}
                <strong>{volumetricKg.toFixed(2)} kg</strong> — Kurir akan menggunakan beban berat terbesar (
                <strong className="underline decoration-2">{chargeableKg.toFixed(2)} kg</strong>).
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[10px] font-semibold text-slate-500 uppercase">Tarif Dihitung</div>
            <div className="text-base font-black text-slate-900">
              {chargeableKg.toFixed(2)} <span className="text-xs font-normal">kg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
