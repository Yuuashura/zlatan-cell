import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDialog } from './DialogProvider';
import { ShoppingBag, Zap, Wallet, User, LogOut, LayoutDashboard, Loader2, Star } from 'lucide-react';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { confirm } = useDialog();
  const { pathname } = useLocation();

  const links = [
    { to: '/', label: 'Katalog', Icon: ShoppingBag },
    { to: '/topup', label: 'Top Up Saldo', Icon: Wallet },
    { to: '/ulasan', label: 'Ulasan', Icon: Star },
    ...(user ? [{ to: '/profile', label: 'Riwayat Transaksi', Icon: User }] : []),
    ...(user?.role === 'ROLE_ADMIN' ? [{ to: '/admin', label: 'Dashboard Admin', Icon: LayoutDashboard, admin: true }] : []),
  ];
  const activeTo = links.find(({ to }) => (to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(to + '/')))?.to;

  // Pill geometry. dir decides which edge leads so the pill stretches toward the new page, then snaps.
  const linksRef = useRef(null);
  const linkRefs = useRef({});
  const [pill, setPill] = useState({ left: 0, right: 0, visible: false, dir: 1, animate: false });
  const linkKey = links.map((l) => l.to).join();
  useLayoutEffect(() => {
    const place = () => {
      const box = linksRef.current;
      const el = linkRefs.current[activeTo];
      if (!box || !el) {
        setPill((p) => ({ ...p, visible: false, animate: false }));
        return;
      }
      const left = el.offsetLeft;
      const right = box.clientWidth - (el.offsetLeft + el.offsetWidth);
      setPill((p) => ({ left, right, visible: true, dir: left >= p.left ? 1 : -1, animate: p.visible }));
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [activeTo, linkKey]);

  const handleLogout = async () => {
    const ok = await confirm('Sesi Anda di perangkat ini akan diakhiri. Anda perlu login lagi untuk bertransaksi.', {
      title: 'Keluar dari akun?',
      confirmText: 'Ya, keluar',
      danger: true,
    });
    if (!ok) return;
    await logout();
    navigate('/login');
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Zelatan Cell
              </span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wide">DIGITAL & PULSA</span>
            </div>
          </Link>

          {/* Navigation Links: the pill slides to the active page like a stretched rubber band */}
          <div ref={linksRef} className="hidden md:flex relative items-center gap-1 text-sm font-medium text-slate-600">
            <span
              aria-hidden="true"
              className={`nav-pill ${pill.dir < 0 ? 'nav-pill-left' : ''} ${pill.animate ? '' : 'nav-pill-instant'}`}
              style={{ left: pill.left, right: pill.right, opacity: pill.visible ? 1 : 0 }}
            />
            {links.map(({ to, label, Icon, admin }) => {
              const active = to === activeTo;
              return (
                <Link
                  key={to}
                  to={to}
                  ref={(el) => (linkRefs.current[to] = el)}
                  aria-current={active ? 'page' : undefined}
                  className={`nav-link group relative z-10 flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    active ? (admin ? 'text-indigo-700 font-semibold' : 'text-blue-700 font-semibold') : admin ? 'text-indigo-600 hover:text-indigo-700' : 'hover:text-blue-600'
                  }`}
                >
                  <Icon className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-115" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {loading ? (
              /* Skeleton Loading Placeholder saat memeriksa sesi */
              <div className="flex items-center gap-2.5 animate-pulse">
                <div className="hidden sm:block w-24 h-7 bg-slate-100 rounded-full"></div>
                <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                <div className="hidden lg:block w-16 h-4 bg-slate-100 rounded"></div>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3">
                {/* Saldo Badge */}
                <Link to="/topup" className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-emerald-100 transition shadow-xs">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>{formatRupiah(user.balance)}</span>
                  <span className="text-emerald-600 text-[10px] bg-emerald-100/90 px-1.5 py-0.5 rounded-full font-bold">+ Top Up</span>
                </Link>

                <Link to="/profile" className="flex items-center gap-2 text-sm text-slate-700 hover:text-blue-600 transition">
                  {user.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-600">
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="font-medium hidden lg:inline">{user.username}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Keluar"
                  className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-slate-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg transition"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm shadow-blue-500/20 transition"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
