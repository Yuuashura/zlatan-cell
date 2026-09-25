import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Clock, XCircle, ArrowLeft, RefreshCw, Wallet } from 'lucide-react';

export default function TopUpStatusPage() {
  const { externalId } = useParams();
  const { refreshUser } = useAuth();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/topups/status/${externalId}`);
      setStatusData(res.data);
      if (res.data.status === 'SUCCESS') {
        await refreshUser();
      }
    } catch (err) {
      console.error('Failed to fetch topup status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [externalId]);

  // Auto-refresh otomatis setiap 5 detik selama status masih PENDING
  useEffect(() => {
    if (!statusData || statusData.status !== 'PENDING') return;
    const interval = setInterval(() => {
      fetchStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [statusData, externalId]);

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
        
        {loading ? (
          <div className="py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Memeriksa status pembayaran dari Xendit...</p>
          </div>
        ) : statusData ? (
          <div>
            {statusData.status === 'SUCCESS' && (
              <div>
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-1">Top Up Berhasil!</h2>
                <p className="text-xs text-slate-500 mb-6">Saldo Anda telah berhasil ditambahkan.</p>

                <div className="bg-slate-50 rounded-2xl p-4 text-xs text-left space-y-2 mb-6 border border-slate-200">
                  <div className="flex justify-between text-slate-500">
                    <span>Nominal:</span>
                    <span className="font-bold text-slate-900">{formatRupiah(statusData.amount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Saluran Pembayaran:</span>
                    <span className="font-bold text-slate-900">{statusData.paymentChannel || 'Xendit Gateway'}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Waktu:</span>
                    <span className="font-medium text-slate-700">{statusData.paidAt || statusData.date}</span>
                  </div>
                </div>

                <Link
                  to="/"
                  className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            )}

            {statusData.status === 'PENDING' && (
              <div>
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-9 h-9 animate-pulse" />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-1">Menunggu Pembayaran</h2>
                <p className="text-xs text-slate-500 mb-6">
                  Silakan selesaikan pembayaran di halaman Xendit. Setelah dibayar, saldo akan otomatis bertambah.
                </p>

                <div className="bg-slate-50 rounded-2xl p-4 text-xs text-left space-y-2 mb-6 border border-slate-200">
                  <div className="flex justify-between text-slate-500">
                    <span>Nominal:</span>
                    <span className="font-bold text-slate-900">{formatRupiah(statusData.amount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>ID Tagihan:</span>
                    <span className="font-mono text-slate-700">{statusData.externalId}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={fetchStatus}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Periksa Status Sekarang
                  </button>
                  <Link
                    to="/"
                    className="block w-full py-2.5 text-slate-500 hover:text-slate-700 text-xs font-semibold"
                  >
                    Kembali ke Beranda
                  </Link>
                </div>

                {/* Auto refresh setiap 5 detik saat PENDING */}
                <p className="text-center text-[11px] text-slate-400 mt-4">
                  Memuat ulang otomatis setiap 5 detik...
                </p>
              </div>
            )}

            {statusData.status === 'FAILED' && (
              <div>
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-9 h-9" />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-1">Pembayaran Gagal / Kedaluwarsa</h2>
                <p className="text-xs text-slate-500 mb-6">Waktu pembayaran telah habis atau transaksi dibatalkan.</p>

                <Link
                  to="/topup"
                  className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition"
                >
                  Coba Top Up Kembali
                </Link>
              </div>
            )}
          </div>
) : (
            <div className="py-8">
              <p className="text-sm font-semibold text-rose-600 mb-4">Transaksi tidak ditemukan</p>
              <p className="text-xs text-slate-500 mb-4">
                {statusData && statusData.status === 'PENDING'
                  ? 'Menunggu webhook Xendit. Silakan tunggu beberapa saat lalu cek ulang.'
                  : 'Transaksi dengan ID ini tidak ditemukan. Pastikan URL benar.'}
              </p>
              <Link to="/" className="text-xs text-blue-600 font-bold hover:underline">
                Kembali ke Beranda
              </Link>
            </div>
          )}

      </div>
    </div>
  );
}
