# Checklist Progres Pengembangan

Centang saat fitur selesai **dan** sudah diuji manual. Isi tanggal dan catatan
supaya bisa langsung disalin ke BAB IV.

Kode SKPL mengacu ke Tabel 3.6 BAB III. Kolom "Proposal" menunjuk bagian laporan
yang harus ikut diperbarui kalau ada keputusan teknis yang berubah saat coding.

> **Pembaruan 26 September 2026:**
> - Fitur dibekukan. Status terkini ada di `CLAUDE.md` dan `../plan.md`.
> - Hasil uji mentah ada di bagian "Hasil uji 25 Sep 2026" di bawah. Versi berformat BAB IV ada di
>   `PENGUJIAN-BLACKBOX.md`.
> - Status per tahap ada di bagian "Status tahap".

## Hasil uji 25 Sep 2026

Cara uji: API dipanggil langsung (curl) dan lewat antarmuka React di browser; data di
Projek-hanif. "Unit" = unit test otomatis (`mvn test`), tanpa database.

| Kode | Skenario | Hasil yang diharapkan | Hasil |
|---|---|---|---|
| Top up manual | Pelanggan ajukan top up Rp 25.000 | Status PENDING, saldo belum bertambah | Sesuai — *fitur pengajuan manual pelanggan dihapus 25 Sep, tidak dipakai di BAB IV* |
| Top up manual | Admin menekan Setujui | Saldo +25.000 tepat sekali | Sesuai (250.000 → 275.000) |
| Top up manual | Setujui kedua kali pada top up yang sama | Ditolak, saldo tetap | Sesuai (HTTP 400) |
| Top up manual | Setujui top up Xendit yang belum dibayar | Ditolak | Sesuai (HTTP 400) |
| Top up manual | Akun pelanggan memanggil endpoint approve | Ditolak | Sesuai (HTTP 403) |
| F05 webhook | Callback PAID nominal cocok / dikirim dua kali / nominal beda / EXPIRED / externalId tidak dikenal | Saldo hanya bertambah sekali dan hanya jika cocok | Sesuai (Unit, 5 kasus) |
| Pembelian | 5 pembelian bersamaan, saldo cukup untuk 1 | 1 berhasil, 4 ditolak, saldo tidak minus, stok −1 | Sesuai |
| F04/F07/F13 | Voucher PROMOHEMAT dipakai pelanggan yang sama dua kali | Kedua ditolak; validasi voucher menampilkan "sudah pernah dipakai" | Sesuai |
| F14 | Simpan flash sale bertabrakan / harga ≥ normal / selesai sebelum mulai | Ditolak dengan pesan jelas | Sesuai (3 kasus) |
| OTP | 5 kali OTP salah | Kode dibatalkan, kode benar pun tidak berlaku lagi | Sesuai (Unit) |
| OTP | Minta OTP baru < 60 detik | Ditolak | Sesuai (Unit) |
| Keamanan | POST login tanpa header X-XSRF-TOKEN | Ditolak | Sesuai (HTTP 403) |
| Keamanan | Respons `/api/admin/users` | Tidak memuat password maupun OTP | Sesuai |
| Login | Login admin memakai email | Berhasil | Sesuai |
| F03 | Akun BANNED login lewat Google | Ditolak, status tetap BANNED | Sesuai (Unit) |
| F03 | Email Google sudah terdaftar / email baru | Ditautkan tanpa akun ganda / akun baru + username unik | Sesuai (Unit) |
| F21 rating | Pelanggan ≥ 2 transaksi membuka beranda | Popup "Nilai Kami" muncul, rating tersimpan di `store_ratings` | Sesuai (browser) |
| F21 rating | Bintang 0 atau 6 / komentar 501 karakter / tanpa login | Ditolak (400/400/401) | Sesuai — *aturan 25 Sep: pelanggan 0 transaksi kini boleh menilai; syarat 2 transaksi hanya untuk popup* |
| F21 rating | Kirim ulang rating | Baris yang sama diperbarui, bukan bertambah | Sesuai |
| F15 | Dashboard admin | Kartu ringkasan, tren 30 hari, grafik 12 bulan, produk terlaris, kategori | Sesuai (browser) |
| F16 | Unduh PDF periode 1–30 Sep 2026 | Kop toko, periode, tabel, ringkasan; angka sama dengan layar | Sesuai (omset Rp 1.053.200, laba Rp 126.384) |
| F17 | Unduh Excel periode yang sama | Nominal bertipe angka, kolom laba berupa rumus, baris total `SUM` | Sesuai |
| F19 | Tabel laporan, top up, pengguna | Paginasi dan pencarian di server | Sesuai |
| F20 AI | Semua 8 menu laporan dijalankan pada database | Tanpa error | Sesuai |
| F20 AI | Output AI berisi SQL / laporan di luar menu / rentang > 366 hari / limit > 20 | Ditolak | Sesuai (Unit) |
| F20 AI | Chat tanpa `OPENROUTER_API_KEY` | Pesan "AI belum dikonfigurasi", sesi tetap tersimpan | Sesuai (browser) |
| Profil | Nomor HP salah format / milik akun lain / password lama salah | Ditolak | Sesuai |
| Profil | Ganti password benar, lalu login dengan password baru | Berhasil | Sesuai |
| Kategori/provider | Nama kosong / duplikat / hapus yang masih dipakai produk | Ditolak | Sesuai |
| Pembelian | Beli pulsa dengan nomor tujuan kosong / `12345` | Ditolak, saldo tidak berkurang | Sesuai (HTTP 400, saldo tetap 350.000) |
| Pembelian | Beli pulsa ke `+62 812-9999-0000` | Berhasil, nomor tersimpan sebagai `081299990000` | Sesuai |
| Pembelian | Beli token PLN dengan nomor meter 10 digit | Ditolak | Sesuai (HTTP 400) |
| Pembelian | Beli token PLN 20.000 ke meter `14234567890` | Berhasil, token 20 digit, nomor meter tampil di struk, riwayat, dan laporan admin | Sesuai |
| Pembelian | Katalog pelanggan | Hanya produk digital (pulsa, data, token PLN, voucher game); aksesoris dan kategori kosong tidak tampil | Sesuai (36 produk, 4 kategori) |
| Pembelian | Beli aksesoris lewat API | Ditolak "hanya dijual langsung di konter" | Sesuai (HTTP 400) |
| Pembelian | Beli Mobile Legends 86 Diamonds dengan ID kosong / `<script>` | Ditolak | Sesuai (HTTP 400) |
| Pembelian | Beli Mobile Legends 86 Diamonds ke `12345678 (1234)` | Berhasil, ID game tersimpan | Sesuai |
| Katalog | Beranda "Semua" | Hanya kartu kategori (Pulsa, Paket Data, Token PLN, Voucher Game) | Sesuai |
| Katalog | Pilih Pulsa, lalu Telkomsel | Kartu 6 operator, lalu 16 nominal Rp 2.000 – Rp 1.000.000; breadcrumb Semua › PULSA › Telkomsel | Sesuai |
| Katalog | Pilih Voucher Game / Token PLN | 5 kartu game / langsung 6 nominal token (hanya satu provider) | Sesuai |
| Username | Login `BUDI_SANTOSO` dan `Budi_Santoso` untuk akun `budi_santoso` | Berhasil, nama tampil sesuai ejaan asli | Sesuai |
| Username | Daftar `Budi_Santoso` dengan email lain | Ditolak "Username sudah digunakan" | Sesuai (HTTP 400) |
| Struk PLN | Pemilik membuka `/api/transactions/{id}/receipt` | Data struk | Sesuai (HTTP 200) |
| Struk PLN | Pelanggan lain / tamu membuka struk yang sama | Ditolak | Sesuai (HTTP 404 / 401) |
| Struk PLN | Halaman `/struk/{id}` dicetak | Lebar 58 mm, navbar dan footer tidak ikut tercetak | Sesuai (CSS `@page size 58mm`); belum dicoba ke printer fisik |
| Bayar Xendit | Pesan Token PLN 20.000 dengan metode Xendit | Invoice sandbox dibuat: harga Rp 21.500 + admin 10% Rp 2.150 = Rp 23.650 | Sesuai |
| Bayar Xendit | Webhook PAID nominal salah | Diabaikan, pesanan tetap PENDING | Sesuai |
| Bayar Xendit | Webhook PAID benar, lalu dikirim ulang | Produk diproses sekali (token 20 digit), saldo tidak berubah | Sesuai |
| Bayar Xendit | Stok habis setelah pelanggan membayar | Pesanan FAILED, seluruh pembayaran (Rp 3.300 termasuk admin) masuk saldo | Sesuai |
| Bayar Xendit | Invoice kedaluwarsa / pelanggan lain membuka pesanan / webhook tanpa token | EXPIRED / 404 / 401 | Sesuai |
| Profil | Ganti nama ke nama akun lain beda huruf / berisi `<b>` | Ditolak | Sesuai |
| Profil | Ganti nama pengguna | Sesi tetap aktif; login dengan nama baru berhasil, nama lama ditolak | Sesuai |
| Profil | Unggah foto PNG / file bukan gambar / hapus foto | JPEG 256 px tersimpan / ditolak / foto hilang | Sesuai |
| Katalog | Logo provider di kartu produk | Semua provider punya logo (`/api/providers/{id}/logo`) | Sesuai |
| Pembelian | Aturan nomor HP (10–13 digit, awalan 08/62/+62), meter PLN (11–12 digit), ID game (4–40 karakter) | Sesuai aturan | Sesuai (Unit, `PurchaseTargetTest`) |

