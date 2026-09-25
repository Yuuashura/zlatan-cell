import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ShieldAlert, SearchX } from 'lucide-react';

// Halaman status: 404 (rute tidak ada) dan 403 (bukan admin membuka halaman admin).
const VARIANTS = {
  404: {
    icon: SearchX,
    title: 'Halaman tidak ditemukan',
    message: 'Halaman yang kamu cari tidak ada atau sudah dipindahkan.',
    tone: 'text-blue-600 bg-blue-50',
  },
  403: {
    icon: ShieldAlert,
    title: 'Akses ditolak',
    message: 'Halaman ini khusus admin Zelatan Cell. Akunmu tidak memiliki izin untuk membukanya.',
    tone: 'text-rose-600 bg-rose-50',
  },
};

export default function StatusPage({ code }) {
  const v = VARIANTS[code];
  const Icon = v.icon;
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 ${v.tone}`}>
        <Icon className="w-10 h-10" />
      </div>
      <p className="text-6xl font-black text-slate-200 tracking-tight mb-2">{code}</p>
      <h1 className="text-2xl font-black text-slate-900 mb-2">{v.title}</h1>
      <p className="text-sm text-slate-500 mb-8">{v.message}</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm shadow-blue-500/20 transition"
      >
        <Home className="w-4 h-4" /> Kembali ke Beranda
      </Link>
    </div>
  );
}
