# Pengujian Black Box — Zelatan Cell v2

Bahan BAB IV. Disusun 26 September 2026 dari pengujian yang benar-benar dijalankan pada
24–26 September 2026 (catatan asal: `CHECKLIST-PROGRES.md` bagian "Hasil uji").

## Cara membaca

**Teknik** (sesuai BAB II 2.17):
- **EP** — *Equivalence Partitioning*: satu wakil dari tiap kelas masukan (valid / tidak valid).
- **BVA** — *Boundary Value Analysis*: nilai tepat di batas, di bawah, dan di atasnya.
- **DT** — *Decision Table*: kombinasi kondisi (misalnya status webhook × nominal × sudah diproses).

**Cara uji:**
- **Browser**: lewat antarmuka React.
- **API**: memanggil endpoint langsung dengan curl.
- **Unit**: unit test otomatis (`mvn test`).

**Kesimpulan:**
- **Valid**: hasil sama dengan yang diharapkan.
- **Tidak Valid**: hasil berbeda.
- **Belum diuji**: skenario belum dijalankan. Wajib diuji dan ditangkap layarnya sebelum BAB IV
  final.

**Tangkapan layar:** nama file yang disarankan untuk folder `screenshots-bab4/`. Hasil uji lewat
API/Unit perlu ditangkap ulang dari layar aplikasi atau dari keluaran terminal/test.

Kode SKPL F20 ke atas adalah usulan tambahan (lihat `USULAN-PERUBAHAN-JUDUL.md` bagian 5).
Kode modul tanpa SKPL (registrasi, login, katalog, riwayat, kelola data) disesuaikan dengan Tabel 3.6.

---

## 1. Registrasi dan verifikasi OTP

| Kode | Teknik | Skenario | Data masukan | Hasil diharapkan | Hasil pengujian | Kesimpulan | Tangkapan layar |
|---|---|---|---|---|---|---|---|
| BB-01-01 | EP | Daftar dengan data valid | username, email, HP, password baru | OTP dikirim, akun aktif setelah OTP benar | — | Belum diuji | bb-01-01-daftar.png |
| BB-01-02 | EP | Username sudah dipakai akun lain (beda huruf) | `Budi_Santoso` (sudah ada `budi_santoso`) | Ditolak "Username sudah digunakan oleh akun lain." | HTTP 400, pesan sesuai | Valid | bb-01-02-username-ganda.png |
| BB-01-03 | EP | Konfirmasi password kosong | `confirmPassword` kosong | Ditolak "Konfirmasi password wajib diisi." | HTTP 400, pesan sesuai | Valid | bb-01-03-konfirmasi.png |
| BB-01-04 | BVA | OTP salah berulang | salah ke-1 s.d. ke-5 | Setelah salah ke-5, kode hangus; kode benar pun ditolak | Sesuai (Unit `AuthServiceOtpTest`) | Valid | bb-01-04-otp-hangus.png |
| BB-01-05 | BVA | Minta OTP ulang sebelum 60 detik | kirim ulang < 60 detik | Ditolak | Sesuai (Unit) | Valid | bb-01-05-otp-cooldown.png |

## 2. Login username/password

| Kode | Teknik | Skenario | Data masukan | Hasil diharapkan | Hasil pengujian | Kesimpulan | Tangkapan layar |
|---|---|---|---|---|---|---|---|
| BB-02-01 | EP | Username dan password benar | `budi_santoso` / benar | Masuk ke beranda | Berhasil | Valid | bb-02-01-login.png |
| BB-02-02 | EP | Username beda huruf besar/kecil | `BUDI_SANTOSO`, `Budi_Santoso` | Masuk ke akun `budi_santoso` | Berhasil, nama tampil sesuai ejaan asli | Valid | bb-02-02-login-huruf.png |
| BB-02-03 | EP | Login memakai email | email admin | Masuk | Berhasil | Valid | bb-02-03-login-email.png |
| BB-02-04 | EP | Password salah | password keliru | Ditolak "Username atau password salah." | HTTP 401, pesan sesuai | Valid | bb-02-04-password-salah.png |
| BB-02-05 | EP | Permintaan tanpa token CSRF | POST login tanpa `X-XSRF-TOKEN` | Ditolak | HTTP 403 | Valid | bb-02-05-csrf.png |
| BB-02-06 | EP | Akun Google mencoba login dengan password | email akun Google | Pesan "Akun ini terdaftar melalui Google..." | — | Belum diuji | bb-02-06-akun-google.png |
| BB-02-07 | EP | Akun BANNED login dengan password | `banned_user` | Ditolak | — | Belum diuji | bb-02-07-banned.png |

