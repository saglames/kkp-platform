const express = require('express');
const router = express.Router();
const pool = require('../db');

// Tüm kesim ölçülerini getir
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM kesim_olculeri
      ORDER BY model, alt_grup, parca
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Kesim ölçüleri getirme hatası:', error);
    res.status(500).json({ error: 'Kesim ölçüleri getirilemedi' });
  }
});

// Modellere göre gruplanmış liste
router.get('/modeller', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT model FROM kesim_olculeri ORDER BY model
    `);
    res.json(result.rows.map(row => row.model));
  } catch (error) {
    console.error('Modeller getirme hatası:', error);
    res.status(500).json({ error: 'Modeller getirilemedi' });
  }
});

// Belirli bir modele ait kesim ölçüleri
router.get('/model/:model', async (req, res) => {
  try {
    const { model } = req.params;
    const result = await pool.query(`
      SELECT * FROM kesim_olculeri
      WHERE model = $1
      ORDER BY alt_grup, parca
    `, [model]);
    res.json(result.rows);
  } catch (error) {
    console.error('Model kesim ölçüleri getirme hatası:', error);
    res.status(500).json({ error: 'Model kesim ölçüleri getirilemedi' });
  }
});

// Yeni kesim ölçüsü ekle
router.post('/', async (req, res) => {
  try {
    const {
      model,
      alt_grup,
      parca,
      dis_cap,
      et_kalinligi,
      uzunluk,
      genisletme,
      punch,
      birim_agirlik
    } = req.body;

    const result = await pool.query(`
      INSERT INTO kesim_olculeri (
        model, alt_grup, parca, dis_cap, et_kalinligi,
        uzunluk, genisletme, punch, birim_agirlik
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [model, alt_grup, parca, dis_cap, et_kalinligi, uzunluk, genisletme, punch, birim_agirlik]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Kesim ölçüsü ekleme hatası:', error);
    res.status(500).json({ error: 'Kesim ölçüsü eklenemedi' });
  }
});

// Kesim ölçüsü güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      model,
      alt_grup,
      parca,
      dis_cap,
      et_kalinligi,
      uzunluk,
      genisletme,
      punch,
      birim_agirlik
    } = req.body;

    const result = await pool.query(`
      UPDATE kesim_olculeri
      SET model = $1, alt_grup = $2, parca = $3, dis_cap = $4,
          et_kalinligi = $5, uzunluk = $6, genisletme = $7,
          punch = $8, birim_agirlik = $9
      WHERE id = $10
      RETURNING *
    `, [model, alt_grup, parca, dis_cap, et_kalinligi, uzunluk, genisletme, punch, birim_agirlik, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kesim ölçüsü bulunamadı' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Kesim ölçüsü güncelleme hatası:', error);
    res.status(500).json({ error: 'Kesim ölçüsü güncellenemedi' });
  }
});

// Kesim ölçüsü sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM kesim_olculeri WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kesim ölçüsü bulunamadı' });
    }

    res.json({ message: 'Kesim ölçüsü silindi', data: result.rows[0] });
  } catch (error) {
    console.error('Kesim ölçüsü silme hatası:', error);
    res.status(500).json({ error: 'Kesim ölçüsü silinemedi' });
  }
});

// Excel'den toplu import
router.post('/import', async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Geçersiz veri formatı' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let imported = 0;
      let errors = [];

      for (const row of data) {
        try {
          await client.query(`
            INSERT INTO kesim_olculeri (
              model, alt_grup, parca, dis_cap, et_kalinligi,
              uzunluk, genisletme, punch, birim_agirlik
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [
            row.model,
            row.alt_grup,
            row.parca,
            row.dis_cap,
            row.et_kalinligi,
            row.uzunluk,
            row.genisletme,
            row.punch,
            row.birim_agirlik
          ]);
          imported++;
        } catch (err) {
          errors.push({ row, error: err.message });
        }
      }

      await client.query('COMMIT');
      res.json({
        message: 'Import tamamlandı',
        imported,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Import hatası:', error);
    res.status(500).json({ error: 'Import işlemi başarısız' });
  }
});

// Arama
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const result = await pool.query(`
      SELECT * FROM kesim_olculeri
      WHERE model ILIKE $1
         OR alt_grup ILIKE $1
         OR parca ILIKE $1
         OR punch ILIKE $1
      ORDER BY model, alt_grup, parca
    `, [`%${q}%`]);
    res.json(result.rows);
  } catch (error) {
    console.error('Arama hatası:', error);
    res.status(500).json({ error: 'Arama yapılamadı' });
  }
});

module.exports = router;