**Belum diuji:** pembayaran Xendit sandbox penuh lewat ngrok, login Google sungguhan, email
terkirim ke alamat asli, printer thermal fisik, dan evaluasi ketepatan asisten AI.
Versi berformat BAB IV (teknik EP/BVA/DT, kode uji, kesimpulan): **`PENGUJIAN-BLACKBOX.md`**.

---

## Status tahap (diperbarui 26 Sep 2026)

Daftar centang rinci Tahap A–G (disusun 15–18 Sep) diganti tabel ini. Banyak butirnya merujuk
halaman Thymeleaf dan profil MySQL yang sudah tidak ada setelah arsitektur pindah ke
React + Supabase. Bukti diambil dari kode yang ada sekarang.

| Tahap | Isi | Status | Bukti di kode | Butir yang ditinggalkan / belum |
|---|---|---|---|---|
| Persiapan | Backup, `.env`, git | Sebagian | `.env` di-ignore; backup `backup-aplikasi-sebelum-v2-lanjutan-2026-09-25.tar.gz` | **Commit git belum ada** (dilakukan manual oleh Hanif) |
| A | Migrasi MySQL → PostgreSQL Supabase | Selesai | `application.properties` (`SUPABASE_DB_*`), `docs/sql/001`, data dipindah ke Projek-hanif 25 Sep | Profil MySQL cadangan dan `ddl-auto=validate` tidak dipakai (tetap `update`, tabel baru lewat `docs/sql/`) |
| B · F05 | Top up Xendit | Selesai | `XenditService`, `PaymentService`, `XenditWebhookController`, `TopUpStatusPage` | Uji sandbox penuh lewat ngrok belum; pengajuan manual pelanggan dihapus |
| B · F03 | Login Google | Selesai | `GoogleAccountService`, `CustomOAuth2UserService`, `CustomOidcUserService`, tombol Google di `LoginPage` | Uji login sungguhan di browser belum dicatat formal |
| B · F18 | Email otomatis | Selesai | `EmailService` (`@Async`, dikirim setelah commit): OTP, selamat datang, top up, struk | Template `email/*.html` Thymeleaf diganti HTML di `EmailService`; `EmailLog` tidak dibuat; uji ke alamat asli belum |
| C | REST API + kerangka React | Selesai | `api/*ApiController`, `frontend/`, CSRF cookie + `X-XSRF-TOKEN` di `api/client.js` | `frontend-maven-plugin` tidak dipakai; build disalin manual ke `static/` |
| D · F15 | Dashboard Chart.js | Selesai | `AdminDashboardApiController`, `ReportService`, `AdminDashboardPage` | — |
| D · F16 | Laporan PDF | Selesai | `SalesReportService` (OpenPDF), `/api/admin/reports/sales/pdf` | Satu service untuk PDF dan Excel, bukan `ReportPdfService` terpisah |
| D · F17 | Laporan Excel | Selesai | `SalesReportService` (Apache POI, rumus `SUM`), `/api/admin/reports/sales/excel` | — |
| E · F14 | Flash sale | Selesai | `FlashSaleRepository.claimSlot`, `AdminFlashSalePage`, hitung mundur di `HomePage` | Uji kuota habis dan hitung mundur belum dicatat |
| E · F04/F07/F13 | Voucher | Selesai | `VoucherUsage` (`docs/sql/004`), `TransactionHistoryService.checkVoucher` | Uji kode salah / kedaluwarsa / minimal belanja belum dicatat |
| E · F19 | Tabel | Selesai | Paginasi dan pencarian server: laporan, top up, pengguna, ulasan | — |
| F | 21 halaman Thymeleaf → React | Selesai | `frontend/src/pages/*`; Thymeleaf dan MySQL sudah tidak ada di `pom.xml` | — |
| G | Black Box seluruh modul | Sebagian | `PENGUJIAN-BLACKBOX.md`: 70 skenario Valid, 24 belum diuji | Tangkapan layar `screenshots-bab4` belum; evaluasi AI (`EVALUASI-ASISTEN-AI.md`) belum dijalankan |

