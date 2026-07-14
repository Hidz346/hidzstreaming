# 🚀 HidzStreaming - Platform Streaming Anime & Komik Modern

Selamat datang di *Source Code* **HidzStreaming**! Ini adalah platform modern berbasis Next.js untuk menonton Anime, Donghua, membaca Komik, serta membaca Novel — murni untuk browsing dan streaming konten, tanpa sistem akun/login.

Ikuti panduan di bawah ini langkah demi langkah untuk melakukan instalasi hingga mendeploy (*online*-kan) web ini ke Vercel.

---

## 🛠️ Persiapan Awal (Requirements)
Sebelum mulai, pastikan Anda sudah memiliki:
1. Akun [GitHub](https://github.com/) (Untuk menyimpan source code)
2. Akun [Vercel](https://vercel.com/) (Untuk Hosting / Deploy Web)
3. [Node.js](https://nodejs.org/) terinstall di laptop/PC Anda (Jika ingin menjalankan di komputer lokal)

---

## 💻 Langkah 1: Menjalankan Web di Komputer (Lokal)

Jika Anda ingin mencoba atau mengedit webnya di komputer sendiri:

1. Ekstrak *source code* yang sudah Anda download.
2. Buka folder tersebut di *Code Editor* (contoh: **VS Code**).
3. Buka **Terminal** di dalam VS Code (tekan `Ctrl` + `~`).
4. Jalankan perintah instalasi paket:
   ```bash
   npm install
   ```
5. Setelah selesai, jalankan website:
   ```bash
   npm run dev
   ```
6. Buka browser dan pergi ke `http://localhost:3000`. Web HidzStreaming Anda sudah berjalan!

---

## 🚀 Langkah 2: Deploy ke Vercel (Online-kan Website)

Agar web Anda bisa diakses oleh semua orang di internet (online), kita akan menggunakan Vercel.

### A. Upload Code ke GitHub
1. Buka [GitHub](https://github.com/) dan buat *Repository* baru (Public atau Private).
2. Upload seluruh source code ini ke repository GitHub tersebut. *(Jika Anda bingung, cari tutorial "Cara upload project Next.js ke GitHub")*.

### B. Deploy dari Vercel
1. Buka [Vercel](https://vercel.com/) dan login menggunakan akun GitHub Anda.
2. Klik tombol **"Add New..."** > **"Project"**.
3. Vercel akan menampilkan daftar repository GitHub Anda. Cari repository HidzStreaming yang baru Anda upload, lalu klik **"Import"**.
4. Klik tombol biru **"Deploy"**. Tidak ada Environment Variable yang perlu diisi karena web ini tidak lagi menggunakan database/akun.
5. Tunggu sekitar 2-5 menit. Vercel sedang mem-build web Anda.
6. Selesai! Vercel akan memberikan link/URL gratis (contoh: `hidzstreaming.vercel.app`) untuk web Anda.

---

## ❓ Troubleshooting (Masalah yang Sering Terjadi)

- **Error saat Deploy di Vercel?**
  Pastikan `npm install` berjalan tanpa error di komputer lokal Anda terlebih dahulu sebelum melakukan deploy.
- **Gambar Donghua/Anime/Komik/Novel tidak muncul?**
  Web ini menggunakan API *scraping* pihak ketiga untuk seluruh datanya (Anime, Donghua, Komik, Novel). Jika gambar atau data tidak muncul, kemungkinan sumber aslinya sedang down atau mengganti sistem proteksinya.

🎉 **Selamat menikmati platform streaming Anda sendiri!**
