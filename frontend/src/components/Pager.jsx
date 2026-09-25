import React from 'react';

// Navigasi halaman untuk tabel yang dipaginasi di server (SKPL-F19). page dimulai dari 0.
export default function Pager({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-3 mt-6 text-xs">
      <button
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
      >
        Sebelumnya
      </button>
      <span className="text-slate-500">
        Halaman {page + 1} dari {totalPages}
      </span>
      <button
        disabled={page + 1 >= totalPages}
        onClick={() => onChange(page + 1)}
        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
      >
        Berikutnya
      </button>
    </div>
  );
}
