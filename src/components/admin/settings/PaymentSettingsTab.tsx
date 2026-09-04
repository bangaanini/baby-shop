'use client';

import React from 'react';
import { CreditCard, Eye, EyeOff, Lock, Key, Copy, Check, Radio, AlertCircle, RefreshCw, Zap, ExternalLink } from 'lucide-react';

export interface PaymentSettingsData {
  qris: boolean;
  bcaVa: boolean;
  mandiriVa: boolean;
  briVa: boolean;
  gopay: boolean;
}

interface PaymentSettingsTabProps {
  payments: PaymentSettingsData;
  setPayments: React.Dispatch<React.SetStateAction<PaymentSettingsData>>;
  activePaymentGateway: 'midtrans' | 'xendit' | 'simulator';
  setActivePaymentGateway: (v: 'midtrans' | 'xendit' | 'simulator') => void;
  midtransServerKey: string;
  setMidtransServerKey: (v: string) => void;
  midtransClientKey: string;
  setMidtransClientKey: (v: string) => void;
  midtransMerchantId: string;
  setMidtransMerchantId: (v: string) => void;
  midtransIsProduction: boolean;
  setMidtransIsProduction: (v: boolean) => void;
  showMidtransServerKey: boolean;
  setShowMidtransServerKey: (v: boolean) => void;
  xenditSecretKey: string;
  setXenditSecretKey: (v: string) => void;
  xenditPublicKey: string;
  setXenditPublicKey: (v: string) => void;
  xenditWebhookToken: string;
  setXenditWebhookToken: (v: string) => void;
  xenditIsProduction: boolean;
  setXenditIsProduction: (v: boolean) => void;
  showXenditSecretKey: boolean;
  setShowXenditSecretKey: (v: boolean) => void;
  showXenditWebhookToken: boolean;
  setShowXenditWebhookToken: (v: boolean) => void;
  currentOrigin: string;
  copyToClipboard: (text: string, key: string) => void;
  copiedKey: string | null;
  handleTestGatewayConnection: () => void;
  isTestingGateway: boolean;
  gatewayTestResult: { success: boolean; message: string; provider: string } | null;
  onChange: () => void;
}

