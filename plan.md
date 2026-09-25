# Plan Pengembangan Lanjutan — Zelatan Cell

Disusun 25 September 2026, setelah penelaahan kode `backend/` dan `frontend/`.
Dokumen ini untuk **dibahas dulu** sebelum ada kode yang diubah.

Isi:

1. Keputusan yang perlu dijawab
2. Urutan fase
3. Fase 0 — Persiapan dan pindah database ke Supabase **Projek-hanif**
4. Fase 1 — Perbaikan kritis (bug saldo dan keamanan)
5. Fase 2 — Fitur rating toko ("Nilai Kami")
6. Fase 3 — Fitur AI chat untuk admin
7. Fase 4 — Melengkapi fitur v2 yang belum tuntas
8. Fase 5 — Saran fitur tambahan (backlog)
9. Dampak ke proposal
10. Skenario uji Black Box

---

## 1. Keputusan yang perlu dijawab dulu

Setiap baris sudah punya usulan default. Kalau tidak ada keberatan, default itu yang dipakai.

| # | Keputusan | Usulan default |
|---|---|---|
| K1 | Data di database Supabase lama dipindah atau tidak? | **Tidak.** Isinya sebagian besar data dummy dari `DataDummy`, jadi cukup di-seed ulang di Projek-hanif. Kalau ada data uji BAB IV yang harus dipertahankan, pindahkan dengan `pg_dump --data-only` lalu restore. |
| K2 | Struktur repositori git | Satu repo untuk `Aplikasi/` (backend + frontend). Caranya: pindahkan `backend/.git` ke `Aplikasi/.git`, lalu commit (git mengenali perpindahan file sebagai rename). Alternatifnya: repo terpisah untuk frontend. |
| K3 | Rating: satu pelanggan bisa memberi berapa rating? | **Satu rating per pelanggan, bisa diubah.** Rata-rata tidak bisa digelembungkan oleh satu orang. |
| K4 | Rating: kalau pelanggan menekan "Nanti saja" | Popup muncul lagi 3 hari kemudian. Waktu penolakan disimpan di `localStorage`, tanpa kolom database. |
| K5 | Model AI untuk chat admin | **Model gratis OpenRouter** (akhiran `:free`), dengan pola mengikuti referensi SnapMart. Nama model disimpan di `.env` supaya bisa diganti tanpa mengubah kode, karena model gratis sering berganti. |
| K6 | Riwayat percakapan AI disimpan ke database? | **Ya**, seperti SnapMart: sesi chat per admin di tabel `ai_chat_sessions` dan `ai_chat_messages`. Sekaligus jadi bukti untuk BAB IV. |
| K9 | Cara AI mengambil data | **Menu laporan tetap**: AI memilih jenis laporan dan periodenya, backend yang menjalankan query. Text-to-SQL seperti SnapMart **tidak** dipakai apa adanya; alasannya di bagian 6.2. |
| K7 | Laporan PDF/Excel (F16/F17) | Tentukan: tetap `window.print()` + CSV (lalu proposal disesuaikan), **atau** dibuat sesuai proposal (OpenPDF + `.xlsx` Apache POI). Usulan: sesuai proposal, karena itu yang tertulis di Tabel 3.6. |
| K8 | Kode SKPL untuk dua fitur baru | Usulan **SKPL-F20** AI chat admin dan **SKPL-F21** rating toko. Perlu disetujui pembimbing (lihat bagian 9). |

---

## 2. Urutan fase

Prinsipnya sama dengan dokumen lama: **risiko tertinggi dulu**. Perbaikan saldo dan keamanan lebih mendesak daripada fitur baru, karena fitur baru (rating, AI) dibangun di atas data transaksi yang sekarang masih bisa salah.

| Fase | Isi | Kenapa urutannya di sini |
|---|---|---|
| 0 | Commit kondisi sekarang, pindah DB ke Projek-hanif | Semua fase berikutnya diuji di DB baru, cukup sekali |
| 1 | Perbaikan kritis | Saldo bisa bertambah gratis / terpotong salah; data rating dan analisis AI ikut salah kalau ini belum beres |
| 2 | Rating toko | Kecil dan mandiri; datanya nanti dipakai AI |
| 3 | AI chat admin | Butuh query agregasi yang juga dipakai dashboard (F15) dan data rating |
| 4 | Melengkapi fitur v2 | Menutup janji proposal (F15–F19) |
| 5 | Backlog saran | Dikerjakan kalau waktu cukup |

