const express = require('express');
const router = express.Router();
const pool = require('../db');

// TÜM VERİLERİ JSON OLARAK DIŞA AKTAR
router.get('/export', async (req, res) => {
  try {
    const mamulIzolasyon = await pool.query('SELECT * FROM mamul_izolasyon');
    const mamulKoli = await pool.query('SELECT * FROM mamul_koli');
    const mamulKutu = await pool.query('SELECT * FROM mamul_kutu');
    const mamulTapa = await pool.query('SELECT * FROM mamul_tapa');
    const mamulHistory = await pool.query('SELECT * FROM mamul_history ORDER BY created_at DESC LIMIT 100');

    const gorevler = await pool.query('SELECT * FROM gorevler');
    const gorevNotlar = await pool.query('SELECT * FROM gorev_notlar');
    const siparisHazirlik = await pool.query('SELECT * FROM siparis_hazirlik');
    const urunSiparisler = await pool.query('SELECT * FROM urun_siparisler');
    const simulasyonStok = await pool.query('SELECT * FROM simulasyon_stok');

    const exportData = {
      exportDate: new Date().toISOString(),
      mamulStok: {
        izolasyon: mamulIzolasyon.rows,
        koli: mamulKoli.rows,
        kutu: mamulKutu.rows,
        tapa: mamulTapa.rows,
        history: mamulHistory.rows
      },
      kaliteKontrol: {
        gorevler: gorevler.rows,
        gorevNotlar: gorevNotlar.rows,
        siparisHazirlik: siparisHazirlik.rows,
        urunSiparisler: urunSiparisler.rows,
        simulasyonStok: simulasyonStok.rows
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=kkp_yedek_${new Date().toISOString().split('T')[0]}.json`);
    res.json(exportData);
  } catch (error) {
    console.error('Veri dışa aktarma hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// JSON VERİLERİNİ İÇE AKTAR
router.post('/import', async (req, res) => {
  const { data } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Mamül Stok verileri
    if (data.mamulStok) {
      if (data.mamulStok.izolasyon) {
        for (const item of data.mamulStok.izolasyon) {
          await client.query(
            'INSERT INTO mamul_izolasyon (name, kullanilan_urunler, stock) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
            [item.name, item.kullanilan_urunler, item.stock]
          );
        }
      }

      if (data.mamulStok.koli) {
        for (const item of data.mamulStok.koli) {
          await client.query(
            'INSERT INTO mamul_koli (name, dimensions, icine_giren_urunler, stock) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
            [item.name, item.dimensions, item.icine_giren_urunler, item.stock]
          );
        }
      }

      if (data.mamulStok.kutu) {
        for (const item of data.mamulStok.kutu) {
          await client.query(
            'INSERT INTO mamul_kutu (name, dimensions, icine_giren_urun, stock) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
            [item.name, item.dimensions, item.icine_giren_urun, item.stock]
          );
        }
      }

      if (data.mamulStok.tapa) {
        for (const item of data.mamulStok.tapa) {
          await client.query(
            'INSERT INTO mamul_tapa (name, stock) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [item.name, item.stock]
          );
        }
      }
    }

    // Kalite Kontrol verileri
    if (data.kaliteKontrol) {
      if (data.kaliteKontrol.gorevler) {
        for (const item of data.kaliteKontrol.gorevler) {
          await client.query(
            `INSERT INTO gorevler (baslik, aciklama, aciliyet, atanan, tamamlandi, sira)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [item.baslik, item.aciklama, item.aciliyet, item.atanan, item.tamamlandi, item.sira]
          );
        }
      }

      if (data.kaliteKontrol.siparisHazirlik) {
        for (const item of data.kaliteKontrol.siparisHazirlik) {
          await client.query(
            `INSERT INTO siparis_hazirlik
             (tarih, operator, siparis_no, urun_kodu, siparis_adet, gonderilen_adet, durum,
              malzeme_koli, malzeme_kutu, malzeme_izolasyon, malzeme_tapa, malzeme_poset, notlar)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [item.tarih, item.operator, item.siparis_no, item.urun_kodu, item.siparis_adet,
             item.gonderilen_adet, item.durum, item.malzeme_koli, item.malzeme_kutu,
             item.malzeme_izolasyon, item.malzeme_tapa, item.malzeme_poset, item.notlar]
          );
        }
      }

      if (data.kaliteKontrol.urunSiparisler) {
        for (const item of data.kaliteKontrol.urunSiparisler) {
          await client.query(
            `INSERT INTO urun_siparisler (urun_adi, adet_miktar, olcu, talep_eden, aciklama, durum, gelen_adet, gelen_notlar)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [item.urun_adi, item.adet_miktar, item.olcu, item.talep_eden, item.aciklama, item.durum, item.gelen_adet, item.gelen_notlar]
          );
        }
      }

      if (data.kaliteKontrol.simulasyonStok) {
        for (const item of data.kaliteKontrol.simulasyonStok) {
          await client.query(
            `INSERT INTO simulasyon_stok (malzeme_turu, urun_adi, olculeri, mevcut_adet, ekleyen)
             VALUES ($1, $2, $3, $4, $5)`,
            [item.malzeme_turu, item.urun_adi, item.olculeri, item.mevcut_adet, item.ekleyen]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Veriler başarıyla içe aktarıldı' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Veri içe aktarma hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// TÜM VERİLERİ SİL (TEMİZLE)
router.delete('/clear-all', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query('TRUNCATE mamul_izolasyon, mamul_koli, mamul_kutu, mamul_tapa, mamul_history RESTART IDENTITY CASCADE');
    await client.query('TRUNCATE gorevler, gorev_notlar, siparis_hazirlik, urun_siparisler, simulasyon_stok RESTART IDENTITY CASCADE');

    await client.query('COMMIT');
    res.json({ success: true, message: 'Tüm veriler temizlendi' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Veri temizleme hatası:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;
