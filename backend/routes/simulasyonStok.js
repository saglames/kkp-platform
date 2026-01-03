const express = require('express');
const router = express.Router();
const pool = require('../db');

// Tüm simülasyon stoklarını getir
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM simulasyon_stok ORDER BY malzeme_turu ASC, urun_adi ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Simülasyon stok getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Malzeme türüne göre getir
router.get('/:malzeme_turu', async (req, res) => {
  const { malzeme_turu } = req.params;
  try {
    const result = await pool.query('SELECT * FROM simulasyon_stok WHERE malzeme_turu = $1 ORDER BY urun_adi ASC', [malzeme_turu]);
    res.json(result.rows);
  } catch (error) {
    console.error('Simülasyon stok getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Simülasyon stok ekle
router.post('/', async (req, res) => {
  const { malzeme_turu, urun_adi, olculeri, mevcut_adet, ekleyen } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO simulasyon_stok (malzeme_turu, urun_adi, olculeri, mevcut_adet, ekleyen)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [malzeme_turu, urun_adi, olculeri, mevcut_adet || 0, ekleyen]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Simülasyon stok ekleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Simülasyon stok güncelle
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { malzeme_turu, urun_adi, olculeri, mevcut_adet, ekleyen } = req.body;
  try {
    const result = await pool.query(
      `UPDATE simulasyon_stok SET
       malzeme_turu = $1, urun_adi = $2, olculeri = $3, mevcut_adet = $4, ekleyen = $5,
       son_guncelleme = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [malzeme_turu, urun_adi, olculeri, mevcut_adet, ekleyen, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Simülasyon stok güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Simülasyon stok değiştir (ekle/çıkar)
router.post('/:id/stok-degistir', async (req, res) => {
  const { id } = req.params;
  const { eklenen_adet, kullanilan_adet, yapan, sebep } = req.body;

  try {
    const currentStock = await pool.query('SELECT mevcut_adet FROM simulasyon_stok WHERE id = $1', [id]);
    if (currentStock.rows.length === 0) {
      throw new Error('Ürün bulunamadı');
    }

    const oldStock = currentStock.rows[0].mevcut_adet;
    let newStock = oldStock;
    let islemTuru = '';
    let miktar = 0;

    if (eklenen_adet && eklenen_adet > 0) {
      newStock += eklenen_adet;
      islemTuru = 'ekleme';
      miktar = eklenen_adet;
    }
    if (kullanilan_adet && kullanilan_adet > 0) {
      newStock -= kullanilan_adet;
      islemTuru = 'kullanim';
      miktar = kullanilan_adet;
    }

    const result = await pool.query(
      'UPDATE simulasyon_stok SET mevcut_adet = $1, son_guncelleme = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [newStock, id]
    );

    // Hareket logunu kaydet
    if (islemTuru && yapan) {
      await pool.query(
        `INSERT INTO simulasyon_stok_hareket_log (stok_id, islem_turu, miktar, onceki_stok, yeni_stok, yapan, sebep)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, islemTuru, miktar, oldStock, newStock, yapan, sebep]
      );
    }

    res.json({ success: true, oldStock, newStock, item: result.rows[0] });
  } catch (error) {
    console.error('Simülasyon stok değiştirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stok hareket loglarını getir
router.get('/:id/hareket-log', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM simulasyon_stok_hareket_log WHERE stok_id = $1 ORDER BY tarih DESC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Stok hareket log getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Simülasyon stok sil
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM simulasyon_stok WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Simülasyon stok silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Malzeme türüne göre özet
router.get('/stats/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT malzeme_turu, COUNT(*) as urun_sayisi, SUM(mevcut_adet) as toplam_adet
      FROM simulasyon_stok
      GROUP BY malzeme_turu
      ORDER BY malzeme_turu
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Özet istatistik hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