---

## 3. Fase 0 — Persiapan dan pindah database ke Projek-hanif

### 3.1 Kondisi Projek-hanif (dicek 25 Sep 2026 lewat Supabase MCP)

| | |
|---|---|
| Nama | Projek-hanif |
| Project ref | `mevzhxisbubhlnvwamje` |
| Region | `ap-southeast-1` (Singapore) — sesuai rekomendasi dokumen migrasi |
| Postgres | 17 |
| Isi skema `public` | kosong (0 tabel) |

Supabase tetap dipakai **hanya sebagai PostgreSQL terkelola**. Spring Boot tetap satu-satunya yang mengakses database lewat JDBC. Supabase MCP yang terhubung ke Claude hanya dipakai saat pengembangan: menjalankan SQL, melihat tabel, dan menjalankan advisor keamanan.

### 3.2 Langkah

1. **Amankan kondisi sekarang.** Commit semua perubahan yang menumpuk di `backend/` (penghapusan Thymeleaf, `api/`, Xendit, OAuth) dan masukkan `frontend/` ke git sesuai keputusan K2. Tanpa ini, perubahan di fase berikutnya tidak bisa ditarik kembali.
2. Perbaiki `.gitignore`: baris `*.properties` membuat `application.properties` tidak pernah masuk repo. Ganti dengan pengecualian yang spesifik, lalu commit `application.properties` **setelah** semua kredensialnya jadi placeholder (langkah 4).
3. Ambil connection string dari Dashboard Projek-hanif → **Connect → Session pooler** (port 5432, user `postgres.mevzhxisbubhlnvwamje`). Host pooler diambil dari dashboard, jangan ditebak. Kalau password database tidak diketahui, reset di Database Settings.
4. Isi `SUPABASE_DB_HOST`, `SUPABASE_DB_USER`, `SUPABASE_DB_PASSWORD` di `backend/.env`. Di `application.properties`, **hapus nilai default** host, user, dan password lama (sekarang password asli tertulis sebagai default di baris 11). Tanpa default, salah konfigurasi langsung gagal dengan jelas.
5. Jalankan backend. Hibernate (`ddl-auto=update`) membentuk tabel di DB kosong, lalu `DataSeed` dan `DataDummy` mengisi data. Ini juga menguji jalur seed dari nol, yang terakhir gagal di test `contextLoads` (`IndexOutOfBoundsException` di `DataDummy`). Perbaiki kalau masih gagal.
6. **Nyalakan RLS di semua tabel `public`.** Tabel di skema `public` bisa diakses lewat Data API Supabase. Karena aplikasi tidak memakai Data API, cukup `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` tanpa policy. Koneksi JDBC memakai role pemilik tabel sehingga tidak terpengaruh. Opsional: matikan Data API di pengaturan proyek.
7. Jalankan advisor keamanan dan performa Supabase (`get_advisors`), lalu perbaiki temuannya.
8. Uji regresi singkat: login lokal, login Google, beli produk, top up Xendit (simulasi callback), halaman admin.
9. Pause atau hapus proyek Supabase lama setelah yakin tidak dibutuhkan. Password lama sudah tersimpan sebagai teks biasa, jadi anggap sudah bocor.
10. Perbarui `CLAUDE.md` dan `docs/CHECKLIST-PROGRES.md` sesuai kondisi kode yang sebenarnya (Thymeleaf sudah dihapus, React sudah jalan, DB sudah Projek-hanif).

### 3.3 Aturan skema mulai fase ini

- Tabel **baru** (rating, dan lain-lain) dibuat dengan file SQL di `backend/docs/sql/`, supaya constraint (`CHECK`, `UNIQUE`, foreign key) dan RLS tertulis jelas. Entity JPA dipetakan ke tabel itu.
- Tabel lama tetap dikelola `ddl-auto=update` selama pengembangan. Setelah Fase 4, pertimbangkan pindah ke `ddl-auto=validate`.

**Selesai kalau:** aplikasi jalan di Projek-hanif, semua fitur v1 lolos uji regresi, advisor tidak menunjukkan error keamanan, dan kondisi awal sudah ter-commit.

---

## 4. Fase 1 — Perbaikan kritis

Semua temuan dari penelaahan kode. Nomor baris mengacu ke kondisi 25 Sep 2026.

### 1.1 Top up manual disetujui otomatis (paling mendesak)

