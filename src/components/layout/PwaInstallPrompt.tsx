'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user already dismissed recently
    const dismissedAt = localStorage.getItem('nbusiness_pwa_dismissed');
    if (dismissedAt) {
      const diff = Date.now() - Number(dismissedAt);
      // Hide for 2 days after dismiss
      if (diff < 2 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
        return;
      }
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Also detect standalone display mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback hint for iOS Safari
      alert('Untuk pengguna iPhone/iPad: Tekan ikon Bagikan (Share) di browser Safari Anda, lalu pilih "Tambahkan ke Layar Utama" (Add to Home Screen) 📲');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Error during PWA installation:', err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('nbusiness_pwa_dismissed', String(Date.now()));
  };

  if (!showPrompt || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-3 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 border-2 border-[#FFE8D6] shadow-[0_16px_36px_-6px_rgba(255,159,67,0.28),inset_0_2px_4px_rgba(255,255,255,0.95)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF9F43] to-[#EE8A2B] text-white flex items-center justify-center font-heading font-black text-xl border border-[#F38C26] shadow-xs shrink-0">
            <Smartphone className="w-6 h-6 drop-shadow-xs" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-heading font-black text-slate-800 truncate">
                Pasang Aplikasi NBusiness
              </h4>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-heading font-black">
                PWA
              </span>
            </div>
            <p className="text-[11px] font-body text-slate-500 leading-tight truncate">
              Akses cepat langsung dari layar utama HP Anda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="clay-btn-orange px-3 py-1.5 text-xs text-white rounded-xl flex items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pasang</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Tutup notifikasi pasang aplikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
