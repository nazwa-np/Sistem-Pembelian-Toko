# 🛒 Sistem Pembelian Toko - Admin Dashboard

Sistem Pembelian Toko adalah aplikasi web berbasis **Node.js**, **Express.js**, **MySQL**, dan **EJS**, yang memungkinkan admin untuk **melihat daftar produk, memproses pembelian, dan mengelola stok** secara mudah melalui antarmuka web interaktif.

Aplikasi ini dirancang untuk mempermudah manajemen produk dan transaksi pembelian di toko, sekaligus memberikan tampilan dashboard yang bersih dan mudah digunakan.

---

## 🚀 Fitur Utama

- **Daftar Produk Lengkap** — menampilkan semua produk beserta stok dan kategori.  
- **Filter & Pencarian** — cari produk berdasarkan nama, kategori, status stok, atau urutkan sesuai kebutuhan.  
- **Input Pembelian** — admin bisa memproses pembelian langsung dari dashboard.  
- **Update Stok Otomatis** — stok produk berkurang otomatis saat pembelian, dan kembali saat pembatalan.  
- **Riwayat Pembelian** — menampilkan transaksi terakhir beserta status (aktif/dibatalkan).  
- **Batalkan Pembelian** — admin dapat membatalkan transaksi, stok akan dikembalikan otomatis.  
- **Responsif & Interaktif** — antarmuka web yang mudah digunakan dengan feedback langsung.

---

## 🧩 Teknologi yang Digunakan

| Komponen | Deskripsi |
|-----------|------------|
| **Frontend** | HTML5, CSS, JavaScript, EJS |
| **Backend** | Node.js + Express.js |
| **Database** | MySQL / MariaDB |

---

## ⚙️ Instalasi dan Menjalankan Proyek

### 1️⃣ Clone atau Unduh Proyek
Salin repositori ini ke komputer lokal kamu.

### 2️⃣ Instal Dependensi
Pastikan Node.js dan npm sudah terpasang, lalu jalankan
```npm install```

### 3️⃣ Konfigurasi Database
Buat database MySQL bernama `toko_db` dan buat tabel sesuai kebutuhan:
- **produk** 
- **stock_produk** 
- **pembelian**
- Sesuaikan konfigurasi koneksi MySQL di `app.js`

### 4️⃣ Menjalankan Server
Jalankan aplikasi dengan perintah `node app.js`

---
## 🧠 Cara Kerja Singkat

1. Admin membuka dashboard `/admin`.
2. Daftar produk ditampilkan lengkap dengan stok dan harga.
3. Admin dapat memfilter produk berdasarkan kategori, stok, atau urutan.
4. Saat pembelian diproses, stok akan otomatis berkurang, dan data transaksi tersimpan di database.
5. Riwayat pembelian menampilkan transaksi terbaru, beserta tombol untuk membatalkan jika diperlukan.
6. Jika pembatalan dilakukan, stok produk otomatis dikembalikan.

---
"Terima kasih telah melihat proyek saya! Portofolio ini akan terus berkembang seiring saya menyelesaikan lebih banyak proyek, meningkatkan keterampilan"