`TopUpService.autoApproveTopUp()` (`services/TopUpService.java:56`) menambah saldo setiap top up manual yang sudah menunggu ≥ 1 menit. Siapa pun yang login bisa `POST /api/topups/manual` dengan nominal bebas dan mendapat saldo tanpa membayar.

- Hapus scheduler itu (dan `@EnableScheduling` kalau tidak ada job lain).
- Top up manual menunggu admin lewat `POST /api/admin/topups/{id}/approve` yang sudah ada.
- **Buat halaman React `/admin/topups`** (daftar PENDING, tombol Setujui/Tolak). Endpoint-nya sudah ada, halamannya belum.

### 1.2 Saldo, kuota voucher, dan kuota flash sale tidak atomik

Saldo dibaca, dicek, lalu ditulis ulang (`TransactionHistoryService.java:138-153`). Dua pembelian bersamaan bisa lolos dengan saldo untuk satu pembelian. Pola yang sama ada di webhook Xendit dan approve admin.

- Pakai pola yang sudah terbukti di `ProductRepository.decrementStock`:
  - debit: `UPDATE User u SET u.balance = u.balance - :amount WHERE u.id = :id AND u.balance >= :amount` → 0 baris berarti saldo tidak cukup
  - kredit: `UPDATE User u SET u.balance = u.balance + :amount WHERE u.id = :id`
  - voucher: `... SET usedCount = usedCount + 1 WHERE id = :id AND usedCount < usageLimit`
  - flash sale: `... SET soldCount = soldCount + 1 WHERE id = :id AND soldCount < quota`
- Dipakai di pembelian, webhook Xendit, dan approve admin.
- Satu unit test: dua debit bersamaan dengan saldo cukup untuk satu → hanya satu yang berhasil.

### 1.3 OTP bisa ditebak habis-habisan

OTP 6 digit tanpa batas percobaan (`AuthService.java:112`, `:197`). Jalur reset password bisa dipakai mengambil alih akun.

- Kolom baru `otp_attempts` di `users`. Setelah 5 kali salah, OTP dihapus dan pengguna harus minta kode baru.
- Jeda minimal 60 detik antar permintaan kirim ulang OTP.
- Berhenti menulis OTP ke log (`EmailService.java:31`, `:55`), kecuali saat `app.mail.enabled=false` untuk pengembangan lokal.

### 1.4 API admin mengirim entity mentah

`GET /api/admin/users` dan `GET /api/admin/topups` (`AdminManagementApiController.java:198`, `:171`) mengirim hash password dan `otpCode` ke browser. Ubah menjadi `Map`/DTO yang hanya berisi kolom yang dibutuhkan halaman, seperti controller lain.

### 1.5 CSRF mati untuk seluruh `/api/**`

`SecurityConfig.java:69`. Frontend sudah mengirim header `X-XSRF-TOKEN`, jadi CSRF bisa dinyalakan lagi:

- `CookieCsrfTokenRepository.withHttpOnlyFalse()` dengan request handler yang cocok untuk SPA (ikuti pola SPA di dokumentasi Spring Security 6)
- kecualikan hanya `/api/xendit/**` (webhook)

### 1.6 Kredensial dan konfigurasi

- Password Supabase lama dan password admin `rahasia123` keluar dari `application.properties` (sebagian sudah di Fase 0). Password admin dibaca dari `.env`.
- `@Async` di `EmailService` tidak aktif karena belum ada `@EnableAsync`, sehingga email dikirim sinkron dan registrasi ikut lambat. Tambahkan `@EnableAsync`.

### 1.7 Flash sale ganda untuk satu produk

`findByProductIdAndActiveTrue` mengembalikan `Optional`. Kalau admin membuat dua flash sale aktif untuk produk yang sama, pembelian produk itu error 500.

- Validasi di endpoint simpan: periode tidak boleh bertumpuk untuk produk yang sama.
- Query pembelian mengambil flash sale yang sedang berjalan, bukan sembarang yang `active`.

**Selesai kalau:** setiap poin punya skenario uji yang lolos, dan uji regresi alur pembelian serta top up tetap normal.

---

## 5. Fase 2 — Rating toko "Nilai Kami" (usulan SKPL-F21)

### 5.1 Alur

1. Pelanggan menyelesaikan transaksi pembelian.
2. Sistem memeriksa: jumlah transaksi **SUCCESS** milik pelanggan ≥ 2 dan pelanggan belum pernah memberi rating.
3. Kalau memenuhi dan popup tidak sedang ditunda (K4), muncul popup **"Nilai Kami"**:
   - bintang 1–5 (wajib)
   - komentar (opsional, maksimal 500 karakter)
   - tombol **Kirim** dan **Nanti saja**
