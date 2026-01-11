const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET - Tüm fittingsleri getir
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM yari_mamul_fittingsler ORDER BY ebat_kod ASC, urun_tipi ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fittingsler getirme hatası:', error);
    res.status(500).json({ error: 'Veriler getirilemedi' });
  }
});

// GET - Logları getir
router.get('/log', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM yari_mamul_fittingsler_log ORDER BY tarih DESC LIMIT 100'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Log getirme hatası:', error);
    res.status(500).json({ error: 'Loglar getirilemedi' });
  }
});

// POST - Yeni fittings ekle
router.post('/', async (req, res) => {
  const { ebat_kod, urun_tipi, adet, kg, yapan } = req.body;

  if (!ebat_kod || !urun_tipi || yapan === undefined) {
    return res.status(400).json({ error: 'Ebat/Kod, Ürün Tipi ve yapan bilgisi zorunludur' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fittings ekle
    const insertResult = await client.query(
      `INSERT INTO yari_mamul_fittingsler (ebat_kod, urun_tipi, adet, kg)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [ebat_kod, urun_tipi, adet || 0, kg || 0]
    );

    // Log ekle
    await client.query(
      `INSERT INTO yari_mamul_fittingsler_log (islem_tipi, yapan, yeni_veri, aciklama)
       VALUES ($1, $2, $3, $4)`,
      ['ekleme', yapan, JSON.stringify(insertResult.rows[0]), `${ebat_kod} - ${urun_tipi} eklendi`]
    );

    await client.query('COMMIT');
    res.json(insertResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Fittings ekleme hatası:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Bu ürün zaten mevcut' });
    } else {
      res.status(500).json({ error: 'Fittings eklenemedi' });
    }
  } finally {
    client.release();
  }
});

// PUT - Fittings güncelle
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { ebat_kod, urun_tipi, adet, kg, yapan } = req.body;

  if (yapan === undefined) {
    return res.status(400).json({ error: 'Yapan bilgisi zorunludur' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Eski veriyi al
    const oldData = await client.query(
      'SELECT * FROM yari_mamul_fittingsler WHERE id = $1',
      [id]
    );

    if (oldData.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Fittings bulunamadı' });
    }

    // Güncelle
    const updateResult = await client.query(
      `UPDATE yari_mamul_fittingsler
       SET ebat_kod = $1, urun_tipi = $2, adet = $3, kg = $4
       WHERE id = $5
       RETURNING *`,
      [ebat_kod, urun_tipi, adet || 0, kg || 0, id]
    );

    // Log ekle
    await client.query(
      `INSERT INTO yari_mamul_fittingsler_log (islem_tipi, yapan, eski_veri, yeni_veri, aciklama)
       VALUES ($1, $2, $3, $4, $5)`,
      ['guncelleme', yapan, JSON.stringify(oldData.rows[0]), JSON.stringify(updateResult.rows[0]), `${ebat_kod} - ${urun_tipi} güncellendi`]
    );

    await client.query('COMMIT');
    res.json(updateResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Fittings güncelleme hatası:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Bu ürün kombinasyonu zaten kullanılıyor' });
    } else {
      res.status(500).json({ error: 'Fittings güncellenemedi' });
    }
  } finally {
    client.release();
  }
});

// DELETE - Fittings sil
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
      'SELECT * FROM yari_mamul_fittingsler WHERE id = $1',
      [id]
    );

    if (oldData.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Fittings bulunamadı' });
    }

    // Sil
    await client.query('DELETE FROM yari_mamul_fittingsler WHERE id = $1', [id]);

    // Log ekle
    await client.query(
      `INSERT INTO yari_mamul_fittingsler_log (islem_tipi, yapan, eski_veri, aciklama)
       VALUES ($1, $2, $3, $4)`,
      ['silme', yapan, JSON.stringify(oldData.rows[0]), `${oldData.rows[0].ebat_kod} - ${oldData.rows[0].urun_tipi} silindi`]
    );

    await client.query('COMMIT');
    res.json({ message: 'Fittings silindi' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Fittings silme hatası:', error);
    res.status(500).json({ error: 'Fittings silinemedi' });
  } finally {
    client.release();
  }
});

module.exports = router;
