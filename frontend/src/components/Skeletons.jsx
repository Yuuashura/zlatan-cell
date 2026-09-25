import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Circular Spinner Loader dengan teks opsional
 */
export function CircularSpinner({ text = 'Memuat data...', size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-9 h-9',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-slate-400 gap-2.5 ${className}`}>
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} animate-spin text-blue-600`} />
      {text && <span className="text-xs font-semibold text-slate-500 tracking-wide">{text}</span>}
    </div>
  );
}

/**
 * Skeleton Loader untuk Kartu Produk di Katalog
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between animate-pulse">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="h-4 w-16 bg-slate-200 rounded-md"></div>
          <div className="h-4 w-12 bg-slate-100 rounded-full"></div>
        </div>
        <div className="h-5 w-3/4 bg-slate-200 rounded-lg mb-2"></div>
        <div className="h-3 w-full bg-slate-100 rounded mb-1.5"></div>
        <div className="h-3 w-1/2 bg-slate-100 rounded mb-5"></div>
      </div>

      <div>
        <div className="h-6 w-24 bg-slate-200 rounded-lg mb-3"></div>
        <div className="h-10 w-full bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  );
}

/**
 * Skeleton Loader untuk Promo Flash Sale
 */
export function FlashSaleSkeleton() {
  return (
    <div className="bg-gradient-to-br from-rose-50/70 to-orange-50/70 border border-rose-200/60 rounded-2xl p-4 shadow-xs flex flex-col justify-between animate-pulse">
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="h-4 w-20 bg-rose-200 rounded-full"></div>
          <div className="h-4 w-24 bg-rose-100 rounded-full"></div>
        </div>
        <div className="h-5 w-3/4 bg-slate-200 rounded-lg mb-2"></div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-20 bg-rose-200 rounded-lg"></div>
          <div className="h-4 w-14 bg-slate-200 rounded"></div>
        </div>
      </div>
      <div className="h-9 w-full bg-rose-200 rounded-xl"></div>
    </div>
  );
}

/**
 * Skeleton Loader untuk Voucher Diskon
 */
export function VoucherSkeleton() {
  return (
    <div className="bg-white border border-amber-200/80 rounded-xl px-4 py-2.5 flex items-center gap-3 animate-pulse">
      <div className="h-5 w-20 bg-slate-200 rounded"></div>
      <div className="h-4 w-24 bg-amber-100 rounded"></div>
    </div>
  );
}

/**
 * Skeleton Loader untuk Kartu Ringkasan Statistik
 */
export function StatCardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-3 w-20 bg-slate-200 rounded"></div>
        <div className="w-8 h-8 bg-slate-100 rounded-xl"></div>
      </div>
      <div className="h-7 w-28 bg-slate-200 rounded-lg mb-2"></div>
      <div className="h-3 w-36 bg-slate-100 rounded"></div>
    </div>
  );
}

/**
 * Skeleton Loader untuk Baris Tabel
 */
export function TableRowSkeleton({ cols = 6 }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3.5 px-4">
          <div className="h-4 bg-slate-200/80 rounded w-full"></div>
        </td>
      ))}
    </tr>
  );
}