## 3. Login Google (SKPL-F03)

| Kode | Teknik | Skenario | Data masukan | Hasil diharapkan | Hasil pengujian | Kesimpulan | Tangkapan layar |
|---|---|---|---|---|---|---|---|
| BB-03-01 | DT | Email Google belum terdaftar | akun Google baru | Akun baru dibuat dengan username unik | Sesuai (Unit `GoogleAccountServiceTest`) | Valid | bb-03-01-google-baru.png |
| BB-03-02 | DT | Email Google sudah terdaftar | email akun lokal | Ditautkan ke akun lama, tidak ada akun ganda | Sesuai (Unit) | Valid | bb-03-02-google-tautan.png |
| BB-03-03 | DT | Akun BANNED login lewat Google | akun berstatus BANNED | Ditolak, status tetap BANNED | Sesuai (Unit) | Valid | bb-03-03-google-banned.png |
| BB-03-04 | EP | Login Google sungguhan di browser | akun Google pribadi | Masuk ke beranda | — | Belum diuji | bb-03-04-google-browser.png |

## 4. Katalog produk

| Kode | Teknik | Skenario | Data masukan | Hasil diharapkan | Hasil pengujian | Kesimpulan | Tangkapan layar |
|---|---|---|---|---|---|---|---|
| BB-04-01 | EP | Buka beranda (Semua) | — | Hanya kartu kategori: Pulsa, Paket Data, Token PLN, Voucher Game | Sesuai (browser) | Valid | bb-04-01-kategori.png |
| BB-04-02 | EP | Pilih kategori dengan banyak provider | Pulsa → Telkomsel | 6 kartu operator, lalu 16 nominal Rp 2.000 – Rp 1.000.000; breadcrumb Semua › PULSA › Telkomsel | Sesuai (browser) | Valid | bb-04-02-pulsa-telkomsel.png |
| BB-04-03 | EP | Pilih kategori dengan satu provider | Token PLN | Langsung 6 nominal token | Sesuai (browser) | Valid | bb-04-03-token-pln.png |
| BB-04-04 | EP | Voucher game | Voucher Game | 5 kartu game dengan logo | Sesuai (browser) | Valid | bb-04-04-voucher-game.png |
| BB-04-05 | EP | Barang fisik tidak dijual online | — | Aksesoris dan kategori kosong tidak tampil | Sesuai (36 produk, 4 kategori) | Valid | bb-04-05-tanpa-aksesoris.png |
| BB-04-06 | EP | Pencarian produk | `Telkomsel 10.000` | Produk yang cocok tampil | — | Belum diuji | bb-04-06-cari.png |

## 5. Transaksi pembelian dengan saldo

