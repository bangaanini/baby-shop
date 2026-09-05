'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  storeName?: string;
}

export function FloatingWhatsApp({
  phoneNumber = '0812-3456-7890',
  storeName = 'NBusiness',
}: FloatingWhatsAppProps) {
  const [phone, setPhone] = useState(phoneNumber);
  const [showTooltip, setShowTooltip] = useState(true);

  // Fetch live phone number from settings
  useEffect(() => {
    let isMounted = true;
    async function loadPhone() {
      try {
        const res = await fetch('/api/settings/public');
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && json.data?.store?.phone) {
            setPhone(json.data.store.phone);
          }
        }
      } catch {
        // Use default fallback
      }
    }
    loadPhone();
    return () => {
      isMounted = false;
    };
  }, []);

  // Format clean Indonesian phone to WhatsApp wa.me international format
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  let formattedPhone = cleanPhone;
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '62' + formattedPhone.slice(1);
  } else if (!formattedPhone.startsWith('62')) {
    formattedPhone = '62' + formattedPhone;
  }

  const defaultMessage = `Halo CS ${storeName}, saya ingin bertanya mengenai produk / pesanan di toko online NBusiness.`;
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <aside
      aria-label="Bantuan WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      {/* Playful Floating Message Pill */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border-2 border-[#FFE8D6] shadow-[0_6px_16px_rgba(255,159,67,0.15)] text-xs font-heading font-bold text-slate-700 relative">
          <span className="text-[#D96B00]">Tanya Admin / CS?</span>
          <button
            type="button"
            onClick={() => setShowTooltip(false)}
            className="text-slate-400 hover:text-slate-600 p-0.5"
            aria-label="Tutup info chat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* WhatsApp Button - Vibrant Clay Bubble */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(16,185,129,0.38),inset_0_2px_4px_rgba(255,255,255,0.6)] border-2 border-emerald-400 hover:scale-110 active:scale-95 transition-all duration-200 group"
        title="Hubungi Layanan Pelanggan WhatsApp"
        aria-label="Hubungi Layanan Pelanggan WhatsApp"
      >
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-xs group-hover:rotate-6 transition-transform" />
      </a>
    </aside>
  );
}
