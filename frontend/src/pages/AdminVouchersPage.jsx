import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useDialog } from '../components/DialogProvider';
import { Tag, Plus, Trash2, ArrowLeft, Clock, Percent, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TableRowSkeleton } from '../components/Skeletons';

export default function AdminVouchersPage() {
  const { confirm, notify } = useDialog();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    id: null,
    code: '',
    discountType: 'PERCENT',
    discountValue: 50,
    minPurchase: 50000,
    maxDiscount: 20000,
    usageLimit: 100,
    startAt: '',
    endAt: '',
    active: true,
  });

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/vouchers');
      setVouchers(res.data);
    } catch (err) {
      console.error('Failed to load vouchers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/vouchers', {
        id: form.id,
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minPurchase: Number(form.minPurchase) || 0,
        maxDiscount: form.discountType === 'PERCENT' ? Number(form.maxDiscount) : null,
        usageLimit: Number(form.usageLimit) || 100,
        startAt: form.startAt || null,
        endAt: form.endAt || null,
        active: form.active,
      });
      setShowModal(false);
      resetForm();
      loadVouchers();
    } catch (err) {
      notify(err.response?.data?.message || 'Gagal menyimpan voucher.', { title: 'Gagal Menyimpan' });
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirm('Voucher ini akan dihapus.', { title: 'Hapus Voucher', confirmText: 'Hapus', danger: true }))) return;
    try {
      await api.delete(`/admin/vouchers/${id}`);
      loadVouchers();
    } catch (err) {
      notify(err.response?.data?.message || 'Gagal menghapus voucher.', { title: 'Gagal Menghapus' });
    }
  };

  const resetForm = () => {
    const now = new Date();
    const start = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const end = new Date(now.getTime() + 7 * 24 * 3600000 - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setForm({
      id: null,
      code: '',
      discountType: 'PERCENT',
      discountValue: 50,
      minPurchase: 50000,
      maxDiscount: 20000,
      usageLimit: 100,
      startAt: start,
      endAt: end,
      active: true,
    });
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const formatExpiryTime = (endAt) => {
    if (!endAt) return 'Selamanya';
    const now = new Date();
    const target = new Date(endAt);
    const diffMs = target - now;

    if (diffMs <= 0) return 'Kedaluwarsa';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} hari lagi`;
    if (hours > 0) return `${hours} jam lagi`;
    const minutes = Math.floor(diffMs / (1000 * 60));
    return `${minutes} menit lagi`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <Link to="/admin" className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-blue-600" /> Kelola Voucher Diskon Lanjutan (SKPL-F13)
          </h1>
          <p className="text-xs text-slate-500">
            Kupon promo persentase / nominal, syarat min. transaksi, batas potongan, kuota real-time, dan masa berlaku
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" /> Buat Voucher Baru
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Kode Voucher</th>
                <th className="py-3.5 px-4">Besaran Diskon</th>
                <th className="py-3.5 px-4">Syarat & Batas</th>
                <th className="py-3.5 px-4">Kuota Pemakaian</th>
                <th className="py-3.5 px-4">Masa Berlaku</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <>
                  <TableRowSkeleton cols={7} />
                  <TableRowSkeleton cols={7} />
                  <TableRowSkeleton cols={7} />
                </>
              ) : (
                vouchers.map((v) => {
                  const used = v.usedCount || 0;
                  const limit = v.usageLimit || 100;
                  const percentUsed = Math.min(100, Math.round((used / limit) * 100));
                  const remaining = Math.max(0, limit - used);

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-slate-900 text-xs bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                          {v.code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {v.discountType === 'PERCENT' ? (
                          <span className="text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full text-xs font-black">
                            Diskon {v.discountValue}%
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-black">
                            Potongan {formatRupiah(v.discountValue)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="space-y-0.5 text-[11px]">
                          <div>Min: <span className="font-semibold text-slate-800">{v.minPurchase > 0 ? formatRupiah(v.minPurchase) : 'Tanpa min.'}</span></div>
                          {v.discountType === 'PERCENT' && v.maxDiscount && (
                            <div>Maks: <span className="font-semibold text-slate-800">{formatRupiah(v.maxDiscount)}</span></div>
                          )}
                        </div>
                      </td>

                      {/* Bar Sisa Kuota */}
                      <td className="py-3.5 px-4 min-w-[160px]">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                          <span>Terpakai {used}/{limit}</span>
                          <span className={remaining > 10 ? 'text-emerald-600' : 'text-amber-600'}>Sisa {remaining}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                          <div
                            className={`h-full rounded-full ${
                              percentUsed >= 90 ? 'bg-rose-500' : percentUsed >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percentUsed}%` }}
                          ></div>
                        </div>
                      </td>

                      {/* Masa Berlaku */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-slate-800">{formatExpiryTime(v.endAt)}</span>
                        </div>
                        {v.endAt && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            s/d {new Date(v.endAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          v.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {v.active ? 'Aktif' : 'Non-aktif'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                          title="Hapus Voucher"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}

              {vouchers.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    Belum ada voucher diskon yang dibuat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 my-8">
            <h3 className="text-base font-bold text-slate-900 mb-4">Buat Voucher Diskon Baru</h3>
            
            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Voucher</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: DISKON50 / SAVE20K"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipe Diskon</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="PERCENT">Persentase (%)</option>
                    <option value="NOMINAL">Nominal Tetap (Rp)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {form.discountType === 'PERCENT' ? 'Persen Diskon (%)' : 'Potongan Diskon (Rp)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder={form.discountType === 'PERCENT' ? '50' : '10000'}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min. Transaksi (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 50000"
                    value={form.minPurchase}
                    onChange={(e) => setForm({ ...form, minPurchase: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {form.discountType === 'PERCENT' ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Maks. Potongan (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Contoh: 20000"
                      value={form.maxDiscount}
                      onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kuota Penggunaan</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="100"
                      value={form.usageLimit}
                      onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {form.discountType === 'PERCENT' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kuota Penggunaan</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mulai Berlaku</label>
                  <input
                    type="datetime-local"
                    value={form.startAt}
                    onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Berakhir</label>
                  <input
                    type="datetime-local"
                    value={form.endAt}
                    onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition"
                >
                  Simpan Voucher
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
