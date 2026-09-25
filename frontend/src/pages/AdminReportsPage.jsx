import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { FileText, Printer, Download, Search, ArrowLeft, Calendar, DollarSign, TrendingUp, ShoppingCart } from 'lucide-react';
import { TableRowSkeleton } from '../components/Skeletons';

// Laporan penjualan: filter dan paginasi di server (SKPL-F19), PDF berkop (SKPL-F16) dan
// Excel .xlsx (SKPL-F17) dibuat backend dari filter yang sama sehingga angkanya selalu cocok.
const PAGE_SIZE = 20;

export default function AdminReportsPage() {
  const [data, setData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReports();
  }, [startDate, endDate, appliedSearch, page]);

  const params = () => {
    const p = {};
    if (startDate) p.startDate = startDate;
    if (endDate) p.endDate = endDate;
    if (appliedSearch) p.search = appliedSearch;
    return p;
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/reports/sales', { params: { ...params(), page, size: PAGE_SIZE } });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat laporan penjualan.');
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    setPage(0);
    setAppliedSearch(searchTerm.trim());
  };

  const download = (type) => {
    const query = new URLSearchParams(params()).toString();
    window.location.href = `/api/admin/reports/sales/${type}${query ? `?${query}` : ''}`;
  };

  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

  const rows = data?.items || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <Link to="/admin" className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" /> Laporan Penjualan
          </h1>
          <p className="text-xs text-slate-500">Filter rekapitulasi penjualan, cetak PDF berkop toko, dan ekspor ke Excel</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => download('pdf')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Printer className="w-4 h-4" /> Cetak PDF (Kop Toko)
          </button>
          <button
            onClick={() => download('excel')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition"
          >
            <Download className="w-4 h-4" /> Ekspor Excel (.xlsx)
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Calendar className="w-4 h-4 text-slate-400" /> Rentang Tanggal:
          </div>
          <input
            type="date"
            aria-label="Tanggal awal"
            value={startDate}
            onChange={(e) => {
              setPage(0);
              setStartDate(e.target.value);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-xs text-slate-400">s/d</span>
          <input
            type="date"
            aria-label="Tanggal akhir"
            value={endDate}
            onChange={(e) => {
              setPage(0);
              setEndDate(e.target.value);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            aria-label="Cari transaksi"
            placeholder="Cari ID / pelanggan / produk, Enter"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-semibold">Total Omset Periode Ini</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{formatRupiah(data?.totalRevenue)}</div>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><DollarSign className="w-4 h-4" /></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-semibold">Laba Kotor (Omset − Modal)</div>
            <div className="text-lg font-black text-emerald-600 mt-0.5">{formatRupiah(data?.totalProfit)}</div>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp className="w-4 h-4" /></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-semibold">Jumlah Transaksi</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{data?.totalElements || 0} Transaksi</div>
          </div>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><ShoppingCart className="w-4 h-4" /></div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3">No</th>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">ID Transaksi</th>
                <th className="py-3 px-3">Pelanggan</th>
                <th className="py-3 px-3">Produk</th>
                <th className="py-3 px-3">Voucher</th>
                <th className="py-3 px-3">Harga Modal</th>
                <th className="py-3 px-3">Total Bayar</th>
                <th className="py-3 px-3">Laba</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <>
                  <TableRowSkeleton cols={10} />
                  <TableRowSkeleton cols={10} />
                  <TableRowSkeleton cols={10} />
                </>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-12 text-slate-400">
                    Tidak ada data transaksi pada rentang waktu ini.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 text-slate-400 font-medium">{page * PAGE_SIZE + i + 1}</td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(r.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">{r.transactionId}</td>
                    <td className="py-3 px-3 text-slate-700">{r.customer}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{r.productName}</td>
                    <td className="py-3 px-3 text-slate-500">{r.voucherCode || '-'}</td>
                    <td className="py-3 px-3 text-slate-500">{formatRupiah(r.costPrice)}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{formatRupiah(r.amountPaid)}</td>
                    <td className="py-3 px-3 font-bold text-emerald-600">{formatRupiah((r.amountPaid || 0) - (r.costPrice || 0))}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {data?.totalPages > 1 && (
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
    </div>
  );
}
