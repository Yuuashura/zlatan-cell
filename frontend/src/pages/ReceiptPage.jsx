import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCode } from '../purchaseTarget';
import { Printer, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

// Printable receipt for a thermal printer (58 mm roll). Styles: .receipt in index.css.
const TITLES = {
  PLN_METER: 'STRUK PEMBELIAN\nTOKEN LISTRIK PRABAYAR',
  PHONE: 'STRUK PEMBELIAN\nPULSA / PAKET DATA',
  GAME_ID: 'STRUK TOP UP\nVOUCHER GAME',
};
const NUMBER_LABELS = { PLN_METER: 'No. Meter', PHONE: 'No. HP', GAME_ID: 'ID Game' };

const rupiah = (v) => 'Rp ' + Math.round(v || 0).toLocaleString('id-ID');
const dateTime = (v) =>
  new Date(v).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function Row({ label, value }) {
  return (
    <div className="row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function ReceiptPage() {
  const { transactionId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // "Cetak Struk" links open this page in a new tab, which has no previous page to go back to.
  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(user?.role === 'ROLE_ADMIN' ? '/admin/reports' : '/profile');
  };

  useEffect(() => {
    api
      .get(`/transactions/${encodeURIComponent(transactionId)}/receipt`)
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err.response?.status === 401 ? 'Silakan login untuk melihat struk.' : 'Struk tidak ditemukan atau bukan milik akun Anda.')
      );
  }, [transactionId]);

  if (error) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700 mb-6">{error}</p>
        <Link to="/profile" className="text-xs font-bold text-blue-600 hover:underline">Ke riwayat transaksi</Link>
      </div>
    );
  }
  if (!data) {
    return (
      <div role="status" className="py-24 flex flex-col items-center gap-2 text-xs text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> Memuat struk...
      </div>
    );
  }

  const pln = data.target === 'PLN_METER';
  return (
    <div className="py-10 px-4 flex flex-col items-center gap-5 print:p-0">
      <div className="print:hidden text-center">
        <div className="flex gap-2 justify-center mb-2">
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" /> Cetak Struk
          </button>
          <button
            onClick={goBack}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        </div>
        <p className="text-[11px] text-slate-500 max-w-xs">
          Format printer thermal 58 mm. Di dialog cetak pilih printer struk, ukuran kertas 58 mm, dan margin &quot;Tidak ada&quot;.
        </p>
      </div>

      <div className="receipt shadow-md print:shadow-none">
        <div className="center">
          <strong className="big">ZELATAN CELL</strong>
          <div>Jl. Temugiri 01 Tinggarjati Lor, Desa Gentasari, Kroya, Cilacap</div>
        </div>
        <hr />
        <div className="center title">{TITLES[data.target] || 'STRUK PEMBELIAN'}</div>
        <hr />
        <Row label="Tanggal" value={dateTime(data.timestamp)} />
        <Row label="No. Ref" value={data.transactionId} />
        <Row label="Pelanggan" value={data.customer} />
        {data.customerNumber && <Row label={NUMBER_LABELS[data.target] || 'No. Tujuan'} value={data.customerNumber} />}
        <Row label="Produk" value={data.productName} />
        <hr />
        <Row label="Harga" value={rupiah(data.price)} />
        {data.discountAmount > 0 && <Row label="Diskon" value={'- ' + rupiah(data.discountAmount)} />}
        {data.adminFee > 0 && <Row label="Biaya admin" value={rupiah(data.adminFee)} />}
        <Row label="TOTAL BAYAR" value={rupiah(data.amountPaid + (data.adminFee || 0))} />
        <Row label="Metode" value={data.paymentMethod === 'XENDIT' ? 'Xendit' : 'Saldo'} />
        <hr />
        {pln ? (
          <>
            <div className="center">STROOM / TOKEN</div>
            <div className="token">{formatCode(data.serialNumber, data.target)}</div>
          </>
        ) : (
          <Row label="SN" value={data.serialNumber} />
        )}
        <hr />
        <div className="center small">
          {pln && <div>Masukkan 20 digit token di atas ke meteran listrik Anda.</div>}
          <div>Simpan struk ini sebagai bukti pembayaran yang sah.</div>
          <div>Terima kasih telah berbelanja di Zelatan Cell</div>
          <div>Dicetak {dateTime(new Date())}</div>
        </div>
      </div>
    </div>
  );
}
