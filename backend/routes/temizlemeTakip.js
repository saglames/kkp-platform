const express = require('express');
const router = express.Router();
const pool = require('../db');

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parti oluştur - Transaction ile
 */
async function partiOlustur(partiData, urunler, kullanici) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Parti kaydı oluştur
    const parti = await client.query(`
      INSERT INTO temizleme_partiler
        (parti_no, irsaliye_no, gidis_tarihi, gidis_kg, gidis_adet,
         gidis_notlar, durum, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, 'gonderildi', $7)
      RETURNING *
    `, [partiData.parti_no, partiData.irsaliye_no, partiData.gidis_tarihi,
        partiData.gidis_kg, partiData.gidis_adet, partiData.gidis_notlar, kullanici]);

    const partiId = parti.rows[0].id;

    // 2. Ürünleri ekle
    for (const urun of urunler) {
      // Parti ürün kaydı
      await client.query(`
        INSERT INTO temizleme_parti_urunler
          (parti_id, urun_id, gidis_adet, gidis_kg)
        VALUES ($1, $2, $3, $4)
      `, [partiId, urun.urun_id, urun.gidis_adet, urun.gidis_kg || 0]);

      // 3. surec_temizlemede_olan tablosunu güncelle
      await client.query(`
        INSERT INTO surec_temizlemede_olan (urun_id, adet, parti_id, gidis_kg, updated_by)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (urun_id)
        DO UPDATE SET
          adet = surec_temizlemede_olan.adet + EXCLUDED.adet,
          gidis_kg = COALESCE(surec_temizlemede_olan.gidis_kg, 0) + EXCLUDED.gidis_kg,
          updated_by = EXCLUDED.updated_by,
          updated_at = CURRENT_TIMESTAMP
      `, [urun.urun_id, urun.gidis_adet, partiId, urun.gidis_kg || 0, kullanici]);
    }

    // 4. Log kaydı
    await client.query(`
      INSERT INTO surec_hareket_log
        (parti_id, parti_no, islem_tipi, kaynak, hedef, adet, gidis_kg, yapan)
      VALUES ($1, $2, 'parti_gonderildi', 'sistem', 'temizlemede_olan', $3, $4, $5)
    `, [partiId, partiData.parti_no, partiData.gidis_adet, partiData.gidis_kg, kullanici]);

    await client.query('COMMIT');
    return parti.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Parti dönüşü kaydet
 */
async function partiDonusuKaydet(partiId, donusData, urunler, kullanici) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Parti dönüş bilgilerini güncelle
    await client.query(`
      UPDATE temizleme_partiler
      SET donus_tarihi = $1,
          donus_kg = $2,
          donus_adet = $3,
          donus_notlar = $4,
          durum = 'kalite_kontrol',
          updated_by = $5,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
    `, [donusData.donus_tarihi, donusData.donus_kg, donusData.donus_adet,
        donusData.donus_notlar, kullanici, partiId]);

    // 2. Ürün bazlı dönüş bilgilerini güncelle
    for (const urun of urunler) {
      await client.query(`
        UPDATE temizleme_parti_urunler
        SET donus_adet = $1,
            donus_kg = $2
        WHERE parti_id = $3 AND urun_id = $4
      `, [urun.donus_adet, urun.donus_kg || 0, partiId, urun.urun_id]);

      // 3. surec_temizlemede_olan'dan düş
      await client.query(`
        UPDATE surec_temizlemede_olan
        SET adet = adet - $1,
            gidis_kg = COALESCE(gidis_kg, 0) - $2,
            updated_by = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE urun_id = $4
      `, [urun.gidis_adet, urun.gidis_kg || 0, kullanici, urun.urun_id]);

      // 4. surec_temizlemeden_gelen'e ekle (kalite kontrole bekliyor)
      await client.query(`
        INSERT INTO surec_temizlemeden_gelen
          (urun_id, adet, kg, parti_id, kalite_kontrol_durum, updated_by)
        VALUES ($1, $2, $3, $4, 'beklemede', $5)
        ON CONFLICT (urun_id)
        DO UPDATE SET
          adet = surec_temizlemeden_gelen.adet + EXCLUDED.adet,
          kg = COALESCE(surec_temizlemeden_gelen.kg, 0) + EXCLUDED.kg,
          updated_by = EXCLUDED.updated_by,
          updated_at = CURRENT_TIMESTAMP
      `, [urun.urun_id, urun.donus_adet, urun.donus_kg || 0, partiId, kullanici]);
    }

    // 5. Log
    await client.query(`
      INSERT INTO surec_hareket_log
        (parti_id, islem_tipi, kaynak, hedef, adet, donus_kg, yapan)
      VALUES ($1, 'parti_donus', 'temizlemede_olan', 'kalite_kontrol', $2, $3, $4)
    `, [partiId, donusData.donus_adet, donusData.donus_kg, kullanici]);

    await client.query('COMMIT');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Kalite kontrol yap
 */
