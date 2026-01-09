const express = require('express');
const router = express.Router();
const pool = require('../db');

// İZOLASYON ROUTES
// Tüm izolasyonları getir
router.get('/izolasyon', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, cin_adi, turk_adi, renk, kullanilan_urunler, stock, created_at, updated_at
      FROM mamul_izolasyon
      ORDER BY name ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('İzolasyon getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// İzolasyon ekle
router.post('/izolasyon', async (req, res) => {
  const { name, cin_adi, turk_adi, renk, kullanilan_urunler, stock } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO mamul_izolasyon (name, cin_adi, turk_adi, renk, kullanilan_urunler, stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, cin_adi, turk_adi, renk, kullanilan_urunler || [], stock || 0]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('İzolasyon ekleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// İzolasyon güncelle
router.put('/izolasyon/:id', async (req, res) => {
  const { id } = req.params;
  const { name, cin_adi, turk_adi, renk, kullanilan_urunler, stock } = req.body;
  try {
    const result = await pool.query(
      'UPDATE mamul_izolasyon SET name = $1, cin_adi = $2, turk_adi = $3, renk = $4, kullanilan_urunler = $5, stock = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [name, cin_adi, turk_adi, renk, kullanilan_urunler, stock, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('İzolasyon güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// İzolasyon stok değiştir (ekle/çıkar)
router.post('/izolasyon/:id/stok-degistir', async (req, res) => {
  const { id } = req.params;
  const { amount, action, reason } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Mevcut stoğu al
    const currentStock = await client.query('SELECT name, stock FROM mamul_izolasyon WHERE id = $1', [id]);
    if (currentStock.rows.length === 0) {
      throw new Error('Ürün bulunamadı');
    }

    const oldStock = currentStock.rows[0].stock;
    const newStock = action === 'Eklendi' ? oldStock + amount : oldStock - amount;

    // Stoğu güncelle
    await client.query('UPDATE mamul_izolasyon SET stock = $1 WHERE id = $2', [newStock, id]);

    // Geçmişe kaydet
    await client.query(
      `INSERT INTO mamul_history (category, item_name, action, amount, reason, old_stock, new_stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['izolasyon', currentStock.rows[0].name, action, amount, reason, oldStock, newStock]
    );

    await client.query('COMMIT');
    res.json({ success: true, oldStock, newStock });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Stok değiştirme hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// İzolasyon sil
router.delete('/izolasyon/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM mamul_izolasyon WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('İzolasyon silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// KOLİ ROUTES
router.get('/koli', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mamul_koli ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/koli', async (req, res) => {
  const { name, dimensions, icine_giren_urunler, stock } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO mamul_koli (name, dimensions, icine_giren_urunler, stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, dimensions, icine_giren_urunler, stock || 0]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/koli/:id', async (req, res) => {
  const { id } = req.params;
  const { name, dimensions, icine_giren_urunler, stock } = req.body;
  try {
    const result = await pool.query(
      'UPDATE mamul_koli SET name = $1, dimensions = $2, icine_giren_urunler = $3, stock = $4 WHERE id = $5 RETURNING *',
      [name, dimensions, icine_giren_urunler, stock, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/koli/:id/stok-degistir', async (req, res) => {
  const { id } = req.params;
  const { amount, action, reason } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const currentStock = await client.query('SELECT name, stock FROM mamul_koli WHERE id = $1', [id]);
    if (currentStock.rows.length === 0) {
      throw new Error('Ürün bulunamadı');
    }

    const oldStock = currentStock.rows[0].stock;
    const newStock = action === 'Eklendi' ? oldStock + amount : oldStock - amount;

    await client.query('UPDATE mamul_koli SET stock = $1 WHERE id = $2', [newStock, id]);

    await client.query(
      `INSERT INTO mamul_history (category, item_name, action, amount, reason, old_stock, new_stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['koli', currentStock.rows[0].name, action, amount, reason, oldStock, newStock]
    );

    await client.query('COMMIT');
    res.json({ success: true, oldStock, newStock });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

router.delete('/koli/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM mamul_koli WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// KUTU ROUTES
router.get('/kutu', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mamul_kutu ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/kutu', async (req, res) => {
  const { name, dimensions, icine_giren_urun, stock } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO mamul_kutu (name, dimensions, icine_giren_urun, stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, dimensions, icine_giren_urun, stock || 0]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/kutu/:id', async (req, res) => {
  const { id } = req.params;
  const { name, dimensions, icine_giren_urun, stock } = req.body;
  try {
    const result = await pool.query(
      'UPDATE mamul_kutu SET name = $1, dimensions = $2, icine_giren_urun = $3, stock = $4 WHERE id = $5 RETURNING *',
      [name, dimensions, icine_giren_urun, stock, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/kutu/:id/stok-degistir', async (req, res) => {
  const { id } = req.params;
  const { amount, action, reason } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const currentStock = await client.query('SELECT name, stock FROM mamul_kutu WHERE id = $1', [id]);
    if (currentStock.rows.length === 0) {
      throw new Error('Ürün bulunamadı');
    }

    const oldStock = currentStock.rows[0].stock;
    const newStock = action === 'Eklendi' ? oldStock + amount : oldStock - amount;

    await client.query('UPDATE mamul_kutu SET stock = $1 WHERE id = $2', [newStock, id]);

    await client.query(
      `INSERT INTO mamul_history (category, item_name, action, amount, reason, old_stock, new_stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['kutu', currentStock.rows[0].name, action, amount, reason, oldStock, newStock]
    );

    await client.query('COMMIT');
    res.json({ success: true, oldStock, newStock });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

router.delete('/kutu/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM mamul_kutu WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TAPA ROUTES
router.get('/tapa', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mamul_tapa ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tapa', async (req, res) => {
  const { name, stock } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO mamul_tapa (name, stock) VALUES ($1, $2) RETURNING *',
      [name, stock || 0]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/tapa/:id', async (req, res) => {
  const { id } = req.params;
  const { name, stock } = req.body;
  try {
    const result = await pool.query(
      'UPDATE mamul_tapa SET name = $1, stock = $2 WHERE id = $3 RETURNING *',
      [name, stock, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tapa/:id/stok-degistir', async (req, res) => {
  const { id } = req.params;
  const { amount, action, reason } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const currentStock = await client.query('SELECT name, stock FROM mamul_tapa WHERE id = $1', [id]);
    if (currentStock.rows.length === 0) {
      throw new Error('Ürün bulunamadı');
    }

    const oldStock = currentStock.rows[0].stock;
    const newStock = action === 'Eklendi' ? oldStock + amount : oldStock - amount;

    await client.query('UPDATE mamul_tapa SET stock = $1 WHERE id = $2', [newStock, id]);

    await client.query(
      `INSERT INTO mamul_history (category, item_name, action, amount, reason, old_stock, new_stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['tapa', currentStock.rows[0].name, action, amount, reason, oldStock, newStock]
    );

    await client.query('COMMIT');
    res.json({ success: true, oldStock, newStock });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

router.delete('/tapa/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM mamul_tapa WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GEÇMİŞ
router.get('/history', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mamul_history ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