| Kode | Teknik | Skenario | Data masukan | Hasil diharapkan | Hasil pengujian | Kesimpulan | Tangkapan layar |
|---|---|---|---|---|---|---|---|
| BB-05-01 | EP | Nomor HP tujuan kosong / tidak valid | kosong, `12345` | Ditolak, saldo tidak berkurang | HTTP 400, saldo tetap Rp 350.000 | Valid | bb-05-01-hp-salah.png |
| BB-05-02 | EP | Nomor HP format internasional | `+62 812-9999-0000` | Berhasil, tersimpan `081299990000` | Sesuai | Valid | bb-05-02-hp-62.png |
| BB-05-03 | BVA | Panjang nomor HP | 10 digit, 13 digit, 14 digit | 10 dan 13 diterima, 14 ditolak | Sesuai (Unit `PurchaseTargetTest`) | Valid | bb-05-03-hp-batas.png |
| BB-05-04 | BVA | Panjang nomor meter PLN | 10, 11, 12, 13 digit | 11 dan 12 diterima, 10 dan 13 ditolak | 10 digit ditolak (API); 11 digit berhasil (API); 12/13 sesuai (Unit) | Valid | bb-05-04-meter-batas.png |
| BB-05-05 | EP | Beli token PLN valid | Token PLN 20.000, meter `14234567890` | Berhasil, token 20 digit tampil di struk, riwayat, dan laporan admin | Sesuai | Valid | bb-05-05-token-pln.png |
| BB-05-06 | EP / BVA | ID game tidak valid | kosong, `<script>`, `123` (3 karakter) | Ditolak | Sesuai (API + Unit) | Valid | bb-05-06-idgame-salah.png |
| BB-05-07 | EP | Beli voucher game valid | Mobile Legends 86 Diamonds, `12345678 (1234)` | Berhasil, ID game tersimpan | Sesuai | Valid | bb-05-07-voucher-game.png |
| BB-05-08 | EP | Beli barang fisik lewat API | Silicone Phone Case | Ditolak "hanya dijual langsung di konter" | HTTP 400 | Valid | bb-05-08-aksesoris.png |
| BB-05-09 | DT | Lima pembelian bersamaan, saldo cukup untuk satu | 5 permintaan paralel | 1 berhasil, 4 ditolak, saldo tidak minus, stok berkurang 1 | Sesuai | Valid | bb-05-09-bersamaan.png |
| BB-05-10 | EP | Saldo tidak cukup | produk di atas saldo | Ditolak "Saldo tidak mencukupi", tombol Top Up muncul | — | Belum diuji | bb-05-10-saldo-kurang.png |

## 6. Bayar produk langsung lewat Xendit (usulan SKPL-F22)

| Kode | Teknik | Skenario | Data masukan | Hasil diharapkan | Hasil pengujian | Kesimpulan | Tangkapan layar |
|---|---|---|---|---|---|---|---|
| BB-06-01 | EP | Buat pesanan Xendit | Token PLN 20.000 | Invoice sandbox: Rp 21.500 + admin 10% Rp 2.150 = Rp 23.650 | Sesuai, invoice Xendit terbuat | Valid | bb-06-01-invoice.png |
| BB-06-02 | DT | Webhook PAID, nominal tidak cocok | paid_amount 1.000 | Diabaikan, pesanan tetap PENDING | Sesuai | Valid | bb-06-02-nominal-salah.png |
| BB-06-03 | DT | Webhook PAID nominal cocok | paid_amount 23.650 | Pesanan SUCCESS, token terbit | Sesuai | Valid | bb-06-03-lunas.png |
| BB-06-04 | DT | Webhook PAID dikirim ulang | webhook yang sama 2× | Produk diproses sekali, saldo tidak berubah | Sesuai | Valid | bb-06-04-ulang.png |
| BB-06-05 | DT | Dibayar, tetapi stok habis | stok diubah 0 sebelum webhook | Pesanan FAILED, seluruh Rp 3.300 (termasuk admin) masuk saldo | Sesuai | Valid | bb-06-05-refund.png |
| BB-06-06 | DT | Invoice kedaluwarsa | status EXPIRED | Pesanan EXPIRED | Sesuai | Valid | bb-06-06-expired.png |
| BB-06-07 | EP | Pelanggan lain membuka pesanan | akun `rizky21` | Ditolak | HTTP 404 | Valid | bb-06-07-bukan-pemilik.png |
| BB-06-08 | EP | Webhook tanpa token | tanpa `X-CALLBACK-TOKEN` | Ditolak | HTTP 401 | Valid | bb-06-08-tanpa-token.png |
| BB-06-09 | EP | Pembayaran sandbox penuh lewat ngrok | bayar di halaman Xendit | Kembali ke `/pesanan/...`, status Berhasil | — | Belum diuji | bb-06-09-sandbox.png |

## 7. Voucher diskon (SKPL-F04 / F07 / F13)