export function PaymentSettingsTab({
  payments,
  setPayments,
  activePaymentGateway,
  setActivePaymentGateway,
  midtransServerKey,
  setMidtransServerKey,
  midtransClientKey,
  setMidtransClientKey,
  midtransMerchantId,
  setMidtransMerchantId,
  midtransIsProduction,
  setMidtransIsProduction,
  showMidtransServerKey,
  setShowMidtransServerKey,
  xenditSecretKey,
  setXenditSecretKey,
  xenditPublicKey,
  setXenditPublicKey,
  xenditWebhookToken,
  setXenditWebhookToken,
  xenditIsProduction,
  setXenditIsProduction,
  showXenditSecretKey,
  setShowXenditSecretKey,
  showXenditWebhookToken,
  setShowXenditWebhookToken,
  currentOrigin,
  copyToClipboard,
  copiedKey,
  handleTestGatewayConnection,
  isTestingGateway,
  gatewayTestResult,
  onChange,
}: PaymentSettingsTabProps) {
  const webhookUrl = `${currentOrigin}/api/webhooks/payment`;

  return (
    <div className="space-y-6">
      {/* 1. Pilihan Provider Aktif */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Pilihan Payment Gateway Aktif (Pilih 1 Provider)
              </h2>
              <p className="text-xs text-slate-500">
                Sistem akan memproses seluruh transaksi checkout online menggunakan provider yang aktif
              </p>
            </div>
          </div>
        </div>

        {/* Radio Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Midtrans */}
          <div
            onClick={() => {
              setActivePaymentGateway('midtrans');
              onChange();
            }}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              activePaymentGateway === 'midtrans'
                ? 'border-blue-500 bg-blue-50/30 shadow-xs'
                : 'border-slate-100 hover:border-slate-200 bg-white'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                  MIDTRANS SNAP
                </span>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    activePaymentGateway === 'midtrans'
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {activePaymentGateway === 'midtrans' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
              <strong className="text-sm font-bold text-slate-800 block">Midtrans Snap Popup</strong>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Pop-up resmi Midtrans untuk QRIS Instan, GoPay, BCA, Mandiri, BRI, dan BNI VA.
              </p>
            </div>
          </div>

          {/* Xendit */}
          <div
            onClick={() => {
              setActivePaymentGateway('xendit');
              onChange();
            }}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              activePaymentGateway === 'xendit'
                ? 'border-purple-500 bg-purple-50/30 shadow-xs'
                : 'border-slate-100 hover:border-slate-200 bg-white'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                  XENDIT INVOICE
                </span>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    activePaymentGateway === 'xendit'
                      ? 'border-purple-600 bg-purple-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {activePaymentGateway === 'xendit' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
              <strong className="text-sm font-bold text-slate-800 block">Xendit XenInvoice</strong>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Halaman pembayaran hosted invoice Xendit dengan QRIS, OVO, Dana, ShopeePay, dan VA Bank.
              </p>
            </div>
          </div>

          {/* Simulator */}
          <div
            onClick={() => {
              setActivePaymentGateway('simulator');
              onChange();
            }}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              activePaymentGateway === 'simulator'
                ? 'border-amber-500 bg-amber-50/30 shadow-xs'
                : 'border-slate-100 hover:border-slate-200 bg-white'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                  INTERNAL SIMULATOR
                </span>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    activePaymentGateway === 'simulator'
                      ? 'border-amber-600 bg-amber-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {activePaymentGateway === 'simulator' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
              <strong className="text-sm font-bold text-slate-800 block">Mode Uji Coba (Demo)</strong>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Simulasi transaksi pembayaran instan lunas tanpa membutuhkan kredensial API eksternal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Formulir Kredensial Midtrans */}
      {activePaymentGateway === 'midtrans' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="text-blue-600 font-bold">Kredensial Midtrans</span>
                <span className="text-[11px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-md">
                  Snap API
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Dapatkan kunci ini dari Dashboard Midtrans (Settings ➔ Access Keys)
              </p>
            </div>

            {/* Mode Sandbox/Production */}
            <div className="flex items-center gap-2 text-xs">
              <span className={!midtransIsProduction ? 'font-bold text-blue-700' : 'text-slate-500'}>Sandbox</span>
              <button
                type="button"
                onClick={() => {
                  setMidtransIsProduction(!midtransIsProduction);
                  onChange();
                }}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  midtransIsProduction ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    midtransIsProduction ? 'translate-x-5' : ''
                  }`}
                />
              </button>
              <span className={midtransIsProduction ? 'font-bold text-blue-700' : 'text-slate-500'}>Production</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Midtrans Server Key</label>
                <button
                  type="button"
                  onClick={() => setShowMidtransServerKey(!showMidtransServerKey)}
                  className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1"
                >
                  {showMidtransServerKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showMidtransServerKey ? 'Sembunyikan' : 'Lihat'}</span>
                </button>
              </div>
              <input
                type={showMidtransServerKey ? 'text' : 'password'}
                value={midtransServerKey}
                onChange={(e) => {
                  setMidtransServerKey(e.target.value);
                  onChange();
                }}
                placeholder="SB-Mid-server-xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Midtrans Client Key</label>
              <input
                type="text"
                value={midtransClientKey}
                onChange={(e) => {
                  setMidtransClientKey(e.target.value);
                  onChange();
                }}
                placeholder="SB-Mid-client-xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Merchant ID (Opsional)</label>
            <input
              type="text"
              value={midtransMerchantId}
              onChange={(e) => {
                setMidtransMerchantId(e.target.value);
                onChange();
              }}
              placeholder="G123456789"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800 font-mono"
            />
          </div>
        </div>
      )}

      {/* 3. Formulir Kredensial Xendit */}
      {activePaymentGateway === 'xendit' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="text-purple-600 font-bold">Kredensial Xendit</span>
                <span className="text-[11px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-md">
                  XenInvoice
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Dapatkan kunci ini dari Dashboard Xendit (Settings ➔ API Keys & Webhooks)
              </p>
            </div>

            {/* Mode Sandbox/Production */}
            <div className="flex items-center gap-2 text-xs">
              <span className={!xenditIsProduction ? 'font-bold text-purple-700' : 'text-slate-500'}>Sandbox</span>
              <button
                type="button"
                onClick={() => {
                  setXenditIsProduction(!xenditIsProduction);
                  onChange();
                }}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  xenditIsProduction ? 'bg-purple-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    xenditIsProduction ? 'translate-x-5' : ''
                  }`}
                />
              </button>
              <span className={xenditIsProduction ? 'font-bold text-purple-700' : 'text-slate-500'}>Production</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Xendit Secret API Key</label>
                <button
                  type="button"
                  onClick={() => setShowXenditSecretKey(!showXenditSecretKey)}
                  className="text-[11px] text-slate-500 hover:text-purple-600 flex items-center gap-1"
                >
                  {showXenditSecretKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showXenditSecretKey ? 'Sembunyikan' : 'Lihat'}</span>
                </button>
              </div>
              <input
                type={showXenditSecretKey ? 'text' : 'password'}
                value={xenditSecretKey}
                onChange={(e) => {
                  setXenditSecretKey(e.target.value);
                  onChange();
                }}
                placeholder="xnd_development_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Xendit Public Key (Opsional)</label>
              <input
                type="text"
                value={xenditPublicKey}
                onChange={(e) => {
                  setXenditPublicKey(e.target.value);
                  onChange();
                }}
                placeholder="xnd_public_development_xxxxxxxxxxxx"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 font-mono text-slate-800"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Webhook Verification Token (<code className="font-mono text-purple-600">x-callback-token</code>)
              </label>
              <button
                type="button"
                onClick={() => setShowXenditWebhookToken(!showXenditWebhookToken)}
                className="text-[11px] text-slate-500 hover:text-purple-600 flex items-center gap-1"
              >
                {showXenditWebhookToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showXenditWebhookToken ? 'Sembunyikan' : 'Lihat'}</span>
              </button>
            </div>
            <input
              type={showXenditWebhookToken ? 'text' : 'password'}
              value={xenditWebhookToken}
              onChange={(e) => {
                setXenditWebhookToken(e.target.value);
                onChange();
              }}
              placeholder="xnd_webhook_token_xxxxxxxxxxxx"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 font-mono text-slate-800"
            />
          </div>
        </div>
      )}

      {/* 4. Kanal Pembayaran Aktif */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">
          Kanal / Metode Pembayaran yang Diizinkan untuk Pembeli
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { id: 'qris', name: 'QRIS Instan', desc: 'GoPay, OVO, Dana, ShopeePay, BCA', icon: '📱' },
            { id: 'bcaVa', name: 'BCA Virtual Account', desc: 'Verifikasi instan via m-BCA/KlikBCA', icon: '🏦' },
            { id: 'mandiriVa', name: 'Mandiri Virtual Account', desc: 'Verifikasi via Livin by Mandiri', icon: '🏛️' },
            { id: 'briVa', name: 'BRI Virtual Account (BRIVA)', desc: 'Verifikasi via BRImo atau ATM', icon: '💳' },
            { id: 'gopay', name: 'GoPay / GoPay Later', desc: 'Pembayaran saldo 1-Klik Gojek', icon: '🟢' },
          ].map((m) => {
            const isChecked = payments[m.id as keyof PaymentSettingsData];
            return (
              <label
                key={m.id}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between gap-2.5 ${
                  isChecked ? 'border-rose-400 bg-rose-50/20 shadow-xs' : 'border-slate-100 bg-slate-50/50 opacity-60'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xl">{m.icon}</span>
                  <div>
                    <strong className="text-xs font-bold text-slate-800 block">{m.name}</strong>
                    <p className="text-[11px] text-slate-500">{m.desc}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    setPayments({ ...payments, [m.id]: e.target.checked });
                    onChange();
                  }}
                  className="w-4 h-4 rounded accent-rose-500 mt-1 cursor-pointer"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Webhook URL Box & Uji Koneksi */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>URL Webhook Auto-Settlement</span>
            </h3>
            <p className="text-xs text-slate-500">
              Salin URL ini ke Dashboard Payment Gateway agar status pesanan otomatis berubah jadi <strong>Diproses</strong> saat pembeli membayar
            </p>
          </div>

          <button
            type="button"
            onClick={handleTestGatewayConnection}
            disabled={isTestingGateway}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
          >
            {isTestingGateway ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
                <span>Menguji Koneksi...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Uji Koneksi Gateway</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={webhookUrl}
            className="flex-1 px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-700 select-all"
          />
          <button
            type="button"
            onClick={() => copyToClipboard(webhookUrl, 'webhook')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            {copiedKey === 'webhook' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey === 'webhook' ? 'Tersalin' : 'Salin URL'}</span>
          </button>
        </div>

        {gatewayTestResult && (
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
              gatewayTestResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {gatewayTestResult.success ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <strong className="block mb-0.5">
                Hasil Uji Koneksi ({gatewayTestResult.provider.toUpperCase()}):{' '}
                {gatewayTestResult.success ? 'Berhasil Terhubung' : 'Gagal'}
              </strong>
              <p>{gatewayTestResult.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
