const express = require('express');
const router = express.Router();
const pool = require('../db');

// GÖREVLER ROUTES
// Tüm görevleri getir
router.get('/gorevler', async (req, res) => {
  try {
    const gorevler = await pool.query('SELECT * FROM gorevler ORDER BY sira ASC');

    // Her görev için notları getir
    const gorevlerWithNotes = await Promise.all(
      gorevler.rows.map(async (gorev) => {
        const notlar = await pool.query('SELECT * FROM gorev_notlar WHERE gorev_id = $1 ORDER BY tarih ASC', [gorev.id]);
        return { ...gorev, notlar: notlar.rows };
      })
    );

    res.json(gorevlerWithNotes);
  } catch (error) {
    console.error('Görevler getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Görev ekle
router.post('/gorevler', async (req, res) => {
  const { baslik, aciklama, aciliyet, atanan, sira, baslama_tarihi, bitis_tarihi } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO gorevler (baslik, aciklama, aciliyet, atanan, sira, baslama_tarihi, bitis_tarihi) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [baslik, aciklama, aciliyet || 'normal', atanan, sira || 0, baslama_tarihi || null, bitis_tarihi || null]
    );
    res.json({ ...result.rows[0], notlar: [] });
  } catch (error) {
    console.error('Görev ekleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Görev güncelle
router.put('/gorevler/:id', async (req, res) => {
  const { id } = req.params;
  const { baslik, aciklama, aciliyet, atanan, tamamlandi, sira, baslama_tarihi, bitis_tarihi } = req.body;
  try {
    const result = await pool.query(
      'UPDATE gorevler SET baslik = $1, aciklama = $2, aciliyet = $3, atanan = $4, tamamlandi = $5, sira = $6, baslama_tarihi = $7, bitis_tarihi = $8 WHERE id = $9 RETURNING *',
      [baslik, aciklama, aciliyet, atanan, tamamlandi, sira, baslama_tarihi || null, bitis_tarihi || null, id]
    );

    const notlar = await pool.query('SELECT * FROM gorev_notlar WHERE gorev_id = $1 ORDER BY tarih ASC', [id]);
    res.json({ ...result.rows[0], notlar: notlar.rows });
  } catch (error) {
    console.error('Görev güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Görev sil
router.delete('/gorevler/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM gorevler WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Görev silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Göreve not ekle
router.post('/gorevler/:id/not', async (req, res) => {
  const { id } = req.params;
  const { ekleyen, metin } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO gorev_notlar (gorev_id, ekleyen, metin) VALUES ($1, $2, $3) RETURNING *',
      [id, ekleyen, metin]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Not ekleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Not sil
router.delete('/gorevler/:gorevId/not/:notId', async (req, res) => {
  const { notId } = req.params;
  try {
    await pool.query('DELETE FROM gorev_notlar WHERE id = $1', [notId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Not silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// SİPARİŞ HAZIRLIĞI ROUTES
// Tüm siparişleri getir
router.get('/siparis-hazirlik', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM siparis_hazirlik ORDER BY olusturma_tarihi DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Sipariş hazırlık getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sipariş ekle
router.post('/siparis-hazirlik', async (req, res) => {
  const {
    tarih, operator, siparis_no, urun_kodu, siparis_adet, gonderilen_adet,
    durum, notlar,
    siparis_tarihi, tamamlanma_tarihi,
    eksik_koli, eksik_kutu, eksik_izolasyon, eksik_tapa, eksik_poset, eksik_ek_parca,
    hazir_koli, hazir_kutu, hazir_izolasyon, hazir_ek_parca
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO siparis_hazirlik
       (tarih, operator, siparis_no, urun_kodu, siparis_adet, gonderilen_adet, durum, notlar,
        siparis_tarihi, tamamlanma_tarihi,
        eksik_koli, eksik_kutu, eksik_izolasyon, eksik_tapa, eksik_poset, eksik_ek_parca,
        hazir_koli, hazir_kutu, hazir_izolasyon, hazir_ek_parca)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING *`,
      [tarih, operator, siparis_no, urun_kodu, siparis_adet, gonderilen_adet || 0, durum || 'beklemede', notlar,
       siparis_tarihi || tarih, tamamlanma_tarihi,
       eksik_koli || 0, eksik_kutu || 0, eksik_izolasyon || 0, eksik_tapa || 0, eksik_poset || 0, eksik_ek_parca || 0,
       hazir_koli || 0, hazir_kutu || 0, hazir_izolasyon || 0, hazir_ek_parca || 0]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Sipariş ekleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sipariş güncelle
router.put('/siparis-hazirlik/:id', async (req, res) => {
  const { id } = req.params;
  const {
    tarih, operator, siparis_no, urun_kodu, siparis_adet, gonderilen_adet,
    durum, notlar, degistiren,
    siparis_tarihi, tamamlanma_tarihi,
    eksik_koli, eksik_kutu, eksik_izolasyon, eksik_tapa, eksik_poset, eksik_ek_parca,
    hazir_koli, hazir_kutu, hazir_izolasyon, hazir_ek_parca
  } = req.body;

  try {
    // Önce eski değerleri al
    const eskiData = await pool.query('SELECT * FROM siparis_hazirlik WHERE id = $1', [id]);
    const eskiSiparis = eskiData.rows[0];

    // Siparişi güncelle
    const result = await pool.query(
      `UPDATE siparis_hazirlik SET
       tarih = $1, operator = $2, siparis_no = $3, urun_kodu = $4, siparis_adet = $5,
       gonderilen_adet = $6, durum = $7, notlar = $8,
       siparis_tarihi = $9, tamamlanma_tarihi = $10,
       eksik_koli = $11, eksik_kutu = $12, eksik_izolasyon = $13, eksik_tapa = $14, eksik_poset = $15, eksik_ek_parca = $16,
       hazir_koli = $17, hazir_kutu = $18, hazir_izolasyon = $19, hazir_ek_parca = $20,
       son_guncelleme = CURRENT_TIMESTAMP
       WHERE id = $21 RETURNING *`,
      [tarih, operator, siparis_no, urun_kodu, siparis_adet, gonderilen_adet, durum, notlar,
       siparis_tarihi, tamamlanma_tarihi,
       eksik_koli || 0, eksik_kutu || 0, eksik_izolasyon || 0, eksik_tapa || 0, eksik_poset || 0, eksik_ek_parca || 0,
       hazir_koli || 0, hazir_kutu || 0, hazir_izolasyon || 0, hazir_ek_parca || 0,
       id]
    );

    // Değişiklikleri logla
    const degisiklikler = [];

    // Sadece değişiklik varsa log tut
    if (degistiren) {
      if (eskiSiparis.tarih !== tarih) {
        degisiklikler.push({ alan: 'Tarih', eski: eskiSiparis.tarih, yeni: tarih });
      }
      if (eskiSiparis.operator !== operator) {
        degisiklikler.push({ alan: 'Operator', eski: eskiSiparis.operator, yeni: operator });
      }
      if (eskiSiparis.siparis_no !== siparis_no) {
        degisiklikler.push({ alan: 'Sipariş No', eski: eskiSiparis.siparis_no, yeni: siparis_no });
      }
      if (eskiSiparis.urun_kodu !== urun_kodu) {
        degisiklikler.push({ alan: 'Ürün Kodu', eski: eskiSiparis.urun_kodu, yeni: urun_kodu });
      }
      if (eskiSiparis.siparis_adet !== siparis_adet) {
        degisiklikler.push({ alan: 'Sipariş Adet', eski: eskiSiparis.siparis_adet.toString(), yeni: siparis_adet.toString() });
      }
      if (eskiSiparis.gonderilen_adet !== gonderilen_adet) {
        degisiklikler.push({ alan: 'Gönderilen Adet', eski: eskiSiparis.gonderilen_adet.toString(), yeni: gonderilen_adet.toString() });
      }
      if (eskiSiparis.durum !== durum) {
        degisiklikler.push({ alan: 'Durum', eski: eskiSiparis.durum, yeni: durum });
      }

      // Yeni malzeme alanları için değişiklik kontrolü
      if ((eskiSiparis.eksik_koli || 0) !== (eksik_koli || 0)) {
        degisiklikler.push({ alan: 'Eksik Koli', eski: (eskiSiparis.eksik_koli || 0).toString(), yeni: (eksik_koli || 0).toString() });
      }
      if ((eskiSiparis.eksik_kutu || 0) !== (eksik_kutu || 0)) {
        degisiklikler.push({ alan: 'Eksik Kutu', eski: (eskiSiparis.eksik_kutu || 0).toString(), yeni: (eksik_kutu || 0).toString() });
      }
      if ((eskiSiparis.eksik_izolasyon || 0) !== (eksik_izolasyon || 0)) {
        degisiklikler.push({ alan: 'Eksik İzolasyon', eski: (eskiSiparis.eksik_izolasyon || 0).toString(), yeni: (eksik_izolasyon || 0).toString() });
      }
      if ((eskiSiparis.eksik_tapa || 0) !== (eksik_tapa || 0)) {
        degisiklikler.push({ alan: 'Eksik Tapa', eski: (eskiSiparis.eksik_tapa || 0).toString(), yeni: (eksik_tapa || 0).toString() });
      }
      if ((eskiSiparis.eksik_poset || 0) !== (eksik_poset || 0)) {
        degisiklikler.push({ alan: 'Eksik Poşet', eski: (eskiSiparis.eksik_poset || 0).toString(), yeni: (eksik_poset || 0).toString() });
      }
      if ((eskiSiparis.eksik_ek_parca || 0) !== (eksik_ek_parca || 0)) {
        degisiklikler.push({ alan: 'Eksik Ek Parça', eski: (eskiSiparis.eksik_ek_parca || 0).toString(), yeni: (eksik_ek_parca || 0).toString() });
      }

      if ((eskiSiparis.hazir_koli || 0) !== (hazir_koli || 0)) {
        degisiklikler.push({ alan: 'Hazır Koli', eski: (eskiSiparis.hazir_koli || 0).toString(), yeni: (hazir_koli || 0).toString() });
      }
      if ((eskiSiparis.hazir_kutu || 0) !== (hazir_kutu || 0)) {
        degisiklikler.push({ alan: 'Hazır Kutu', eski: (eskiSiparis.hazir_kutu || 0).toString(), yeni: (hazir_kutu || 0).toString() });
      }
      if ((eskiSiparis.hazir_izolasyon || 0) !== (hazir_izolasyon || 0)) {
        degisiklikler.push({ alan: 'Hazır İzolasyon', eski: (eskiSiparis.hazir_izolasyon || 0).toString(), yeni: (hazir_izolasyon || 0).toString() });
      }
      if ((eskiSiparis.hazir_ek_parca || 0) !== (hazir_ek_parca || 0)) {
        degisiklikler.push({ alan: 'Hazır Ek Parça', eski: (eskiSiparis.hazir_ek_parca || 0).toString(), yeni: (hazir_ek_parca || 0).toString() });
      }

      // Notlar karşılaştırması için null kontrolü
      const eskiNotlar = eskiSiparis.notlar || '';
      const yeniNotlar = notlar || '';
      if (eskiNotlar !== yeniNotlar) {
        degisiklikler.push({ alan: 'Notlar', eski: eskiNotlar || '-', yeni: yeniNotlar || '-' });
      }
    }

    // Her değişiklik için log kaydı oluştur
    for (const degisiklik of degisiklikler) {
      await pool.query(
        `INSERT INTO siparis_degisiklik_log (siparis_id, degistiren, degisiklik_turu, eski_deger, yeni_deger, aciklama)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, degistiren || 'Bilinmeyen', degisiklik.alan, degisiklik.eski, degisiklik.yeni,
         `${degisiklik.alan} değiştirildi: "${degisiklik.eski}" → "${degisiklik.yeni}"`]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Sipariş güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sipariş değişiklik loglarını getir
router.get('/siparis-hazirlik/:id/degisiklik-log', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM siparis_degisiklik_log WHERE siparis_id = $1 ORDER BY tarih DESC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Değişiklik log getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sipariş sil
router.delete('/siparis-hazirlik/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM siparis_hazirlik WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Sipariş silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sipariş özet istatistikleri
router.get('/siparis-hazirlik/stats', async (req, res) => {
  try {
    const beklemede = await pool.query("SELECT COUNT(*) FROM siparis_hazirlik WHERE durum = 'beklemede'");
    const tamamlandi = await pool.query("SELECT COUNT(*) FROM siparis_hazirlik WHERE durum = 'tamamlandi'");
    const toplam = await pool.query('SELECT COUNT(*) FROM siparis_hazirlik');
    const toplamGonderilen = await pool.query('SELECT SUM(gonderilen_adet) as total FROM siparis_hazirlik');
    const toplamKalan = await pool.query('SELECT SUM(siparis_adet - gonderilen_adet) as total FROM siparis_hazirlik WHERE durum != \'tamamlandi\'');

    res.json({
      beklemede: parseInt(beklemede.rows[0].count),
      tamamlandi: parseInt(tamamlandi.rows[0].count),
      toplam: parseInt(toplam.rows[0].count),
      toplamGonderilen: parseInt(toplamGonderilen.rows[0].total) || 0,
      toplamKalan: parseInt(toplamKalan.rows[0].total) || 0
    });
  } catch (error) {
    console.error('İstatistik hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sipariş Hazırlık değişiklik loglarını getir (tümü)
router.get('/siparis-hazirlik/degisiklik-log', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sdl.*, sh.siparis_no, sh.urun_kodu
      FROM siparis_degisiklik_log sdl
      LEFT JOIN siparis_hazirlik sh ON sdl.siparis_id = sh.id
      ORDER BY sdl.tarih DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Değişiklik log getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// İç Siparişler değişiklik loglarını getir (tümü)
router.get('/urun-siparisler/degisiklik-log', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT usdl.*, us.urun_adi
      FROM urun_siparis_degisiklik_log usdl
      LEFT JOIN urun_siparisler us ON usdl.siparis_id = us.id
      ORDER BY usdl.tarih DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Değişiklik log getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// GÖNDERİM TAKIP ROUTES
// Sipariş için gönderim ekle
router.post('/siparis-hazirlik/:id/gonderim', async (req, res) => {
  const { id } = req.params;
  const { gonderen, gonderilen_adet, notlar } = req.body;

  try {
    // Eski gönderilen adet değerini al
    const eskiSiparis = await pool.query('SELECT gonderilen_adet FROM siparis_hazirlik WHERE id = $1', [id]);
    const eskiGonderilenAdet = eskiSiparis.rows[0].gonderilen_adet || 0;

    // Önce gönderim kaydı oluştur
    const gonderimResult = await pool.query(
      `INSERT INTO siparis_gonderimler (siparis_id, gonderen, gonderilen_adet, notlar)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, gonderen, gonderilen_adet, notlar]
    );

    // Siparişteki gonderilen_adet'i güncelle
    await pool.query(
      `UPDATE siparis_hazirlik
       SET gonderilen_adet = gonderilen_adet + $1,
           son_guncelleme = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [gonderilen_adet, id]
    );

    // Güncellenmiş sipariş bilgisini al
    const siparisResult = await pool.query('SELECT * FROM siparis_hazirlik WHERE id = $1', [id]);
    const yeniGonderilenAdet = siparisResult.rows[0].gonderilen_adet;

    // Değişiklik loguna kaydet
    await pool.query(
      `INSERT INTO siparis_degisiklik_log (siparis_id, degistiren, degisiklik_turu, eski_deger, yeni_deger, aciklama)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        id,
        gonderen,
        'gonderim_eklendi',
        eskiGonderilenAdet.toString(),
        yeniGonderilenAdet.toString(),
        notlar ? `Gönderim eklendi: ${gonderilen_adet} adet (${notlar})` : `Gönderim eklendi: ${gonderilen_adet} adet`
      ]
    );

    res.json({
      gonderim: gonderimResult.rows[0],
      siparis: siparisResult.rows[0]
    });
  } catch (error) {
    console.error('Gönderim ekleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sipariş için tüm gönderimleri getir
router.get('/siparis-hazirlik/:id/gonderimler', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM siparis_gonderimler WHERE siparis_id = $1 ORDER BY gonderim_tarihi DESC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Gönderim getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Gönderim sil
router.delete('/siparis-hazirlik/:siparisId/gonderim/:gonderimId', async (req, res) => {
  const { siparisId, gonderimId } = req.params;

  try {
    // Önce silinecek gönderimin adetini al
    const gonderimResult = await pool.query('SELECT gonderilen_adet FROM siparis_gonderimler WHERE id = $1', [gonderimId]);

    if (gonderimResult.rows.length === 0) {
      return res.status(404).json({ error: 'Gönderim bulunamadı' });
    }

    const gonderilen_adet = gonderimResult.rows[0].gonderilen_adet;

    // Gönderimi sil
    await pool.query('DELETE FROM siparis_gonderimler WHERE id = $1', [gonderimId]);

    // Siparişteki gonderilen_adet'i güncelle
    await pool.query(
      `UPDATE siparis_hazirlik
       SET gonderilen_adet = gonderilen_adet - $1,
           son_guncelleme = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [gonderilen_adet, siparisId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Gönderim silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// ÜRÜN SİPARİŞLERİ ROUTES
// Tüm ürün siparişlerini getir
router.get('/urun-siparisler', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM urun_siparisler ORDER BY olusturma_tarihi DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Ürün sipariş getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ürün siparişi ekle
router.post('/urun-siparisler', async (req, res) => {
  const { urun_adi, adet_miktar, olcu, talep_eden, aciklama, durum, siparis_veren_yer } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO urun_siparisler (urun_adi, adet_miktar, olcu, talep_eden, aciklama, durum, siparis_veren_yer)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [urun_adi, adet_miktar, olcu, talep_eden, aciklama, durum || 'bekleniyor', siparis_veren_yer]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ürün sipariş ekleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ürün siparişi güncelle
router.put('/urun-siparisler/:id', async (req, res) => {
  const { id } = req.params;
  const { urun_adi, adet_miktar, olcu, talep_eden, aciklama, durum, gelen_adet, gelen_notlar, gelis_tarihi, degistiren, siparis_veren_yer } = req.body;

  try {
    // Önce eski değerleri al
    const eskiData = await pool.query('SELECT * FROM urun_siparisler WHERE id = $1', [id]);
    const eskiSiparis = eskiData.rows[0];

    // Geliş tarihini belirle: frontend'den gelen değer varsa onu kullan, yoksa durum "Geldi" ise şimdiki zaman
    let gelisTarihiValue = gelis_tarihi || null;
    if (!gelisTarihiValue && durum === 'Geldi') {
      gelisTarihiValue = new Date().toISOString();
    }

    const result = await pool.query(
      `UPDATE urun_siparisler SET
       urun_adi = $1, adet_miktar = $2, olcu = $3, talep_eden = $4, aciklama = $5,
       durum = $6, gelen_adet = $7, gelen_notlar = $8, gelis_tarihi = $9, siparis_veren_yer = $10
       WHERE id = $11 RETURNING *`,
      [urun_adi, adet_miktar, olcu, talep_eden, aciklama, durum, gelen_adet, gelen_notlar, gelisTarihiValue, siparis_veren_yer, id]
    );

    // Değişiklikleri logla
    const degisiklikler = [];

    // Sadece değişiklik varsa log tut
    if (degistiren) {
      if (eskiSiparis.urun_adi !== urun_adi) {
        degisiklikler.push({ alan: 'Ürün Adı', eski: eskiSiparis.urun_adi, yeni: urun_adi });
      }
      if (eskiSiparis.adet_miktar !== adet_miktar) {
        degisiklikler.push({ alan: 'Adet/Miktar', eski: eskiSiparis.adet_miktar || '-', yeni: adet_miktar || '-' });
      }
      if (eskiSiparis.olcu !== olcu) {
        degisiklikler.push({ alan: 'Ölçü', eski: eskiSiparis.olcu || '-', yeni: olcu || '-' });
      }
      if (eskiSiparis.talep_eden !== talep_eden) {
        degisiklikler.push({ alan: 'Talep Eden', eski: eskiSiparis.talep_eden || '-', yeni: talep_eden || '-' });
      }
      // Açıklama karşılaştırması için null kontrolü
      const eskiAciklama = eskiSiparis.aciklama || '';
      const yeniAciklama = aciklama || '';
      if (eskiAciklama !== yeniAciklama) {
        degisiklikler.push({ alan: 'Açıklama', eski: eskiAciklama || '-', yeni: yeniAciklama || '-' });
      }
      if (eskiSiparis.durum !== durum) {
        degisiklikler.push({ alan: 'Durum', eski: eskiSiparis.durum, yeni: durum });
      }
      // Gelen adet karşılaştırması için null kontrolü
      const eskiGelenAdet = eskiSiparis.gelen_adet || '';
      const yeniGelenAdet = gelen_adet || '';
      if (eskiGelenAdet !== yeniGelenAdet) {
        degisiklikler.push({ alan: 'Gelen Adet', eski: eskiGelenAdet || '-', yeni: yeniGelenAdet || '-' });
      }
      // Gelen notlar karşılaştırması için null kontrolü
      const eskiGelenNotlar = eskiSiparis.gelen_notlar || '';
      const yeniGelenNotlar = gelen_notlar || '';
      if (eskiGelenNotlar !== yeniGelenNotlar) {
        degisiklikler.push({ alan: 'Gelen Notlar', eski: eskiGelenNotlar || '-', yeni: yeniGelenNotlar || '-' });
      }
      // Sipariş verilen yer karşılaştırması için null kontrolü
      const eskiSiparisVerenYer = eskiSiparis.siparis_veren_yer || '';
      const yeniSiparisVerenYer = siparis_veren_yer || '';
      if (eskiSiparisVerenYer !== yeniSiparisVerenYer) {
        degisiklikler.push({ alan: 'Sipariş Verilen Yer', eski: eskiSiparisVerenYer || '-', yeni: yeniSiparisVerenYer || '-' });
      }
    }

    // Her değişiklik için log kaydı oluştur
    for (const degisiklik of degisiklikler) {
      await pool.query(
        `INSERT INTO urun_siparis_degisiklik_log (siparis_id, degistiren, degisiklik_turu, eski_deger, yeni_deger, aciklama)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, degistiren || 'Bilinmeyen', degisiklik.alan, degisiklik.eski, degisiklik.yeni,
         `${degisiklik.alan} değiştirildi: "${degisiklik.eski}" → "${degisiklik.yeni}"`]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ürün sipariş güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ürün sipariş değişiklik loglarını getir
router.get('/urun-siparisler/:id/degisiklik-log', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM urun_siparis_degisiklik_log WHERE siparis_id = $1 ORDER BY tarih DESC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Ürün sipariş değişiklik log getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ürün siparişi sil
router.delete('/urun-siparisler/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM urun_siparisler WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Ürün sipariş silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