| Kode | Teknik | Skenario | Data masukan | Hasil diharapkan | Hasil pengujian | Kesimpulan | Tangkapan layar |
|---|---|---|---|---|---|---|---|
| BB-07-01 | DT | Voucher dipakai pelanggan yang sama dua kali | `PROMOHEMAT` 2× | Pemakaian kedua ditolak "sudah pernah dipakai" | Sesuai | Valid | bb-07-01-voucher-ganda.png |
| BB-07-02 | EP | Kode voucher tidak ada | `ASAL123` | Ditolak "tidak valid" | — | Belum diuji | bb-07-02-voucher-salah.png |
| BB-07-03 | BVA | Minimal belanja | harga tepat di bawah dan tepat di minimal | Di bawah ditolak, tepat di minimal diterima | — | Belum diuji | bb-07-03-min-belanja.png |
| BB-07-04 | EP | Voucher kedaluwarsa | voucher lewat `endAt` | Ditolak "sudah kedaluwarsa" | — | Belum diuji | bb-07-04-kedaluwarsa.png |

## 8. Flash sale (SKPL-F14)

| Kode | Teknik | Skenario | Data masukan | Hasil diharapkan | Hasil pengujian | Kesimpulan | Tangkapan layar |
|---|---|---|---|---|---|---|---|
| BB-08-01 | EP | Admin simpan flash sale bertabrakan / harga ≥ normal / selesai sebelum mulai | 3 kasus | Ditolak dengan pesan jelas | Sesuai (3 kasus) | Valid | bb-08-01-validasi.png |
| BB-08-02 | EP | Flash sale aktif tampil di beranda dengan hitung mundur | flash sale berjalan | Tampil dengan harga coret dan waktu tersisa | — | Belum diuji | bb-08-02-beranda.png |
| BB-08-03 | BVA | Kuota flash sale habis | kuota 1, dua pembelian | Pembelian kedua memakai harga normal | — | Belum diuji | bb-08-03-kuota.png |

## 9. Top up saldo lewat Xendit (SKPL-F05)

| Kode | Teknik | Skenario | Data masukan | Hasil diharapkan | Hasil pengujian | Kesimpulan | Tangkapan layar |
|---|---|---|---|---|---|---|---|
| BB-09-01 | DT | Webhook PAID nominal cocok / dikirim dua kali / nominal beda / EXPIRED / externalId tidak dikenal | 5 kasus | Saldo bertambah sekali dan hanya jika nominal cocok | Sesuai (Unit `PaymentServiceCallbackTest`, 5 kasus) | Valid | bb-09-01-webhook.png |
| BB-09-02 | EP | Nominal manual diketik | ketik `100000` | Tampil `100.000`, tanpa angka 0 di depan | Diperbaiki 25 Sep | Belum diuji | bb-09-02-nominal.png |
| BB-09-03 | BVA | Nominal minimal | 9.999 dan 10.000 | 9.999 ditolak, 10.000 diterima | — | Belum diuji | bb-09-03-minimal.png |
| BB-09-04 | EP | Top up sandbox penuh lewat ngrok | bayar di halaman Xendit | Saldo bertambah otomatis, email terkirim | — | Belum diuji | bb-09-04-sandbox.png |

> Pengajuan top up manual oleh pelanggan **dihapus** pada 25 Sep 2026 (lihat `USULAN-PERUBAHAN-JUDUL.md`
> Tabel 3.10). Pengujiannya tidak dimasukkan ke BAB IV.

## 10. Pemantauan data top up (admin)

| Kode | Teknik | Skenario | Data masukan | Hasil diharapkan | Hasil pengujian | Kesimpulan | Tangkapan layar |
|---|---|---|---|---|---|---|---|
| BB-10-01 | DT | Setujui permintaan manual lama dua kali | top up PENDING manual | Kali kedua ditolak, saldo bertambah sekali | HTTP 400 pada kali kedua | Valid | bb-10-01-setujui.png |
| BB-10-02 | DT | Setujui top up Xendit yang belum dibayar | top up Xendit PENDING | Ditolak | HTTP 400 | Valid | bb-10-02-xendit.png |
| BB-10-03 | EP | Pelanggan memanggil endpoint setujui | akun pelanggan | Ditolak | HTTP 403 | Valid | bb-10-03-akses.png |
| BB-10-04 | EP | Filter status dan paginasi | status PENDING, halaman 2 | Data tersaring di server | Sesuai | Valid | bb-10-04-filter.png |

