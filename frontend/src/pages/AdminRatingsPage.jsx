import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Pager from '../components/Pager';
import { useAuth } from '../context/AuthContext';
import { useDialog } from '../components/DialogProvider';
import { Stars, RatingSummary, formatReviewDate } from '../components/Stars';
import { ArrowLeft, Star, MessageCircleReply, Loader2, Pencil, Trash2, ExternalLink } from 'lucide-react';

// SKPL-F21 (usulan): admin membaca dan membalas ulasan "Nilai Kami". Balasan tampil publik di /ulasan.
const MAX_REPLY = 1000;

function ReplyBox({ review, onSaved }) {
  const { confirm, notify } = useDialog();
  const [editing, setEditing] = useState(!review.adminReply);
  const [text, setText] = useState(review.adminReply || '');
  const [saving, setSaving] = useState(false);

  const save = async (reply) => {
    setSaving(true);
    try {
      await api.put(`/admin/ratings/${review.id}/reply`, { reply });
      setEditing(false);
      onSaved();
    } catch (err) {
      notify(err.response?.data?.message || 'Gagal menyimpan balasan.', { title: 'Gagal' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const ok = await confirm('Balasan ini akan dihapus dari halaman ulasan publik.', {
      title: 'Hapus Balasan',
      confirmText: 'Hapus',
      danger: true,
    });
    if (ok) save('');
  };

  if (!editing && review.adminReply) {
    return (
      <div className="mt-3 ml-4 pl-3 border-l-2 border-blue-200 bg-blue-50/60 rounded-r-xl py-2 pr-3">
        <div className="text-[11px] font-bold text-blue-700 flex items-center gap-1 mb-0.5">
          <MessageCircleReply className="w-3.5 h-3.5" /> Balasan Anda
          <span className="font-normal text-slate-400 ml-1">{formatReviewDate(review.repliedAt)}</span>
          <span className="ml-auto flex gap-1">
            <button onClick={() => setEditing(true)} title="Ubah balasan" className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={remove} title="Hapus balasan" className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{review.adminReply}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) save(text);
      }}
      className="mt-3 ml-4"
    >
      <label htmlFor={`reply-${review.id}`} className="sr-only">
        Balasan untuk {review.username}
      </label>
      <textarea
        id={`reply-${review.id}`}
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_REPLY))}
        rows={2}
        placeholder={`Balas ulasan ${review.username}...`}
        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
      />
      <div className="flex items-center gap-2 mt-1.5">
        <button
          type="submit"
          disabled={saving || !text.trim()}
          className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-bold flex items-center gap-1.5"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Kirim balasan
        </button>
        {review.adminReply && (
          <button
            type="button"
            onClick={() => {
              setText(review.adminReply);
              setEditing(false);
            }}
            className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:bg-slate-100"
          >
            Batal
          </button>
        )}
        <span className="ml-auto text-[10px] text-slate-400">
          {text.length}/{MAX_REPLY}
        </span>
      </div>
    </form>
  );
}

export default function AdminRatingsPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [unrepliedOnly, setUnrepliedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) load();
  }, [user, page, unrepliedOnly]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/ratings', { params: { page, size: 20, unreplied: unrepliedOnly } });
      setData(res.data);
    } catch (err) {
      console.error('Failed to load ratings', err);
    } finally {
      setLoading(false);
    }
  };

  const setFilter = (value) => {
    setPage(0);
    setUnrepliedOnly(value);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/admin" className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline mb-1">
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
      </Link>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mb-1">
            <Star className="w-6 h-6 text-amber-500" /> Ulasan Pelanggan &quot;Nilai Kami&quot;
          </h1>
          <p className="text-xs text-slate-500">Balasan Anda tampil di halaman ulasan publik</p>
        </div>
        <Link to="/ulasan" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
          Lihat halaman publik <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {!data ? (
        <div className="py-12 text-center text-slate-400 text-sm">Memuat ulasan...</div>
      ) : (
        <>
          <div className="mb-8">
            <RatingSummary data={data} />
          </div>

          <div className="flex gap-1.5 bg-white border border-slate-200 rounded-xl p-1 text-xs font-semibold w-fit mb-4">
            <button
              onClick={() => setFilter(false)}
              className={`px-3 py-1.5 rounded-lg transition ${!unrepliedOnly ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Semua ({data.count})
            </button>
            <button
              onClick={() => setFilter(true)}
              className={`px-3 py-1.5 rounded-lg transition ${unrepliedOnly ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Belum dibalas ({data.unrepliedCount})
            </button>
          </div>

          <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 ${loading ? 'opacity-60' : ''}`}>
            {data.items.length === 0 && (
              <div className="py-10 text-center text-slate-400 text-sm">
                {unrepliedOnly ? 'Semua ulasan sudah dibalas.' : 'Belum ada ulasan dari pelanggan.'}
              </div>
            )}
            {data.items.map((r) => (
              <div key={`${r.id}-${r.repliedAt || 'none'}`} className="p-5">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900 text-sm">{r.username}</span>
                  <span className="text-[11px] text-slate-400">{formatReviewDate(r.updatedAt)}</span>
                </div>
                <Stars value={r.rating} />
                {r.comment ? (
                  <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{r.comment}</p>
                ) : (
                  <p className="text-xs text-slate-400 mt-2 italic">Tanpa komentar</p>
                )}
                <ReplyBox review={r} onSaved={load} />
              </div>
            ))}
          </div>

          <Pager page={page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
