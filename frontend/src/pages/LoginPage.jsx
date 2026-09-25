import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Lock, User, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const registeredSuccess = searchParams.get('registered');
  const verifiedSuccess = searchParams.get('verified');
  const resetSuccess = searchParams.get('reset');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(username, password);
      // Back to the page that sent the visitor here (AdminRoute), otherwise the role's home.
      const from = location.state?.from;
      if (data.role === 'ROLE_ADMIN') {
        navigate(from?.startsWith('/admin') ? from : '/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      // Jika akun terdaftar tapi belum verifikasi email OTP
      if (err.response?.data?.unverified) {
        const targetEmail = err.response.data.email;
        navigate(`/verify-otp?email=${encodeURIComponent(targetEmail)}&fromLogin=true`);
        return;
      }
      setError(err.response?.data?.message || 'Username atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-blue-500/20">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Selamat Datang</h2>
          <p className="text-xs text-slate-500 mt-1">Masuk ke akun Zelatan Cell Anda</p>
        </div>

        {verifiedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-xs mb-5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Email berhasil diverifikasi! Silakan masuk dengan akun Anda.</span>
          </div>
        )}

        {resetSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-xs mb-5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Password berhasil direset! Silakan masuk dengan kata sandi baru.</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl p-3 text-xs mb-5 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Username atau Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username atau email"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-blue-600 hover:underline">
                Lupa password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Memverifikasi...' : 'Masuk ke Akun'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <span className="relative bg-white px-3 text-[11px] text-slate-400 font-medium">atau masuk dengan</span>
        </div>

        {/* Google OAuth2 Button (SKPL-F03) */}
        <a
          href="/oauth2/authorization/google"
          className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2.5 shadow-xs transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Masuk dengan Google</span>
        </a>

        <div className="mt-8 text-center text-xs text-slate-500">
          Belum punya akun?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:underline">
            Daftar Sekarang
          </Link>
        </div>

      </div>
    </div>
  );
}
