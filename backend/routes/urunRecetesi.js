const express = require('express');
const router = express.Router();
const pool = require('../db');
const { eslestirMalzemeler } = require('../services/malzemeEslestirme');

// ÜRÜN REÇETESİ ROUTES

// Tüm ürün reçetelerini getir
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ur.*,
        COUNT(rm.id) as malzeme_sayisi
      FROM urun_recetesi ur
      LEFT JOIN recete_malzemeler rm ON ur.id = rm.urun_id
      GROUP BY ur.id
      ORDER BY ur.urun_kodu ASC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hesaplama kayıtlarını listele (must be before /:id route)
router.get('/hesaplama-kayitlari', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        urun_kodu,
        siparis_adet,
        hesaplayan,
        hesaplama_tarihi,
        stok_dusumleri_yapildi,
        stok_dusum_tarihi,
        stok_dusumleri_yapan,
        notlar
      FROM siparis_hesaplama_kayitlari
      ORDER BY hesaplama_tarihi DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Kayıt listeleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Tek bir hesaplama kaydını getir (must be before /:id route)
router.get('/hesaplama-kayitlari/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM siparis_hesaplama_kayitlari WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Kayıt getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Belirli bir ürün reçetesini ve malzemelerini getir
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const urunResult = await pool.query('SELECT * FROM urun_recetesi WHERE id = $1', [id]);
    if (urunResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ürün reçetesi bulunamadı' });
    }

    const malzemelerResult = await pool.query(
      'SELECT * FROM recete_malzemeler WHERE urun_id = $1 ORDER BY kategori, malzeme_tipi',
      [id]
    );

    res.json({
      urun: urunResult.rows[0],
      malzemeler: malzemelerResult.rows
    });
  } catch (error) {
    console.error('Ürün reçetesi detay getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ürün kodu ile reçete getir
router.get('/by-code/:urun_kodu', async (req, res) => {
  const { urun_kodu } = req.params;
  try {
    const urunResult = await pool.query('SELECT * FROM urun_recetesi WHERE urun_kodu = $1', [urun_kodu]);
    if (urunResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ürün reçetesi bulunamadı' });
    }

    const malzemelerResult = await pool.query(
      'SELECT * FROM recete_malzemeler WHERE urun_id = $1 ORDER BY kategori, malzeme_tipi',
      [urunResult.rows[0].id]
    );

    res.json({
      urun: urunResult.rows[0],
      malzemeler: malzemelerResult.rows
    });
  } catch (error) {
    console.error('Ürün reçetesi kod ile getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Yeni ürün reçetesi ekle
router.post('/', async (req, res) => {
  const { urun_kodu, urun_adi, aciklama, koli_tipi, koli_kapasitesi, kutu_tipi } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO urun_recetesi (urun_kodu, urun_adi, aciklama, koli_tipi, koli_kapasitesi, kutu_tipi)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [urun_kodu, urun_adi, aciklama, koli_tipi, koli_kapasitesi || 1, kutu_tipi]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ürün reçetesini güncelle
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { urun_kodu, urun_adi, aciklama, koli_tipi, koli_kapasitesi, kutu_tipi } = req.body;

  try {
    const params = [urun_kodu, urun_adi, aciklama, koli_tipi, koli_kapasitesi, kutu_tipi, id];

    const result = await pool.query(
      `UPDATE urun_recetesi
       SET urun_kodu = $1, urun_adi = $2, aciklama = $3, koli_tipi = $4,
           koli_kapasitesi = $5, kutu_tipi = $6,
           guncelleme_tarihi = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      params
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ürün reçetesini sil
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM urun_recetesi WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Ürün reçetesi silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// MALZEME ROUTES

// Ürüne malzeme ekle
router.post('/:urun_id/malzeme', async (req, res) => {
  const { urun_id } = req.params;
  const { malzeme_tipi, malzeme_kodu, malzeme_adi, adet, birim, kategori, notlar } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO recete_malzemeler (urun_id, malzeme_tipi, malzeme_kodu, malzeme_adi, adet, birim, kategori, notlar)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [urun_id, malzeme_tipi, malzeme_kodu, malzeme_adi, adet || 1, birim || 'adet', kategori, notlar]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Malzeme ekleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Malzemeyi güncelle
router.put('/malzeme/:id', async (req, res) => {
  const { id } = req.params;
  const { malzeme_tipi, malzeme_kodu, malzeme_adi, adet, birim, kategori, notlar } = req.body;

  try {
    const result = await pool.query(
      `UPDATE recete_malzemeler
       SET malzeme_tipi = $1, malzeme_kodu = $2, malzeme_adi = $3, adet = $4,
           birim = $5, kategori = $6, notlar = $7
       WHERE id = $8 RETURNING *`,
      [malzeme_tipi, malzeme_kodu, malzeme_adi, adet, birim, kategori, notlar, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Malzeme güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Malzemeyi sil
router.delete('/malzeme/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM recete_malzemeler WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Malzeme silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// SİPARİŞ HESAPLAMA

// Sipariş hesaplama
router.post('/hesapla', async (req, res) => {
  const { urun_kodu, siparis_adet } = req.body;

  try {
    // Ürün reçetesini getir
    const urunResult = await pool.query('SELECT * FROM urun_recetesi WHERE urun_kodu = $1', [urun_kodu]);
    if (urunResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ürün reçetesi bulunamadı' });
    }

    const urun = urunResult.rows[0];

    // Malzemeleri getir
    const malzemelerResult = await pool.query(
      'SELECT * FROM recete_malzemeler WHERE urun_id = $1',
      [urun.id]
    );

    // Hesaplamalar
    const malzemeIhtiyaci = malzemelerResult.rows.map(m => ({
      ...m,
      toplam_adet: m.adet * siparis_adet
    }));

    // Kutu hesaplama (her ürün = 1 kutu)
    const kutu_adedi = siparis_adet;

    // Koli hesaplama (division by zero kontrolü)
    const koli_adedi = urun.koli_kapasitesi > 0
      ? Math.ceil(siparis_adet / urun.koli_kapasitesi)
      : 0;

    // Paketleme malzemeleri (sadece kutu ve koli otomatik hesaplanır)
    const paketlemeMalzemeleri = [];

    if (urun.kutu_tipi) {
      paketlemeMalzemeleri.push({
        malzeme_tipi: 'Kutu',
        malzeme_kodu: urun.kutu_tipi,
        malzeme_adi: 'Ürün kutusu',
        adet: 1,
        birim: 'adet',
        kategori: 'Paketleme',
        toplam_adet: kutu_adedi,
        notlar: 'Otomatik hesaplanmıştır'
      });
    }

    if (urun.koli_tipi) {
      paketlemeMalzemeleri.push({
        malzeme_tipi: 'Koli',
        malzeme_kodu: urun.koli_tipi,
        malzeme_adi: `${urun.koli_kapasitesi} adetlik koli`,
        adet: 1,
        birim: 'adet',
        kategori: 'Paketleme',
        toplam_adet: koli_adedi,
        notlar: 'Otomatik hesaplanmıştır'
      });
    }

    // Tüm malzemeleri birleştir (recete_malzemeler + otomatik kutu/koli)
    const tumMalzemeler = [...malzemeIhtiyaci, ...paketlemeMalzemeleri];

    res.json({
      urun: {
        urun_kodu: urun.urun_kodu,
        urun_adi: urun.urun_adi,
        koli_tipi: urun.koli_tipi,
        koli_kapasitesi: urun.koli_kapasitesi,
        kutu_tipi: urun.kutu_tipi
      },
      siparis_adet,
      kutu_adedi,
      koli_adedi,
      malzeme_ihtiyaci: tumMalzemeler,
      ozet: {
        toplam_malzeme_tipi: tumMalzemeler.length,
        toplam_adet: tumMalzemeler.reduce((sum, m) => sum + m.toplam_adet, 0)
      }
    });
  } catch (error) {
    console.error('Sipariş hesaplama hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// SİPARİŞ HESAPLAMA KAYIT SİSTEMİ

// Sipariş hesaplama ve kayıt
router.post('/hesapla-ve-kaydet', async (req, res) => {
  const { urun_kodu, siparis_adet, hesaplayan } = req.body;

  try {
    // Ürün reçetesini getir
    const urunResult = await pool.query('SELECT * FROM urun_recetesi WHERE urun_kodu = $1', [urun_kodu]);
    if (urunResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ürün reçetesi bulunamadı' });
    }

    const urun = urunResult.rows[0];

    // Malzemeleri getir
    const malzemelerResult = await pool.query(
      'SELECT * FROM recete_malzemeler WHERE urun_id = $1',
      [urun.id]
    );

    // Hesaplamalar
    const malzemeIhtiyaci = malzemelerResult.rows.map(m => ({
      ...m,
      miktar: m.adet * siparis_adet,
      toplam_adet: m.adet * siparis_adet
    }));

    // Kutu hesaplama (her ürün = 1 kutu)
    const kutu_adedi = siparis_adet;

    // Koli hesaplama (division by zero kontrolü)
    const koli_adedi = urun.koli_kapasitesi > 0
      ? Math.ceil(siparis_adet / urun.koli_kapasitesi)
      : 0;

    // Paketleme malzemeleri (sadece kutu ve koli otomatik hesaplanır)
    const paketlemeMalzemeleri = [];

    if (urun.kutu_tipi) {
      paketlemeMalzemeleri.push({
        malzeme_tipi: 'Kutu',
        malzeme_kodu: urun.kutu_tipi,
        malzeme_adi: 'Ürün kutusu',
        adet: 1,
        birim: 'adet',
        kategori: 'Paketleme',
        miktar: kutu_adedi,
        toplam_adet: kutu_adedi,
        notlar: 'Otomatik hesaplanmıştır'
      });
    }

    if (urun.koli_tipi) {
      paketlemeMalzemeleri.push({
        malzeme_tipi: 'Koli',
        malzeme_kodu: urun.koli_tipi,
        malzeme_adi: `${urun.koli_kapasitesi} adetlik koli`,
        adet: 1,
        birim: 'adet',
        kategori: 'Paketleme',
        miktar: koli_adedi,
        toplam_adet: koli_adedi,
        notlar: 'Otomatik hesaplanmıştır'
      });
    }

    // Tüm malzemeleri birleştir (recete_malzemeler + otomatik kutu/koli)
    const tumMalzemeler = [...malzemeIhtiyaci, ...paketlemeMalzemeleri];

    // Malzemeleri stok ile eşleştir
    const eslestirmeSonuclari = await eslestirMalzemeler(tumMalzemeler);

    // Hesaplama sonucunu hazırla
    const hesaplamaSonucu = {
      urun: {
        urun_kodu: urun.urun_kodu,
        urun_adi: urun.urun_adi,
        koli_tipi: urun.koli_tipi,
        koli_kapasitesi: urun.koli_kapasitesi,
        kutu_tipi: urun.kutu_tipi
      },
      siparis_adet,
      kutu_adedi,
      koli_adedi,
      malzeme_ihtiyaci: tumMalzemeler,
      ozet: {
        toplam_malzeme_tipi: tumMalzemeler.length,
        toplam_adet: tumMalzemeler.reduce((sum, m) => sum + m.toplam_adet, 0)
      }
    };

    // Veritabanına kaydet
    const kayitResult = await pool.query(
      `INSERT INTO siparis_hesaplama_kayitlari
       (urun_kodu, siparis_adet, hesaplayan, hesaplama_sonucu, eslestirme_sonuclari)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [urun_kodu, siparis_adet, hesaplayan, JSON.stringify(hesaplamaSonucu), JSON.stringify(eslestirmeSonuclari)]
    );

    res.json({
      kayit: kayitResult.rows[0],
      hesaplama: hesaplamaSonucu,
      eslestirme: eslestirmeSonuclari
    });
  } catch (error) {
    console.error('Hesaplama ve kayıt hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stok düşümü yap
router.post('/stok-dusum/:kayit_id', async (req, res) => {
  const { kayit_id } = req.params;
  const { yapan } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Kaydı getir
    const kayitResult = await client.query(
      'SELECT * FROM siparis_hesaplama_kayitlari WHERE id = $1',
      [kayit_id]
    );

    if (kayitResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }

    const kayit = kayitResult.rows[0];

    // Stok düşümü daha önce yapılmış mı kontrol et
    if (kayit.stok_dusumleri_yapildi) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Bu kayıt için stok düşümü zaten yapılmış' });
    }

    // Eşleştirme sonuçlarını kontrol et
    const eslestirmeSonuclari = kayit.eslestirme_sonuclari;

    if (eslestirmeSonuclari.basarisiz && eslestirmeSonuclari.basarisiz.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Bazı malzemeler stokta bulunamadı. Stok düşümü yapılamaz.',
        basarisiz_malzemeler: eslestirmeSonuclari.basarisiz
      });
    }

    // Tüm eşleşen malzemeler için stok düşümü yap
    const basariliMalzemeler = eslestirmeSonuclari.basarili || [];
    const yetersizMalzemeler = eslestirmeSonuclari.yetersiz || [];
    const tumMalzemeler = [...basariliMalzemeler, ...yetersizMalzemeler];

    const stokDusumleri = [];

    for (const malzeme of tumMalzemeler) {
      // Mevcut stok bilgisini al
      const mevcutStokResult = await client.query(
        'SELECT * FROM simulasyon_stok WHERE id = $1',
        [malzeme.stok_id]
      );

      if (mevcutStokResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          error: `Stok kaydı bulunamadı: ${malzeme.malzeme_kodu}`
        });
      }

      const mevcutStok = mevcutStokResult.rows[0];
      const eskiMiktar = mevcutStok.mevcut_adet;
      const yeniMiktar = eskiMiktar - malzeme.gerekli_miktar;

      // Stok güncelle
      await client.query(
        'UPDATE simulasyon_stok SET mevcut_adet = $1 WHERE id = $2',
        [yeniMiktar, malzeme.stok_id]
      );

      // Log kaydı oluştur
      const sebep = `Sipariş Hesaplama - ${kayit.urun_kodu} - ${kayit.siparis_adet} adet`;
      await client.query(
        `INSERT INTO simulasyon_stok_hareket_log
         (stok_id, islem_turu, miktar, onceki_stok, yeni_stok, yapan, sebep)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [malzeme.stok_id, 'kullanim', malzeme.gerekli_miktar, eskiMiktar, yeniMiktar, 'Sistem', sebep]
      );

      stokDusumleri.push({
        malzeme_kodu: malzeme.malzeme_kodu,
        malzeme_adi: malzeme.malzeme_adi,
        stok_id: malzeme.stok_id,
        eskiMiktar,
        yeniMiktar,
        dusumMiktari: malzeme.gerekli_miktar
      });
    }

    // Kayıt durumunu güncelle
    await client.query(
      `UPDATE siparis_hesaplama_kayitlari
       SET stok_dusumleri_yapildi = TRUE,
           stok_dusum_tarihi = CURRENT_TIMESTAMP,
           stok_dusumleri_yapan = $1
       WHERE id = $2`,
      [yapan || 'Sistem', kayit_id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      mesaj: 'Stok düşümleri başarıyla tamamlandı',
      stok_dusumleri: stokDusumleri
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Stok düşümü hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;
