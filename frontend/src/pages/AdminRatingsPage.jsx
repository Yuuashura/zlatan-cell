import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Star } from 'lucide-react';

// SKPL-F21 (usulan): ringkasan dan daftar rating "Nilai Kami" dari pelanggan.
export function Stars({ value, size = 'w-3.5 h-3.5' }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${size} ${i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
      ))}
    </span>
  );
}

export default function AdminRatingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (user && user.role !== 'ROLE_ADMIN') {
      navigate('/');
      return;
    }
    if (user) load(page);
  }, [user, page]);

  const load = async (p) => {
    try {
      const res = await api.get('/admin/ratings', { params: { page: p, size: 20 } });
      setData(res.data);
    } catch (err) {
      console.error('Failed to load ratings', err);
    }
  };

  const formatDate = (val) => (val ? new Date(val).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-');
  const maxCount = data ? Math.max(1, ...Object.values(data.distribution)) : 1;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/admin" className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline mb-1">
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
      </Link>
      <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mb-1">
        <Star className="w-6 h-6 text-amber-500" /> Rating Toko &quot;Nilai Kami&quot;
      </h1>
      <p className="text-xs text-slate-500 mb-8">Penilaian pelanggan setelah minimal 2 transaksi berhasil</p>

      {!data ? (
        <div className="py-12 text-center text-slate-400 text-sm">Memuat rating...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center">
              <div className="text-5xl font-black text-slate-900">{data.count ? data.average.toFixed(1) : '-'}</div>
              <div className="my-2">
                <Stars value={data.average} size="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-400">{data.count} ulasan</div>
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              {Object.entries(data.distribution)
                .sort((a, b) => b[0] - a[0])
                .map(([star, count]) => (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-10 font-semibold text-slate-600">{star} ★</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(count / maxCount) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right text-slate-500">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100">
            {data.items.length === 0 && (
              <div className="py-10 text-center text-slate-400 text-sm">Belum ada penilaian dari pelanggan.</div>
            )}
            {data.items.map((r) => (
              <div key={r.id} className="p-5">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900 text-sm">{r.username}</span>
                  <span className="text-[11px] text-slate-400">{formatDate(r.updatedAt)}</span>
                </div>
                <Stars value={r.rating} />
                {r.comment && <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{r.comment}</p>}
              </div>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6 text-xs">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="text-slate-500">
                Halaman {page + 1} dari {data.totalPages}
              </span>
              <button
                disabled={page + 1 >= data.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
