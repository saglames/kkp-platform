const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET - Tüm jointleri getir
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM yari_mamul_jointler ORDER BY urun ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Jointler getirme hatası:', error);
    res.status(500).json({ error: 'Veriler getirilemedi' });
  }
});

// GET - Logları getir
router.get('/log', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM yari_mamul_jointler_log ORDER BY tarih DESC LIMIT 100'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Log getirme hatası:', error);
    res.status(500).json({ error: 'Loglar getirilemedi' });
  }
});

// POST - Yeni joint ekle
router.post('/', async (req, res) => {
  const { urun, a_adet, b_adet, c_adet, d_adet, kg, yapan } = req.body;

  if (!urun || yapan === undefined) {
    return res.status(400).json({ error: 'Ürün adı ve yapan bilgisi zorunludur' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Joint ekle
    const insertResult = await client.query(
      `INSERT INTO yari_mamul_jointler (urun, a_adet, b_adet, c_adet, d_adet, kg)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [urun, a_adet || 0, b_adet || 0, c_adet || 0, d_adet || 0, kg || 0]
    );

    // Log ekle
    await client.query(
      `INSERT INTO yari_mamul_jointler_log (islem_tipi, yapan, yeni_veri, aciklama)
       VALUES ($1, $2, $3, $4)`,
      ['ekleme', yapan, JSON.stringify(insertResult.rows[0]), `${urun} ürünü eklendi`]
    );

    await client.query('COMMIT');
    res.json(insertResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Joint ekleme hatası:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Bu ürün zaten mevcut' });
    } else {
      res.status(500).json({ error: 'Joint eklenemedi' });
    }
  } finally {
    client.release();
  }
});

// PUT - Joint güncelle
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { urun, a_adet, b_adet, c_adet, d_adet, kg, yapan } = req.body;

  if (yapan === undefined) {
    return res.status(400).json({ error: 'Yapan bilgisi zorunludur' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Eski veriyi al
    const oldData = await client.query(
      'SELECT * FROM yari_mamul_jointler WHERE id = $1',
      [id]
    );

    if (oldData.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Joint bulunamadı' });
    }

    // Güncelle
    const updateResult = await client.query(
      `UPDATE yari_mamul_jointler
       SET urun = $1, a_adet = $2, b_adet = $3, c_adet = $4, d_adet = $5, kg = $6
       WHERE id = $7
       RETURNING *`,
      [urun, a_adet || 0, b_adet || 0, c_adet || 0, d_adet || 0, kg || 0, id]
    );

    // Log ekle
    await client.query(
      `INSERT INTO yari_mamul_jointler_log (islem_tipi, yapan, eski_veri, yeni_veri, aciklama)
       VALUES ($1, $2, $3, $4, $5)`,
      ['guncelleme', yapan, JSON.stringify(oldData.rows[0]), JSON.stringify(updateResult.rows[0]), `${urun} ürünü güncellendi`]
    );

    await client.query('COMMIT');
    res.json(updateResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Joint güncelleme hatası:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Bu ürün adı zaten kullanılıyor' });
    } else {
      res.status(500).json({ error: 'Joint güncellenemedi' });
    }
  } finally {
    client.release();
  }
});

// DELETE - Joint sil
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { yapan } = req.body;

  if (yapan === undefined) {
    return res.status(400).json({ error: 'Yapan bilgisi zorunludur' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Eski veriyi al
    const oldData = await client.query(
      'SELECT * FROM yari_mamul_jointler WHERE id = $1',
      [id]
    );

    if (oldData.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Joint bulunamadı' });
    }

    // Sil
    await client.query('DELETE FROM yari_mamul_jointler WHERE id = $1', [id]);

    // Log ekle
    await client.query(
      `INSERT INTO yari_mamul_jointler_log (islem_tipi, yapan, eski_veri, aciklama)
       VALUES ($1, $2, $3, $4)`,
      ['silme', yapan, JSON.stringify(oldData.rows[0]), `${oldData.rows[0].urun} ürünü silindi`]
    );

    await client.query('COMMIT');
    res.json({ message: 'Joint silindi' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Joint silme hatası:', error);
    res.status(500).json({ error: 'Joint silinemedi' });
  } finally {
    client.release();
  }
});

module.exports = router;
