import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { TARGETS, formatCode } from '../purchaseTarget';
import { CheckCircle2, Clock, Loader2, AlertTriangle, XCircle, Printer, ExternalLink } from 'lucide-react';

// Xendit sends the customer back here. The product is processed by the webhook, so this page
// polls the order until it leaves PENDING / PAID.
const rupiah = (v) => 'Rp ' + Math.round(v || 0).toLocaleString('id-ID');

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-4 text-xs py-1.5">
      <span className="text-slate-500">{label}</span>
      <span className={`text-right font-semibold text-slate-900 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

export default function OrderStatusPage() {
  const { externalId } = useParams();
  const { refreshUser } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stopped = false;
    let timer;
    const load = async () => {
      try {
        const res = await api.get(`/orders/${encodeURIComponent(externalId)}`);
        if (stopped) return;
        setOrder(res.data);
        if (res.data.status === 'PENDING' || res.data.status === 'PAID') {
          timer = setTimeout(load, 3000);
        } else {
          refreshUser(); // FAILED puts the money back into the balance
        }
      } catch (err) {
        if (!stopped) {
          setError(err.response?.status === 401 ? 'Silakan login untuk melihat pesanan ini.' : 'Pesanan tidak ditemukan.');
        }
      }
    };
    load();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [externalId]);

  if (error || !order) {
    return (
      <div role="status" className="max-w-md mx-auto py-24 px-4 text-center text-sm text-slate-500">
        {error ? (
          <>
            <XCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <p className="font-semibold text-slate-700 mb-6">{error}</p>
            <Link to="/" className="text-xs font-bold text-blue-600 hover:underline">Kembali ke Beranda</Link>
          </>
        ) : (
          <>
            <Loader2 className="w-7 h-7 animate-spin text-blue-600 mx-auto mb-2" /> Memuat status pesanan...
          </>
        )}
      </div>
    );
  }

  const view = {
    PENDING: { Icon: Clock, tone: 'bg-amber-50 text-amber-600', title: 'Menunggu pembayaran', text: 'Selesaikan pembayaran di halaman Xendit. Halaman ini akan diperbarui otomatis setelah pembayaran diterima.' },
    PAID: { Icon: Loader2, tone: 'bg-blue-50 text-blue-600', title: 'Pembayaran diterima', text: 'Produk sedang diproses, tunggu sebentar...' },
    SUCCESS: { Icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600', title: 'Pembelian berhasil', text: 'Produk sudah dikirim ke tujuan berikut.' },
    FAILED: { Icon: AlertTriangle, tone: 'bg-rose-50 text-rose-600', title: 'Produk gagal diproses', text: order.note },
    EXPIRED: { Icon: XCircle, tone: 'bg-slate-100 text-slate-500', title: 'Invoice kedaluwarsa', text: 'Pembayaran tidak diterima sampai batas waktu. Silakan buat pesanan baru.' },
  }[order.status];
  const target = TARGETS[order.target];

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div className="text-center mb-5">
          <div className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center ${view.tone}`}>
            <view.Icon className={`w-7 h-7 ${order.status === 'PAID' ? 'animate-spin' : ''}`} />
          </div>
          <h1 className="text-lg font-black text-slate-900">{view.title}</h1>
          <p className="text-xs text-slate-500 mt-1">{view.text}</p>
        </div>

        <div className="border-t border-b border-slate-100 py-2 mb-5">
          <Row label="Produk" value={order.productName} />
          <Row label={target?.label || 'Tujuan'} value={order.customerNumber} mono />
          <Row label="Harga produk" value={rupiah(order.price)} />
          <Row label="Biaya admin Xendit (10%)" value={rupiah(order.adminFee)} />
          <Row label="Total dibayar" value={rupiah(order.total)} />
          {order.paymentChannel && <Row label="Metode" value={`Xendit · ${order.paymentChannel}`} />}
          {order.transactionId && <Row label="ID Transaksi" value={order.transactionId} mono />}
          {order.serialNumber && (
            <Row label={target?.codeLabel || 'SN'} value={formatCode(order.serialNumber, order.target)} mono />
          )}
        </div>

        <div className="space-y-2">
          {order.status === 'PENDING' && order.invoiceUrl && (
            <a
              href={order.invoiceUrl}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Buka Halaman Pembayaran
            </a>
          )}
          {order.status === 'SUCCESS' && order.target === 'PLN_METER' && (
            <Link
              to={`/struk/${order.transactionId}`}
              className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak Struk Token
            </Link>
          )}
          <Link
            to={order.status === 'SUCCESS' ? '/profile' : '/'}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center"
          >
            {order.status === 'SUCCESS' ? 'Lihat Riwayat Transaksi' : 'Kembali ke Beranda'}
          </Link>
        </div>
      </div>
    </div>
  );
}
