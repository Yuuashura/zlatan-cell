import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { Mail, ShieldCheck, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function VerifyOtpPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const emailParam = searchParams.get('email') || '';
  const fromLogin = searchParams.get('fromLogin');

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Masukkan kode OTP.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', {
        email: email.trim(),
        otp: otp.trim(),
      });
      navigate('/login?verified=true');
    } catch (err) {
      setError(err.response?.data?.message || 'Kode OTP salah atau kedaluwarsa.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Alamat email diperlukan.');
      return;
    }

    setError(null);
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email: email.trim() });
      setSuccessMsg('Kode OTP baru telah dikirimkan ke email Anda.');
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim ulang OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
        
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
            <Mail className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verifikasi Alamat Email</h2>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Masukkan 6 digit kode OTP yang kami kirimkan ke alamat email:
          </p>
          <div className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-800 rounded-full font-bold text-xs">
            {email || 'Email Anda'}
          </div>
        </div>

        {fromLogin && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-xs mb-5 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Akun Anda belum terverifikasi. Kami telah mengirimkan kode OTP baru ke email Anda untuk mengaktifkan akun.</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-xs mb-5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl p-3 text-xs mb-5 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          {!emailParam && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">Kode OTP (6 Digit)</label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              className="w-full text-center py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 rounded-2xl text-2xl font-black tracking-[0.5em] font-mono text-blue-900 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Memverifikasi...' : 'Verifikasi Akun Sekarang'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 mb-2">Tidak menerima kode di kotak masuk maupun spam?</p>
          <button
            type="button"
            disabled={resending || countdown > 0}
            onClick={handleResend}
            className={`text-xs font-bold transition flex items-center gap-1.5 mx-auto ${
              countdown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:underline'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>Kirim Ulang OTP {countdown > 0 ? `(${countdown}s)` : ''}</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-xs text-slate-500 hover:text-slate-700 font-semibold flex items-center justify-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Halaman Masuk
          </Link>
        </div>

      </div>
    </div>
  );
}
