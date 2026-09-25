import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { User, Wallet, Phone, Calendar, ShoppingBag, ArrowUpRight, Search, CheckCircle2, XCircle, Printer } from 'lucide-react';
import { TableRowSkeleton } from '../components/Skeletons';
import EditProfileForm from '../components/EditProfileForm';
import { formatCode } from '../purchaseTarget';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // wait for the session check before deciding to redirect
    if (!user) {
      navigate('/login');
      return;
    }
    loadTransactions();
  }, [user, authLoading]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions/my');
      setTransactions(res.data);
    } catch (err) {
      console.error('Failed to load user transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const filtered = transactions.filter((t) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      (t.transactionId && t.transactionId.toLowerCase().includes(s)) ||
      (t.productName && t.productName.toLowerCase().includes(s)) ||
      (t.serialNumber && t.serialNumber.toLowerCase().includes(s)) ||
      (t.customerNumber && t.customerNumber.includes(s))
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          {user?.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt={user.username}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-lg shadow-blue-500/10"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user?.username}</h1>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'Pelanggan'}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {user?.phoneNumber || user?.email || '-'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Terdaftar: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 w-full md:w-auto flex items-center justify-between md:gap-8">
          <div>
            <div className="text-xs text-slate-400 font-medium">Saldo Dompet</div>
            <div className="text-xl font-black text-emerald-600">{formatRupiah(user?.balance)}</div>
          </div>
          <Link
            to="/topup"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            + Top Up
          </Link>
        </div>
      </div>

      {user && <EditProfileForm />}

      {/* Transaction History Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" /> Riwayat Pembelian Produk
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Daftar transaksi, nomor tujuan, dan SN / token listrik Anda</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari ID transaksi / produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">ID Transaksi</th>
                <th className="py-3 px-3">Produk</th>
                <th className="py-3 px-3">SN / Token</th>
                <th className="py-3 px-3">Total Bayar</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <>
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                </>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(t.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {t.transactionId}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">
                      {t.productName}
                      {t.target && t.customerNumber && (
                        <div className="text-[11px] font-mono font-normal text-slate-400">ke {t.customerNumber}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-blue-600 font-bold bg-blue-50/50 rounded px-2 whitespace-nowrap">
                      {formatCode(t.serialNumber, t.target) || '-'}
                      {t.target === 'PLN_METER' && (
                        <Link
                          to={`/struk/${t.transactionId}`}
                          target="_blank"
                          className="mt-1 flex items-center gap-1 font-sans text-[10px] font-semibold text-slate-500 hover:text-blue-600"
                        >
                          <Printer className="w-3 h-3" /> Cetak struk
                        </Link>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {formatRupiah(t.amountPaid + (t.adminFee || 0))}
                      {t.paymentMethod === 'XENDIT' && (
                        <div className="text-[10px] font-normal text-slate-400">via Xendit, admin {formatRupiah(t.adminFee)}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {t.status === 'SUCCESS' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}

              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400">
                    Belum ada riwayat transaksi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
