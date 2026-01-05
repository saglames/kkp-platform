const express = require('express');
const router = express.Router();
const pool = require('../db');

// Tüm partileri listele
router.get('/partiler', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ts.sevkiyat_no as parti_no,
        ts.irsaliye_no,
        ts.gonderim_tarihi,
        ts.gelis_tarihi,
        ts.durum,
        COALESCE(SUM(su.giden_adet), 0) as toplam_adet,
        COALESCE(SUM(su.giden_kg), 0) as toplam_kg,
        COALESCE(SUM(CASE WHEN su.is_mukerrer = true THEN su.giden_kg ELSE 0 END), 0) as mukerrer_kg,
        COALESCE(SUM(CASE WHEN su.is_mukerrer = true THEN su.giden_adet ELSE 0 END), 0) as mukerrer_adet
      FROM temizleme_sevkiyat ts
      LEFT JOIN sevkiyat_urunler su ON ts.id = su.sevkiyat_id
      GROUP BY ts.id, ts.sevkiyat_no, ts.irsaliye_no, ts.gonderim_tarihi, ts.gelis_tarihi, ts.durum
      ORDER BY ts.sevkiyat_no DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Parti listesi hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Parti detayını getir
router.get('/partiler/:parti_no', async (req, res) => {
  const { parti_no } = req.params;

  try {
    // Parti genel bilgileri
    const partiResult = await pool.query(`
      SELECT
        ts.sevkiyat_no as parti_no,
        ts.irsaliye_no,
        ts.gonderim_tarihi,
        ts.gelis_tarihi,
        ts.durum,
        COALESCE(SUM(su.giden_adet), 0) as toplam_adet,
        COALESCE(SUM(su.giden_kg), 0) as toplam_kg,
        COALESCE(SUM(CASE WHEN su.is_mukerrer = true THEN su.giden_kg ELSE 0 END), 0) as mukerrer_kg,
        COALESCE(SUM(CASE WHEN su.is_mukerrer = true THEN su.giden_adet ELSE 0 END), 0) as mukerrer_adet
      FROM temizleme_sevkiyat ts
      LEFT JOIN sevkiyat_urunler su ON ts.id = su.sevkiyat_id
      WHERE ts.sevkiyat_no = $1
      GROUP BY ts.id, ts.sevkiyat_no, ts.irsaliye_no, ts.gonderim_tarihi, ts.gelis_tarihi, ts.durum
    `, [parti_no]);

    if (partiResult.rows.length === 0) {
      return res.status(404).json({ error: 'Parti bulunamadı!' });
    }

    // Partideki ürünler
    const urunlerResult = await pool.query(`
      SELECT
        urun_kodu,
        parca_tipi,
        giden_adet,
        giden_kg,
        gelen_adet,
        gelen_kg,
        pis_adet,
        pis_kg,
        is_mukerrer,
        gonderim_tarihi,
        gelis_tarihi
      FROM sevkiyat_urunler
      WHERE sevkiyat_id = (
        SELECT id FROM temizleme_sevkiyat WHERE sevkiyat_no = $1
      )
      ORDER BY gonderim_tarihi DESC
    `, [parti_no]);

    const parti = partiResult.rows[0];
    parti.urunler = urunlerResult.rows;

    res.json(parti);
  } catch (error) {
    console.error('Parti detay hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mükerrer temizlik kaydet
router.post('/partiler/:parti_no/mukerrer', async (req, res) => {
  const { parti_no } = req.params;
  const { mukerrer_data } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Sevkiyat ID'yi al
    const sevkiyatResult = await client.query(
      'SELECT id FROM temizleme_sevkiyat WHERE sevkiyat_no = $1',
      [parti_no]
    );

    if (sevkiyatResult.rows.length === 0) {
      throw new Error('Parti bulunamadı!');
    }

    const sevkiyat_id = sevkiyatResult.rows[0].id;

    // Her ürün için mükerrer kaydı güncelle
    for (const [key, value] of Object.entries(mukerrer_data)) {
      if (!value) continue;

      const [urun_kodu, parca_tipi, tip] = key.split('_');

      if (tip === 'adet') {
        const adet = parseInt(value);
        const kg = parseFloat(mukerrer_data[`${urun_kodu}_${parca_tipi}_kg`] || 0);

        if (adet > 0) {
          // Mükerrer kayıt için yeni satır ekle
          await client.query(`
            INSERT INTO sevkiyat_urunler
            (sevkiyat_id, urun_kodu, parca_tipi, giden_adet, giden_kg, gonderim_tarihi, is_mukerrer)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, true)
          `, [sevkiyat_id, urun_kodu, parca_tipi, adet, kg]);
        }
      }
    }

    // Sevkiyat durumunu güncelle
    await client.query(
      'UPDATE temizleme_sevkiyat SET durum = $1 WHERE id = $2',
      ['kalite_kontrol', sevkiyat_id]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Mükerrer temizlik kaydedildi!' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Mükerrer kayıt hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Parti istatistikleri
router.get('/istatistikler', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(DISTINCT ts.id) as toplam_parti,
        COUNT(DISTINCT CASE WHEN ts.durum = 'gonderildi' THEN ts.id END) as bekleyen_parti,
        COUNT(DISTINCT CASE WHEN ts.durum = 'geldi' THEN ts.id END) as tamamlanan_parti,
        COALESCE(SUM(su.giden_kg), 0) as toplam_gonderilen_kg,
        COALESCE(SUM(CASE WHEN su.is_mukerrer = true THEN su.giden_kg ELSE 0 END), 0) as toplam_mukerrer_kg,
        COALESCE(SUM(CASE WHEN su.is_mukerrer = false THEN su.giden_kg ELSE 0 END), 0) as toplam_odenecek_kg
      FROM temizleme_sevkiyat ts
      LEFT JOIN sevkiyat_urunler su ON ts.id = su.sevkiyat_id
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('İstatistik hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
