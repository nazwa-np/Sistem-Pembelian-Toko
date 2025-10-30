-- Buat Database
CREATE DATABASE IF NOT EXISTS toko_db;
USE toko_db;

-- Tabel Produk
CREATE TABLE IF NOT EXISTS produk (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_produk VARCHAR(100) NOT NULL,
  kategori VARCHAR(50),
  harga DECIMAL(12,2) NOT NULL
);

-- Tabel Stock Produk
CREATE TABLE IF NOT EXISTS stock_produk (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produk_id INT NOT NULL,
  jumlah INT NOT NULL DEFAULT 0,
  FOREIGN KEY (produk_id) REFERENCES produk(id) ON DELETE CASCADE
);

-- Tabel Pembelian
CREATE TABLE IF NOT EXISTS pembelian (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produk_id INT NOT NULL,
  jumlah INT NOT NULL,
  total_harga DECIMAL(12,2) NOT NULL,
  tanggal TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('aktif','dibatalkan') DEFAULT 'aktif',
  FOREIGN KEY (produk_id) REFERENCES produk(id) ON DELETE CASCADE
);

-- Data Awal Produk Furniture
INSERT INTO produk (nama_produk, kategori, harga) VALUES
('Meja Makan Kayu Jati', 'Meja', 2500000),
('Kursi Sofa 2 Dudukan', 'Sofa', 1800000),
('Lemari Pakaian 3 Pintu', 'Lemari', 3200000),
('Rak Buku Minimalis', 'Rak', 950000),
('Tempat Tidur Queen Size', 'Tempat Tidur', 4200000),
('Meja Belajar Anak', 'Meja', 750000),
('Kursi Kantor Ergonomis', 'Kursi', 1250000),
('Meja TV Modern', 'Meja', 1600000),
('Kabinet Dapur Putih', 'Kabinet', 2800000),
('Cermin Dinding Bulat', 'Dekorasi', 450000);

-- Data Awal Stock Produk
INSERT INTO stock_produk (produk_id, jumlah) VALUES
(1, 10),
(2, 15),
(3, 8),
(4, 20),
(5, 6),
(6, 12),
(7, 18),
(8, 10),
(9, 7),
(10, 25);