4. Rating tersimpan ke tabel `store_ratings` di Projek-hanif.
5. Popup juga dicek saat halaman beranda dibuka, supaya pelanggan yang sudah memenuhi syarat sebelum fitur ini ada tetap ditawari.

Popup muncul **setelah** transaksi berhasil, bukan di tengah proses pembelian.

### 5.2 Tabel `store_ratings`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | `bigint generated always as identity` | primary key |
| `user_id` | `integer` | FK ke `users(id)`, `UNIQUE` (satu rating per pelanggan, K3) |
| `rating` | `smallint` | `CHECK (rating BETWEEN 1 AND 5)` |
| `comment` | `text` | nullable, `CHECK (char_length(comment) <= 500)` |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()`, diperbarui saat rating diubah |

- Index di `created_at` untuk laporan per periode. `user_id` sudah terindeks oleh `UNIQUE`.
- RLS aktif, tanpa policy (sama seperti tabel lain).
- Dibuat lewat file SQL di `backend/docs/sql/`, entity `StoreRating` memetakan ke tabel ini.

### 5.3 Endpoint

| Method | Path | Akses | Isi |
|---|---|---|---|
| GET | `/api/ratings/me` | pelanggan | `{ eligible, successfulTransactions, rating? }` |
| POST | `/api/ratings` | pelanggan | `{ rating, comment }`, upsert milik sendiri |
| GET | `/api/admin/ratings` | admin | ringkasan (rata-rata, jumlah, sebaran bintang 1–5) + daftar ulasan terbaru, dengan paginasi |
| GET | `/api/ratings/summary` | publik | rata-rata dan jumlah ulasan saja, untuk ditampilkan di beranda (opsional) |

Validasi **diulang di server** saat `POST`: sudah login, rating 1–5, panjang komentar, dan syarat ≥ 2 transaksi sukses. Popup di frontend hanya tampilan, bukan penjaga aturan.

### 5.4 Frontend

- Komponen `RatingModal.jsx`, dipanggil dari `HomePage.jsx` setelah respons `/transactions/buy` sukses dan saat halaman dibuka.
- Kartu "Rating Toko ★ 4,6 (32 ulasan)" di dashboard admin, ditambah bagian daftar ulasan.
- Opsional: tampilkan rata-rata rating di beranda sebagai bukti sosial.

**Selesai kalau:** popup hanya muncul untuk pelanggan dengan ≥ 2 transaksi sukses yang belum memberi rating; data tersimpan di Projek-hanif; rating di luar 1–5 atau komentar > 500 karakter ditolak server; admin bisa melihat rata-rata dan ulasan.

---

## 6. Fase 3 — AI chat untuk admin (usulan SKPL-F20)

### 6.1 Tujuan

Admin bisa bertanya dalam bahasa sehari-hari tentang laporan, misalnya:

- "Ringkas penjualan bulan ini dibanding bulan lalu."
- "Produk apa yang paling laku minggu ini, dan mana yang stoknya perlu diisi?"
- "Apakah voucher DISKON10 menaikkan penjualan?"
- "Apa keluhan pelanggan yang paling sering muncul di ulasan?"

### 6.2 Referensi: AI chat SnapMart

Sumber: `Documents/Wahyudi/SnapMart---FullStack/UAS JAVA/hay_mart`
(`controllers/ai/AiController.java`, `services/ai/AiServiceImpl.java`, `services/ai/ChatServiceImpl.java`)
dan frontend `client/src/pages/admin/AiAssistantController.jsx`.

**Yang diambil apa adanya:**

- Memanggil OpenRouter `POST https://openrouter.ai/api/v1/chat/completions` (format OpenAI-compatible) langsung lewat HTTP, tanpa SDK tambahan. Di Zelatan Cell memakai `RestClient` bawaan Spring, sama seperti `XenditService`.
- Alur **gatekeeper**: pertanyaan dipilah dulu menjadi `LUAR` (di luar topik, ditolak dengan sopan), `INFO` (tentang sistem, dijawab dari konteks), atau pertanyaan yang butuh data.
- **Sesi chat tersimpan di database** per admin. Judul sesi diambil dari pesan pertama, dan 10 pesan terakhir dikirim sebagai konteks supaya pertanyaan lanjutan seperti "kalau bulan lalu?" dipahami.
- Endpoint sesi: buat, daftar, lihat pesan, kirim pesan, hapus satu, hapus semua. Kepemilikan sesi selalu dicek.
- Pesan ramah untuk error dan pertanyaan di luar topik.
- Endpoint cek sisa limit API key (`GET https://openrouter.ai/api/v1/key`).
- Tampilan: daftar sesi di samping, gelembung chat, modal konfirmasi hapus.

