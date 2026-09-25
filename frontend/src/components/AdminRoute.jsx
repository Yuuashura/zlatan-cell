import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

// Penjaga semua rute /admin: peran diperiksa DULU, antarmuka admin tidak pernah dirender untuk
// non-admin. Server tetap menolak /api/admin/** (403) sebagai pengaman utama.
export default function AdminRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div role="status" className="py-32 flex flex-col items-center gap-2 text-xs text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        Memeriksa akses...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/akses-ditolak" replace />;
  }
  return <Outlet />;
}