Tambahan di luar Tabel 3.6 (usulan, perlu persetujuan pembimbing, lihat
`USULAN-PERUBAHAN-JUDUL.md` bagian 5): F20 asisten AI, F21 ulasan, bayar produk via Xendit, nomor
tujuan dan katalog bertingkat (pulsa, paket data, token PLN, voucher game), struk token PLN,
foto dan nama profil.

## Kalau ada keputusan teknis yang berubah

Setiap kali implementasi berbeda dari yang tertulis di proposal, catat di sini supaya
BAB III bisa ikut diperbarui sebelum sidang.

| Tanggal | Yang berubah | Bagian proposal yang perlu disesuaikan |
|---|---|---|
| 18 Sep 2026 | Frontend Thymeleaf diganti React + Vite | BAB I batasan poin 6 dan metodologi 1.6.2; BAB II tambah subbab React dan REST API; BAB III Tabel 3.9; kebutuhan non-fungsional NF01 dan NF06 |
| 18 Sep 2026 | Basis data MySQL/MariaDB diganti PostgreSQL (Supabase) | BAB I batasan poin 6 dan metodologi 1.6.2; BAB II 2.13 diubah dari MySQL menjadi PostgreSQL/Supabase; BAB III Tabel 3.9, XAMPP/Laragon dihapus |
| 18 Sep 2026 | Arsitektur menjadi SPA + REST API, bukan server-rendered | BAB III bagian arsitektur sistem; Daftar Pustaka perlu rujukan React, PostgreSQL, Supabase |
| 18 Sep 2026 | Beban kerja bertambah (migrasi di luar 10 fitur semula) | Tabel 1.1 Waktu Penelitian — pertimbangkan baris tambahan. **Perlu dibicarakan dengan pembimbing.** |
| 25 Sep 2026 | Database pindah ke Supabase **Projek-hanif**; data lama tidak dipindah, di-seed ulang (keputusan K1) | BAB III Tabel 3.9 |
| 25 Sep 2026 | Top up manual tidak lagi disetujui otomatis oleh scheduler; wajib diverifikasi admin | Deskripsi sistem berjalan / usulan di BAB III |
| 25 Sep 2026 | Usulan fitur baru SKPL-F20 AI chat admin (OpenRouter, menu laporan tetap, tanpa text-to-SQL) dan SKPL-F21 rating toko | Tabel 3.6, 3.10, Gambar 3.3 (aktor OpenRouter), BAB II subbab LLM & kepuasan pelanggan. **Perlu persetujuan pembimbing.** |
| 25 Sep 2026 | Satu voucher hanya boleh dipakai sekali per pelanggan (tabel `voucher_usages`) | Aturan voucher di BAB III |
| 25 Sep 2026 | Edit profil hanya nomor HP dan password; email tidak bisa diubah (dipakai untuk login Google dan OTP) | Use case kelola profil |
| 25 Sep 2026 | Ulasan toko dibuka untuk publik (`/ulasan`), semua pelanggan yang login boleh menilai (syarat ≥ 2 transaksi hanya untuk popup), admin bisa membalas ulasan | Deskripsi SKPL-F21, use case pelanggan dan admin |
| 25 Sep 2026 | Pengajuan top up manual oleh pelanggan dihapus; top up hanya lewat Xendit. Admin tetap bisa menyetujui/menolak permintaan manual lama yang masih PENDING | Use case top up pelanggan, activity diagram top up |
| 25 Sep 2026 | Produk bisa dibayar langsung lewat Xendit (tanpa saldo) dengan biaya admin 10%; jika produk gagal diproses setelah dibayar, dana masuk saldo. Profil: ubah nama pengguna dan foto profil | Use case pembelian (metode bayar), sequence diagram webhook, kamus data `product_orders`, `user_avatars` |
| 25 Sep 2026 | Kategori diganti PULSA dan PAKET DATA; katalog bertingkat kategori › provider › nominal; struk token PLN untuk printer thermal 58 mm; konfirmasi logout; username tidak membedakan huruf besar/kecil | Rancangan antarmuka katalog, use case cetak struk, aturan akun di BAB III |
| 25 Sep 2026 | Produk fisik (aksesoris) tidak dijual lewat aplikasi, hanya di konter; kategori Voucher Game (Mobile Legends, Free Fire, PUBG Mobile, Genshin Impact, Valorant) ditambahkan dengan ID game sebagai tujuan; kartu produk menampilkan logo provider | Ruang lingkup produk di BAB I/III, kamus data produk |
| 25 Sep 2026 | Pembelian pulsa/kuota meminta nomor HP tujuan, token PLN meminta nomor meter / ID pelanggan (token 20 digit); produk Token Listrik PLN 20 rb – 1 jt ditambahkan | Alur transaksi pembelian (activity/sequence diagram), atribut `customer_number` di kamus data |
| | | |
