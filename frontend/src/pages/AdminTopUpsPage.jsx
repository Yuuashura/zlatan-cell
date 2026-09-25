import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useDialog } from '../components/DialogProvider';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Wallet, CheckCircle2, XCircle } from 'lucide-react';
import Pager from '../components/Pager';

// Verifikasi top up manual (v1) dan pemantauan top up Xendit (SKPL-F05).
// Top up manual tidak lagi disetujui otomatis: saldo baru bertambah setelah admin menekan Setujui.
const STATUS_STYLE = {
  PENDING: 'bg-amber-50 text-amber-700',
  SUCCESS: 'bg-emerald-50 text-emerald-700',
  FAILED: 'bg-rose-50 text-rose-700',
};

export default function AdminTopUpsPage() {
  const { confirm, notify } = useDialog();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [page, setPage] = useState(0);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (user) load();
  }, [user, filter, page]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/topups', { params: { status: filter, page, size: 20 } });
      setData(res.data);
    } catch (err) {
      console.error('Failed to load top ups', err);
    } finally {
      setLoading(false);
    }
  };

  const act = async (id, action) => {
    const approve = action === 'approve';
    const ok = await confirm(
      approve ? `Saldo pelanggan akan bertambah sesuai nominal top up #${id}.` : `Top up #${id} akan ditolak.`,
      { title: approve ? 'Setujui Top Up' : 'Tolak Top Up', confirmText: approve ? 'Setujui' : 'Tolak', danger: !approve }
    );
    if (!ok) return;
    try {
      setBusyId(id);
      await api.post(`/admin/topups/${id}/${action}`);
      await load();
    } catch (err) {
      notify(err.response?.data?.message || 'Gagal memproses top up.', { title: 'Gagal' });
    } finally {
      setBusyId(null);
    }
  };

  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  const formatDate = (val) =>
    val ? new Date(val).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

  const shown = data?.items || [];
  const pendingManual = data?.pendingManual || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <Link to="/admin" className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-blue-600" /> Data &amp; Verifikasi Top Up
          </h1>
          <p className="text-xs text-slate-500">
            {pendingManual} permintaan top up manual menunggu verifikasi. Top up Xendit diproses otomatis oleh webhook.
          </p>
        </div>
        <div className="flex gap-1.5 bg-white border border-slate-200 rounded-xl p-1 text-xs font-semibold">
          {['PENDING', 'SUCCESS', 'FAILED', 'ALL'].map((f) => (
            <button
              key={f}
              onClick={() => {
                setPage(0);
                setFilter(f);
              }}
              className={`px-3 py-1.5 rounded-lg transition ${filter === f ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {f === 'ALL' ? 'Semua' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-4">#</th>
              <th className="py-3.5 px-4">Pelanggan</th>
              <th className="py-3.5 px-4">Nominal</th>
              <th className="py-3.5 px-4">Metode</th>
              <th className="py-3.5 px-4">Waktu</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-10 text-center text-slate-400">Memuat data top up...</td>
              </tr>
            ) : shown.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-10 text-center text-slate-400">Belum ada data top up pada filter ini.</td>
              </tr>
            ) : (
              shown.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 text-slate-400">{r.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{r.username}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">{formatRupiah(r.amount)}</td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {r.method === 'XENDIT' ? `Xendit${r.paymentChannel ? ` · ${r.paymentChannel}` : ''}` : 'Manual'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{formatDate(r.date)}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLE[r.status] || ''}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {r.status === 'PENDING' && r.method === 'MANUAL' ? (
                      <div className="flex gap-1.5 justify-center">
                        <button
                          disabled={busyId === r.id}
                          onClick={() => act(r.id, 'approve')}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Setujui
                        </button>
                        <button
                          disabled={busyId === r.id}
                          onClick={() => act(r.id, 'reject')}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 disabled:opacity-50"
                        >
                          <XCircle className="w-3 h-3" /> Tolak
                        </button>
                      </div>
                    ) : (
                      <span className="block text-center text-slate-300">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pager page={page} totalPages={data?.totalPages} onChange={setPage} />
    </div>
  );
}