## 11. Riwayat transaksi dan struk

| Kode | Teknik | Skenario | Data masukan | Hasil diharapkan | Hasil pengujian | Kesimpulan | Tangkapan layar |
|---|---|---|---|---|---|---|---|
| BB-11-01 | EP | Riwayat menampilkan nomor tujuan dan SN/token | akun `budi_santoso` | Nomor tujuan, SN/token, metode bayar tampil | Sesuai (API) | Valid | bb-11-01-riwayat.png |
| BB-11-02 | EP | Pemilik membuka struk token PLN | transaksi token milik sendiri | Struk tampil | HTTP 200 | Valid | bb-11-02-struk.png |
| BB-11-03 | EP | Pelanggan lain / tamu membuka struk | akun lain, tanpa login | Ditolak | HTTP 404 / 401 | Valid | bb-11-03-struk-akses.png |
| BB-11-04 | EP | Pratinjau cetak struk | dialog cetak browser | Lebar 58 mm, navbar dan footer tidak tercetak | — (aturan CSS cetak sudah terpasang) | Belum diuji | bb-11-04-cetak.png |
| BB-11-05 | EP | Cetak ke printer thermal fisik | printer 58 mm | Struk tercetak rapi | — | Belum diuji | bb-11-05-printer.jpg |
| BB-11-06 | EP | Tombol Kembali pada struk yang dibuka di tab baru | klik Kembali | Pindah ke riwayat (pelanggan) / laporan (admin) | Diperbaiki 26 Sep | Belum diuji | bb-11-06-kembali.png |

## 12. Kelola profil

| Kode | Teknik | Skenario | Data masukan | Hasil diharapkan | Hasil pengujian | Kesimpulan | Tangkapan layar |
|---|---|---|---|---|---|---|---|
| BB-12-01 | EP | Nomor HP salah format / milik akun lain / password lama salah | 3 kasus | Ditolak | Sesuai | Valid | bb-12-01-validasi.png |
| BB-12-02 | EP | Ganti password benar | password lama benar + baru | Login dengan password baru berhasil | Sesuai | Valid | bb-12-02-password.png |
| BB-12-03 | EP | Ganti nama ke nama akun lain (beda huruf) / berisi `<b>` | `RIZKY21`, `<b>x` | Ditolak | HTTP 400 | Valid | bb-12-03-nama-salah.png |
| BB-12-04 | EP | Ganti nama pengguna | `Budi Santoso` | Tersimpan, sesi tetap aktif, login dengan nama baru berhasil, nama lama ditolak | Sesuai | Valid | bb-12-04-nama.png |
| BB-12-05 | EP | Foto profil | PNG 600×400, file bukan gambar, hapus | JPEG 256 px tersimpan / ditolak / foto hilang | Sesuai | Valid | bb-12-05-foto.png |

## 13. Kelola data master (admin)

| Kode | Teknik | Skenario | Data masukan | Hasil diharapkan | Hasil pengujian | Kesimpulan | Tangkapan layar |
|---|---|---|---|---|---|---|---|
| BB-13-01 | EP | Kategori/provider: nama kosong / duplikat / hapus yang masih dipakai produk | 3 kasus | Ditolak | Sesuai | Valid | bb-13-01-kategori.png |
| BB-13-02 | EP | Tambah, ubah, hapus produk | produk baru | Tersimpan dan tampil dengan logo provider | — | Belum diuji | bb-13-02-produk.png |
| BB-13-03 | EP | Data pengguna tidak membocorkan data sensitif | `/api/admin/users` | Tidak ada password maupun OTP | Sesuai | Valid | bb-13-03-pengguna.png |
| BB-13-04 | EP | Ban / unban pengguna | akun pelanggan | Status berubah, akun BANNED tidak bisa login | — | Belum diuji | bb-13-04-ban.png |
| BB-13-05 | EP | Tambah / ubah voucher | voucher baru | Tersimpan dan tampil di beranda | — | Belum diuji | bb-13-05-voucher.png |
| BB-13-06 | EP | Paginasi dan pencarian tabel (SKPL-F19) | laporan, top up, pengguna | Disaring di server | Sesuai | Valid | bb-13-06-tabel.png |

