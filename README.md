# Zelatan Cell — Sistem Informasi Penjualan & Manajemen Persediaan

Aplikasi web konter pulsa **Zelatan Cell** (Desa Gentasari, Kroya, Cilacap): penjualan pulsa, paket
data, token listrik PLN, dan voucher game, lengkap dengan saldo akun, pembayaran Xendit, laporan
penjualan, dan asisten AI untuk admin.

Proyek skripsi *"Pengembangan Sistem Informasi Penjualan dan Manajemen Persediaan Berbasis Web
Menggunakan Metode Waterfall pada Usaha Zelatan Cell"* — Hanif Fauzan Nurrahman (NIM 02032311025),
S1 Teknik Informatika, Universitas Nasional Pasim. Versi ini adalah pengembangan v1 → v2.

---

## Daftar isi

- [Fitur](#fitur)
- [Arsitektur dan teknologi](#arsitektur-dan-teknologi)
- [Struktur folder](#struktur-folder)
- [Prasyarat](#prasyarat)
- [Konfigurasi `.env`](#konfigurasi-env)
- [Menyiapkan database](#menyiapkan-database)
- [Menjalankan aplikasi](#menjalankan-aplikasi)
- [Akun awal](#akun-awal)
- [Pengujian](#pengujian)
- [Catatan alur penting](#catatan-alur-penting)
- [Dokumen terkait](#dokumen-terkait)

---

## Fitur

### Pelanggan

| Fitur | Keterangan |
|---|---|
| Akun | Daftar dengan verifikasi OTP email, login username/email + password, atau **login Google**. Username tidak membedakan huruf besar/kecil. |
| Katalog bertingkat | Beranda menampilkan kategori → provider (operator / game) → daftar nominal. Pencarian produk langsung. |
| Produk | **Pulsa** dan **Paket Data** 6 operator (pulsa Rp 2.000 – Rp 1.000.000), **Token PLN** 20 rb – 1 jt, **Voucher Game** (Mobile Legends, Free Fire, PUBG Mobile, Genshin Impact, Valorant). |
| Nomor tujuan | Pulsa/kuota meminta nomor HP, token PLN meminta nomor meter, voucher game meminta ID game. Divalidasi di server. |
| Metode bayar | **Saldo akun**, atau **Xendit** (QRIS, virtual account, e-wallet) dengan biaya admin 10%. |
| Top up saldo | Lewat Xendit; saldo bertambah otomatis setelah pembayaran lunas. |
| Promo | Voucher diskon (sekali per pelanggan) dan flash sale berkuota. |
| Struk | Email struk setiap pembelian; **struk token PLN** siap cetak ke printer thermal 58 mm. |
| Riwayat & profil | Riwayat transaksi, ubah nama pengguna, foto profil, nomor HP, dan password. |
| Ulasan "Nilai Kami" | Rating 1–5 + komentar, tampil publik di `/ulasan`; popup otomatis setelah 2 transaksi. |

### Admin

| Fitur | Keterangan |
|---|---|
| Dashboard | Omset, laba kotor, tren 30 hari dan 12 bulan, produk terlaris, stok menipis. |
| Kelola data | Produk (dengan logo), kategori, provider, voucher, flash sale, pengguna (ban/unban), top up. |
| Laporan | Laporan penjualan dengan filter dan pencarian, unduh **PDF** berkop dan **Excel** (.xlsx). |
| Ulasan | Membaca dan membalas ulasan pelanggan. |
| AI chat | Tanya jawab laporan dalam bahasa sehari-hari (OpenRouter). AI hanya memilih laporan dari menu tetap, tidak menulis SQL. |

---

## Arsitektur dan teknologi

```
React (Vite)  ──/api──►  Spring Boot REST API  ──JDBC──►  PostgreSQL (Supabase)
                               │
                               ├─► Xendit Invoice API (+ webhook)
                               ├─► Google OAuth2 / OIDC
                               ├─► SMTP Gmail
                               └─► OpenRouter (AI chat admin)
```

| Lapisan | Teknologi |
|---|---|
| Backend | Java 21, Spring Boot 3.4 (Web, Data JPA, Security, Validation, OAuth2 Client, Mail), Lombok, OpenPDF, Apache POI |
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7, Chart.js, axios, lucide-react |
| Database | PostgreSQL 17 di Supabase (session pooler) |
| Integrasi | Xendit (sandbox), Google OAuth2, Gmail SMTP, OpenRouter |

Keamanan yang diterapkan: sesi Spring Security + CSRF untuk semua `/api/**` (kecuali webhook Xendit
yang diverifikasi `X-CALLBACK-TOKEN`), perubahan saldo/stok/kuota dengan `UPDATE` bersyarat yang
atomik, halaman admin dijaga peran di frontend dan backend, RLS aktif di semua tabel.

---

## Struktur folder

```
Aplikasi/
├── README.md               ← dokumen ini
├── plan.md                 ← rencana pengembangan (fase, keputusan)
├── backend/                ← Spring Boot
│   ├── .env.example        ← contoh konfigurasi (salin jadi .env)
│   ├── CLAUDE.md           ← aturan pengembangan dan status fitur
│   ├── docs/
│   │   ├── CHECKLIST-PROGRES.md   ← checklist fitur + hasil uji (BAB IV)
│   │   └── sql/                   ← skrip database 001–011, dijalankan berurutan
│   └── src/main/
│       ├── java/com/example/kartu/
│       │   ├── api/          REST controller
│       │   ├── config/       keamanan, SPA fallback, properti Xendit
│       │   ├── services/     logika bisnis (pembelian, pembayaran, laporan, AI, email)
│       │   ├── models/       entity JPA
│       │   ├── repositories/ Spring Data JPA
│       │   ├── enums/        TransactionStatus, PurchaseTarget
│       │   └── seed/         data awal (admin, kategori, data contoh)
│       └── resources/
│           ├── application.properties   ← hanya placeholder ${...}
│           └── static/                  ← hasil build React + img/ (logo provider)
└── frontend/               ← React + Vite
    └── src/
        ├── pages/          halaman (beranda, top up, profil, struk, admin, ...)
        ├── components/     Navbar, dialog, logo produk, bintang rating, ...
        ├── context/        AuthContext (sesi login)
        └── api/client.js   axios + header CSRF otomatis
```

---

## Prasyarat

- **Java 21** dan **Maven 3.9+**
- **Node.js 20.19+ atau 22.12+** (syarat Vite 8) dan npm
- Proyek **Supabase** (PostgreSQL)
- Akun **Xendit** mode test, OAuth client **Google**, **App Password Gmail**, dan API key **OpenRouter**
  (opsional; tanpa key, fitur AI chat menampilkan pesan "belum dikonfigurasi")
- **ngrok** atau tunnel sejenis, hanya untuk menerima webhook Xendit saat pengembangan lokal

---

## Konfigurasi `.env`

Salin `backend/.env.example` menjadi `backend/.env` lalu isi nilainya. File `.env` sudah
di-ignore git; **jangan pernah meng-commit kredensial**. `application.properties` hanya berisi
placeholder `${...}` yang dibaca dari `.env`.

| Variabel | Keterangan |
|---|---|
| `SUPABASE_DB_HOST`, `SUPABASE_DB_USER`, `SUPABASE_DB_PASSWORD` | Koneksi **Session pooler** Supabase (port 5432). Jangan pakai host `db.<ref>.supabase.co` atau port 6543. |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Akun admin yang dibuat otomatis saat pertama kali jalan (hanya jika admin belum ada). |
| `XENDIT_API_KEY` | Secret key **mode test** (`xnd_development_...`). |
| `XENDIT_CALLBACK_TOKEN` | Verification token webhook dari dashboard Xendit. |
| `APP_BASE_URL` | Alamat backend (`http://localhost:8080`). |
| `APP_URL` | Alamat frontend, tujuan kembali setelah bayar di Xendit (`http://localhost:5173` saat dev). |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | OAuth client tipe Web; redirect URI `http://localhost:8080/login/oauth2/code/google`. |
| `MAIL_USERNAME`, `MAIL_APP_PASSWORD`, `MAIL_ENABLED` | SMTP Gmail. `MAIL_ENABLED=false` untuk mematikan email saat menguji. |
| `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_FALLBACK_MODELS` | AI chat admin. Model gratis berakhiran `:free`. |

---

## Menyiapkan database

1. Jalankan backend sekali (lihat bawah). Hibernate (`ddl-auto=update`) membuat tabel inti
   (`users`, `product`, `category`, `provider`, `transaction_history`, `top_up`, `vouchers`,
   `flash_sales`), lalu seeder mengisi admin, kategori, dan data contoh.
2. Jalankan skrip di `backend/docs/sql/` **berurutan** lewat Supabase SQL Editor:

   | Skrip | Isi |
   |---|---|
   | `001` | RLS di semua tabel + index foreign key |
   | `002` – `005` | Ulasan toko, AI chat, pemakaian voucher, balasan ulasan |
   | `006` – `008` | Data produk: token PLN, voucher game, pulsa & paket data lengkap |
   | `009` | Username unik tanpa membedakan huruf besar/kecil |
   | `010` | Pesanan yang dibayar langsung lewat Xendit |
   | `011` | Foto profil |

   Skrip memakai `set role zelatan_app` (role aplikasi pemilik tabel). Jika database Anda tidak
   memakai role terpisah, hapus baris `set role` / `reset role`.

---

## Menjalankan aplikasi

### Mode pengembangan

```bash
# Terminal 1 — backend (http://localhost:8080)
cd backend
mvn spring-boot:run
```

```bash
# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Buka **http://localhost:5173**. Vite meneruskan `/api`, `/oauth2`, dan `/login/oauth2` ke
backend, sehingga keduanya satu origin (cookie sesi dan CSRF bekerja tanpa CORS).

### Webhook Xendit (top up dan bayar produk)

Xendit tidak bisa menghubungi `localhost`. Jalankan tunnel ke port backend:

```bash
ngrok http 8080
```

Daftarkan `https://<url-ngrok>/api/xendit/webhook` di dashboard Xendit (Settings → Webhooks →
Invoice paid), dan pastikan `XENDIT_CALLBACK_TOKEN` sama dengan verification token di sana.

### Build produksi (satu server)

```bash
cd frontend
npm run build
```

Salin isi `frontend/dist/` ke `backend/src/main/resources/static/` (pertahankan folder
`static/img/`), lalu jalankan backend saja dan buka **http://localhost:8080**. Semua alamat halaman
React (termasuk halaman 404) dilayani `index.html` oleh `SpaFallbackConfig`.

---

## Akun awal

| Akun | Keterangan |
|---|---|
| Admin | `ADMIN_USERNAME` / `ADMIN_PASSWORD` dari `.env` (dibuat saat admin belum ada di database). |
| Pelanggan contoh | `rizky21`, `salsa08`, `dinda99`, `bagas11`, `budi_santoso`, … password `password123`. Email berdomain `@zelatancell.test`, sehingga email ke akun ini hanya dicatat di log, tidak dikirim. |

---

## Pengujian

```bash
cd backend
# unit test (tanpa database)
mvn test -Dtest='*ServiceTest,*CallbackTest,*DecisionTest,AuthServiceOtpTest,PurchaseTargetTest'
# uji integrasi: memakai database dari .env, menjalankan semua laporan menu AI (hanya membaca)
mvn test -Dtest=KartuApplicationTests
```

Skenario uji Black Box dan hasilnya (untuk BAB IV) dicatat di
[`backend/docs/CHECKLIST-PROGRES.md`](backend/docs/CHECKLIST-PROGRES.md).

---

## Catatan alur penting

**Pembelian dengan saldo.** Kuota flash sale, kuota voucher, saldo, dan stok diubah dengan
`UPDATE` bersyarat dalam satu transaksi, sehingga pembelian bersamaan tidak bisa membuat stok atau
saldo minus.

**Bayar produk via Xendit.** Tagihan = harga produk + biaya admin 10%. Produk baru diproses saat
webhook *PAID* masuk (bukan saat pelanggan kembali ke halaman), dan webhook yang terkirim dua kali
tidak memproses ulang. Jika produk gagal diproses setelah dibayar (misalnya stok habis), seluruh
pembayaran masuk ke saldo pelanggan. Status pesanan bisa dilihat di `/pesanan/:id`.

**Produk fisik.** Aksesoris hanya dijual langsung di konter: tidak tampil di katalog dan ditolak
jika dibeli lewat API. Admin tetap bisa mengelolanya.

**Struk token PLN.** Halaman `/struk/:idTransaksi` berformat printer thermal 58 mm. Di dialog cetak
pilih printer struk, ukuran kertas 58 mm, dan margin *Tidak ada*.

**Logo provider.** Disimpan di `backend/src/main/resources/static/img/<nama provider>.png` dan
dimuat ulang ke database setiap aplikasi start. Logo PLN dan game saat ini placeholder; ganti
file PNG-nya dengan logo resmi lalu restart backend.

---

## Dokumen terkait

- [`plan.md`](plan.md) — rencana pengembangan per fase dan keputusan desain
- [`backend/CLAUDE.md`](backend/CLAUDE.md) — aturan pengembangan, status fitur, konvensi kode
- [`backend/docs/CHECKLIST-PROGRES.md`](backend/docs/CHECKLIST-PROGRES.md) — checklist dan hasil uji
- [`backend/docs/sql/`](backend/docs/sql/) — skrip database
