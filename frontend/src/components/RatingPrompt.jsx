import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { X, Loader2, Heart } from 'lucide-react';
import { StarInput } from './Stars';

// SKPL-F21 (usulan): popup "Nilai Kami". Muncul untuk pelanggan dengan minimal 2 transaksi
// berhasil yang belum pernah menilai. Syarat itu diperiksa server (/api/ratings/me);
// "Nanti saja" menunda popup selama 3 hari di perangkat ini.
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;
const MAX_COMMENT = 500;

/**
 * @param checkKey  ubah nilainya (misalnya setelah pembelian berhasil) untuk memeriksa ulang
 * @param suppressed jangan tampil selama ada modal lain yang terbuka
 */
export default function RatingPrompt({ checkKey, suppressed }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const snoozeKey = user ? `rating_snooze_${user.id}` : null;

  useEffect(() => {
    if (!user || user.role !== 'ROLE_USER') return;
    const snoozedAt = Number(localStorage.getItem(snoozeKey) || 0);
    if (Date.now() - snoozedAt < SNOOZE_MS) return;
    api
      .get('/ratings/me')
      .then((res) => res.data.eligible && setOpen(true))
      .catch(() => {});
  }, [user?.id, checkKey]);

  if (!open || suppressed) return null;

  const snooze = () => {
    localStorage.setItem(snoozeKey, String(Date.now()));
    setOpen(false);
  };

  const submit = async () => {
    if (!rating) {
      setError('Pilih jumlah bintang terlebih dahulu.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await api.post('/ratings', { rating, comment });
      setDone(true);
      setTimeout(() => setOpen(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim penilaian.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="rating-title" className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative">
        <button onClick={snooze} title="Tutup" className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        {done ? (
          <div className="text-center py-6">
            <Heart className="w-12 h-12 mx-auto text-rose-500 fill-rose-500 mb-3" />
            <h2 className="text-lg font-black text-slate-900">Terima kasih!</h2>
            <p className="text-xs text-slate-500">Penilaianmu membantu Zelatan Cell melayani lebih baik.</p>
            <Link to="/ulasan" onClick={() => setOpen(false)} className="inline-block mt-3 text-xs font-semibold text-blue-600 hover:underline">
              Lihat semua ulasan
            </Link>
          </div>
        ) : (
          <>
            <h2 id="rating-title" className="text-lg font-black text-slate-900 mb-1">Nilai Kami</h2>
            <p className="text-xs text-slate-500 mb-5">
              Seberapa puas kamu berbelanja di Zelatan Cell? Penilaianmu bisa diubah kapan saja.
            </p>

            <div className="mb-4">
              <StarInput value={rating} onChange={setRating} />
            </div>

            <label htmlFor="rating-comment" className="text-xs font-semibold text-slate-600">
              Komentar (opsional)
            </label>
            <textarea
              id="rating-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
              rows={3}
              placeholder="Ceritakan pengalamanmu..."
              className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
            <div className="text-right text-[10px] text-slate-400 mb-3">
              {comment.length}/{MAX_COMMENT}
            </div>

            {error && <p className="text-xs text-rose-600 mb-3">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={snooze}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
              >
                Nanti saja
              </button>
              <button
                onClick={submit}
                disabled={sending}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {sending && <Loader2 className="w-4 h-4 animate-spin" />} Kirim
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