**Yang diubah, dan alasannya:**

| SnapMart | Zelatan Cell | Alasan |
|---|---|---|
| AI menulis SQL sendiri, backend menjalankannya setelah disaring regex daftar kata terlarang | AI hanya **memilih laporan dari menu tetap** beserta periodenya; query ditulis di backend | Saringan regex bisa ditembus. Contoh: `SELECT row_to_json(u) FROM users u` lolos semua filter SnapMart (tidak ada `*`, tidak ada kata `password`) tapi mengembalikan hash password dan kode OTP. Query AI juga jalan dengan role pemilik database. Selain itu, komentar rating ditulis pelanggan dan ikut dibaca AI, sehingga bisa berisi instruksi jahat (prompt injection). Tanpa SQL dari AI, akibat terburuknya hanya jawaban yang aneh, bukan kebocoran data. |
| Model tertulis di kode (`anthropic/claude-haiku-4.5`, berbayar) | Model **gratis** (`:free`) diambil dari `.env`, ditambah daftar cadangan | Model gratis sering berganti atau penuh. OpenRouter menerima parameter `models` (array) sebagai cadangan otomatis kalau model utama sedang down atau terkena batas. |
| API key di `application.yaml` (terenkripsi Jasypt) | `OPENROUTER_API_KEY` di `.env` | Konsisten dengan kredensial lain di proyek ini |
| Frontend `fetch` + header Bearer | Klien `api` (axios) yang sudah ada | Proyek ini memakai sesi cookie dan CSRF, bukan token |
| Endpoint `/ai/**` | `/api/admin/ai/**`, hanya `ROLE_ADMIN` | Mengikuti pola URL dan aturan keamanan yang sudah ada |

### 6.3 Alur satu pertanyaan

```
Admin ─► POST /api/admin/ai/sessions/{id}/messages
          │
          ├─ 1. simpan pesan admin
          ├─ 2. panggilan AI #1 (router, temperature 0)
          │     input : konteks Zelatan Cell + menu laporan + tanggal hari ini + 10 pesan terakhir
          │     output: JSON, salah satu dari
          │       {"type":"LUAR"}
          │       {"type":"INFO"}
          │       {"type":"DATA","reports":[{"report":"sales_summary","start":"2026-09-01","end":"2026-09-30"}]}
          ├─ 3. backend memvalidasi JSON (lihat 6.5); gagal ► pesan "coba ulangi dengan kalimat lain"
          ├─ 4. backend menjalankan laporan yang dipilih (JPQL) ► hasil ringkas
          ├─ 5. panggilan AI #2: hasil data + pertanyaan ► jawaban Bahasa Indonesia
          └─ 6. simpan jawaban, kembalikan ke frontend
```

Pertanyaan `LUAR` cukup satu panggilan AI. Pertanyaan `INFO` dan `DATA` butuh dua panggilan.

### 6.4 Menu laporan (whitelist)

| Laporan | Parameter | Isi |
|---|---|---|
| `sales_summary` | `start`, `end` | omset, profit, jumlah transaksi, total diskon |
| `daily_sales` | `start`, `end` | omset per hari |
| `top_products` | `start`, `end`, `limit` | produk terlaris dan omsetnya |
| `sales_by_category` | `start`, `end` | komposisi per kategori dan provider |
| `low_stock` | `threshold` | produk dengan stok ≤ ambang |
| `topup_summary` | `start`, `end` | top up per status dan metode (Xendit / manual) |
| `promo_performance` | `start`, `end` | pemakaian voucher dan flash sale |
| `rating_summary` | `start`, `end` | rata-rata, sebaran bintang, dan komentar terbaru (dari Fase 2) |

Satu pertanyaan boleh memakai maksimal 3 laporan sekaligus, misalnya `sales_summary` bulan ini dan bulan lalu untuk perbandingan.