## 14. Dashboard dan laporan (SKPL-F15, F16, F17)

| Kode | Teknik | Skenario | Data masukan | Hasil diharapkan | Hasil pengujian | Kesimpulan | Tangkapan layar |
|---|---|---|---|---|---|---|---|
| BB-14-01 | EP | Dashboard admin | — | Kartu ringkasan, tren 30 hari, grafik 12 bulan, produk terlaris, kategori | Sesuai (browser) | Valid | bb-14-01-dashboard.png |
| BB-14-02 | EP | Unduh PDF | periode 1–30 Sep 2026 | Kop toko, periode, tabel, ringkasan; angka sama dengan layar | Sesuai (omset Rp 1.053.200, laba Rp 126.384 pada saat uji) | Valid | bb-14-02-pdf.png |
| BB-14-03 | EP | Unduh Excel | periode yang sama | Nominal bertipe angka, laba berupa rumus, baris total `SUM` | Sesuai | Valid | bb-14-03-excel.png |
| BB-14-04 | EP | Cari laporan berdasarkan nomor tujuan | `14234567` | Hanya transaksi dengan nomor itu | Sesuai (1 baris) | Valid | bb-14-04-cari-nomor.png |

## 15. Notifikasi email (SKPL-F18)

| Kode | Teknik | Skenario | Data masukan | Hasil diharapkan | Hasil pengujian | Kesimpulan | Tangkapan layar |
|---|---|---|---|---|---|---|---|
| BB-15-01 | EP | Email ke domain uji tidak dikirim | akun `@zelatancell.test` | Hanya dicatat di log | Sesuai (log "[DEV, email nonaktif] Struk pembelian ...") | Valid | bb-15-01-log.png |
| BB-15-02 | EP | Email OTP / selamat datang / top up / struk ke alamat asli | akun Gmail pribadi | Email diterima dengan isi yang benar | — | Belum diuji | bb-15-02-email.png |

## 16. Ulasan "Nilai Kami" (usulan SKPL-F21)

| Kode | Teknik | Skenario | Data masukan | Hasil diharapkan | Hasil pengujian | Kesimpulan | Tangkapan layar |
|---|---|---|---|---|---|---|---|
| BB-16-01 | BVA | Popup otomatis | pelanggan dengan 1 dan 2 transaksi | Muncul hanya setelah ≥ 2 transaksi | Sesuai (browser) | Valid | bb-16-01-popup.png |
| BB-16-02 | BVA | Nilai bintang dan panjang komentar | bintang 0 dan 6; komentar 501 karakter; bintang 5 dengan komentar biasa | 0, 6, dan 501 karakter ditolak; bintang 5 tersimpan | HTTP 400 untuk tiga kasus tidak valid; ulasan valid tersimpan | Valid | bb-16-02-batas.png |
| BB-16-03 | EP | Pelanggan tanpa transaksi / tamu | akun 0 transaksi, tanpa login | Pelanggan boleh menilai lewat `/ulasan`; tamu ditolak (401) | Sesuai (aturan diperbarui 25 Sep) | Valid | bb-16-03-akses.png |
| BB-16-04 | EP | Kirim ulang ulasan | ulasan kedua dari akun yang sama | Ulasan lama diperbarui, bukan bertambah | Sesuai | Valid | bb-16-04-ulang.png |
| BB-16-05 | EP | Admin membalas ulasan | balasan teks | Balasan tampil di halaman publik | Sesuai (browser) | Valid | bb-16-05-balas.png |

## 17. Asisten AI admin (usulan SKPL-F20)

