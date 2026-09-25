import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Users, Shield, ArrowLeft, Ban, CheckCircle2 } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (id, currentStatus) => {
    const action = currentStatus === 'ACTIVE' ? 'menonaktifkan (banned)' : 'mengaktifkan kembali';
    if (!window.confirm(`Yakin ingin ${action} akun pengguna ini?`)) return;

    try {
      await api.post(`/admin/users/${id}/toggle-ban`);
      loadUsers();
    } catch (err) {
      alert('Gagal mengubah status: ' + err.message);
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
            <Users className="w-6 h-6 text-blue-600" /> Data Pengguna (SKPL-F12)
          </h1>
          <p className="text-xs text-slate-500">Kelola akun pelanggan, hak akses, dan status pemblokiran</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-4">Username</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">No. Telepon</th>
              <th className="py-3.5 px-4">Saldo</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80">
                <td className="py-3.5 px-4 font-bold text-slate-900">{u.username}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    u.role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500">{u.phoneNumber || '-'}</td>
                <td className="py-3.5 px-4 font-bold text-emerald-600">{formatRupiah(u.balance)}</td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {u.status || 'ACTIVE'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  {u.role !== 'ROLE_ADMIN' && (
                    <button
                      onClick={() => handleToggleBan(u.id, u.status)}
                      className={`px-3 py-1 rounded-xl text-[10px] font-bold transition flex items-center gap-1 mx-auto ${
                        u.status === 'ACTIVE'
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? (
                        <>
                          <Ban className="w-3 h-3" /> Blokir
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Aktifkan
                        </>
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