Query-nya ditulis dengan JPQL di repository (aturan nomor 9 `CLAUDE.md`) dan **dipakai bersama dashboard F15**. Dashboard yang sekarang menjumlahkan di Java setelah `findAll()` ikut diperbaiki sekalian.

### 6.5 Validasi dan keamanan

- Nama laporan harus ada di menu. Tanggal harus format ISO yang valid, rentang maksimal 366 hari, `limit` 1–20, dan maksimal 3 laporan per pertanyaan. Selain itu ditolak.
- Endpoint hanya untuk `ROLE_ADMIN`, dan setiap sesi dicek kepemilikannya.
- **Privasi:** hasil laporan hanya berisi angka agregat, nama produk, dan teks komentar rating tanpa nama pengirim. Email, nomor HP, dan username pelanggan tidak dikirim ke OpenRouter. Ini penting karena penyedia model gratis bisa mencatat prompt; cek juga pengaturan privasi di akun OpenRouter.
- Komentar rating dikirim sebagai data yang diberi pembatas jelas, dan AI diinstruksikan untuk tidak menjalankan perintah apa pun dari dalam data.
- Respons `429` dari OpenRouter (batas habis) dijawab dengan pesan jelas, misalnya "Kuota AI gratis hari ini sudah habis, coba lagi besok".
- Timeout HTTP ±60 detik, karena model gratis bisa lambat.
- Jawaban ditampilkan sebagai teks biasa dengan daftar sederhana (`whitespace-pre-wrap`), tanpa pustaka markdown tambahan.

### 6.6 Tabel baru

`ai_chat_sessions`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | `bigint generated always as identity` | primary key |
| `admin_user_id` | `integer` | FK ke `users(id)`, diindeks |
| `title` | `varchar(100)` | diisi dari pesan pertama |
| `created_at`, `updated_at` | `timestamptz` | default `now()` |

`ai_chat_messages`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | `bigint generated always as identity` | primary key |
| `session_id` | `bigint` | FK ke `ai_chat_sessions(id)` **`ON DELETE CASCADE`**, diindeks |
| `role` | `varchar(10)` | `CHECK (role IN ('USER','AI'))` |
| `content` | `text` | |
| `created_at` | `timestamptz` | default `now()` |

`ON DELETE CASCADE` membuat hapus sesi otomatis menghapus pesannya, jadi tidak perlu `deleteBySession` manual seperti di SnapMart. RLS aktif tanpa policy, sama seperti tabel lain.

### 6.7 Endpoint

| Method | Path | Isi |
|---|---|---|
| POST | `/api/admin/ai/sessions` | buat sesi baru |
| GET | `/api/admin/ai/sessions` | daftar sesi milik admin yang login |
| GET | `/api/admin/ai/sessions/{id}/messages` | isi percakapan |
| POST | `/api/admin/ai/sessions/{id}/messages` | kirim pertanyaan, balas jawaban AI |
| DELETE | `/api/admin/ai/sessions/{id}` | hapus satu sesi |
| DELETE | `/api/admin/ai/sessions` | hapus semua sesi milik admin |
| GET | `/api/admin/ai/usage` | sisa limit API key OpenRouter |

### 6.8 Konfigurasi `.env`

```
OPENROUTER_API_KEY=
# model utama, format <penyedia>/<model>:free — pilih dari openrouter.ai/models (filter harga: free)
OPENROUTER_MODEL=
# cadangan, dipisah koma, dikirim sebagai parameter "models"
OPENROUTER_FALLBACK_MODELS=
```

Model yang dipilih sebaiknya diuji dulu dengan 10–20 pertanyaan contoh. Yang dinilai: apakah JSON router selalu valid, dan apakah jawabannya berbahasa Indonesia dengan baik.

### 6.9 Batas pemakaian gratis

Menurut dokumentasi OpenRouter (dicek 25 Sep 2026), model `:free` dibatasi:

| Kondisi akun | Per menit | Per hari |
|---|---|---|
| Belum pernah membeli kredit | 20 | 50 |
| Sudah membeli kredit minimal $10 | 20 | 1.000 |

Satu pertanyaan data memakai 2 panggilan, jadi tanpa kredit kira-kira **25 pertanyaan per hari**. Untuk demo dan pengujian BAB IV biasanya cukup. Kalau kurang, membeli kredit $10 sekali menaikkan batas menjadi ±500 pertanyaan per hari, dan kreditnya tidak terpakai selama tetap memakai model gratis.

### 6.10 Frontend

