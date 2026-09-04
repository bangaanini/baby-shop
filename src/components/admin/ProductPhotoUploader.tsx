'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Star,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
  Plus,
} from 'lucide-react';

export interface ProductPhotoUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

export function ProductPhotoUploader({
  images = [],
  onChange,
  disabled = false,
  maxImages = 8,
}: ProductPhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | File[]) => {
    if (disabled || isUploading) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    if (images.length + fileArray.length > maxImages) {
      setErrorMessage(`Maksimal ${maxImages} foto produk. Anda dapat mengunggah ${maxImages - images.length} foto lagi.`);
      return;
    }

    const validFiles: File[] = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    for (const file of fileArray) {
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage(`Format file "${file.name}" tidak didukung. Gunakan JPG, PNG, atau WebP.`);
        return;
      }
      if (file.size > maxSizeBytes) {
        setErrorMessage(`Ukuran file "${file.name}" melebihi batas 5MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ current: 0, total: validFiles.length });

    const newUploadedUrls: string[] = [];
    let completed = 0;

    try {
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || `Gagal mengunggah file "${file.name}"`);
        }

        newUploadedUrls.push(data.url);
        completed++;
        setUploadProgress({ current: completed, total: validFiles.length });
      }

      const updatedImages = [...images, ...newUploadedUrls];
      onChange(updatedImages);
      setSuccessMessage(`${validFiles.length} foto berhasil diunggah ke Cloudflare R2!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat mengunggah foto');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleSetCover = (index: number) => {
    if (index <= 0 || index >= images.length) return;
    const targetUrl = images[index];
    const remaining = images.filter((_, i) => i !== index);
    const reordered = [targetUrl, ...remaining];
    onChange(reordered);
  };

  const handleMoveLeft = (index: number) => {
    if (index <= 0) return;
    const copy = [...images];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    onChange(copy);
  };

  const handleMoveRight = (index: number) => {
    if (index >= images.length - 1) return;
    const copy = [...images];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    onChange(copy);
  };

  const handleRemovePhoto = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => {
          if (e.target.files) {
            handleFiles(e.target.files);
          }
        }}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Upload Dropzone (When Empty or Main Header) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !isUploading && images.length < maxImages) {
            fileInputRef.current?.click();
          }
        }}
        className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 transition-all cursor-pointer text-center ${
          isDragging
            ? 'border-rose-500 bg-rose-50/70 scale-[1.01]'
            : 'border-slate-300 hover:border-rose-400 bg-slate-50/60 hover:bg-rose-50/20'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-black text-slate-800">
              {isUploading
                ? `Mengunggah Foto (${uploadProgress?.current || 0}/${uploadProgress?.total || 0})...`
                : 'Tarik & Letakkan Foto Produk di Sini'}
            </h4>
            <p className="text-xs text-slate-500">
              atau <span className="text-rose-600 font-bold hover:underline">klik untuk memilih dari perangkat</span> (Maksimal {maxImages} foto, hingga 5MB/foto)
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
            <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 font-semibold text-slate-600">
              JPG
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 font-semibold text-slate-600">
              PNG
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 font-semibold text-slate-600">
              WebP
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-600">
              <ShieldCheck className="w-3.5 h-3.5" /> Cloudflare R2 Storage
            </span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 font-medium animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-700 font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 font-bold px-1">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-rose-500" />
              Galeri Foto Terunggah ({images.length}/{maxImages})
            </span>
            <span className="text-[11px] font-normal text-slate-400">
              Foto pertama adalah Cover Utama
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {images.map((url, index) => {
              const isCover = index === 0;

              return (
                <div
                  key={`${url}-${index}`}
                  className={`group relative rounded-2xl border-2 overflow-hidden bg-white shadow-xs transition-all duration-200 flex flex-col ${
                    isCover
                      ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Image Aspect Ratio Container */}
                  <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Foto produk ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.opacity = '0.5';
                      }}
                    />

                    {/* Cover Badge */}
                    {isCover ? (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black tracking-wide shadow-md">
                          <Star className="w-3 h-3 fill-white stroke-white" />
                          Foto Utama / Cover
                        </span>
                      </div>
                    ) : (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                          #{index + 1}
                        </span>
                      </div>
                    )}

                    {/* Delete Icon Overlay Button */}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      disabled={disabled || isUploading}
                      title="Hapus Foto"
                      className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/60 hover:bg-rose-600 text-white transition-colors backdrop-blur-xs cursor-pointer shadow-sm opacity-90 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Action Bar Beneath Thumbnail */}
                  <div className="p-2 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                    {/* Reorder Left/Right */}
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveLeft(index)}
                        disabled={disabled || index === 0}
                        title="Geser ke Kiri"
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveRight(index)}
                        disabled={disabled || index === images.length - 1}
                        title="Geser ke Kanan"
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Set Cover Action */}
                    {!isCover ? (
                      <button
                        type="button"
                        onClick={() => handleSetCover(index)}
                        disabled={disabled || isUploading}
                        className="px-2 py-1 text-[10px] font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500 rounded-lg transition-colors cursor-pointer"
                      >
                        Set Cover
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-500">Cover Aktif</span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* "Add More" Button Card if room available */}
            {images.length < maxImages && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-rose-400 hover:bg-rose-50/20 transition-all flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-rose-600 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-rose-100 flex items-center justify-center transition-colors">
                  <Plus className="w-5 h-5 text-slate-500 group-hover:text-rose-600" />
                </div>
                <span className="text-[11px] font-bold">Tambah Foto</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Guidance Banner */}
      <div className="bg-sky-50/80 border border-sky-200/80 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-sky-900">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <p className="font-bold text-sky-950">Panduan Foto Produk Seller Center:</p>
          <p className="text-sky-800 text-[11px]">
            Foto berlatar terang, rasio 1:1, format JPG/PNG/WebP, tersimpan aman di Cloudflare R2.
            Foto dengan badge <strong className="text-rose-600">⭐ Foto Utama / Cover</strong> akan otomatis ditampilkan di katalog toko dan halaman rekomendasi.
          </p>
        </div>
      </div>
    </div>
  );
}
