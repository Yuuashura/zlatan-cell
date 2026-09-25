import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Zap, Wallet, CreditCard, ArrowRight, CheckCircle2, Clock, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { CircularSpinner } from '../components/Skeletons';

export default function TopUpPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [amount, setAmount] = useState(50000);
  const [topups, setTopups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const presets = [10000, 25000, 50000, 100000, 200000, 500000];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await api.get('/topups/my');
      setTopups(res.data);
    } catch (err) {
      console.error('Failed to load topup history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const handleAutomaticPay = async () => {
    if (amount < 10000) {
      setError('Minimal nominal top up adalah Rp 10.000');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/topups/pay', { amount });
      if (res.data.invoiceUrl) {
        window.location.href = res.data.invoiceUrl;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses pembayaran otomatis.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualRequest = async () => {
    if (amount < 10000) {
      setError('Minimal nominal top up adalah Rp 10.000');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/topups/manual', { amount });
      setSuccessMsg(res.data.message || 'Permintaan top up manual berhasil dibuat.');
      await loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengajukan top up manual.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Wallet className="w-8 h-8 text-blue-600" /> Pengisian Saldo Akun
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Isi saldo akun Zelatan Cell Anda secara instan menggunakan payment gateway Xendit atau ajukan manual.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form Card */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-500">Saldo Akun Saat Ini</span>
              <div className="text-xl font-black text-slate-900">{formatRupiah(user?.balance)}</div>
            </div>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
              Aktif
            </span>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl p-3 text-xs mb-5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-xs mb-5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 mb-2">Pilih Nominal Top Up</label>
            <div className="grid grid-cols-3 gap-2.5 mb-3">
              {presets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition ${
                    amount === val
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {formatRupiah(val)}
                </button>
              ))}
            </div>

            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Atau Masukkan Nominal Sendiri:</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
              <input
                type="number"
                min="10000"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            {/* Automatic Payment (Xendit) */}
            <button
              disabled={loading}
              onClick={handleAutomaticPay}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Bayar Otomatis via Xendit (Instan)</span>
            </button>
            <p className="text-[11px] text-center text-slate-400">
              Tersedia QRIS, BCA, BNI, BRI, Mandiri VA, OVO, & DANA. Saldo bertambah otomatis seketika setelah bayar.
            </p>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <span className="relative bg-white px-3 text-[11px] text-slate-400">atau</span>
            </div>

            {/* Manual Payment */}
            <button
              disabled={loading}
              onClick={handleManualRequest}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-xs transition disabled:opacity-50"
            >
              Ajukan Permintaan Manual (Konfirmasi Admin)
            </button>
          </div>

        </div>

        {/* History Sidebar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" /> Riwayat Top Up
          </h3>

          <div className="space-y-3 overflow-y-auto max-h-[400px]">
            {historyLoading ? (
              <div className="space-y-2.5 py-2 animate-pulse">
                <div className="h-16 bg-slate-100 rounded-xl"></div>
                <div className="h-16 bg-slate-100 rounded-xl"></div>
                <div className="h-16 bg-slate-100 rounded-xl"></div>
              </div>
            ) : (
              topups.map((t) => (
                <div key={t.id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800">{formatRupiah(t.amount)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' :
                      t.status === 'FAILED' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {t.paymentChannel && (
                    <div className="text-[10px] text-slate-500 mt-1 font-medium">
                      Metode: {t.paymentChannel}
                    </div>
                  )}
                </div>
              ))
            )}

            {topups.length === 0 && !historyLoading && (
              <div className="text-center py-8 text-xs text-slate-400">
                Belum ada riwayat top up.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
