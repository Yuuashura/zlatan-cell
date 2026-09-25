import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Pager from '../components/Pager';
import { Stars, StarInput, RatingSummary, formatReviewDate } from '../components/Stars';
import { Star, MessageCircleReply, Loader2, CheckCircle2 } from 'lucide-react';

// SKPL-F21 (usulan): ulasan toko terbuka untuk semua orang. Pelanggan yang login bisa memberi
// atau mengubah ulasannya di sini tanpa syarat transaksi; balasan admin tampil di bawah ulasan.
const MAX_COMMENT = 500;

function ReviewForm({ onSaved }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hasReview, setHasReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api
      .get('/ratings/me')
      .then((res) => {
        const mine = res.data.rating;
        if (mine) {
          setRating(mine.rating);
          setComment(mine.comment || '');
          setHasReview(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setMessage({ ok: false, text: 'Pilih jumlah bintang terlebih dahulu.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.post('/ratings', { rating, comment });
      setHasReview(true);
      setMessage({ ok: true, text: res.data.message });
      onSaved();
    } catch (err) {
      setMessage({ ok: false, text: err.response?.data?.message || 'Gagal mengirim ulasan.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-6 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
      <h2 className="font-bold text-slate-900 mb-1">{hasReview ? 'Ubah ulasanmu' : 'Beri ulasan'}</h2>
      <p className="text-xs text-slate-500 mb-4">
        {hasReview
          ? 'Mengubah ulasan akan menghapus balasan admin sebelumnya.'
          : 'Ceritakan pengalamanmu berbelanja di Zelatan Cell.'}
      </p>
      <StarInput value={rating} onChange={setRating} />
      <label htmlFor="review-comment" className="block text-xs font-semibold text-slate-600 mt-3">
        Komentar (opsional)
      </label>
      <textarea
        id="review-comment"
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
        rows={3}
        placeholder="Tulis pengalamanmu..."
        className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-slate-400">
          {comment.length}/{MAX_COMMENT}
        </span>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition flex items-center gap-2 disabled:opacity-60"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />} {hasReview ? 'Simpan perubahan' : 'Kirim ulasan'}
        </button>
      </div>
      {message && (
        <p className={`text-xs mt-2 flex items-center gap-1 ${message.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
          {message.ok && <CheckCircle2 className="w-3.5 h-3.5" />} {message.text}
        </p>
      )}
    </form>
  );
}

export default function RatingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [error, setError] = useState(null);

  const load = async (p = page) => {
    try {
      setError(null);
      const res = await api.get('/ratings', { params: { page: p, size: 10 } });
      setData(res.data);
    } catch {
      setError('Ulasan belum bisa dimuat. Coba muat ulang halaman.');
    }
  };

  useEffect(() => {
    load(page);
  }, [page]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 mb-1">
        <Star className="w-7 h-7 fill-amber-400 text-amber-400" /> Ulasan Pelanggan
      </h1>
      <p className="text-sm text-slate-500 mb-8">Apa kata pelanggan tentang Zelatan Cell</p>

      {error && <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700">{error}</div>}

      {data && (
        <div className="mb-8">
          <RatingSummary data={data} />
        </div>
      )}

      <div className="mb-8">
        {authLoading ? null : user?.role === 'ROLE_USER' ? (
          <ReviewForm onSaved={() => (page === 0 ? load(0) : setPage(0))} />
        ) : !user ? (
          <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 text-sm text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>Sudah pernah berbelanja di Zelatan Cell? Masuk untuk memberi ulasan.</span>
            <Link to="/login" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold text-center">
              Masuk
            </Link>
          </div>
        ) : null}
      </div>

      {!data ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100">
            {data.items.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-sm">Belum ada ulasan. Jadilah yang pertama!</div>
            )}
            {data.items.map((r) => (
              <article key={r.id} className="p-5">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900 text-sm">{r.username}</span>
                  <span className="text-[11px] text-slate-400">{formatReviewDate(r.updatedAt)}</span>
                </div>
                <Stars value={r.rating} />
                {r.comment && <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{r.comment}</p>}
                {r.adminReply && (
                  <div className="mt-3 ml-4 pl-3 border-l-2 border-blue-200 bg-blue-50/60 rounded-r-xl py-2 pr-3">
                    <div className="text-[11px] font-bold text-blue-700 flex items-center gap-1 mb-0.5">
                      <MessageCircleReply className="w-3.5 h-3.5" /> Balasan Zelatan Cell
                      <span className="font-normal text-slate-400 ml-1">{formatReviewDate(r.repliedAt)}</span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{r.adminReply}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
          <Pager page={page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
