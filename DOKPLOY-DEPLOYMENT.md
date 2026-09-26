# Panduan Deployment Dokploy & Integrasi Webhook Xendit

Dokumen ini memandu langkah-langkah deployment aplikasi **Zelatan Cell** ke VPS menggunakan **Dokploy** dan konfigurasi **Webhook Xendit**.

---

## 1. Arsitektur Single-Container di Dokploy

Aplikasi ini menggunakan pendekatan **Multi-Stage Docker Container**:
1. **Frontend (React + Vite)** di-build menjadi file statis HTML/CSS/JS.
2. File statis tersebut disatukan ke dalam jar **Spring Boot** (disajikan via `SpaFallbackConfig`).
3. Dijalankan dalam **1 container tunggal** (port `8080`).

**Keuntungan:**
- Hanya perlu 1 service di Dokploy.
- Bebas CORS dan cookie session (`JSESSIONID`, `XSRF-TOKEN`) aman karena berjalan dalam *single-origin*.
- Hemat RAM VPS (hanya ~350 MB).

---

## 2. Langkah Deployment di Dokploy

### Langkah 1: Push Branch Production ke GitHub
Pastikan branch `production` sudah di-push ke repositori GitHub:
```bash
git push -u origin production
```

### Langkah 2: Buat Application / Compose di Dokploy
1. Buka dashboard Dokploy di browser Anda (`https://dokploy.vps-anda.com`).
2. Masuk ke Project Anda, lalu klik **Create Service** (pilih **Compose** atau **Application**).
3. Beri nama aplikasi, misalnya: `zelatan-cell`.
4. Pada tab **General / Source**:
   - **Source Type:** GitHub
   - **Repository:** `Yuuashura/zlatan-cell`
   - **Branch:** `main`
   - **Build Type:** `Compose` (menggunakan `docker-compose.yml`) atau `Dockerfile`
   - **Dockerfile Path:** `/Dockerfile`
   - **Context Path:** `/`

### Langkah 3: Konfigurasi Port & Domain
1. Pada tab **General / Network**:
   - **Port:** `8080`
2. Pada tab **Domains**:
   - Klik **Create Domain**.
   - Masukkan domain/subdomain Anda (misal: `konter.domainanda.com` atau `zelatan.my.id`).
   - Pastikan DNS domain (A Record) sudah mengarah ke IP VPS Anda.
   - Aktifkan fitur **HTTPS (Let's Encrypt / SSL)**.

### Langkah 4: Isi Environment Variables
1. Masuk ke tab **Environment** di aplikasi Dokploy.
2. Salin isi file `.env.production.example` dan sesuaikan nilainya:
   - Ganti `APP_BASE_URL` dan `APP_URL` dengan domain Anda (contoh: `https://zelatan.my.id`).
   - Masukkan kredensial database Supabase Anda (`SUPABASE_DB_HOST`, `SUPABASE_DB_USER`, `SUPABASE_DB_PASSWORD`).
   - Masukkan `XENDIT_API_KEY` dan `XENDIT_CALLBACK_TOKEN`.
   - Masukkan `ADMIN_USERNAME` dan `ADMIN_PASSWORD`.
   - Simpan (*Save*).

### Langkah 5: Deploy
1. Klik tombol **Deploy** di Dokploy.
2. Dokploy akan meng-clone branch `production`, menjalankan build Dockerfile multi-stage, dan menjalankan container.
3. Pantau log build dan pastikan status aplikasi menjadi **Running**.

---

## 3. Konfigurasi Webhook Xendit & Ngrok

Karena Anda menggunakan domain statis Ngrok (`https://stinging-usual-risotto.ngrok-free.dev`), tunnel ini dapat berjalan secara otomatis melalui container Docker maupun langsung diakses Xendit tanpa perlu membeli domain kustom!

1. Buka [Dashboard Xendit](https://dashboard.xendit.co).
2. Masuk ke menu **Settings** > **Developers** > **Webhooks**.
3. Di bagian **Webhook URL**:
   - Pilih event: **Invoice paid** (dan invoice expired/created).
   - Masukkan URL webhook publik Ngrok Anda:
     ```
     https://stinging-usual-risotto.ngrok-free.dev/api/xendit/callback
     ```
4. Di bagian **Verification token**:
   - Salin token verifikasi yang tertera di dashboard Xendit.
   - Tempel (*paste*) nilai token tersebut ke variabel **`XENDIT_CALLBACK_TOKEN`** di tab Environment Dokploy.
5. Klik **Save Changes** / **Test Webhook**.
   - Respon yang dikembalikan aplikasi adalah **200 OK**.

---

## 4. Konfigurasi Redirect Payment (Kembali ke Website Setelah Bayar)

Alur redirect sudah tertanam otomatis di aplikasi menggunakan variabel `APP_URL`:
- **Top Up Saldo:** setelah bayar di Xendit, pelanggan otomatis diarahkan kembali ke:
  `https://stinging-usual-risotto.ngrok-free.dev/topup/status/{externalId}`
- **Beli Produk Langsung:** setelah bayar, pelanggan diarahkan kembali ke:
  `https://stinging-usual-risotto.ngrok-free.dev/pesanan/{externalId}`

Pastikan variabel `APP_URL` dan `APP_BASE_URL` di Dokploy diset:
```env
APP_BASE_URL=https://stinging-usual-risotto.ngrok-free.dev
APP_URL=https://stinging-usual-risotto.ngrok-free.dev
```

---

## 5. Menjalankan via Dokploy (Compose vs Application)

Anda memiliki 2 cara mudah di Dokploy:

### Opsi 1: Dokploy Compose (Direkomendasikan Jika Ingin Ngrok Otomatis Jalan di VPS)
1. Di Dokploy, pilih **Create Service** > **Compose**.
2. Hubungkan ke GitHub repo `Yuuashura/zlatan-cell`, pilih branch `main`.
3. Dokploy akan membaca `docker-compose.yml` yang menjalankan container `app` (Spring Boot + React) dan container `ngrok` secara berdampingan.
4. Ngrok akan otomatis membuat tunnel ke `https://stinging-usual-risotto.ngrok-free.dev` 24/7!

### Opsi 2: Dokploy Application (Single Container)
1. Di Dokploy, pilih **Create Application**.
2. Pilih Build Type **Dockerfile** (port 8080).
3. Jika VPS Anda sudah punya domain atau ingin di-tunnel manual, cukup masukkan domain di menu Domains Dokploy.

---

## 5. Konfigurasi Google OAuth2 (Jika Menggunakan Login Google)

Jika fitur login Google aktif:
1. Masuk ke [Google Cloud Console](https://console.cloud.google.com/).
2. Buka menu **APIs & Services** > **Credentials**.
3. Pilih Client ID aplikasi web Anda.
4. Pada bagian **Authorized redirect URIs**, tambahkan:
   ```
   https://<domain-anda.com>/login/oauth2/code/google
   ```
5. Simpan perubahan.
