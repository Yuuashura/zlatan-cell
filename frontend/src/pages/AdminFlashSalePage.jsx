import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Flame, Plus, Trash2, ArrowLeft, Clock } from 'lucide-react';

export default function AdminFlashSalePage() {
  const [flashSales, setFlashSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    productId: '',
    flashPrice: '',
    startAt: '',
    endAt: '',
    quota: 50,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fsRes, pRes] = await Promise.all([
        api.get('/admin/flash-sales'),
        api.get('/admin/products'),
      ]);
      setFlashSales(fsRes.data);
      setProducts(pRes.data);
      if (pRes.data.length > 0 && !form.productId) {
        setForm((prev) => ({ ...prev, productId: pRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load flash sales', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/flash-sales', {
        productId: Number(form.productId),
        flashPrice: Number(form.flashPrice),
        startAt: form.startAt,
        endAt: form.endAt,
        quota: Number(form.quota),
      });
      setShowModal(false);
      loadData();
    } catch (err) {
      alert('Gagal menyimpan Flash Sale: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus promo flash sale ini?')) return;
    try {
      await api.delete(`/admin/flash-sales/${id}`);
      loadData();
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link to="/admin" className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-rose-500" /> Kelola Flash Sale (SKPL-F14)
          </h1>
          <p className="text-xs text-slate-500">Pasang promo potongan harga berbatas waktu dengan penghitung mundur di beranda</p>
        </div>

        <button
          onClick={() => {
            const now = new Date();
            const start = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            const end = new Date(now.getTime() + 24 * 3600000 - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            setForm({ productId: products[0]?.id || '', flashPrice: '', startAt: start, endAt: end, quota: 50 });
            setShowModal(true);
          }}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-rose-500/20"
        >
          <Plus className="w-4 h-4" /> Pasang Flash Sale
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-4">Produk</th>
              <th className="py-3.5 px-4">Harga Normal</th>
              <th className="py-3.5 px-4">Harga Flash Sale</th>
              <th className="py-3.5 px-4">Periode Promo</th>
              <th className="py-3.5 px-4">Terjual / Kuota</th>
              <th className="py-3.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {flashSales.map((fs) => (
              <tr key={fs.id} className="hover:bg-slate-50/80">
                <td className="py-3.5 px-4 font-bold text-slate-900">{fs.product?.name}</td>
                <td className="py-3.5 px-4 text-slate-400 line-through">{formatRupiah(fs.product?.price)}</td>
                <td className="py-3.5 px-4 font-bold text-rose-600 text-sm">{formatRupiah(fs.flashPrice)}</td>
                <td className="py-3.5 px-4 text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(fs.startAt).toLocaleDateString('id-ID')} s/d {new Date(fs.endAt).toLocaleDateString('id-ID')}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-700 font-medium">
                  {fs.soldCount || 0} / {fs.quota || '-'}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => handleDelete(fs.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}

            {flashSales.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-10 text-slate-400">
                  Belum ada promo flash sale yang aktif.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">Pasang Flash Sale Baru</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Produk</label>
                <select
                  value={form.productId}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (Normal: {formatRupiah(p.price)})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Promo (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="Harga diskon"
                    value={form.flashPrice}
                    onChange={(e) => setForm({ ...form, flashPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kuota Promo</label>
                  <input
                    type="number"
                    required
                    value={form.quota}
                    onChange={(e) => setForm({ ...form, quota: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Waktu Mulai</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.startAt}
                    onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Waktu Selesai</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.endAt}
                    onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs"
                >
                  Aktifkan Flash Sale
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs"
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