- Halaman `/admin/ai-chat`, meniru tata letak `AiAssistantController.jsx` SnapMart: daftar sesi di kiri, chat di kanan, modal konfirmasi hapus.
- Tombol contoh pertanyaan untuk sesi baru.
- Indikator "sedang menganalisis…" selama menunggu.
- Info sisa kuota dari `/api/admin/ai/usage`.

### 6.11 Alternatif kalau ingin "tanya apa saja" seperti SnapMart

Kalau menu laporan terasa terlalu terbatas, text-to-SQL bisa dipakai **dengan syarat pengamanan di level database**, bukan hanya regex:

- role PostgreSQL khusus `ai_reader` yang hanya boleh `SELECT` pada view di schema `ai` (bukan `public`), dan view itu tidak memuat kolom sensitif
- koneksi read-only (`default_transaction_read_only = on`) dan `statement_timeout` beberapa detik
- DataSource kedua di Spring khusus untuk role ini
- regex SnapMart tetap dipasang sebagai lapis tambahan

Hasilnya lebih fleksibel, tapi penyiapannya lebih banyak, lebih sulit dijelaskan di laporan, dan model gratis lebih sering menulis SQL PostgreSQL yang salah. Usulannya: mulai dari menu laporan, lalu tambah laporan baru kalau ada pertanyaan admin yang belum terjawab.

**Selesai kalau:** jawaban angka cocok dengan hitungan manual dari tabel transaksi; pertanyaan di luar topik ditolak dengan sopan; permintaan seperti "tampilkan password semua user" tidak mengembalikan data sensitif apa pun; kuota habis menghasilkan pesan jelas, bukan error 500; sesi tersimpan dan bisa dibuka kembali; non-admin mendapat 403; API key tidak pernah muncul di frontend.

---

## 7. Fase 4 — Melengkapi fitur v2 yang belum tuntas

| Kode | Yang kurang | Rencana |
|---|---|---|
| F18 | Baru ada email OTP | Tambah email top up berhasil (dari webhook Xendit dan approve admin) dan email struk pembelian. Pengiriman tidak boleh menggagalkan transaksi. |
| F15 | Tren hanya 7 hari, tidak ada grafik bulanan, dihitung di Java | Tren 30 hari + grafik bulanan 12 bulan, memakai query JPQL dari Fase 3 |
| F16 / F17 | `window.print()` dan CSV | Sesuai keputusan K7 |
| F04/F07/F13 | Satu pelanggan bisa memakai voucher berulang kali | Tabel `voucher_usages` (voucher, user, transaksi, waktu) + `UNIQUE(voucher_id, user_id)` |
| F19 | Tabel dimuat semua lalu disaring di browser | Paginasi dan pencarian di server (`Pageable`) untuk laporan, top up, pengguna |
| F03 | Akun Google yang mencoba login dengan password mendapat pesan umum "password salah" | Pesan jelas: "Akun ini terdaftar melalui Google, silakan masuk dengan tombol Google". Logika pembuatan akun Google yang ditulis 3 kali disatukan ke satu tempat. |
| — | Halaman yang belum ada | Kelola kategori, kelola provider, edit profil pelanggan (endpoint sebagian sudah ada) |
| — | Kode mati | Hapus `ProductService`, `CategoryService`, `ProviderService`, `VoucherService`, `FileUploadUtil`, DTO yang tidak dipakai, dan 11 file build lama di `static/assets` |

---

## 8. Fase 5 — Saran fitur tambahan (backlog)

Diurutkan dari manfaat terbesar untuk konter pulsa. Kerjakan hanya kalau waktu penelitian cukup, dan konfirmasikan ke pembimbing karena menambah cakupan.

