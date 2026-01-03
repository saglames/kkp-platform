const express = require('express');
const router = express.Router();
const pool = require('../db');

// ============================================================
// ÜRÜNLER ENDPOINTS
// ============================================================

// GET /api/urun-agirliklari/urunler
// Get all products with weight categories
router.get('/urunler', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, urun_kodu, agirlik_a, agirlik_b, agirlik_c, agirlik_d,
             created_at, updated_at
      FROM urun_agirliklari_master
      ORDER BY urun_kodu
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/urun-agirliklari/urunler/:id
// Update product weights
router.put('/urunler/:id', async (req, res) => {
  const { id } = req.params;
  const { agirlik_a, agirlik_b, agirlik_c, agirlik_d } = req.body;

  try {
    const result = await pool.query(`
      UPDATE urun_agirliklari_master
      SET agirlik_a = $1, agirlik_b = $2, agirlik_c = $3, agirlik_d = $4
      WHERE id = $5
      RETURNING *
    `, [agirlik_a, agirlik_b, agirlik_c, agirlik_d, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// FITTINGLAR ENDPOINTS
// ============================================================

// GET /api/urun-agirliklari/fittinglar
// Get all fittings
router.get('/fittinglar', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, tip, boyut, agirlik, created_at, updated_at
      FROM urun_agirliklari_fittinglar
      ORDER BY tip, boyut
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching fittings:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/urun-agirliklari/fittinglar/:id
// Update fitting weight
router.put('/fittinglar/:id', async (req, res) => {
  const { id } = req.params;
  const { agirlik } = req.body;

  try {
    const result = await pool.query(`
      UPDATE urun_agirliklari_fittinglar
      SET agirlik = $1
      WHERE id = $2
      RETURNING *
    `, [agirlik, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fitting not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating fitting:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// HESAPLAMA ENDPOINTS
// ============================================================

// POST /api/urun-agirliklari/hesapla
// Single calculation (product or fitting)
router.post('/hesapla', async (req, res) => {
  const { hesaplama_tipi, urun_id, fitting_id, kalite, adet, yapan } = req.body;

  if (!hesaplama_tipi || !adet || !yapan) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let urun_kodu, birim_agirlik;

    if (hesaplama_tipi === 'Ürün' && urun_id && kalite) {
      // Get product weight based on quality
      const productResult = await client.query(`
        SELECT urun_kodu, agirlik_${kalite.toLowerCase()} as agirlik
        FROM urun_agirliklari_master
        WHERE id = $1
      `, [urun_id]);

      if (productResult.rows.length === 0) {
        throw new Error('Product not found');
      }

      urun_kodu = productResult.rows[0].urun_kodu;
      birim_agirlik = parseFloat(productResult.rows[0].agirlik);
    } else if (hesaplama_tipi === 'Fitting' && fitting_id) {
      // Get fitting weight
      const fittingResult = await client.query(`
        SELECT CONCAT(tip, ' ', boyut) as urun_kodu, agirlik
        FROM urun_agirliklari_fittinglar
        WHERE id = $1
      `, [fitting_id]);

      if (fittingResult.rows.length === 0) {
        throw new Error('Fitting not found');
      }

      urun_kodu = fittingResult.rows[0].urun_kodu;
      birim_agirlik = parseFloat(fittingResult.rows[0].agirlik);
    } else {
      throw new Error('Invalid calculation type or missing parameters');
    }

    const toplam_agirlik = birim_agirlik * adet;

    // Insert calculation
    const hesaplamaResult = await client.query(`
      INSERT INTO urun_agirliklari_hesaplamalar
      (hesaplama_tipi, urun_kodu, kalite, adet, birim_agirlik, toplam_agirlik, yapan)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [hesaplama_tipi, urun_kodu, kalite || null, adet, birim_agirlik, toplam_agirlik, yapan]);

    await client.query('COMMIT');
    res.json(hesaplamaResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in calculation:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// POST /api/urun-agirliklari/hesapla-ab-toplam
// A+B total calculation
router.post('/hesapla-ab-toplam', async (req, res) => {
  const { urun_id, adet_a, adet_b, yapan } = req.body;

  if (!urun_id || !yapan) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get product
    const productResult = await client.query(`
      SELECT urun_kodu, agirlik_a, agirlik_b
      FROM urun_agirliklari_master
      WHERE id = $1
    `, [urun_id]);

    if (productResult.rows.length === 0) {
      throw new Error('Product not found');
    }

    const { urun_kodu, agirlik_a, agirlik_b } = productResult.rows[0];

    const calculations = [];

    // Insert A calculation if adet > 0
    if (adet_a && adet_a > 0) {
      const toplam_a = parseFloat(agirlik_a) * adet_a;
      const resultA = await client.query(`
        INSERT INTO urun_agirliklari_hesaplamalar
        (hesaplama_tipi, urun_kodu, kalite, adet, birim_agirlik, toplam_agirlik, yapan)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, ['A+B Toplam', urun_kodu, 'A', adet_a, agirlik_a, toplam_a, yapan]);
      calculations.push(resultA.rows[0]);
    }

    // Insert B calculation if adet > 0
    if (adet_b && adet_b > 0) {
      const toplam_b = parseFloat(agirlik_b) * adet_b;
      const resultB = await client.query(`
        INSERT INTO urun_agirliklari_hesaplamalar
        (hesaplama_tipi, urun_kodu, kalite, adet, birim_agirlik, toplam_agirlik, yapan)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, ['A+B Toplam', urun_kodu, 'B', adet_b, agirlik_b, toplam_b, yapan]);
      calculations.push(resultB.rows[0]);
    }

    const total_weight = calculations.reduce((sum, calc) => sum + parseFloat(calc.toplam_agirlik), 0);

    await client.query('COMMIT');
    res.json({
      calculations,
      total_weight,
      urun_kodu
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in A+B total calculation:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// POST /api/urun-agirliklari/hesapla-batch
// Batch calculation (Feature 4)
router.post('/hesapla-batch', async (req, res) => {
  const { items, yapan } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0 || !yapan) {
    return res.status(400).json({ error: 'Invalid batch data' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const batch_id = `BATCH_${Date.now()}`;
    const calculations = [];
    let total_weight = 0;

    for (const item of items) {
      const { tip, urun_id, fitting_id, kalite, adet } = item;

      let urun_kodu, birim_agirlik;

      if (tip === 'Ürün' && urun_id && kalite) {
        const productResult = await client.query(`
          SELECT urun_kodu, agirlik_${kalite.toLowerCase()} as agirlik
          FROM urun_agirliklari_master
          WHERE id = $1
        `, [urun_id]);

        if (productResult.rows.length === 0) continue;

        urun_kodu = productResult.rows[0].urun_kodu;
        birim_agirlik = parseFloat(productResult.rows[0].agirlik);
      } else if (tip === 'Fitting' && fitting_id) {
        const fittingResult = await client.query(`
          SELECT CONCAT(tip, ' ', boyut) as urun_kodu, agirlik
          FROM urun_agirliklari_fittinglar
          WHERE id = $1
        `, [fitting_id]);

        if (fittingResult.rows.length === 0) continue;

        urun_kodu = fittingResult.rows[0].urun_kodu;
        birim_agirlik = parseFloat(fittingResult.rows[0].agirlik);
      } else {
        continue;
      }

      const toplam_agirlik = birim_agirlik * adet;
      total_weight += toplam_agirlik;

      const hesaplamaResult = await client.query(`
        INSERT INTO urun_agirliklari_hesaplamalar
        (hesaplama_tipi, urun_kodu, kalite, adet, birim_agirlik, toplam_agirlik, batch_id, batch_detay, yapan)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, ['Toplu', urun_kodu, kalite || null, adet, birim_agirlik, toplam_agirlik, batch_id, JSON.stringify(item), yapan]);

      calculations.push(hesaplamaResult.rows[0]);
    }

    await client.query('COMMIT');
    res.json({
      batch_id,
      calculations,
      total_weight,
      item_count: calculations.length
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in batch calculation:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// GET /api/urun-agirliklari/hesaplamalar
// Get all calculations with pagination
router.get('/hesaplamalar', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(`
      SELECT id, hesaplama_tipi, urun_kodu, kalite, adet, birim_agirlik,
             toplam_agirlik, batch_id, yapan, created_at
      FROM urun_agirliklari_hesaplamalar
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching calculations:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/urun-agirliklari/hesaplamalar/recent
// Get last 5 calculations (Feature 2)
router.get('/hesaplamalar/recent', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, hesaplama_tipi, urun_kodu, kalite, adet, birim_agirlik,
             toplam_agirlik, batch_id, yapan, created_at
      FROM urun_agirliklari_hesaplamalar
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recent calculations:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/urun-agirliklari/hesaplamalar/:id
// Delete a specific calculation
router.delete('/hesaplamalar/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      DELETE FROM urun_agirliklari_hesaplamalar
      WHERE id = $1
      RETURNING id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Calculation not found' });
    }

    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error('Error deleting calculation:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/urun-agirliklari/hesaplamalar
// Clear all calculation history
router.delete('/hesaplamalar', async (req, res) => {
  try {
    const result = await pool.query(`
      DELETE FROM urun_agirliklari_hesaplamalar
      RETURNING id
    `);

    res.json({ success: true, deleted_count: result.rows.length });
  } catch (error) {
    console.error('Error clearing calculations:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// KARŞILAŞTIRMA (COMPARISON) ENDPOINT - Feature 9
// ============================================================

// GET /api/urun-agirliklari/karsilastir/:urun_id/:adet
// Compare all qualities for a product
router.get('/karsilastir/:urun_id/:adet', async (req, res) => {
  const { urun_id, adet } = req.params;

  try {
    const productResult = await pool.query(`
      SELECT urun_kodu, agirlik_a, agirlik_b, agirlik_c, agirlik_d
      FROM urun_agirliklari_master
      WHERE id = $1
    `, [urun_id]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.rows[0];
    const quantity = parseInt(adet);

    const comparison = {
      urun_kodu: product.urun_kodu,
      adet: quantity,
      qualities: []
    };

    const qualities = ['A', 'B', 'C', 'D'];
    const weights = [
      parseFloat(product.agirlik_a),
      parseFloat(product.agirlik_b),
      parseFloat(product.agirlik_c),
      parseFloat(product.agirlik_d)
    ];

    for (let i = 0; i < qualities.length; i++) {
      const total_weight = weights[i] * quantity;
      const previous_weight = i > 0 ? weights[i - 1] * quantity : null;
      const weight_diff = previous_weight ? total_weight - previous_weight : 0;
      const percent_diff = previous_weight ? ((total_weight - previous_weight) / previous_weight * 100).toFixed(2) : 0;

      comparison.qualities.push({
        kalite: qualities[i],
        birim_agirlik: weights[i],
        toplam_agirlik: total_weight,
        fark_kg: weight_diff,
        fark_yuzde: percent_diff
      });
    }

    res.json(comparison);
  } catch (error) {
    console.error('Error in comparison:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// İSTATİSTİKLER (STATISTICS) ENDPOINT
// ============================================================

// GET /api/urun-agirliklari/istatistikler
// Get summary statistics
router.get('/istatistikler', async (req, res) => {
  try {
    // Total calculations count
    const totalResult = await pool.query(`
      SELECT COUNT(*) as total_calculations
      FROM urun_agirliklari_hesaplamalar
    `);

    // Total weight calculated
    const weightResult = await pool.query(`
      SELECT SUM(toplam_agirlik) as total_weight
      FROM urun_agirliklari_hesaplamalar
    `);

    // Most calculated product
    const popularProductResult = await pool.query(`
      SELECT urun_kodu, COUNT(*) as calculation_count
      FROM urun_agirliklari_hesaplamalar
      WHERE hesaplama_tipi IN ('Ürün', 'A+B Toplam')
      GROUP BY urun_kodu
      ORDER BY calculation_count DESC
      LIMIT 1
    `);

    // Most calculated fitting
    const popularFittingResult = await pool.query(`
      SELECT urun_kodu, COUNT(*) as calculation_count
      FROM urun_agirliklari_hesaplamalar
      WHERE hesaplama_tipi = 'Fitting'
      GROUP BY urun_kodu
      ORDER BY calculation_count DESC
      LIMIT 1
    `);

    res.json({
      total_calculations: parseInt(totalResult.rows[0].total_calculations) || 0,
      total_weight: parseFloat(weightResult.rows[0].total_weight) || 0,
      most_popular_product: popularProductResult.rows[0] || null,
      most_popular_fitting: popularFittingResult.rows[0] || null
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
