import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  TrendingUp, DollarSign, ShoppingCart, AlertTriangle, Users, Package,
  FileText, Tag, Flame, ShieldAlert, ArrowUpRight, Bot, Star, Wallet
} from 'lucide-react';
import { StatCardSkeleton, CircularSpinner } from '../components/Skeletons';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'ROLE_ADMIN') {
      navigate('/');
      return;
    }
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [sumRes, chartRes] = await Promise.all([
        api.get('/admin/dashboard/summary'),
        api.get('/admin/dashboard/charts'),
      ]);
      setSummary(sumRes.data);
      setCharts(chartRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  // Chart configs
  const lineChartData = {
    labels: charts?.dailyLabels || [],
    datasets: [
      {
        label: 'Omset Penjualan (Rp)',
        data: charts?.dailyValues || [],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: '#1d4ed8',
      },
    ],
  };

  const barChartData = {
    labels: (charts?.topProducts || []).map((p) => p.name),
    datasets: [
      {
        label: 'Jumlah Terjual',
        data: (charts?.topProducts || []).map((p) => p.salesCount),
        backgroundColor: '#6366f1',
        borderRadius: 8,
      },
    ],
  };

  const monthlyChartData = {
    labels: charts?.monthlyLabels || [],
    datasets: [
      {
        label: 'Omset Bulanan (Rp)',
        data: charts?.monthlyValues || [],
        backgroundColor: '#2563eb',
        borderRadius: 8,
      },
    ],
  };

  const doughnutData = {
    labels: charts?.categoryLabels || [],
    datasets: [
      {
        data: charts?.categoryValues || [],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full">
            Panel Administrator
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
            Dashboard Analitik & Penjualan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Pantau performa omset, estimasi profit, dan aktivitas operasional toko Zelatan Cell
          </p>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/ai-chat"
            className="px-3.5 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-sm shadow-indigo-500/20"
          >
            <Bot className="w-3.5 h-3.5" /> Tanya AI
          </Link>
          <Link
            to="/admin/reports"
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" /> Laporan Penjualan
          </Link>
          <Link
            to="/admin/products"
            className="px-3.5 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
          >
            <Package className="w-3.5 h-3.5" /> Kelola Produk & Stok
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-400">Total Omset</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1">
              {formatRupiah(summary?.totalOmset)}
            </div>
            <span className="text-[11px] text-slate-400">Pendapatan kotor akumulasi</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-400">Estimasi Profit</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600 mb-1">
              {formatRupiah(summary?.totalProfit)}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">Selisih harga jual & modal</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-400">Transaksi Sukses</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1">
              {summary?.totalTransactions || 0}
            </div>
            <span className="text-[11px] text-slate-400">Total transaksi digital lunas</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-400">Stok Menipis</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-600 mb-1">
              {summary?.lowStockCount || 0} Produk
            </div>
            <span className="text-[11px] text-amber-600 font-semibold">Stok &le; 5 item perlu kulakan</span>
          </div>

        </div>
      )}

      {/* Charts Grid */}
      {loading ? (
        <div className="py-12 bg-white rounded-3xl border border-slate-200 mb-8">
          <CircularSpinner text="Memuat grafik analitik penjualan..." size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Line Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Tren Penjualan 30 Hari Terakhir</h3>
              <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full">Chart.js</span>
            </div>
            <div className="h-64">
              <Line
                data={lineChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } },
                  },
                }}
              />
            </div>
          </div>

          {/* Category Doughnut */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-4">Komposisi Kategori</h3>
              <div className="h-52 flex items-center justify-center">
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } },
                  }}
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Monthly Sales Bar Chart (SKPL-F15) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs mb-8">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Penjualan Bulanan 12 Bulan Terakhir</h3>
        <div className="h-56">
          <Bar
            data={monthlyChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { grid: { color: '#f1f5f9' } },
                x: { grid: { display: false } },
              },
            }}
          />
        </div>
      </div>

      {/* Top Products Bar Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs mb-8">
        <h3 className="font-bold text-slate-900 text-sm mb-4">5 Produk Terlaris</h3>
        <div className="h-56">
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { grid: { color: '#f1f5f9' }, ticks: { stepSize: 1 } },
                x: { grid: { display: false } },
              },
            }}
          />
        </div>
      </div>

      {/* Management Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/admin/products"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <div className="font-bold text-slate-900 text-sm">Produk & Stok</div>
            <div className="text-[11px] text-slate-400">Tambah & edit barang</div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/admin/vouchers"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <div className="font-bold text-slate-900 text-sm">Voucher Diskon</div>
            <div className="text-[11px] text-slate-400">Kelola kupon promo</div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/admin/flash-sales"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <div className="font-bold text-slate-900 text-sm">Flash Sale</div>
            <div className="text-[11px] text-slate-400">Periode promo terbatas</div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/admin/users"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <div className="font-bold text-slate-900 text-sm">Data Pengguna</div>
            <div className="text-[11px] text-slate-400">Kelola akun & status</div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/admin/topups"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5"><Wallet className="w-4 h-4 text-emerald-600" /> Top Up</div>
            <div className="text-[11px] text-slate-400">Verifikasi top up manual</div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/admin/ratings"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {summary?.ratingCount ? `${summary.ratingAverage.toFixed(1)} / 5` : 'Rating Toko'}
            </div>
            <div className="text-[11px] text-slate-400">{summary?.ratingCount || 0} ulasan pelanggan</div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/admin/ai-chat"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5"><Bot className="w-4 h-4 text-indigo-600" /> Asisten AI</div>
            <div className="text-[11px] text-slate-400">Tanya jawab laporan</div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>

    </div>
  );
}
