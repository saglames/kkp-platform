const express = require('express');
const router = express.Router();
const pool = require('../db');

// ANASAYFA - Tüm süreç özeti
router.get('/anasayfa', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM surec_anasayfa ORDER BY urun_kodu');
    res.json(result.rows);
  } catch (error) {
    console.error('Anasayfa getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// ÜRÜNLER - Tüm ürünleri getir
router.get('/urunler', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM surec_urunler WHERE aktif = TRUE ORDER BY urun_kodu'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Ürünler getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// TEMİZLEMEYE GİDECEK - Liste
router.get('/temizlemeye-gidecek', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tg.*, u.tip, u.urun_kodu, u.urun_kodu_base
      FROM surec_temizlemeye_gidecek tg
      JOIN surec_urunler u ON tg.urun_id = u.id
      WHERE u.aktif = TRUE
      ORDER BY u.urun_kodu
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Temizlemeye gidecek getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// TEMİZLEMEYE GİDECEK - Adet ekle
router.post('/temizlemeye-gidecek/ekle', async (req, res) => {
  const { urun_id, adet, yapan } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Mevcut adeti al
    const current = await client.query(
      'SELECT adet FROM surec_temizlemeye_gidecek WHERE urun_id = $1',
      [urun_id]
    );

    const yeniAdet = (current.rows[0]?.adet || 0) + adet;

    // Güncelle veya ekle
    const result = await client.query(`
      INSERT INTO surec_temizlemeye_gidecek (urun_id, adet, updated_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (urun_id)
      DO UPDATE SET adet = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [urun_id, yeniAdet, yapan]);

    // Log kaydı
    await client.query(`
      INSERT INTO surec_hareket_log (urun_id, islem_tipi, hedef, adet, yapan)
      VALUES ($1, 'temizlemeye_ekle', 'temizlemeye_gidecek', $2, $3)
    `, [urun_id, adet, yapan]);

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Temizlemeye gidecek ekleme hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// TEMİZLEMEYE GÖNDER - Temizlemeye Gidecek'ten Temizlemede Olan'a transfer
// VE Sevkiyat Takip sistemine kayıt
router.post('/temizlemeye-gonder', async (req, res) => {
  const { urun_id, adet, kg, yapan, irsaliye_no, parti_no } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Ürün bilgilerini al (urun_kodu ve parca_tipi için)
    const urunResult = await client.query(
      'SELECT urun_kodu, tip FROM surec_urunler WHERE id = $1',
      [urun_id]
    );

    if (urunResult.rows.length === 0) {
      throw new Error('Ürün bulunamadı!');
    }

    const { urun_kodu, tip: parca_tipi } = urunResult.rows[0];

    // Kg hesaplaması (eğer girilmemişse)
    let calculated_kg = kg;
    if (!kg && adet) {
      // Ürün kodundan base kodu al (parantez içini çıkar)
      const base_urun_kodu = urun_kodu.replace(/\s*\([ABCD]\)\s*$/, '').trim();

      // Ağırlık bilgisini al
      const agirlikResult = await client.query(
        `SELECT agirlik_a, agirlik_b, agirlik_c, agirlik_d
         FROM urun_agirliklari_master
         WHERE urun_kodu = $1`,
        [base_urun_kodu]
      );

      if (agirlikResult.rows.length > 0) {
        const agirlik = agirlikResult.rows[0];
        const parca = parca_tipi?.toUpperCase();

        if (parca === 'A' && agirlik.agirlik_a) {
          calculated_kg = adet * parseFloat(agirlik.agirlik_a);
        } else if (parca === 'B' && agirlik.agirlik_b) {
          calculated_kg = adet * parseFloat(agirlik.agirlik_b);
        } else if (parca === 'C' && agirlik.agirlik_c) {
          calculated_kg = adet * parseFloat(agirlik.agirlik_c);
        } else if (parca === 'D' && agirlik.agirlik_d) {
          calculated_kg = adet * parseFloat(agirlik.agirlik_d);
        }
      }
    }

    // Temizlemeye Gidecek'ten düş
    const gidecek = await client.query(
      'SELECT adet FROM surec_temizlemeye_gidecek WHERE urun_id = $1',
      [urun_id]
    );

    if (!gidecek.rows[0] || gidecek.rows[0].adet < adet) {
      throw new Error('Yeterli adet yok!');
    }

    const yeniGidecekAdet = gidecek.rows[0].adet - adet;
    await client.query(
      'UPDATE surec_temizlemeye_gidecek SET adet = $1, updated_by = $2 WHERE urun_id = $3',
      [yeniGidecekAdet, yapan, urun_id]
    );

    // Temizlemede Olan'a ekle
    const olan = await client.query(
      'SELECT adet FROM surec_temizlemede_olan WHERE urun_id = $1',
      [urun_id]
    );

    const yeniOlanAdet = (olan.rows[0]?.adet || 0) + adet;
    await client.query(`
      INSERT INTO surec_temizlemede_olan (urun_id, adet, updated_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (urun_id)
      DO UPDATE SET adet = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP
    `, [urun_id, yeniOlanAdet, yapan]);

    // ===== SEVKIYAT TAKİP SİSTEMİNE KAYIT =====
    // Parti numarası kullanıcı tarafından girilmeli
    if (!parti_no) {
      throw new Error('Parti numarası girilmedi!');
    }

    // Aynı parti numarasına sahip sevkiyat var mı kontrol et
    const existingSevkiyat = await client.query(
      'SELECT id FROM temizleme_sevkiyat WHERE sevkiyat_no = $1',
      [parti_no]
    );

    let final_sevkiyat_id;

    if (existingSevkiyat.rows.length > 0) {
      // Mevcut partiye ekleme yap
      final_sevkiyat_id = existingSevkiyat.rows[0].id;
    } else {
      // Yeni parti oluştur
      const sevkiyatResult = await client.query(
        `INSERT INTO temizleme_sevkiyat
         (sevkiyat_no, irsaliye_no, gonderim_tarihi, durum)
         VALUES ($1, $2, CURRENT_TIMESTAMP, 'gonderildi')
         RETURNING id`,
        [parti_no, irsaliye_no]
      );

      final_sevkiyat_id = sevkiyatResult.rows[0].id;
    }

    // Sevkiyata ürün ekle
    await client.query(
      `INSERT INTO sevkiyat_urunler
       (sevkiyat_id, urun_kodu, parca_tipi, giden_adet, giden_kg, gonderim_tarihi, is_mukerrer)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, false)`,
      [final_sevkiyat_id, urun_kodu, parca_tipi, adet, calculated_kg || 0]
    );

    // Log
    await client.query(`
      INSERT INTO surec_hareket_log (urun_id, islem_tipi, kaynak, hedef, adet, kg, yapan, gidis_kg)
      VALUES ($1, 'temizlemeye_gonder', 'temizlemeye_gidecek', 'temizlemede_olan', $2, $3, $4, $5)
    `, [urun_id, adet, calculated_kg, yapan, calculated_kg]);

    await client.query('COMMIT');
    res.json({
      success: true,
      message: 'Transfer başarılı',
      sevkiyat_id: final_sevkiyat_id,
      calculated_kg: calculated_kg
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Temizlemeye gönderme hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// TEMİZLEMEDE OLAN - Liste
router.get('/temizlemede-olan', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT to2.*, u.tip, u.urun_kodu, u.urun_kodu_base
      FROM surec_temizlemede_olan to2
      JOIN surec_urunler u ON to2.urun_id = u.id
      WHERE u.aktif = TRUE
      ORDER BY u.urun_kodu
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Temizlemede olan getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// TEMİZLEMEDEN GETİR - Temizlemede Olan'dan Temizlemeden Gelen'e transfer
// VE Sevkiyat Takip sistemini güncelle
router.post('/temizlemeden-getir', async (req, res) => {
  const { urun_id, adet, kg, yapan } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Ürün bilgilerini al
    const urunResult = await client.query(
      'SELECT urun_kodu, tip FROM surec_urunler WHERE id = $1',
      [urun_id]
    );

    if (urunResult.rows.length === 0) {
      throw new Error('Ürün bulunamadı!');
    }

    const { urun_kodu, tip: parca_tipi } = urunResult.rows[0];

    // Kg hesaplaması (eğer girilmemişse)
    let calculated_kg = kg;
    if (!kg && adet) {
      const base_urun_kodu = urun_kodu.replace(/\s*\([ABCD]\)\s*$/, '').trim();

      const agirlikResult = await client.query(
        `SELECT agirlik_a, agirlik_b, agirlik_c, agirlik_d
         FROM urun_agirliklari_master
         WHERE urun_kodu = $1`,
        [base_urun_kodu]
      );

      if (agirlikResult.rows.length > 0) {
        const agirlik = agirlikResult.rows[0];
        const parca = parca_tipi?.toUpperCase();

        if (parca === 'A' && agirlik.agirlik_a) {
          calculated_kg = adet * parseFloat(agirlik.agirlik_a);
        } else if (parca === 'B' && agirlik.agirlik_b) {
          calculated_kg = adet * parseFloat(agirlik.agirlik_b);
        } else if (parca === 'C' && agirlik.agirlik_c) {
          calculated_kg = adet * parseFloat(agirlik.agirlik_c);
        } else if (parca === 'D' && agirlik.agirlik_d) {
          calculated_kg = adet * parseFloat(agirlik.agirlik_d);
        }
      }
    }


    // Temizlemede Olan'dan düş
    const olan = await client.query(
      'SELECT adet FROM surec_temizlemede_olan WHERE urun_id = $1',
      [urun_id]
    );

    if (!olan.rows[0] || olan.rows[0].adet < adet) {
      throw new Error('Yeterli adet yok!');
    }

    const yeniOlanAdet = olan.rows[0].adet - adet;
    await client.query(
      'UPDATE surec_temizlemede_olan SET adet = $1, updated_by = $2 WHERE urun_id = $3',
      [yeniOlanAdet, yapan, urun_id]
    );

    // Temizlemeden Gelen'e ekle
    const gelen = await client.query(
      'SELECT adet, kg FROM surec_temizlemeden_gelen WHERE urun_id = $1',
      [urun_id]
    );

    const yeniGelenAdet = (gelen.rows[0]?.adet || 0) + adet;
    const yeniKg = (gelen.rows[0]?.kg || 0) + (calculated_kg || 0);

    await client.query(`
      INSERT INTO surec_temizlemeden_gelen (urun_id, adet, kg, updated_by)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (urun_id)
      DO UPDATE SET adet = $2, kg = $3, updated_by = $4, updated_at = CURRENT_TIMESTAMP
    `, [urun_id, yeniGelenAdet, yeniKg, yapan]);

    // Sevkiyat takip sistemini güncelle (en son gönderilen ürünü bul ve gelen bilgilerini güncelle)
    const sevkiyatUrunResult = await client.query(`
      SELECT id FROM sevkiyat_urunler
      WHERE urun_kodu = $1
        AND parca_tipi = $2
        AND gelen_adet IS NULL
      ORDER BY gonderim_tarihi DESC
      LIMIT 1
    `, [urun_kodu, parca_tipi]);

    if (sevkiyatUrunResult.rows.length > 0) {
      const sevkiyat_urun_id = sevkiyatUrunResult.rows[0].id;

      await client.query(`
        UPDATE sevkiyat_urunler
        SET gelen_adet = $1, gelen_kg = $2, gelis_tarihi = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [adet, calculated_kg || 0, sevkiyat_urun_id]);

      console.log(`✅ Sevkiyat güncellendi: ${urun_kodu} - ${adet} adet, ${calculated_kg || 0} kg`);
    } else {
      console.log(`⚠️ Sevkiyat kaydı bulunamadı: ${urun_kodu} (${parca_tipi})`);
    }

    // Log
    await client.query(`
      INSERT INTO surec_hareket_log (urun_id, islem_tipi, kaynak, hedef, adet, kg, yapan, donus_kg)
      VALUES ($1, 'temizlemeden_getir', 'temizlemede_olan', 'temizlemeden_gelen', $2, $3, $4, $5)
    `, [urun_id, adet, calculated_kg, yapan, calculated_kg]);

    await client.query('COMMIT');
    res.json({
      success: true,
      message: 'Transfer başarılı',
      calculated_kg: calculated_kg
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Temizlemeden getirme hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// TEMİZLEMEDEN GELEN - Liste
router.get('/temizlemeden-gelen', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tg.*, u.tip, u.urun_kodu, u.urun_kodu_base
      FROM surec_temizlemeden_gelen tg
      JOIN surec_urunler u ON tg.urun_id = u.id
      WHERE u.aktif = TRUE
      ORDER BY u.urun_kodu
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Temizlemeden gelen getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// SEVKE HAZIR - Liste
router.get('/sevke-hazir', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM surec_sevke_hazir
      ORDER BY urun_kodu_base
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Sevke hazır getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// SEVKE HAZIRLA - Temizlemeden Gelen'den Sevke Hazır'a
router.post('/sevke-hazirla', async (req, res) => {
  const { urun_id, adet, yapan } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Ürün bilgilerini al
    const urun = await client.query(
      'SELECT urun_kodu_base FROM surec_urunler WHERE id = $1',
      [urun_id]
    );

    if (!urun.rows[0]) {
      throw new Error('Ürün bulunamadı!');
    }

    let urun_kodu_base = urun.rows[0].urun_kodu_base;

    // Parantez kısmını çıkar - sadece base kodu al (CMY-Y102SS-TR (A) -> CMY-Y102SS-TR)
    urun_kodu_base = urun_kodu_base.replace(/\s*\([AB]\)\s*$/, '').trim();

    // Aynı base koda sahip A ve B parçalarını al (temizlemeden gelen'den)
    // Base kod eşleşmesi için parantez kısmını göz ardı et
    const parcalar = await client.query(`
      SELECT tg.urun_id, tg.adet, u.urun_kodu, u.urun_kodu_base
      FROM surec_temizlemeden_gelen tg
      JOIN surec_urunler u ON tg.urun_id = u.id
      WHERE REGEXP_REPLACE(u.urun_kodu_base, '\\s*\\([AB]\\)\\s*$', '', 'g') = $1 AND tg.adet > 0
      ORDER BY u.urun_kodu
    `, [urun_kodu_base]);

    if (parcalar.rows.length === 0) {
      throw new Error('Temizlemeden gelen\'de ürün bulunamadı!');
    }

    // Minimum adedi bul (A ve B'nin en azı)
    const minAdet = Math.min(...parcalar.rows.map(p => p.adet));

    // Kullanıcının girdiği adet minimum adetten fazla olamaz
    const transferAdet = Math.min(adet, minAdet);

    if (transferAdet === 0) {
      throw new Error('Transfer edilecek adet yok!');
    }

    // Her parçadan (A ve B) aynı miktarda düş
    for (const parca of parcalar.rows) {
      const yeniAdet = parca.adet - transferAdet;
      await client.query(
        'UPDATE surec_temizlemeden_gelen SET adet = $1, updated_by = $2 WHERE urun_id = $3',
        [yeniAdet, yapan, parca.urun_id]
      );

      // Log her parça için
      await client.query(`
        INSERT INTO surec_hareket_log (urun_id, islem_tipi, kaynak, hedef, adet, yapan)
        VALUES ($1, 'sevke_hazirla', 'temizlemeden_gelen', 'sevke_hazir', $2, $3)
      `, [parca.urun_id, transferAdet, yapan]);
    }

    // Sevke Hazır'a ekle (A ve B birleşik olarak)
    const hazir = await client.query(
      'SELECT adet FROM surec_sevke_hazir WHERE urun_kodu_base = $1',
      [urun_kodu_base]
    );

    const yeniHazirAdet = (hazir.rows[0]?.adet || 0) + transferAdet;

    await client.query(`
      INSERT INTO surec_sevke_hazir (urun_kodu_base, adet, updated_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (urun_kodu_base)
      DO UPDATE SET adet = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP
    `, [urun_kodu_base, yeniHazirAdet, yapan]);

    await client.query('COMMIT');

    // Kullanıcıya bilgi ver
    let message = `${transferAdet} adet sevke hazır yapıldı`;
    if (transferAdet < adet) {
      message += ` (İstenen: ${adet}, Minimum: ${minAdet})`;
    }

    res.json({
      success: true,
      message: message,
      transferredAmount: transferAdet,
      requestedAmount: adet
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Sevke hazırlama hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// SEVK ET - Sevke Hazır'dan Sevk Edilen'e
router.post('/sevk-et', async (req, res) => {
  const { urun_kodu_base, adet, tarih, gonderildigi_yer, irsaliye_numarasi, notlar, yapan } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Sevke Hazır'dan düş
    const hazir = await client.query(
      'SELECT adet FROM surec_sevke_hazir WHERE urun_kodu_base = $1',
      [urun_kodu_base]
    );

    if (!hazir.rows[0] || hazir.rows[0].adet < adet) {
      throw new Error('Yeterli adet yok!');
    }

    const yeniHazirAdet = hazir.rows[0].adet - adet;
    await client.query(
      'UPDATE surec_sevke_hazir SET adet = $1, updated_by = $2 WHERE urun_kodu_base = $3',
      [yeniHazirAdet, yapan, urun_kodu_base]
    );

    // Tarih yoksa bugünün tarihi kullan
    const sevkTarihi = tarih || new Date().toISOString().split('T')[0];

    // Sevk Edilen'e ekle
    const result = await client.query(`
      INSERT INTO surec_sevk_edilen
        (tip, urun_kodu_base, tarih, adet, gonderildigi_yer, irsaliye_numarasi, notlar, created_by)
      VALUES ('Joint', $1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [urun_kodu_base, sevkTarihi, adet, gonderildigi_yer, irsaliye_numarasi, notlar, yapan]);

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Sevk etme hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// SEVK EDİLEN - Geçmiş liste
router.get('/sevk-edilen', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM surec_sevk_edilen
      ORDER BY tarih DESC, id DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Sevk edilen getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// SEVK EDİLEN - Manuel Ekle
router.post('/sevk-edilen', async (req, res) => {
  const { tip, urun_kodu_base, tarih, adet, gonderildigi_yer, irsaliye_numarasi, notlar, created_by } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO surec_sevk_edilen
        (tip, urun_kodu_base, tarih, adet, gonderildigi_yer, irsaliye_numarasi, notlar, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [tip, urun_kodu_base, tarih, adet, gonderildigi_yer, irsaliye_numarasi, notlar, created_by]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Sevk edilen ekleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// SEVK EDİLEN - Güncelle
router.put('/sevk-edilen/:id', async (req, res) => {
  const { id } = req.params;
  const { tip, urun_kodu_base, tarih, adet, gonderildigi_yer, irsaliye_numarasi, notlar } = req.body;

  try {
    const result = await pool.query(`
      UPDATE surec_sevk_edilen
      SET tip = $1, urun_kodu_base = $2, tarih = $3, adet = $4,
          gonderildigi_yer = $5, irsaliye_numarasi = $6, notlar = $7
      WHERE id = $8
      RETURNING *
    `, [tip, urun_kodu_base, tarih, adet, gonderildigi_yer, irsaliye_numarasi, notlar, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Sevk edilen güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// SEVK EDİLEN - Sil
router.delete('/sevk-edilen/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM surec_sevk_edilen WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Sevk edilen silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// KALAN - Liste
router.get('/kalan', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT k.*, u.tip, u.urun_kodu, u.urun_kodu_base
      FROM surec_kalan k
      JOIN surec_urunler u ON k.urun_id = u.id
      WHERE u.aktif = TRUE
      ORDER BY u.urun_kodu
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Kalan getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// KALAN - Notları güncelle
router.put('/kalan/:urun_id/notlar', async (req, res) => {
  const { urun_id } = req.params;
  const { notlar, tapali_bekleyen_notlar, yapan } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO surec_kalan (urun_id, notlar, tapali_bekleyen_notlar, updated_by)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (urun_id)
      DO UPDATE SET
        notlar = $2,
        tapali_bekleyen_notlar = $3,
        updated_by = $4,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [urun_id, notlar, tapali_bekleyen_notlar, yapan]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Kalan notları güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// HAREKET LOGları - Son hareketler
router.get('/hareket-log', async (req, res) => {
  const { limit = 50 } = req.query;

  try {
    const result = await pool.query(`
      SELECT hl.*, u.urun_kodu
      FROM surec_hareket_log hl
      JOIN surec_urunler u ON hl.urun_id = u.id
      ORDER BY hl.created_at DESC
      LIMIT $1
    `, [limit]);

    res.json(result.rows);
  } catch (error) {
    console.error('Hareket log getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// İSTATİSTİKLER
router.get('/istatistikler', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        SUM(tg.adet) as toplam_temizlemeye_gidecek,
        SUM(to2.adet) as toplam_temizlemede_olan,
        SUM(tgelen.adet) as toplam_temizlemeden_gelen,
        SUM(sh.adet) as toplam_sevke_hazir,
        (SELECT SUM(adet) FROM surec_sevk_edilen WHERE tarih >= CURRENT_DATE - INTERVAL '30 days') as son_30_gun_sevk
      FROM surec_temizlemeye_gidecek tg
      FULL OUTER JOIN surec_temizlemede_olan to2 ON TRUE
      FULL OUTER JOIN surec_temizlemeden_gelen tgelen ON TRUE
      FULL OUTER JOIN surec_sevke_hazir sh ON TRUE
    `);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('İstatistik getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// TEMİZLEMEYE GİDECEK - Manuel ekleme
router.post('/temizlemeye-gidecek', async (req, res) => {
  const { tip, urun_kodu, adet, created_by } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Ürün var mı kontrol et
    let urun = await client.query(
      'SELECT id FROM surec_urunler WHERE urun_kodu = $1',
      [urun_kodu]
    );

    let urun_id;
    if (urun.rows.length === 0) {
      // Ürün yoksa ekle
      const newUrun = await client.query(`
        INSERT INTO surec_urunler (tip, urun_kodu, urun_kodu_base)
        VALUES ($1, $2, $2)
        RETURNING id
      `, [tip || 'Joint', urun_kodu]);
      urun_id = newUrun.rows[0].id;
    } else {
      urun_id = urun.rows[0].id;
    }

    // Temizlemeye gidecek'e ekle veya güncelle
    const result = await client.query(`
      INSERT INTO surec_temizlemeye_gidecek (urun_id, adet, updated_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (urun_id)
      DO UPDATE SET
        adet = surec_temizlemeye_gidecek.adet + EXCLUDED.adet,
        updated_by = EXCLUDED.updated_by,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [urun_id, adet, created_by || 'esat']);

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Temizlemeye gidecek ekleme hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// TEMİZLEMEYE GİDECEK - Direkt güncelle
router.put('/temizlemeye-gidecek/:id', async (req, res) => {
  const { id } = req.params;
  const { adet, yapan } = req.body;

  try {
    const result = await pool.query(`
      UPDATE surec_temizlemeye_gidecek
      SET adet = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [adet, yapan || 'Manuel Güncelleme', id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Temizlemeye gidecek güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// TEMİZLEMEYE GİDECEK - Sil
router.delete('/temizlemeye-gidecek/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM surec_temizlemeye_gidecek WHERE id = $1', [id]);
    res.json({ message: 'Kayıt silindi' });
  } catch (error) {
    console.error('Temizlemeye gidecek silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// TEMİZLEMEDE OLAN - Manuel ekleme
router.post('/temizlemede-olan', async (req, res) => {
  const { tip, urun_kodu, adet, created_by } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let urun = await client.query('SELECT id FROM surec_urunler WHERE urun_kodu = $1', [urun_kodu]);
    let urun_id;
    if (urun.rows.length === 0) {
      const newUrun = await client.query(
        'INSERT INTO surec_urunler (tip, urun_kodu, urun_kodu_base) VALUES ($1, $2, $2) RETURNING id',
        [tip || 'Joint', urun_kodu]
      );
      urun_id = newUrun.rows[0].id;
    } else {
      urun_id = urun.rows[0].id;
    }

    const result = await client.query(`
      INSERT INTO surec_temizlemede_olan (urun_id, adet, updated_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (urun_id)
      DO UPDATE SET adet = surec_temizlemede_olan.adet + EXCLUDED.adet,
        updated_by = EXCLUDED.updated_by, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [urun_id, adet, created_by || 'esat']);

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Temizlemede olan ekleme hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// TEMİZLEMEDE OLAN - Direkt güncelle
router.put('/temizlemede-olan/:id', async (req, res) => {
  const { id } = req.params;
  const { adet, yapan } = req.body;

  try {
    const result = await pool.query(`
      UPDATE surec_temizlemede_olan
      SET adet = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [adet, yapan || 'Manuel Güncelleme', id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Temizlemede olan güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// TEMİZLEMEDE OLAN - Sil
router.delete('/temizlemede-olan/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM surec_temizlemede_olan WHERE id = $1', [req.params.id]);
    res.json({ message: 'Kayıt silindi' });
  } catch (error) {
    console.error('Temizlemede olan silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// TEMİZLEMEDEN GELEN - Manuel ekleme
router.post('/temizlemeden-gelen', async (req, res) => {
  const { tip, urun_kodu, adet, created_by } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let urun = await client.query('SELECT id FROM surec_urunler WHERE urun_kodu = $1', [urun_kodu]);
    let urun_id;
    if (urun.rows.length === 0) {
      const newUrun = await client.query(
        'INSERT INTO surec_urunler (tip, urun_kodu, urun_kodu_base) VALUES ($1, $2, $2) RETURNING id',
        [tip || 'Joint', urun_kodu]
      );
      urun_id = newUrun.rows[0].id;
    } else {
      urun_id = urun.rows[0].id;
    }

    const result = await client.query(`
      INSERT INTO surec_temizlemeden_gelen (urun_id, adet, updated_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (urun_id)
      DO UPDATE SET adet = surec_temizlemeden_gelen.adet + EXCLUDED.adet,
        updated_by = EXCLUDED.updated_by, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [urun_id, adet, created_by || 'esat']);

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Temizlemeden gelen ekleme hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// TEMİZLEMEDEN GELEN - Direkt güncelle
router.put('/temizlemeden-gelen/:id', async (req, res) => {
  const { id } = req.params;
  const { adet, yapan } = req.body;

  try {
    const result = await pool.query(`
      UPDATE surec_temizlemeden_gelen
      SET adet = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [adet, yapan || 'Manuel Güncelleme', id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Temizlemeden gelen güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// TEMİZLEMEDEN GELEN - Sil
router.delete('/temizlemeden-gelen/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM surec_temizlemeden_gelen WHERE id = $1', [req.params.id]);
    res.json({ message: 'Kayıt silindi' });
  } catch (error) {
    console.error('Temizlemeden gelen silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// SEVKE HAZIR - Manuel ekleme
router.post('/sevke-hazir', async (req, res) => {
  const { tip, urun_kodu, adet, created_by } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let urun = await client.query('SELECT id FROM surec_urunler WHERE urun_kodu = $1', [urun_kodu]);
    let urun_id;
    if (urun.rows.length === 0) {
      const newUrun = await client.query(
        'INSERT INTO surec_urunler (tip, urun_kodu, urun_kodu_base) VALUES ($1, $2, $2) RETURNING id',
        [tip || 'Joint', urun_kodu]
      );
      urun_id = newUrun.rows[0].id;
    } else {
      urun_id = urun.rows[0].id;
    }

    const result = await client.query(`
      INSERT INTO surec_sevke_hazir (urun_id, adet, updated_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (urun_id)
      DO UPDATE SET adet = surec_sevke_hazir.adet + EXCLUDED.adet,
        updated_by = EXCLUDED.updated_by, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [urun_id, adet, created_by || 'esat']);

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Sevke hazır ekleme hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// SEVKE HAZIR - Direkt güncelle
router.put('/sevke-hazir/:id', async (req, res) => {
  const { id } = req.params;
  const { adet, yapan } = req.body;

  try {
    const result = await pool.query(`
      UPDATE surec_sevke_hazir
      SET adet = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [adet, yapan || 'Manuel Güncelleme', id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Sevke hazır güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// SEVKE HAZIR - Sil
router.delete('/sevke-hazir/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM surec_sevke_hazir WHERE id = $1', [req.params.id]);
    res.json({ message: 'Kayıt silindi' });
  } catch (error) {
    console.error('Sevke hazır silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// KALAN - Manuel ekleme
router.post('/kalan', async (req, res) => {
  const { tip, urun_kodu, adet, created_by } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let urun = await client.query('SELECT id FROM surec_urunler WHERE urun_kodu = $1', [urun_kodu]);
    let urun_id;
    if (urun.rows.length === 0) {
      const newUrun = await client.query(
        'INSERT INTO surec_urunler (tip, urun_kodu, urun_kodu_base) VALUES ($1, $2, $2) RETURNING id',
        [tip || 'Joint', urun_kodu]
      );
      urun_id = newUrun.rows[0].id;
    } else {
      urun_id = urun.rows[0].id;
    }

    // Kalan için direkt ürün tablosunda adet güncelle
    const result = await client.query(`
      UPDATE surec_urunler
      SET adet = adet + $1
      WHERE id = $2
      RETURNING *
    `, [adet, urun_id]);

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Kalan ekleme hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// KALAN - Güncelle
router.put('/kalan/:id', async (req, res) => {
  const { id } = req.params;
  const { adet } = req.body;

  try {
    const result = await pool.query(`
      UPDATE surec_urunler
      SET adet = $1
      WHERE id = $2
      RETURNING *
    `, [adet, id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Kalan güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// KALAN - Sil
router.delete('/kalan/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM surec_urunler WHERE id = $1', [req.params.id]);
    res.json({ message: 'Kayıt silindi' });
  } catch (error) {
    console.error('Kalan silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
