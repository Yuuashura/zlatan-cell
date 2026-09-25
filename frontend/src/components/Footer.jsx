import React from 'react';
import { MapPin, Phone, ShieldCheck, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white">Zelatan Cell</span>
                <span className="block text-[10px] text-slate-400 font-medium tracking-wide">DIGITAL & PULSA</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 mb-3">
              Pusat penjualan pulsa, kuota internet, voucher game, dan layanan telekomunikasi digital terpercaya di Kroya, Cilacap.
            </p>
            <div className="flex items-start gap-2 text-xs text-slate-400 mt-4">
              <svg className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Desa Gentasari, Jl. Temugiri 01 Tinggarjati Lor, Kec. Kroya, Kab. Cilacap, Jawa Tengah 53282</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Metode Pembayaran</h4>
            <p className="text-xs text-slate-400 mb-3">
              Didukung oleh payment gateway <strong>Xendit</strong> mode Sandbox untuk kemudahan dan keamanan transaksi Anda:
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded">QRIS</span>
              <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded">BCA VA</span>
              <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded">BNI VA</span>
              <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded">BRI VA</span>
              <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded">Mandiri VA</span>
              <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded">OVO / DANA</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Keamanan & Layanan</h4>
            <ul className="text-xs space-y-2">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 11a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Transaksi otomatis 24 jam real-time</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 11a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Verifikasi instan via Webhook Xendit</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 11a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Dual otentikasi login aman</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-xs text-slate-500">
          © 2026 Zelatan Cell. Rancang Bangun & Pengembangan Sistem Informasi Penjualan.
        </div>
      </div>
    </footer>
  );
}