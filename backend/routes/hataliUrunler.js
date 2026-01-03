const express = require('express');
const router = express.Router();
const pool = require('../db');

// AKTIF PARTI ROUTES

// Aktif parti verilerini getir
router.get('/aktif/:parti_no', async (req, res) => {
  const { parti_no } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM hatali_urunler WHERE parti_no = $1 ORDER BY urun_kodu',
      [parti_no]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Aktif parti getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ürün hata sayısını güncelle veya ekle
router.post('/guncelle', async (req, res) => {
  const {
    parti_no,
    urun_kodu,
    temizleme_problemi = 0,
    vuruk_problem = 0,
    capagi_alinmayan = 0,
    polisaj = 0,
    kaynak_az = 0,
    kaynak_akintisi = 0,
    ici_capakli = 0,
    pim_girmeyen = 0,
    boncuklu = 0,
    yamuk = 0,
    gramaji_dusuk = 0,
    hurda = 0
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO hatali_urunler
       (parti_no, urun_kodu, temizleme_problemi, vuruk_problem, capagi_alinmayan,
        polisaj, kaynak_az, kaynak_akintisi, ici_capakli, pim_girmeyen,
        boncuklu, yamuk, gramaji_dusuk, hurda, guncelleme_tarihi)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)
       ON CONFLICT (parti_no, urun_kodu)
       DO UPDATE SET
         temizleme_problemi = $3,
         vuruk_problem = $4,
         capagi_alinmayan = $5,
         polisaj = $6,
         kaynak_az = $7,
         kaynak_akintisi = $8,
         ici_capakli = $9,
         pim_girmeyen = $10,
         boncuklu = $11,
         yamuk = $12,
         gramaji_dusuk = $13,
         hurda = $14,
         guncelleme_tarihi = CURRENT_TIMESTAMP
       RETURNING *`,
      [parti_no, urun_kodu, temizleme_problemi, vuruk_problem, capagi_alinmayan,
       polisaj, kaynak_az, kaynak_akintisi, ici_capakli, pim_girmeyen,
       boncuklu, yamuk, gramaji_dusuk, hurda]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Partiyi kaydet ve sıfırla
router.post('/kaydet-parti', async (req, res) => {
  const { parti_no, kayit_yapan, notlar } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Aktif parti verilerini getir
    const aktifVeriler = await client.query(
      'SELECT * FROM hatali_urunler WHERE parti_no = $1',
      [parti_no]
    );

    if (aktifVeriler.rows.length === 0) {
      throw new Error('Kaydedilecek veri bulunamadı');
    }

    // Toplam hata sayısını hesapla
    let toplamHata = 0;
    aktifVeriler.rows.forEach(row => {
      toplamHata += (row.temizleme_problemi || 0) + (row.vuruk_problem || 0) +
                     (row.capagi_alinmayan || 0) + (row.polisaj || 0) +
                     (row.kaynak_az || 0) + (row.kaynak_akintisi || 0) +
                     (row.ici_capakli || 0) + (row.pim_girmeyen || 0) +
                     (row.boncuklu || 0) + (row.yamuk || 0) +
                     (row.gramaji_dusuk || 0) + (row.hurda || 0);
    });

    // Log tablosuna kaydet
    const logResult = await client.query(
      `INSERT INTO hatali_urunler_log (parti_no, kayit_yapan, veriler, toplam_hata, notlar)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [parti_no, kayit_yapan, JSON.stringify(aktifVeriler.rows), toplamHata, notlar]
    );

    // Aktif tabloyu temizle
    await client.query(
      'DELETE FROM hatali_urunler WHERE parti_no = $1',
      [parti_no]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      log: logResult.rows[0],
      message: `Parti ${parti_no} başarıyla kaydedildi`
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Parti kaydetme hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Aktif partiyi sıfırla (kaydetmeden)
router.delete('/sifirla/:parti_no', async (req, res) => {
  const { parti_no } = req.params;
  try {
    await pool.query(
      'DELETE FROM hatali_urunler WHERE parti_no = $1',
      [parti_no]
    );
    res.json({ success: true, message: 'Parti sıfırlandı' });
  } catch (error) {
    console.error('Parti sıfırlama hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// GEÇMİŞ LOG ROUTES

// Tüm geçmiş partileri getir
router.get('/gecmis', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM hatali_urunler_log ORDER BY kayit_tarihi DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Geçmiş getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Belirli bir log kaydını getir
router.get('/gecmis/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM hatali_urunler_log WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Log getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Filtreleme ile geçmiş partileri getir
router.post('/gecmis/filtrele', async (req, res) => {
  const { baslangic_tarihi, bitis_tarihi, parti_no } = req.body;

  try {
    let query = 'SELECT * FROM hatali_urunler_log WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (baslangic_tarihi) {
      query += ` AND kayit_tarihi >= $${paramIndex}`;
      params.push(baslangic_tarihi);
      paramIndex++;
    }

    if (bitis_tarihi) {
      query += ` AND kayit_tarihi <= $${paramIndex}`;
      params.push(bitis_tarihi);
      paramIndex++;
    }

    if (parti_no) {
      query += ` AND parti_no ILIKE $${paramIndex}`;
      params.push(`%${parti_no}%`);
      paramIndex++;
    }

    query += ' ORDER BY kayit_tarihi DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Filtreleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Log kaydını sil
router.delete('/gecmis/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM hatali_urunler_log WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Log silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
