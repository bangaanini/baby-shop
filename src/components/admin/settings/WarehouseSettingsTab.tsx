'use client';

import React from 'react';
import { MapPin, Building2, Warehouse, Info } from 'lucide-react';

export interface OriginWarehouseData {
  warehouseName: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  fullAddress: string;
}

interface WarehouseSettingsTabProps {
  warehouse: OriginWarehouseData;
  setWarehouse: React.Dispatch<React.SetStateAction<OriginWarehouseData>>;
  onChange: () => void;
}

export function WarehouseSettingsTab({ warehouse, setWarehouse, onChange }: WarehouseSettingsTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Lokasi Asal Gudang Pengiriman Toko
              </h2>
              <p className="text-xs text-slate-500">
                Alamat ini menjadi titik asal keberangkatan kurir ekspres ke seluruh 38 provinsi di Indonesia
              </p>
            </div>
          </div>
        </div>

        {/* Notice Info */}
        <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Perhitungan ongkir otomatis (Biteship API dan Smart Fallback kurir) menggunakan <strong>Kota/Kabupaten</strong> dan <strong>Kode Pos</strong> gudang di bawah ini untuk menghitung tarif akurat sampai ke alamat rumah pembeli.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Warehouse className="w-3.5 h-3.5 text-slate-400" />
                <span>Nama Gudang / Cabang Pengiriman</span>
              </label>
              <input
                type="text"
                value={warehouse.warehouseName}
                onChange={(e) => {
                  setWarehouse({ ...warehouse, warehouseName: e.target.value });
                  onChange();
                }}
                placeholder="Gudang Utama NBusiness Jakarta"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Provinsi</label>
              <input
                type="text"
                value={warehouse.province}
                onChange={(e) => {
                  setWarehouse({ ...warehouse, province: e.target.value });
                  onChange();
                }}
                placeholder="DKI Jakarta"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Kota / Kabupaten</label>
              <input
                type="text"
                value={warehouse.city}
                onChange={(e) => {
                  setWarehouse({ ...warehouse, city: e.target.value });
                  onChange();
                }}
                placeholder="Jakarta Selatan"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Kecamatan</label>
              <input
                type="text"
                value={warehouse.district}
                onChange={(e) => {
                  setWarehouse({ ...warehouse, district: e.target.value });
                  onChange();
                }}
                placeholder="Kebayoran Baru"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Kode Pos</label>
              <input
                type="text"
                value={warehouse.postalCode}
                onChange={(e) => {
                  setWarehouse({ ...warehouse, postalCode: e.target.value });
                  onChange();
                }}
                placeholder="12160"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 font-mono text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Alamat Lengkap Gudang (Patokan & Nomor Bangunan)
            </label>
            <textarea
              rows={3}
              value={warehouse.fullAddress}
              onChange={(e) => {
                setWarehouse({ ...warehouse, fullAddress: e.target.value });
                onChange();
              }}
              placeholder="Jl. Senopati Raya No. 45, RT.05/RW.02, Kel. Selong, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12160"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 leading-relaxed text-slate-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
