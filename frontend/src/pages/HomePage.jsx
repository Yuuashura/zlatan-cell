import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Flame, Tag, Clock, CheckCircle2, AlertCircle, ShoppingCart, 
  Search, Zap, ArrowRight, ShieldAlert, Sparkles, RefreshCw, Copy, Check
} from 'lucide-react';
import { 
  ProductCardSkeleton, 
  FlashSaleSkeleton, 
  VoucherSkeleton, 
  CircularSpinner 
} from '../components/Skeletons';
import RatingPrompt from '../components/RatingPrompt';

export default function HomePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  // Checkout modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState(null);
  const [validatingVoucher, setValidatingVoucher] = useState(false);
  const [buying, setBuying] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [ratingCheck, setRatingCheck] = useState(0); // naik setiap pembelian berhasil

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, provRes, fsRes, vRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/providers'),
        api.get('/flash-sales/active'),
        api.get('/vouchers/active'),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setProviders(provRes.data);
      setFlashSales(fsRes.data);
      setVouchers(vRes.data);
    } catch (err) {
      console.error('Failed to load home data', err);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const formatExpiryTime = (endAt) => {
    if (!endAt) return 'Selamanya';
    const now = new Date();
    const target = new Date(endAt);
    const diffMs = target - now;

    if (diffMs <= 0) return 'Kedaluwarsa';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} hari lagi`;
    if (hours > 0) return `${hours} jam lagi`;
    const minutes = Math.floor(diffMs / (1000 * 60));
    return `${minutes} menit lagi`;
  };

  const handleCopyVoucher = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim() || !selectedProduct) return;
    setValidatingVoucher(true);
    setVoucherMessage(null);

    // Hitung basis harga: jika flash sale, gunakan harga flash sale
    const activePrice = selectedProduct.isFlashSale ? selectedProduct.flashPrice : selectedProduct.price;

    try {
      const res = await api.post('/vouchers/validate', {
        code: voucherCode.trim(),
        amount: activePrice,
      });

      if (res.data.valid) {
        setAppliedVoucher(res.data);
        setVoucherDiscount(res.data.discountAmount);
        setVoucherMessage({ type: 'success', text: res.data.message });
      } else {
        setAppliedVoucher(null);
        setVoucherDiscount(0);
        setVoucherMessage({ type: 'error', text: res.data.message });
      }
    } catch (err) {
      setAppliedVoucher(null);
      setVoucherDiscount(0);
      setVoucherMessage({
        type: 'error',
        text: err.response?.status === 401 ? 'Silakan login untuk memakai voucher.' : 'Gagal memvalidasi kode voucher.',
      });
    } finally {
      setValidatingVoucher(false);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setBuying(true);
    setPurchaseResult(null);
    try {
      const res = await api.post('/transactions/buy', {
        productId: selectedProduct.id,
        voucherCode: voucherDiscount > 0 ? voucherCode.trim() : null,
      });
      setPurchaseResult({ success: true, data: res.data });
      setRatingCheck((n) => n + 1);
      
      // Update data user (saldo) dan stok produk secara realtime
      await refreshUser();
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Transaksi gagal diproses';
      setPurchaseResult({ success: false, message: msg });
    } finally {
      setBuying(false);
    }
  };

  const openCheckout = (p, defaultVoucherCode = null) => {
    setSelectedProduct(p);
    setVoucherCode(defaultVoucherCode || '');
    setAppliedVoucher(null);
    setVoucherDiscount(0);
    setVoucherMessage(null);
    setPurchaseResult(null);
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory && p.category?.id !== selectedCategory) return false;
    if (selectedProvider && p.provider?.id !== selectedProvider) return false;
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen pb-16">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 bg-blue-500/30 text-blue-200 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Konter Digital Terpercaya
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                Isi Pulsa & Paket Data <span className="text-blue-300">Cepat Tanpa Antri</span>
              </h1>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-6">
                Transaksi instan 24 jam dengan integrasi payment gateway otomatis. Berbagai pilihan provider favorit dan promo diskon harian.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/topup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition">
                  <Zap className="w-4 h-4 fill-current" /> Top Up Saldo Instan
                </Link>
                {!authLoading && !user && (
                  <Link to="/register" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl border border-white/20 transition">
                    Daftar Akun Baru <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Balance / Stats Card dengan Skeleton */}
            <div className="w-full md:w-80 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl">
              <div className="text-xs uppercase tracking-wider text-blue-200 font-semibold mb-2">Status Akun Anda</div>
              {authLoading ? (
                <div className="animate-pulse space-y-3 py-2">
                  <div className="h-5 w-32 bg-white/20 rounded"></div>
                  <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                    <div className="h-3 w-16 bg-white/20 rounded mb-2"></div>
                    <div className="h-7 w-28 bg-white/30 rounded"></div>
                  </div>
                  <div className="h-8 w-full bg-white/20 rounded-lg"></div>
                </div>
              ) : user ? (
                <div>
                  <div className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    {user.profilePictureUrl ? (
                      <img src={user.profilePictureUrl} alt="" className="w-6 h-6 rounded-full object-cover border border-white/40" />
                    ) : null}
                    <span>{user.username}</span>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10 mb-4">
                    <div className="text-xs text-slate-300">Saldo Tersedia</div>
                    <div className="text-2xl font-black text-emerald-300">{formatRupiah(user.balance)}</div>
                  </div>
                  <Link to="/topup" className="block text-center w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg text-xs transition shadow-sm">
                    + Tambah Saldo
                  </Link>
                </div>
              ) : (
                <div>
                  <div className="text-sm text-slate-200 mb-4 leading-relaxed">
                    Masuk atau buat akun untuk kemudahan pembelian dan dapatkan voucher potongan belanja.
                  </div>
                  <Link to="/login" className="block text-center w-full bg-white text-blue-800 font-bold py-2 rounded-lg text-xs hover:bg-blue-50 transition">
                    Masuk Sekarang
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">

        {/* Flash Sale Section (SKPL-F14) dengan Skeleton */}
        {loading ? (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-rose-500 text-white rounded-xl shadow-md shadow-rose-500/30">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Flash Sale Spesial</h2>
                <p className="text-xs text-slate-500">Harga promo terbatas sebelum waktu habis!</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FlashSaleSkeleton />
              <FlashSaleSkeleton />
              <FlashSaleSkeleton />
              <FlashSaleSkeleton />
            </div>
          </div>
        ) : flashSales.length > 0 ? (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-500 text-white rounded-xl shadow-md shadow-rose-500/30">
                  <Flame className="w-5 h-5 fill-current animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Flash Sale Spesial</h2>
                  <p className="text-xs text-slate-500">Harga promo terbatas sebelum waktu habis!</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {flashSales.map((fs) => (
                <div key={fs.id} className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        FLASH DEAL
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> Berakhir {new Date(fs.endAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">{fs.productName}</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-black text-rose-600">{formatRupiah(fs.flashPrice)}</span>
                      <span className="text-xs text-slate-400 line-through">{formatRupiah(fs.originalPrice)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const found = products.find((p) => p.id === fs.productId);
                      if (found) openCheckout(found);
                    }}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-500/20 transition flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Ambil Promo
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Voucher Promo Section Lanjutan (SKPL-F04 / F07 / F13) */}
        {loading ? (
          <div className="mb-10 bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-amber-900">Voucher Diskon Tersedia</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <VoucherSkeleton />
              <VoucherSkeleton />
              <VoucherSkeleton />
            </div>
          </div>
        ) : vouchers.length > 0 ? (
          <div className="mb-12 bg-gradient-to-br from-amber-50/80 to-yellow-50/50 border border-amber-200/80 rounded-3xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-950">Voucher Diskon Spesial Hari Ini</h3>
                  <p className="text-xs text-amber-700/90">Gunakan kode voucher di bawah untuk mendapatkan potongan harga tambahan saat checkout!</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vouchers.map((v) => {
                const used = v.usedCount || 0;
                const limit = v.usageLimit || 100;
                const remaining = Math.max(0, limit - used);
                const percentUsed = Math.min(100, Math.round((used / limit) * 100));

                return (
                  <div
                    key={v.id}
                    className="bg-white border border-amber-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-amber-300 transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header Card */}
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                            {v.code}
                          </span>
                          <button
                            onClick={() => handleCopyVoucher(v.code)}
                            className="p-1 text-slate-400 hover:text-amber-600 rounded transition"
                            title="Salin Kode"
                          >
                            {copiedCode === v.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Expiry Badge */}
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> {formatExpiryTime(v.endAt)}
                        </span>
                      </div>

                      {/* Discount Label */}
                      <div className="mb-2">
                        {v.discountType === 'PERCENT' ? (
                          <div className="text-lg font-black text-purple-700">
                            Diskon {v.discountValue}%
                          </div>
                        ) : (
                          <div className="text-lg font-black text-emerald-700">
                            Potongan {formatRupiah(v.discountValue)}
                          </div>
                        )}
                        <div className="text-[11px] text-slate-500 font-medium space-y-0.5 mt-0.5">
                          {v.minPurchase > 0 && (
                            <div>Min. Belanja: <span className="font-bold text-slate-700">{formatRupiah(v.minPurchase)}</span></div>
                          )}
                          {v.discountType === 'PERCENT' && v.maxDiscount && (
                            <div>Maks. Potongan: <span className="font-bold text-slate-700">{formatRupiah(v.maxDiscount)}</span></div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Kuota Progress Bar */}
                    <div className="pt-2 border-t border-slate-100 mt-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                        <span>Sisa Kuota</span>
                        <span className={remaining <= 5 ? 'text-rose-600' : 'text-slate-700'}>
                          {remaining} / {limit} Kuota
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentUsed >= 85 ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${percentUsed}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          
          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
            {loading ? (
              <div className="flex gap-2">
                <div className="h-7 w-16 bg-slate-100 rounded-xl animate-pulse"></div>
                <div className="h-7 w-20 bg-slate-100 rounded-xl animate-pulse"></div>
                <div className="h-7 w-24 bg-slate-100 rounded-xl animate-pulse"></div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => { setSelectedCategory(null); setSelectedProvider(null); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    !selectedCategory && !selectedProvider
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(selectedCategory === c.id ? null : c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      selectedCategory === c.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c.type}
                  </button>
                ))}
              </>
            )}
          </div>

        </div>

        {/* Product Grid / Skeleton Loaders */}
        {loading ? (
          <div>
            <div className="text-center py-3 mb-6">
              <CircularSpinner text="Memuat katalog produk Zelatan Cell..." size="md" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => {
              const currentPrice = p.isFlashSale ? p.flashPrice : p.price;
              return (
                <div
                  key={p.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                        {p.provider?.name || p.category?.type || 'Produk'}
                      </span>
                      {p.isFlashSale ? (
                        <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5 fill-current" /> FLASH
                        </span>
                      ) : (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          p.stock > 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          Stok: {p.stock}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mb-1.5 line-clamp-1">{p.name}</h3>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{p.description || 'Layanan digital terverifikasi'}</p>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-xl font-black text-blue-600">{formatRupiah(currentPrice)}</span>
                      {p.isFlashSale && (
                        <span className="text-xs text-slate-400 line-through">{formatRupiah(p.price)}</span>
                      )}
                    </div>

                    <button
                      disabled={p.stock <= 0}
                      onClick={() => openCheckout(p)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                        p.stock > 0
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {p.stock > 0 ? 'Beli Sekarang' : 'Stok Habis'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">Tidak ada produk yang cocok</p>
            <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci lain atau reset filter</p>
          </div>
        )}

      </div>

      {/* Checkout Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Konfirmasi Pembelian</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {purchaseResult ? (
              <div className="text-center py-4">
                {purchaseResult.success ? (
                  <div>
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-1">Transaksi Berhasil!</h4>
                    <p className="text-xs text-slate-500 mb-4">{purchaseResult.data?.message}</p>
                    
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left text-xs space-y-1.5 mb-6">
                      <div className="flex justify-between text-slate-600">
                        <span>ID Transaksi:</span>
                        <span className="font-mono font-bold text-slate-900">{purchaseResult.data?.transactionId}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Serial Number (SN):</span>
                        <span className="font-mono font-bold text-blue-600">{purchaseResult.data?.serialNumber}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Total Bayar:</span>
                        <span className="font-bold text-slate-900">{formatRupiah(purchaseResult.data?.amountPaid)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Sisa Saldo:</span>
                        <span className="font-bold text-emerald-600">{formatRupiah(purchaseResult.data?.newBalance)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-sm"
                    >
                      Selesai
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-1">Transaksi Gagal</h4>
                    <p className="text-xs text-rose-600 mb-6">{purchaseResult.message}</p>
                    
                    {purchaseResult.message.includes('Saldo tidak mencukupi') && (
                      <Link
                        to="/topup"
                        className="block w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs mb-2"
                      >
                        Top Up Saldo Sekarang
                      </Link>
                    )}
                    
                    <button
                      onClick={() => setPurchaseResult(null)}
                      className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                    >
                      Coba Lagi
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Product Info */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
                  <div className="text-xs text-slate-400 font-semibold mb-1">Produk</div>
                  <div className="text-base font-bold text-slate-900">{selectedProduct.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{selectedProduct.description}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Stok saat ini: <span className="font-bold text-slate-700">{selectedProduct.stock} item</span></div>
                </div>

                {/* Voucher input */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Punya Kode Voucher Diskon?</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Contoh: DISKON50"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      disabled={validatingVoucher}
                      onClick={handleApplyVoucher}
                      className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs hover:bg-slate-900 transition disabled:opacity-50"
                    >
                      {validatingVoucher ? 'Memeriksa...' : 'Terapkan'}
                    </button>
                  </div>
                  {voucherMessage && (
                    <div className={`text-[11px] mt-1.5 font-medium ${voucherMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {voucherMessage.text}
                    </div>
                  )}
                </div>

                {/* Rincian Harga */}
                <div className="border-t border-slate-200 pt-3 space-y-2 text-xs mb-6">
                  <div className="flex justify-between text-slate-600">
                    <span>Harga Normal:</span>
                    <span>{formatRupiah(selectedProduct.price)}</span>
                  </div>
                  {selectedProduct.isFlashSale && (
                    <div className="flex justify-between text-rose-600 font-semibold">
                      <span>Diskon Flash Sale:</span>
                      <span>-{formatRupiah(selectedProduct.price - selectedProduct.flashPrice)}</span>
                    </div>
                  )}
                  {voucherDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Diskon Voucher ({voucherCode}):</span>
                      <span>-{formatRupiah(voucherDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Pembayaran:</span>
                    <span className="text-blue-600 font-black">
                      {formatRupiah(Math.max(0, (selectedProduct.isFlashSale ? selectedProduct.flashPrice : selectedProduct.price) - voucherDiscount))}
                    </span>
                  </div>
                </div>

                {/* Confirm Buttons */}
                <div className="space-y-2">
                  <button
                    disabled={buying}
                    onClick={handleConfirmPurchase}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {buying ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Memproses Transaksi...</span>
                      </>
                    ) : (
                      'Konfirmasi & Bayar Sekarang'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="w-full py-2 text-slate-500 hover:text-slate-700 text-xs font-semibold"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      <RatingPrompt checkKey={ratingCheck} suppressed={!!selectedProduct} />
    </div>
  );
}