async function kaliteKontrolYap(partiId, kaliteData, kullanici) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { karar, kontrol_edilen_adet, hata_adet, hata_detay, aciklama, problem_kategorileri } = kaliteData;

    // Hata oranı hesapla (division by zero kontrolü)
    const hataOrani = kontrol_edilen_adet > 0
      ? ((hata_adet / kontrol_edilen_adet) * 100).toFixed(2)
      : '0.00';

    // 1. Kalite kontrol log kaydı
    await client.query(`
      INSERT INTO temizleme_kalite_kontrol_log
        (parti_id, karar, karar_veren, kontrol_edilen_adet,
         hata_tespit_edilen_adet, hata_orani, aciklama, problem_kategorileri)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [partiId, karar, kullanici, kontrol_edilen_adet,
        hata_adet, hataOrani, aciklama, JSON.stringify(problem_kategorileri || [])]);

    // 2. Ödeme hesaplama - hata detaylarına göre ödenecek/ödenmeyecek ayır
    if (hata_detay) {
      for (const [urun_kodu, hatalar] of Object.entries(hata_detay)) {
        // Toplam hatalı adet hesapla
        const toplamHata = Object.values(hatalar).reduce((sum, val) => sum + (val || 0), 0);

        // Ürünü bul
        const urun = await client.query(`
          SELECT pu.*, u.birim_agirlik
          FROM temizleme_parti_urunler pu
          JOIN surec_urunler u ON pu.urun_id = u.id
          WHERE pu.parti_id = $1 AND u.urun_kodu = $2
        `, [partiId, urun_kodu]);

        if (urun.rows.length > 0) {
          const urunData = urun.rows[0];

          // Ödenecek = dönüş - hatalı
          const odenecekAdet = (urunData.donus_adet || 0) - toplamHata;
          const odenmeyecekAdet = toplamHata;

          // KG hesaplama (birim ağırlık varsa)
          let odenecekKg = urunData.donus_kg || 0;
          let odenmeyecekKg = 0;

          if (urunData.birim_agirlik && urunData.birim_agirlik > 0) {
            odenmeyecekKg = (toplamHata * urunData.birim_agirlik) / 1000; // gram to kg
            odenecekKg = (urunData.donus_kg || 0) - odenmeyecekKg;
          }

          // Güncelle
          await client.query(`
            UPDATE temizleme_parti_urunler
            SET odenecek_adet = $1,
                odenecek_kg = $2,
                odenmeyecek_adet = $3,
                odenmeyecek_kg = $4,
                hata_adet = $5
            WHERE id = $6
          `, [odenecekAdet, odenecekKg, odenmeyecekAdet, odenmeyecekKg, toplamHata, urunData.id]);
        }
      }
    } else {
      // Hata yoksa tüm dönüş miktarı ödenecek
      await client.query(`
        UPDATE temizleme_parti_urunler
        SET odenecek_adet = donus_adet,
            odenecek_kg = donus_kg,
            odenmeyecek_adet = 0,
            odenmeyecek_kg = 0,
            hata_adet = 0
        WHERE parti_id = $1
      `, [partiId]);
    }

    // 3. Parti durumunu güncelle
    let yeniDurum = karar;
    await client.query(`
      UPDATE temizleme_partiler
      SET kalite_durum = $1,
          durum = $2,
          kalite_kontrol_tarihi = CURRENT_TIMESTAMP,
          kalite_kontrol_yapan = $3,
          kalite_notlar = $4,
          updated_by = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
    `, [karar, yeniDurum, kullanici, aciklama, partiId]);

    // 4. Kabul edilirse sevke hazıra taşı
    if (karar === 'kabul') {
      const partiUrunler = await client.query(`
        SELECT pu.*, u.urun_kodu_base, u.urun_kodu
        FROM temizleme_parti_urunler pu
        JOIN surec_urunler u ON pu.urun_id = u.id
        WHERE pu.parti_id = $1
      `, [partiId]);

      for (const urun of partiUrunler.rows) {
        // Temizlemeden gelen'den düş
        await client.query(`
          UPDATE surec_temizlemeden_gelen
          SET adet = adet - $1,
              kg = COALESCE(kg, 0) - $2,
              kalite_kontrol_durum = 'kabul',
              updated_by = $3,
              updated_at = CURRENT_TIMESTAMP
          WHERE urun_id = $4
        `, [urun.donus_adet, urun.donus_kg || 0, kullanici, urun.urun_id]);

        // Sevke hazıra ekle (base kod üzerinden birleştir)
        const baseKod = urun.urun_kodu_base.replace(/\s*\([AB]\)\s*$/, '').trim();
        await client.query(`
          INSERT INTO surec_sevke_hazir (urun_kodu_base, adet, updated_by)
          VALUES ($1, $2, $3)
          ON CONFLICT (urun_kodu_base)
          DO UPDATE SET
            adet = surec_sevke_hazir.adet + EXCLUDED.adet,
            updated_by = EXCLUDED.updated_by,
            updated_at = CURRENT_TIMESTAMP
        `, [baseKod, urun.donus_adet, kullanici]);
      }
    }

    // 4. Tekrar temizliğe gönderilirse yeni parti oluştur
    else if (karar === 'tekrar_temizlik') {
      const anaParti = await client.query('SELECT * FROM temizleme_partiler WHERE id = $1', [partiId]);
      const partiNo = `${anaParti.rows[0].parti_no}-T${anaParti.rows[0].tekrar_temizlik_sayisi + 1}`;

      // Yeni parti oluştur
      const yeniParti = await client.query(`
        INSERT INTO temizleme_partiler
          (parti_no, ana_parti_id, gidis_tarihi, gidis_adet, gidis_kg,
           durum, tekrar_temizlik_sayisi, created_by)
        VALUES ($1, $2, CURRENT_DATE, $3, $4, 'gonderildi', $5, $6)
        RETURNING *
      `, [partiNo, partiId, anaParti.rows[0].donus_adet, anaParti.rows[0].donus_kg,
          anaParti.rows[0].tekrar_temizlik_sayisi + 1, kullanici]);

      // Ana partiyi güncelle
      await client.query(`
        UPDATE temizleme_partiler
        SET tekrar_temizlik_sayisi = tekrar_temizlik_sayisi + 1,
            updated_by = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [kullanici, partiId]);

      // Ürünleri yeni partiye kopyala
      const partiUrunler = await client.query(`
        SELECT * FROM temizleme_parti_urunler WHERE parti_id = $1
      `, [partiId]);

      for (const urun of partiUrunler.rows) {
        await client.query(`
          INSERT INTO temizleme_parti_urunler (parti_id, urun_id, gidis_adet, gidis_kg)
          VALUES ($1, $2, $3, $4)
        `, [yeniParti.rows[0].id, urun.urun_id, urun.donus_adet, urun.donus_kg]);

        // Temizlemede olan'a ekle
        await client.query(`
          UPDATE surec_temizlemede_olan
          SET adet = adet + $1,
              gidis_kg = COALESCE(gidis_kg, 0) + $2,
              updated_by = $3,
              updated_at = CURRENT_TIMESTAMP
          WHERE urun_id = $4
        `, [urun.donus_adet, urun.donus_kg || 0, kullanici, urun.urun_id]);
      }
    }

    // 5. Hatalı ürünler kaydı oluştur (eğer hata varsa)
    if (hata_adet > 0 && hata_detay) {
      const partiInfo = await client.query('SELECT parti_no FROM temizleme_partiler WHERE id = $1', [partiId]);
      const partiNo = partiInfo.rows[0].parti_no;

      for (const [urun_kodu, hatalar] of Object.entries(hata_detay)) {
        await client.query(`
          INSERT INTO hatali_urunler
            (parti_no, urun_kodu, temizleme_parti_id, kaynak,
             temizleme_problemi, vuruk_problem, capagi_alinmayan, polisaj,
             kaynak_az, kaynak_akintisi, ici_capakli, pim_girmeyen,
             boncuklu, yamuk, gramaji_dusuk, hurda)
          VALUES ($1, $2, $3, 'kalite_kontrol', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (parti_no, urun_kodu)
          DO UPDATE SET
            temizleme_problemi = hatali_urunler.temizleme_problemi + EXCLUDED.temizleme_problemi,
            vuruk_problem = hatali_urunler.vuruk_problem + EXCLUDED.vuruk_problem,
            capagi_alinmayan = hatali_urunler.capagi_alinmayan + EXCLUDED.capagi_alinmayan,
            polisaj = hatali_urunler.polisaj + EXCLUDED.polisaj,
            kaynak_az = hatali_urunler.kaynak_az + EXCLUDED.kaynak_az,
            kaynak_akintisi = hatali_urunler.kaynak_akintisi + EXCLUDED.kaynak_akintisi,
            ici_capakli = hatali_urunler.ici_capakli + EXCLUDED.ici_capakli,
            pim_girmeyen = hatali_urunler.pim_girmeyen + EXCLUDED.pim_girmeyen,
            boncuklu = hatali_urunler.boncuklu + EXCLUDED.boncuklu,
            yamuk = hatali_urunler.yamuk + EXCLUDED.yamuk,
            gramaji_dusuk = hatali_urunler.gramaji_dusuk + EXCLUDED.gramaji_dusuk,
            hurda = hatali_urunler.hurda + EXCLUDED.hurda,
            guncelleme_tarihi = CURRENT_TIMESTAMP
        `, [partiNo, urun_kodu, partiId,
            hatalar.temizleme_problemi || 0, hatalar.vuruk_problem || 0,
            hatalar.capagi_alinmayan || 0, hatalar.polisaj || 0,
            hatalar.kaynak_az || 0, hatalar.kaynak_akintisi || 0,
            hatalar.ici_capakli || 0, hatalar.pim_girmeyen || 0,
            hatalar.boncuklu || 0, hatalar.yamuk || 0,
            hatalar.gramaji_dusuk || 0, hatalar.hurda || 0]);
      }
    }

    await client.query('COMMIT');
    return { success: true, hataOrani };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ============================================