| Kode | Teknik | Skenario | Data masukan | Hasil diharapkan | Hasil pengujian | Kesimpulan | Tangkapan layar |
|---|---|---|---|---|---|---|---|
| BB-17-01 | EP | Kedelapan laporan dijalankan pada basis data | semua menu laporan | Tanpa error | Sesuai (`KartuApplicationTests`) | Valid | bb-17-01-laporan.png |
| BB-17-02 | EP | Keluaran model di luar aturan | SQL, laporan di luar menu, rentang > 366 hari, limit > 20 | Ditolak, tidak dijalankan | Sesuai (Unit `AiChatDecisionTest`) | Valid | bb-17-02-validasi.png |
| BB-17-03 | EP | API key belum diisi | `OPENROUTER_API_KEY` kosong | Pesan "AI belum dikonfigurasi", sesi tetap tersimpan | Sesuai (browser) | Valid | bb-17-03-tanpa-key.png |
| BB-17-04 | EP | Kelola sesi: buat, pindah (dengan indikator memuat), hapus lewat dialog konfirmasi | — | Berjalan sesuai | Sesuai (browser) | Valid | bb-17-04-sesi.png |
| BB-17-05 | EP | Pelanggan membuka asisten AI | akun pelanggan ke halaman admin | Dialihkan ke Akses Ditolak, tidak ada panggilan API admin | Sesuai (browser; `AdminRoute` yang sama menjaga semua halaman admin termasuk `/admin/ai-chat`) | Valid | bb-17-05-akses.png |
| BB-17-06 | EP | Ketepatan jawaban | 20 pertanyaan uji | Lihat `EVALUASI-ASISTEN-AI.md` | — | Belum diuji | bb-17-06-evaluasi.png |

## 18. Hak akses halaman

| Kode | Teknik | Skenario | Data masukan | Hasil diharapkan | Hasil pengujian | Kesimpulan | Tangkapan layar |
|---|---|---|---|---|---|---|---|
| BB-18-01 | EP | Tamu membuka halaman admin | `/admin` tanpa login | Dialihkan ke halaman login | Sesuai (browser) | Valid | bb-18-01-tamu.png |
| BB-18-02 | EP | Pelanggan membuka halaman admin | `/admin/reports` | Halaman "Akses ditolak" | Sesuai (browser) | Valid | bb-18-02-pelanggan.png |
| BB-18-03 | EP | Alamat tidak dikenal | `/halaman-asal` | Halaman 404 dengan tombol kembali ke beranda | Sesuai (browser) | Valid | bb-18-03-404.png |
| BB-18-04 | EP | Keluar dari akun | klik tombol keluar | Muncul konfirmasi; setelah "Ya, keluar" sesi berakhir | — | Belum diuji | bb-18-04-logout.png |

---

## Rekapitulasi

| Modul | Valid | Belum diuji |
|---|---|---|
| 1 Registrasi & OTP | 4 | 1 |
| 2 Login | 5 | 2 |
| 3 Login Google | 3 | 1 |
| 4 Katalog | 5 | 1 |
| 5 Pembelian saldo | 9 | 1 |
| 6 Bayar via Xendit | 8 | 1 |
| 7 Voucher | 1 | 3 |
| 8 Flash sale | 1 | 2 |
| 9 Top up Xendit | 1 | 3 |
| 10 Pemantauan top up | 4 | 0 |
| 11 Riwayat & struk | 3 | 3 |
| 12 Profil | 5 | 0 |
| 13 Data master | 3 | 3 |
| 14 Dashboard & laporan | 4 | 0 |
| 15 Email | 1 | 1 |
| 16 Ulasan | 5 | 0 |
| 17 Asisten AI | 5 | 1 |
| 18 Hak akses | 3 | 1 |
| **Jumlah** | **70** | **24** |

Sebelum BAB IV final:
1. Jalankan ke-24 skenario "Belum diuji".
2. Ambil tangkapan layar semua skenario. Untuk yang diuji lewat API/Unit, ulangi lewat layar
   aplikasi bila memungkinkan.
3. Bersihkan data uji terlebih dahulu (`docs/sql/012_bersihkan_data_uji.sql`), supaya tangkapan
   layar tidak memuat transaksi percobaan.
