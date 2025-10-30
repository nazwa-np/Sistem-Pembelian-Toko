const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'toko_db'
});

db.connect(err => {
  if (err) {
    console.error('Gagal konek ke MySQL:', err.message);
  } else {
    console.log('Terhubung ke database MySQL');
  }
});

app.get('/', (req, res) => {
  res.redirect('/admin');
});

app.get('/admin', (req, res) => {
  const queryProduk = `
    SELECT p.*, s.jumlah AS stock 
    FROM produk p 
    LEFT JOIN stock_produk s ON p.id = s.produk_id
    ORDER BY p.id
  `;
  
  db.query(queryProduk, (err, produk) => {
    if (err) {
      console.error('Error ambil produk:', err.message);
      return res.status(500).send('Kesalahan database');
    }

    const queryPembelian = `
      SELECT p.*, pr.nama_produk, pr.harga 
      FROM pembelian p 
      JOIN produk pr ON p.produk_id = pr.id 
      ORDER BY p.tanggal DESC 
      LIMIT 50
    `;
    
    db.query(queryPembelian, (err, pembelian) => {
      if (err) {
        console.error('Error ambil pembelian:', err.message);
        return res.status(500).send('Kesalahan database');
      }

      res.render('admin', { produk, pembelian });
    });
  });
});

// POST: Input Pembelian
app.post('/admin/pembelian', (req, res) => {
  const { produk_id, jumlah } = req.body;

  if (!produk_id || !jumlah || jumlah <= 0) {
    return res.status(400).json({ success: false, message: 'Data tidak valid.' });
  }

  db.query('SELECT jumlah FROM stock_produk WHERE produk_id = ?', [produk_id], (err, stockRows) => {
    if (err) return res.status(500).json({ success: false, message: 'Gagal cek stok.' });

    const stock = stockRows[0];
    if (!stock) return res.status(404).json({ success: false, message: 'Stok tidak ditemukan.' });
    if (stock.jumlah < jumlah) return res.status(400).json({ success: false, message: 'Stok tidak cukup.' });

    db.query('SELECT harga, nama_produk FROM produk WHERE id = ?', [produk_id], (err, produkRows) => {
      if (err) return res.status(500).json({ success: false, message: 'Gagal ambil produk.' });
      const produk = produkRows[0];
      if (!produk) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });

      const totalHarga = produk.harga * jumlah;

      db.beginTransaction(err => {
        if (err) throw err;

        db.query(
          'INSERT INTO pembelian (produk_id, jumlah, total_harga, status) VALUES (?, ?, ?, ?)',
          [produk_id, jumlah, totalHarga, 'aktif'],
          (err) => {
            if (err) return db.rollback(() => res.status(500).json({ success: false, message: 'Gagal menyimpan pembelian.' }));

            db.query(
              'UPDATE stock_produk SET jumlah = jumlah - ? WHERE produk_id = ?',
              [jumlah, produk_id],
              (err) => {
                if (err) return db.rollback(() => res.status(500).json({ success: false, message: 'Gagal update stok.' }));
                
                db.commit(err => {
                  if (err) return db.rollback(() => res.status(500).json({ success: false, message: 'Transaksi gagal.' }));
                  console.log(`✅ Pembelian ${produk.nama_produk} x${jumlah}`);
                  res.json({ success: true, message: `Pembelian berhasil! ${produk.nama_produk} x${jumlah}` });
                });
              }
            );
          }
        );
      });
    });
  });
});

app.post('/admin/pembelian/cancel/:id', (req, res) => {
  const pembelianId = req.params.id;

  db.query(
    'SELECT p.*, pr.nama_produk FROM pembelian p JOIN produk pr ON p.produk_id = pr.id WHERE p.id = ? AND p.status = "aktif"',
    [pembelianId],
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: 'Gagal ambil data.' });

      const pembelian = rows[0];
      if (!pembelian) return res.status(404).json({ success: false, message: 'Pembelian tidak ditemukan.' });

      db.beginTransaction(err => {
        if (err) throw err;

        db.query('UPDATE pembelian SET status = "dibatalkan" WHERE id = ?', [pembelianId], err => {
          if (err) return db.rollback(() => res.status(500).json({ success: false, message: 'Gagal batalkan.' }));

          db.query('UPDATE stock_produk SET jumlah = jumlah + ? WHERE produk_id = ?', [pembelian.jumlah, pembelian.produk_id], err => {
            if (err) return db.rollback(() => res.status(500).json({ success: false, message: 'Gagal kembalikan stok.' }));

            db.commit(err => {
              if (err) return db.rollback(() => res.status(500).json({ success: false, message: 'Transaksi gagal.' }));
              console.log(`❌ Pembelian dibatalkan: ${pembelian.nama_produk}`);
              res.json({ success: true, message: `Pembelian #${pembelianId} dibatalkan.` });
            });
          });
        });
      });
    }
  );
});

app.use((req, res) => {
  res.status(404).send('404 - Halaman tidak ditemukan');
});

app.listen(PORT, () => {
  console.log('=================================');
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log(`Admin Dashboard: http://localhost:${PORT}/admin`);
  console.log('=================================');
});