// API ENDPOINTS
// ============================================

// PARTİ YÖNETİMİ

/**
 * POST /api/temizleme-takip/partiler
 * Yeni parti oluştur
 */
router.post('/partiler', async (req, res) => {
  try {
    const { parti_no, irsaliye_no, gidis_tarihi, gidis_kg, gidis_adet, gidis_notlar, urunler, yapan } = req.body;

    if (!parti_no || !gidis_tarihi || !gidis_adet || !urunler || urunler.length === 0) {
      return res.status(400).json({ error: 'Parti no, gidiş tarihi, gidiş adet ve ürünler gerekli!' });
    }

    const partiData = {
      parti_no,
      irsaliye_no,
      gidis_tarihi,
      gidis_kg,
      gidis_adet,
      gidis_notlar
    };

    const parti = await partiOlustur(partiData, urunler, yapan || 'Sistem');

    res.json({ success: true, parti });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/temizleme-takip/partiler/manuel
 * Manuel parti oluştur (kullanıcı ürün kodu text olarak girer)
 */
router.post('/partiler/manuel', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { parti_no, irsaliye_no, gidis_tarihi, urun_kodu, gidis_adet, gidis_kg, gidis_notlar, yapan } = req.body;

    if (!parti_no || !gidis_tarihi || !urun_kodu || !gidis_adet) {
      return res.status(400).json({ error: 'Parti no, gidiş tarihi, ürün kodu ve gidiş adet gerekli!' });
    }

    // 1. Ürünü surec_urunler'de bul veya oluştur
    let urun = await client.query('SELECT * FROM surec_urunler WHERE urun_kodu = $1', [urun_kodu.trim()]);

    let urun_id;
    if (urun.rows.length === 0) {
      // Ürün yoksa yeni oluştur
      const yeniUrun = await client.query(
        `INSERT INTO surec_urunler (urun_kodu, urun_kodu_base, tip)
         VALUES ($1, $2, 'Manuel Giriş')
         RETURNING *`,
        [urun_kodu.trim(), urun_kodu.trim()]
      );
      urun_id = yeniUrun.rows[0].id;
    } else {
      urun_id = urun.rows[0].id;
    }

    // 2. Parti kaydı oluştur
    const parti = await client.query(`
      INSERT INTO temizleme_partiler
        (parti_no, irsaliye_no, gidis_tarihi, gidis_kg, gidis_adet,
         gidis_notlar, durum, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, 'gonderildi', $7)
      RETURNING *
    `, [parti_no, irsaliye_no, gidis_tarihi, gidis_kg || 0, gidis_adet, gidis_notlar, yapan || 'Sistem']);

    const partiId = parti.rows[0].id;

    // 3. Parti ürün kaydı
    await client.query(`
      INSERT INTO temizleme_parti_urunler
        (parti_id, urun_id, gidis_adet, gidis_kg)
      VALUES ($1, $2, $3, $4)
    `, [partiId, urun_id, gidis_adet, gidis_kg || 0]);

    // 4. surec_temizlemede_olan tablosunu güncelle
    await client.query(`
      INSERT INTO surec_temizlemede_olan (urun_id, adet, parti_id, gidis_kg, updated_by)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (urun_id)
      DO UPDATE SET
        adet = surec_temizlemede_olan.adet + EXCLUDED.adet,
        gidis_kg = COALESCE(surec_temizlemede_olan.gidis_kg, 0) + EXCLUDED.gidis_kg,
        updated_by = EXCLUDED.updated_by,
        updated_at = CURRENT_TIMESTAMP
    `, [urun_id, gidis_adet, partiId, gidis_kg || 0, yapan || 'Sistem']);

    // 5. Log kaydı
    await client.query(`
      INSERT INTO surec_hareket_log
        (parti_id, parti_no, islem_tipi, kaynak, hedef, adet, gidis_kg, yapan)
      VALUES ($1, $2, 'parti_gonderildi_manuel', 'sistem', 'temizlemede_olan', $3, $4, $5)
    `, [partiId, parti_no, gidis_adet, gidis_kg || 0, yapan || 'Sistem']);

    await client.query('COMMIT');

    res.json({ success: true, parti: parti.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

/**
 * GET /api/temizleme-takip/partiler
 * Parti listesi (filtreleme ile)
 */
router.get('/partiler', async (req, res) => {
  try {
    const { durum, baslangic_tarihi, bitis_tarihi, parti_no } = req.query;

    let query = 'SELECT * FROM temizleme_partiler WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (durum) {
      query += ` AND durum = $${paramIndex}`;
      params.push(durum);
      paramIndex++;
    }

    if (baslangic_tarihi) {
      query += ` AND gidis_tarihi >= $${paramIndex}`;
      params.push(baslangic_tarihi);
      paramIndex++;
    }

    if (bitis_tarihi) {
      query += ` AND gidis_tarihi <= $${paramIndex}`;
      params.push(bitis_tarihi);
      paramIndex++;
    }

    if (parti_no) {
      query += ` AND parti_no ILIKE $${paramIndex}`;
      params.push(`%${parti_no}%`);
      paramIndex++;
    }

    query += ' ORDER BY gidis_tarihi DESC, id DESC LIMIT 100';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Parti listesi hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/temizleme-takip/partiler/:id
 * Parti detayı
 */
router.get('/partiler/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Parti bilgileri
    const parti = await pool.query('SELECT * FROM temizleme_partiler WHERE id = $1', [id]);

    if (parti.rows.length === 0) {
      return res.status(404).json({ error: 'Parti bulunamadı!' });
    }

    // Parti ürünleri
    const urunler = await pool.query(`
      SELECT pu.*, u.tip, u.urun_kodu, u.urun_kodu_base
      FROM temizleme_parti_urunler pu
      JOIN surec_urunler u ON pu.urun_id = u.id
      WHERE pu.parti_id = $1
      ORDER BY u.urun_kodu
    `, [id]);

    // Kalite kontrol geçmişi
    const kaliteGecmis = await pool.query(`
      SELECT * FROM temizleme_kalite_kontrol_log
      WHERE parti_id = $1
      ORDER BY karar_tarihi DESC
    `, [id]);

    res.json({
      parti: parti.rows[0],
      urunler: urunler.rows,
      kaliteGecmis: kaliteGecmis.rows
    });
  } catch (error) {
    console.error('Parti detay hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/temizleme-takip/partiler/:id
 * Parti güncelle
 */
router.put('/partiler/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { irsaliye_no, gidis_notlar, donus_notlar, yapan } = req.body;

    const result = await pool.query(`
      UPDATE temizleme_partiler
      SET irsaliye_no = COALESCE($1, irsaliye_no),
          gidis_notlar = COALESCE($2, gidis_notlar),
          donus_notlar = COALESCE($3, donus_notlar),
          updated_by = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [irsaliye_no, gidis_notlar, donus_notlar, yapan || 'Sistem', id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parti bulunamadı!' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Parti güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/temizleme-takip/partiler/:id
 * Parti sil
 */
router.delete('/partiler/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Parti var mı kontrol et
    const parti = await client.query('SELECT * FROM temizleme_partiler WHERE id = $1', [id]);
    if (parti.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Parti bulunamadı!' });
    }

    // Parti silinirse CASCADE ile ürünler ve kalite log da silinir
    await client.query('DELETE FROM temizleme_partiler WHERE id = $1', [id]);

    await client.query('COMMIT');
    res.json({ success: true, message: 'Parti silindi' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Parti silme hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// PARTİ DURUM DEĞİŞİKLİKLERİ

/**
 * POST /api/temizleme-takip/partiler/:id/donus
 * Parti dönüşü kaydet
 */
router.post('/partiler/:id/donus', async (req, res) => {
  try {
    const { id } = req.params;
    const { donus_tarihi, donus_kg, donus_adet, donus_notlar, urunler, yapan } = req.body;

    if (!donus_tarihi || !donus_adet || !urunler || urunler.length === 0) {
      return res.status(400).json({ error: 'Dönüş tarihi, dönüş adet ve ürünler gerekli!' });
    }

    const donusData = {
      donus_tarihi,
      donus_kg,
      donus_adet,
      donus_notlar
    };

    await partiDonusuKaydet(parseInt(id), donusData, urunler, yapan || 'Sistem');

    res.json({ success: true, message: 'Parti dönüşü kaydedildi' });
  } catch (error) {
    console.error('Parti dönüş hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// KALİTE KONTROL

/**
 * POST /api/temizleme-takip/partiler/:id/kalite-kontrol
 * Kalite kontrol yap
 */
router.post('/partiler/:id/kalite-kontrol', async (req, res) => {
  try {
    const { id } = req.params;
    const { karar, kontrol_edilen_adet, hata_adet, hata_detay, aciklama, problem_kategorileri, yapan } = req.body;

    if (!karar || !kontrol_edilen_adet) {
      return res.status(400).json({ error: 'Karar ve kontrol edilen adet gerekli!' });
    }

    if (!['kabul', 'red', 'tekrar_temizlik'].includes(karar)) {
      return res.status(400).json({ error: 'Geçersiz karar! (kabul/red/tekrar_temizlik)' });
    }

    const kaliteData = {
      karar,
      kontrol_edilen_adet,
      hata_adet: hata_adet || 0,
      hata_detay,
      aciklama,
      problem_kategorileri
    };

    const result = await kaliteKontrolYap(parseInt(id), kaliteData, yapan || 'Sistem');

    res.json({ success: true, message: 'Kalite kontrol tamamlandı', hataOrani: result.hataOrani });
  } catch (error) {
    console.error('Kalite kontrol hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/temizleme-takip/partiler/:id/kalite-gecmis
 * Kalite kontrol geçmişi
 */
router.get('/partiler/:id/kalite-gecmis', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT * FROM temizleme_kalite_kontrol_log
      WHERE parti_id = $1
      ORDER BY karar_tarihi DESC
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Kalite geçmiş hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// RAPORLAMA

/**
 * GET /api/temizleme-takip/raporlar/ozet
 * Genel özet rapor
 */
router.get('/raporlar/ozet', async (req, res) => {
  try {
    // Toplam parti sayısı
    const toplamParti = await pool.query(`
      SELECT COUNT(*) as toplam FROM temizleme_partiler
    `);

    // Durum dağılımı
    const durumDagilimi = await pool.query(`
      SELECT durum, COUNT(*) as sayi
      FROM temizleme_partiler
      GROUP BY durum
    `);

    // Durum dağılımını objeye çevir
    const durumObj = {};
    durumDagilimi.rows.forEach(row => {
      durumObj[row.durum] = parseInt(row.sayi);
    });

    // Kalite kontrol sonuçları
    const kaliteKontrol = await pool.query(`
      SELECT
        karar,
        COUNT(*) as sayi,
        AVG(hata_orani) as ortalama_hata_orani
      FROM temizleme_kalite_kontrol_log
      GROUP BY karar
    `);

    // Ortalama kalite oranı (100 - ortalama hata oranı) - division by zero kontrolü
    const rowCount = kaliteKontrol.rows.length;
    const ortalamaHataOrani = rowCount > 0
      ? kaliteKontrol.rows.reduce((acc, row) => acc + (parseFloat(row.ortalama_hata_orani) || 0), 0) / rowCount
      : 0;
    const ortalamaKaliteOrani = 100 - ortalamaHataOrani;

    // Toplam kayıplar
    const toplamKayiplar = await pool.query(`
      SELECT
        SUM(ABS(kg_farki)) as toplam_kg_kaybi,
        SUM(ABS(adet_farki)) as toplam_adet_kaybi
      FROM temizleme_partiler
      WHERE donus_tarihi IS NOT NULL AND adet_farki < 0
    `);

    res.json({
      toplam_parti: parseInt(toplamParti.rows[0].toplam),
      durum_dagilimi: durumObj,
      ortalama_kalite_orani: parseFloat(ortalamaKaliteOrani.toFixed(2)),
      toplam_kg_kaybi: parseFloat(toplamKayiplar.rows[0].toplam_kg_kaybi || 0),
      toplam_adet_kaybi: parseInt(toplamKayiplar.rows[0].toplam_adet_kaybi || 0)
    });
  } catch (error) {
    console.error('Özet rapor hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/temizleme-takip/raporlar/urun-bazli
 * Ürün bazlı kayıp raporu
 */
router.get('/raporlar/urun-bazli', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.urun_kodu,
        u.tip,
        SUM(pu.gidis_adet) as toplam_gidis_adet,
        SUM(pu.gidis_kg) as toplam_gidis_kg,
        SUM(pu.donus_adet) as toplam_donus_adet,
        SUM(pu.donus_kg) as toplam_donus_kg,
        SUM(ABS(pu.adet_farki)) as kayip_adet,
        SUM(ABS(pu.kg_farki)) as kayip_kg,
        COUNT(DISTINCT pu.parti_id) as parti_sayisi
      FROM temizleme_parti_urunler pu
      JOIN surec_urunler u ON pu.urun_id = u.id
      JOIN temizleme_partiler p ON pu.parti_id = p.id
      WHERE p.donus_tarihi IS NOT NULL AND pu.adet_farki < 0
      GROUP BY u.urun_kodu, u.tip
      ORDER BY kayip_adet DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Ürün bazlı rapor hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// FİYATLANDIRMA

/**
 * GET /api/temizleme-takip/fiyatlandirma
 * Aktif fiyatlandırmayı getir
 */
router.get('/fiyatlandirma', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM temizleme_fiyatlandirma
      WHERE aktif = true
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.json({
        birim_fiyat_kg: 0.75,
        birim_fiyat_adet: 5.50
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Fiyatlandırma hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/temizleme-takip/fiyatlandirma
 * Yeni fiyatlandırma kaydet
 */
router.post('/fiyatlandirma', async (req, res) => {
  const client = await pool.connect();
  try {
    const { birim_fiyat_kg, birim_fiyat_adet, urun_tipi, notlar, yapan } = req.body;

    if (!birim_fiyat_kg || !birim_fiyat_adet) {
      return res.status(400).json({ error: 'Birim fiyatlar gerekli!' });
    }

    await client.query('BEGIN');

    // Mevcut fiyatlandırmayı pasifleştir
    await client.query(`
      UPDATE temizleme_fiyatlandirma
      SET aktif = false, gecerli_tarih_bitis = CURRENT_DATE
      WHERE aktif = true AND urun_tipi = $1
    `, [urun_tipi || 'genel']);

    // Yeni fiyatlandırma ekle
    const result = await client.query(`
      INSERT INTO temizleme_fiyatlandirma (
        urun_tipi, birim_fiyat_kg, birim_fiyat_adet,
        gecerli_tarih_baslangic, aktif, notlar, created_by
      ) VALUES ($1, $2, $3, CURRENT_DATE, true, $4, $5)
      RETURNING *
    `, [urun_tipi || 'genel', birim_fiyat_kg, birim_fiyat_adet, notlar, yapan || 'Sistem']);

    await client.query('COMMIT');

    res.json({ success: true, fiyatlandirma: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Fiyatlandırma kayıt hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// ÖDEME HESAPLAMA VE RAPORLAMA

/**
 * POST /api/temizleme-takip/partiler/:id/odeme-hesapla
 * Parti için ödeme hesapla
 */
router.post('/partiler/:id/odeme-hesapla', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    // Parti bilgisini getir
    const parti = await client.query(`
      SELECT * FROM temizleme_partiler WHERE id = $1
    `, [id]);

    if (parti.rows.length === 0) {
      return res.status(404).json({ error: 'Parti bulunamadı!' });
    }

    const partiData = parti.rows[0];

    // Kalite kontrol yapıldı mı kontrol et
    if (partiData.durum !== 'kabul') {
      return res.status(400).json({ error: 'Ödeme hesabı için kalite kontrol kabul edilmelidir!' });
    }

    // Aktif fiyatlandırmayı getir
    let fiyat = await client.query(`
      SELECT * FROM temizleme_fiyatlandirma
      WHERE aktif = true
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (fiyat.rows.length === 0) {
      fiyat = { birim_fiyat_kg: 0.75, birim_fiyat_adet: 5.50 };
    } else {
      fiyat = fiyat.rows[0];
    }

    // Parti ürünlerini getir
    const urunler = await client.query(`
      SELECT
        pu.*,
        u.urun_kodu,
        u.tip
      FROM temizleme_parti_urunler pu
      JOIN surec_urunler u ON pu.urun_id = u.id
      WHERE pu.parti_id = $1
    `, [id]);

    // Her ürün için ödenecek miktarı hesapla
    let toplamOdenecek = 0;
    const urunDetaylari = [];

    for (const urun of urunler.rows) {
      // Ödenecek miktar = dönüş miktarı - hatalı miktar
      const odenecekAdet = urun.odenecek_adet !== null ? urun.odenecek_adet : urun.donus_adet;
      const odenecekKg = urun.odenecek_kg !== null ? urun.odenecek_kg : urun.donus_kg;

      const urunTutari = (odenecekAdet * fiyat.birim_fiyat_adet) + (odenecekKg * fiyat.birim_fiyat_kg);
      toplamOdenecek += urunTutari;

      urunDetaylari.push({
        urun_kodu: urun.urun_kodu,
        tip: urun.tip,
        gidis_adet: urun.gidis_adet,
        gidis_kg: urun.gidis_kg,
        donus_adet: urun.donus_adet,
        donus_kg: urun.donus_kg,
        odenecek_adet: odenecekAdet,
        odenecek_kg: odenecekKg,
        odenmeyecek_adet: urun.odenmeyecek_adet || 0,
        odenmeyecek_kg: urun.odenmeyecek_kg || 0,
        hata_adet: urun.hata_adet || 0,
        tutar: urunTutari.toFixed(2)
      });
    }

    // Parti tablosunu güncelle
    await client.query(`
      UPDATE temizleme_partiler
      SET
        birim_fiyat_kg = $1,
        birim_fiyat_adet = $2,
        odenecek_tutar = $3,
        odeme_durumu = 'odenecek'
      WHERE id = $4
    `, [fiyat.birim_fiyat_kg, fiyat.birim_fiyat_adet, toplamOdenecek.toFixed(2), id]);

    res.json({
      success: true,
      parti_no: partiData.parti_no,
      toplam_odenecek: toplamOdenecek.toFixed(2),
      birim_fiyat_kg: fiyat.birim_fiyat_kg,
      birim_fiyat_adet: fiyat.birim_fiyat_adet,
      urun_detaylari: urunDetaylari
    });
  } catch (error) {
    console.error('Ödeme hesaplama hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

/**
 * GET /api/temizleme-takip/raporlar/odeme-raporu
 * Ödeme raporu - tüm partilerin ödeme durumu
 */
router.get('/raporlar/odeme-raporu', async (req, res) => {
  try {
    const { durum } = req.query;

    let whereClause = "WHERE p.durum = 'kabul'";
    let params = [];
    let paramCount = 1;

    if (durum) {
      whereClause += ` AND p.odeme_durumu = $${paramCount}`;
      params.push(durum);
      paramCount++;
    }

    const result = await pool.query(`
      SELECT
        p.id,
        p.parti_no,
        p.irsaliye_no,
        p.gidis_tarihi,
        p.donus_tarihi,
        p.gidis_adet,
        p.gidis_kg,
        p.donus_adet,
        p.donus_kg,
        p.birim_fiyat_kg,
        p.birim_fiyat_adet,
        p.odenecek_tutar,
        p.odenen_tutar,
        p.odeme_durumu,
        p.odeme_tarihi,
        p.odeme_notlari,
        (
          SELECT SUM(pu.odenecek_adet)
          FROM temizleme_parti_urunler pu
          WHERE pu.parti_id = p.id
        ) as toplam_odenecek_adet,
        (
          SELECT SUM(pu.odenecek_kg)
          FROM temizleme_parti_urunler pu
          WHERE pu.parti_id = p.id
        ) as toplam_odenecek_kg,
        (
          SELECT SUM(pu.odenmeyecek_adet)
          FROM temizleme_parti_urunler pu
          WHERE pu.parti_id = p.id
        ) as toplam_odenmeyecek_adet,
        (
          SELECT SUM(pu.odenmeyecek_kg)
          FROM temizleme_parti_urunler pu
          WHERE pu.parti_id = p.id
        ) as toplam_odenmeyecek_kg
      FROM temizleme_partiler p
      ${whereClause}
      ORDER BY p.gidis_tarihi DESC
    `, params);

    // Toplam özet hesapla
    const toplam = {
      toplam_parti: result.rows.length,
      toplam_odenecek_tutar: result.rows.reduce((sum, p) => sum + parseFloat(p.odenecek_tutar || 0), 0),
      toplam_odenen_tutar: result.rows.reduce((sum, p) => sum + parseFloat(p.odenen_tutar || 0), 0),
      kalan_borc: 0
    };
    toplam.kalan_borc = toplam.toplam_odenecek_tutar - toplam.toplam_odenen_tutar;

    res.json({
      partiler: result.rows,
      ozet: toplam
    });
  } catch (error) {
    console.error('Ödeme raporu hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/temizleme-takip/partiler/:id/odeme-detay
 * Parti için detaylı ödeme bilgisi
 */
router.get('/partiler/:id/odeme-detay', async (req, res) => {
  try {
    const { id } = req.params;

    // Parti bilgisi
    const parti = await pool.query(`
      SELECT * FROM temizleme_partiler WHERE id = $1
    `, [id]);

    if (parti.rows.length === 0) {
      return res.status(404).json({ error: 'Parti bulunamadı!' });
    }

    // Ürün detayları
    const urunler = await pool.query(`
      SELECT
        pu.*,
        u.urun_kodu,
        u.tip
      FROM temizleme_parti_urunler pu
      JOIN surec_urunler u ON pu.urun_id = u.id
      WHERE pu.parti_id = $1
    `, [id]);

    // Ödeme geçmişi
    const odemeGecmisi = await pool.query(`
      SELECT * FROM temizleme_odeme_log
      WHERE parti_id = $1
      ORDER BY odeme_tarihi DESC
    `, [id]);

    res.json({
      parti: parti.rows[0],
      urunler: urunler.rows,
      odeme_gecmisi: odemeGecmisi.rows
    });
  } catch (error) {
    console.error('Ödeme detay hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/temizleme-takip/partiler/:id/odeme-kaydet
 * Ödeme kaydı yap
 */
router.post('/partiler/:id/odeme-kaydet', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { odeme_tutari, odeme_tarihi, odeme_yontemi, aciklama, yapan } = req.body;

    if (!odeme_tutari || !odeme_tarihi) {
      return res.status(400).json({ error: 'Ödeme tutarı ve tarihi gerekli!' });
    }

    await client.query('BEGIN');

    // Parti bilgisini getir
    const parti = await client.query(`
      SELECT * FROM temizleme_partiler WHERE id = $1
    `, [id]);

    if (parti.rows.length === 0) {
      throw new Error('Parti bulunamadı!');
    }

    const partiData = parti.rows[0];
    const yeniOdenenTutar = parseFloat(partiData.odenen_tutar || 0) + parseFloat(odeme_tutari);
    const odenecekTutar = parseFloat(partiData.odenecek_tutar || 0);

    let yeniOdemeDurumu = 'kismen_odendi';
    let odemeTipi = 'kismen';

    if (yeniOdenenTutar >= odenecekTutar) {
      yeniOdemeDurumu = 'odendi';
      odemeTipi = 'tam';
    }

    // Ödeme log'u ekle
    await client.query(`
      INSERT INTO temizleme_odeme_log (
        parti_id, odeme_tipi, odeme_tutari, odeme_tarihi,
        odeme_yontemi, aciklama, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [id, odemeTipi, odeme_tutari, odeme_tarihi, odeme_yontemi, aciklama, yapan || 'Sistem']);

    // Parti durumunu güncelle
    await client.query(`
      UPDATE temizleme_partiler
      SET
        odenen_tutar = $1,
        odeme_durumu = $2,
        odeme_tarihi = $3
      WHERE id = $4
    `, [yeniOdenenTutar, yeniOdemeDurumu, odeme_tarihi, id]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Ödeme kaydedildi',
      odenen_tutar: yeniOdenenTutar,
      kalan_borc: (odenecekTutar - yeniOdenenTutar).toFixed(2),
      odeme_durumu: yeniOdemeDurumu
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Ödeme kayıt hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;