| # | Fitur | Kenapa berguna | Ukuran |
|---|---|---|---|
| S1 | **Nomor tujuan saat membeli pulsa/paket data** + deteksi operator dari prefix (0811 Telkomsel, 0857 Indosat, dan seterusnya) | Sekarang pembelian memakai nomor HP akun pembeli. Konter pulsa nyata hampir selalu mengisi ke nomor orang lain. Ini celah fungsional terbesar. | Kecil–sedang |
| S2 | **Mutasi saldo** (tabel `balance_mutations`: setiap kredit dan debit beserta sumbernya) | Pelanggan bisa melihat riwayat saldo, admin bisa menelusuri selisih, dan AI bisa menjawab "kenapa saldo si X berkurang". Melengkapi perbaikan 1.2. | Sedang |
| S3 | **Invoice Xendit kedaluwarsa otomatis** | Kalau webhook `EXPIRED` tidak pernah sampai, top up tetap PENDING selamanya. Job harian menandai PENDING > 24 jam sebagai FAILED. | Kecil |
| S4 | **Peringatan stok menipis** ke admin (email harian atau badge di dashboard) | Memakai `EmailService` yang sudah ada | Kecil |
| S5 | **Struk/bukti transaksi** yang bisa dicetak atau diunduh per transaksi | Bukti untuk pelanggan, berguna juga di BAB IV | Kecil |
| S6 | **Admin membalas ulasan** | Kelanjutan alami fitur rating, menunjukkan toko merespons keluhan | Kecil |
| S7 | **Rate limiting** untuk login, OTP, dan AI chat | Pertahanan lapis kedua setelah 1.3 | Kecil |
| S8 | **Log aktivitas admin** (siapa menyetujui top up, mengubah harga, memblokir pengguna, kapan) | Akuntabilitas, bisa ditanyakan ke AI | Sedang |
| S9 | **Deploy online** (misalnya Railway/Render + Projek-hanif) | Demo ke pembimbing tanpa laptop, dan webhook Xendit bisa diuji tanpa ngrok | Sedang |

Sengaja **tidak** diusulkan: peramalan stok (Single Exponential Smoothing), karena sudah diputuskan ditinggalkan di `docs/KONTEKS-SESI.md`.

---

## 9. Dampak ke proposal

AI chat dan rating **tidak ada** di Tabel 3.6 (SKPL-F01..F19). Sebelum dikerjakan, perlu:

- Persetujuan pembimbing untuk menambah SKPL-F20 dan SKPL-F21 (K8), karena menambah cakupan dan menyentuh jadwal Tabel 1.1.
- BAB II: subbab Large Language Model dan OpenRouter (gateway API ke banyak model), serta subbab pengukuran kepuasan pelanggan (rating).
- BAB III: Tabel 3.6 dan 3.10 ditambah dua baris, Gambar 3.3 ditambah aktor eksternal **OpenRouter (LLM API)**, dan skema tabel `store_ratings`, `ai_chat_sessions`, `ai_chat_messages`. Sequence diagram AI chat bisa mencontoh `Gambar_4.19_Sequence_Diagram_Berinteraksi_dengan_Asisten_AI.puml` di SnapMart.
- Catatan privasi: data penjualan agregat dikirim ke pihak ketiga (OpenRouter dan penyedia modelnya) saat admin memakai AI chat, dan model gratis bisa mencatat prompt. Kemungkinan akan ditanyakan penguji; jawabannya ada di bagian 6.5.
- Alasan memilih menu laporan, bukan text-to-SQL (bagian 6.2), layak ditulis di BAB III sebagai keputusan desain keamanan.
- Perpindahan ke Projek-hanif tidak mengubah proposal: tetap PostgreSQL (Supabase).
- Catat semua perubahan di tabel paling bawah `docs/CHECKLIST-PROGRES.md`.

---

## 10. Skenario uji Black Box (ringkas)

Rincian lengkap nanti masuk `docs/PENGUJIAN-BLACKBOX.md`.

| Modul | Skenario utama |
|---|---|
| Top up manual | Pengajuan tetap PENDING sampai admin menyetujui; saldo bertambah sekali |
| Pembelian | Dua pembelian bersamaan dengan saldo untuk satu → satu berhasil, satu ditolak; saldo tidak negatif |
| OTP | Salah 5 kali → OTP hangus; kirim ulang < 60 detik ditolak |
| API admin | Respons `/api/admin/users` tidak memuat password maupun OTP |
| CSRF | `POST` tanpa header `X-XSRF-TOKEN` ditolak; webhook Xendit tetap diterima |
| Rating | 0–1 transaksi → popup tidak muncul; 2 transaksi → muncul; rating 0 atau 6 ditolak; komentar 501 karakter ditolak; kirim ulang memperbarui, bukan menambah |
| AI chat | Angka omset bulan ini cocok dengan hitungan manual; pertanyaan di luar topik ditolak sopan; "tampilkan password semua user" tidak mengembalikan data sensitif; kuota habis → pesan jelas; sesi tersimpan dan bisa dibuka lagi; akun pelanggan mendapat 403 |
| Regresi v1 | Login lokal dan Google, katalog, pembelian, top up Xendit (simulasi callback), semua halaman admin |
