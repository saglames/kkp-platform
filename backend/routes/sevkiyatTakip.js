const express = require('express');
const router = express.Router();
const pool = require('../db');

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Sevkiyat Takip API çalışıyor!', timestamp: new Date() });
});

// ===== SEVKİYAT İŞLEMLERİ =====

// Tüm sevkiyatları listele (özet bilgilerle)
router.get('/sevkiyatlar', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM v_sevkiyat_ozet
      ORDER BY sevkiyat_no DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Sevkiyat listesi hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Tek bir sevkiyatın detaylarını getir
router.get('/sevkiyat/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Sevkiyat bilgisi
    const sevkiyat = await pool.query(
      'SELECT * FROM temizleme_sevkiyat WHERE id = $1',
      [id]
    );

    if (sevkiyat.rows.length === 0) {
      return res.status(404).json({ error: 'Sevkiyat bulunamadı' });
    }

    // Sevkiyattaki ürünler
    const urunler = await pool.query(`
      SELECT *
      FROM sevkiyat_urunler
      WHERE sevkiyat_id = $1
      ORDER BY is_mukerrer ASC, urun_kodu ASC
    `, [id]);

    // Özet bilgiler
    const ozet = await pool.query(
      'SELECT * FROM v_sevkiyat_ozet WHERE id = $1',
      [id]
    );

    res.json({
      sevkiyat: sevkiyat.rows[0],
      urunler: urunler.rows,
      ozet: ozet.rows[0]
    });
  } catch (error) {
    console.error('Sevkiyat detay hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Yeni sevkiyat oluştur
router.post('/sevkiyat', async (req, res) => {
  const { irsaliye_no, gonderim_tarihi, urunler, notlar } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Yeni sevkiyat numarası al
    const sevkiyatNoResult = await client.query(
      "SELECT COALESCE(MAX(sevkiyat_no), 0) + 1 as next_no FROM temizleme_sevkiyat"
    );
    const sevkiyat_no = sevkiyatNoResult.rows[0].next_no;

    // Sevkiyat oluştur
    const sevkiyatResult = await client.query(
      `INSERT INTO temizleme_sevkiyat
       (sevkiyat_no, irsaliye_no, gonderim_tarihi, notlar, durum)
       VALUES ($1, $2, $3, $4, 'gonderildi')
       RETURNING *`,
      [sevkiyat_no, irsaliye_no, gonderim_tarihi || new Date(), notlar]
    );

    const sevkiyat = sevkiyatResult.rows[0];

    // Ürünleri ekle
    for (const urun of urunler) {
      await client.query(
        `INSERT INTO sevkiyat_urunler
         (sevkiyat_id, urun_kodu, parca_tipi, giden_adet, giden_kg,
          gonderim_tarihi, is_mukerrer, kaynak_sevkiyat_id, kaynak_urun_id, notlar)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          sevkiyat.id,
          urun.urun_kodu,
          urun.parca_tipi,
          urun.giden_adet,
          urun.giden_kg,
          gonderim_tarihi || new Date(),
          urun.is_mukerrer || false,
          urun.kaynak_sevkiyat_id || null,
          urun.kaynak_urun_id || null,
          urun.notlar || null
        ]
      );
    }

    await client.query('COMMIT');

    // Oluşturulan sevkiyatı döndür
    const result = await pool.query(
      'SELECT * FROM v_sevkiyat_ozet WHERE id = $1',
      [sevkiyat.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Sevkiyat oluşturma hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Sevkiyat güncelle
router.put('/sevkiyat/:id', async (req, res) => {
  const { id } = req.params;
  const { irsaliye_no, gonderim_tarihi, gelis_tarihi, durum, notlar } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Eski değeri al
    const eskiVeri = await client.query('SELECT * FROM temizleme_sevkiyat WHERE id = $1', [id]);

    if (eskiVeri.rows.length === 0) {
      throw new Error('Sevkiyat bulunamadı');
    }

    // Güncelle
    const result = await client.query(
      `UPDATE temizleme_sevkiyat
       SET irsaliye_no = COALESCE($1, irsaliye_no),
           gonderim_tarihi = COALESCE($2, gonderim_tarihi),
           gelis_tarihi = COALESCE($3, gelis_tarihi),
           durum = COALESCE($4, durum),
           notlar = COALESCE($5, notlar)
       WHERE id = $6
       RETURNING *`,
      [irsaliye_no, gonderim_tarihi, gelis_tarihi, durum, notlar, id]
    );

    // Log kaydet
    await client.query(`
      INSERT INTO temizleme_takip_log (sevkiyat_id, islem_tipi, eski_deger, yeni_deger, yapan, aciklama)
      VALUES ($1, 'sevkiyat_guncelle', $2, $3, $4, $5)
    `, [
      id,
      JSON.stringify(eskiVeri.rows[0]),
      JSON.stringify(result.rows[0]),
      'Kullanıcı',
      'Sevkiyat bilgileri güncellendi'
    ]);

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Sevkiyat güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// ===== ÜRÜN İŞLEMLERİ =====

// Sevkiyat ürünü güncelle (gelen bilgileri ekle)
router.put('/urun/:id', async (req, res) => {
  const { id } = req.params;
  const {
    giden_adet,
    giden_kg,
    gelen_adet,
    gelen_kg,
    gelis_tarihi,
    pis_adet,
    pis_kg,
    problemli_adet,
    problemli_kg,
    notlar
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE sevkiyat_urunler
       SET giden_adet = COALESCE($1, giden_adet),
           giden_kg = COALESCE($2, giden_kg),
           gelen_adet = COALESCE($3, gelen_adet),
           gelen_kg = COALESCE($4, gelen_kg),
           gelis_tarihi = COALESCE($5, gelis_tarihi),
           pis_adet = COALESCE($6, pis_adet),
           pis_kg = COALESCE($7, pis_kg),
           problemli_adet = COALESCE($8, problemli_adet),
           problemli_kg = COALESCE($9, problemli_kg),
           notlar = COALESCE($10, notlar)
       WHERE id = $11
       RETURNING *`,
      [giden_adet, giden_kg, gelen_adet, gelen_kg, gelis_tarihi, pis_adet, pis_kg, problemli_adet, problemli_kg, notlar, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ürün güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sevkiyata ürün ekle (mükerrer için)
router.post('/sevkiyat/:sevkiyat_id/urun', async (req, res) => {
  const { sevkiyat_id } = req.params;
  const {
    urun_kodu,
    parca_tipi,
    giden_adet,
    giden_kg,
    is_mukerrer,
    kaynak_sevkiyat_id,
    kaynak_urun_id,
    notlar
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO sevkiyat_urunler
       (sevkiyat_id, urun_kodu, parca_tipi, giden_adet, giden_kg,
        gonderim_tarihi, is_mukerrer, kaynak_sevkiyat_id, kaynak_urun_id, notlar)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7, $8, $9)
       RETURNING *`,
      [
        sevkiyat_id,
        urun_kodu,
        parca_tipi,
        giden_adet,
        giden_kg,
        is_mukerrer || false,
        kaynak_sevkiyat_id || null,
        kaynak_urun_id || null,
        notlar || null
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ürün ekleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== KALİTE KONTROL =====

// Pis çıkan ürünleri kaydet
router.post('/kalite-kontrol', async (req, res) => {
  const { urun_id, pis_adet, pis_kg } = req.body;

  try {
    const result = await pool.query(
      `UPDATE sevkiyat_urunler
       SET pis_adet = $1,
           pis_kg = $2
       WHERE id = $3
       RETURNING *`,
      [pis_adet, pis_kg, urun_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Kalite kontrol kayıt hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Pis çıkan ürünleri getir (mükerrer göndermek için)
router.get('/sevkiyat/:id/pis-urunler', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT
        id,
        urun_kodu,
        parca_tipi,
        pis_adet as adet,
        pis_kg as kg,
        gelen_adet,
        gelen_kg
      FROM sevkiyat_urunler
      WHERE sevkiyat_id = $1
        AND pis_adet > 0
      ORDER BY urun_kodu
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Pis ürünler listesi hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== İSTATİSTİKLER VE RAPORLAR =====

// Ödeme raporu
router.get('/odeme-raporu/:sevkiyat_id', async (req, res) => {
  const { sevkiyat_id } = req.params;

  try {
    const result = await pool.query(`
      SELECT
        s.sevkiyat_no,
        s.irsaliye_no,
        s.gonderim_tarihi,
        SUM(CASE WHEN su.is_mukerrer = false THEN su.giden_kg ELSE 0 END) as ilk_gonderim_kg,
        SUM(CASE WHEN su.is_mukerrer = true THEN su.giden_kg ELSE 0 END) as mukerrer_kg,
        SUM(su.giden_kg) as toplam_giden_kg,
        SUM(CASE WHEN su.is_mukerrer = false THEN su.giden_kg ELSE 0 END) as odenecek_kg
      FROM temizleme_sevkiyat s
      LEFT JOIN sevkiyat_urunler su ON s.id = su.sevkiyat_id
      WHERE s.id = $1
      GROUP BY s.id, s.sevkiyat_no, s.irsaliye_no, s.gonderim_tarihi
    `, [sevkiyat_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sevkiyat bulunamadı' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ödeme raporu hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sevkiyat sil
router.delete('/sevkiyat/:id', async (req, res) => {
  const { id } = req.params;
  const { neden, yapan } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Sevkiyat bilgisini al (log için)
    const sevkiyat = await client.query(
      'SELECT * FROM temizleme_sevkiyat WHERE id = $1',
      [id]
    );

    if (sevkiyat.rows.length === 0) {
      throw new Error('Sevkiyat bulunamadı');
    }

    // Ürünleri al (log için)
    const urunler = await client.query(
      'SELECT * FROM sevkiyat_urunler WHERE sevkiyat_id = $1',
      [id]
    );

    // Log kaydet
    await client.query(`
      INSERT INTO temizleme_takip_log (sevkiyat_id, islem_tipi, eski_deger, yapan, aciklama)
      VALUES ($1, 'sevkiyat_sil', $2, $3, $4)
    `, [
      id,
      JSON.stringify({ sevkiyat: sevkiyat.rows[0], urunler: urunler.rows }),
      yapan || 'Sistem',
      neden || 'Silme nedeni belirtilmemiş'
    ]);

    // Sevkiyatı sil (CASCADE ile ürünler de silinir)
    await client.query('DELETE FROM temizleme_sevkiyat WHERE id = $1', [id]);

    await client.query('COMMIT');
    res.json({ message: 'Sevkiyat başarıyla silindi' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Sevkiyat silme hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// İşlem loglarını getir
router.get('/logs', async (req, res) => {
  const { sevkiyat_id, limit } = req.query;

  try {
    let query = `
      SELECT
        l.*,
        s.sevkiyat_no,
        s.irsaliye_no,
        u.urun_kodu
      FROM temizleme_takip_log l
      LEFT JOIN temizleme_sevkiyat s ON l.sevkiyat_id = s.id
      LEFT JOIN sevkiyat_urunler u ON l.urun_id = u.id
    `;

    const params = [];
    if (sevkiyat_id) {
      query += ' WHERE l.sevkiyat_id = $1';
      params.push(sevkiyat_id);
    }

    query += ' ORDER BY l.created_at DESC';

    // Limit varsa ve 0 değilse ekle (0 veya undefined = tüm kayıtlar)
    if (limit && parseInt(limit) > 0) {
      query += ' LIMIT $' + (params.length + 1);
      params.push(limit);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Log getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dashboard istatistikleri
router.get('/istatistikler', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(DISTINCT s.id) as toplam_sevkiyat,
        COUNT(DISTINCT CASE WHEN s.durum = 'gonderildi' THEN s.id END) as bekleyen_sevkiyat,
        COUNT(DISTINCT CASE WHEN s.durum = 'geldi' THEN s.id END) as gelen_sevkiyat,
        SUM(su.giden_kg) as toplam_giden_kg,
        SUM(su.gelen_kg) as toplam_gelen_kg,
        SUM(CASE WHEN su.is_mukerrer THEN su.giden_kg ELSE 0 END) as toplam_mukerrer_kg
      FROM temizleme_sevkiyat s
      LEFT JOIN sevkiyat_urunler su ON s.id = su.sevkiyat_id
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('İstatistikler hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
