const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function migrateData() {
  console.log('🚀 Veri taşıma işlemi başlıyor...');

  const client = await pool.connect();

  try {
    // JSON dosyalarını oku
    const mamulStokPath = path.join('C:', 'Users', 'ESAT', 'Downloads', 'envanter-yedek-2025-12-30.json');
    const kaliteKontrolPath = path.join('C:', 'Users', 'ESAT', 'Downloads', 'akg_firebase_yedek_2025-12-30.json');

    const mamulStokData = JSON.parse(fs.readFileSync(mamulStokPath, 'utf8'));
    const kaliteKontrolData = JSON.parse(fs.readFileSync(kaliteKontrolPath, 'utf8'));

    await client.query('BEGIN');

    // 1. MAMÜL STOK - İZOLASYON
    console.log('📦 İzolasyon verileri aktarılıyor...');
    for (const item of mamulStokData.inventory.izolasyon) {
      if (!item.name || item.name.trim() === '') continue;

      // Kullanılan ürünleri belirle (- ile ayrılmış isimleri array'e çevir)
      const kullanilanUrunler = item.name.includes(' - ')
        ? item.name.split(' - ').map(u => u.trim())
        : [item.name];

      await client.query(
        'INSERT INTO mamul_izolasyon (name, kullanilan_urunler, stock) VALUES ($1, $2, $3)',
        [item.name, kullanilanUrunler, item.stock]
      );
    }

    // 2. MAMÜL STOK - KOLİ
    console.log('📦 Koli verileri aktarılıyor...');
    for (const item of mamulStokData.inventory.koli) {
      const dimensions = item.name.split(' - ')[1] || '';
      const name = item.name.split(' - ')[0] || item.name;

      // Simülasyon stokta koli bilgilerini bul
      const simulasyonKoli = kaliteKontrolData.stok?.find(s =>
        s.malzemeTuru === 'koli' && s.urunAdi.includes(name)
      );

      const icineGirenUrunler = simulasyonKoli?.olculeri || '';

      await client.query(
        'INSERT INTO mamul_koli (name, dimensions, icine_giren_urunler, stock) VALUES ($1, $2, $3, $4)',
        [name, dimensions, icineGirenUrunler, item.stock]
      );
    }

    // 3. MAMÜL STOK - KUTU
    console.log('📦 Kutu verileri aktarılıyor...');
    for (const item of mamulStokData.inventory.kutu) {
      const dimensions = item.name.split(' - ')[1] || '';
      const name = item.name.split(' - ')[0] || item.name;

      // Simülasyon stokta kutu bilgilerini bul
      const simulasyonKutu = kaliteKontrolData.stok?.find(s =>
        s.malzemeTuru === 'kutu' && s.urunAdi.includes(name)
      );

      const icineGirenUrun = simulasyonKutu?.olculeri || '';

      await client.query(
        'INSERT INTO mamul_kutu (name, dimensions, icine_giren_urun, stock) VALUES ($1, $2, $3, $4)',
        [name, dimensions, icineGirenUrun, item.stock]
      );
    }

    // 4. MAMÜL STOK - TAPA
    console.log('📦 Tapa verileri aktarılıyor...');
    for (const item of mamulStokData.inventory.tapa) {
      await client.query(
        'INSERT INTO mamul_tapa (name, stock) VALUES ($1, $2)',
        [item.name, item.stock]
      );
    }

    // 5. MAMÜL STOK - GEÇMİŞ
    console.log('📋 İşlem geçmişi aktarılıyor...');
    for (const item of mamulStokData.history) {
      await client.query(
        `INSERT INTO mamul_history (category, item_name, action, amount, reason, old_stock, new_stock, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          item.category,
          item.itemName,
          item.action,
          item.amount,
          item.reason,
          item.newStock - (item.action === 'Eklendi' ? item.amount : -item.amount),
          item.newStock,
          new Date(item.date.split('.').reverse().join('-'))
        ]
      );
    }

    // 6. KALİTE KONTROL - GÖREVLER
    console.log('✅ Görevler aktarılıyor...');
    for (const gorev of kaliteKontrolData.gorevler) {
      const result = await client.query(
        `INSERT INTO gorevler (baslik, aciklama, aciliyet, atanan, tamamlandi, sira, olusturma_tarihi)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          gorev.baslik,
          gorev.aciklama,
          gorev.aciliyet,
          gorev.atanan,
          gorev.tamamlandi,
          gorev.sira,
          new Date(gorev.olusturmaTarihi)
        ]
      );

      // Görev notlarını ekle
      if (gorev.notlar && gorev.notlar.length > 0) {
        for (const not of gorev.notlar) {
          await client.query(
            `INSERT INTO gorev_notlar (gorev_id, ekleyen, metin, tarih)
             VALUES ($1, $2, $3, $4)`,
            [result.rows[0].id, not.ekleyen, not.metin, new Date(not.tarih)]
          );
        }
      }
    }

    // 7. KALİTE KONTROL - SİPARİŞ HAZIRLIĞI
    console.log('📦 Sipariş hazırlık verileri aktarılıyor...');
    for (const siparis of kaliteKontrolData.siparisHazirlik) {
      // Tarihleri güvenli şekilde parse et
      const olusturmaTarihi = siparis.olusturmaTarihi ? new Date(siparis.olusturmaTarihi) : new Date();
      const sonGuncelleme = siparis.sonGuncelleme ? new Date(siparis.sonGuncelleme) : new Date();

      // Geçersiz tarih kontrolü
      if (isNaN(olusturmaTarihi.getTime())) olusturmaTarihi = new Date();
      if (isNaN(sonGuncelleme.getTime())) sonGuncelleme = new Date();

      await client.query(
        `INSERT INTO siparis_hazirlik
         (tarih, operator, siparis_no, urun_kodu, siparis_adet, gonderilen_adet, durum,
          malzeme_koli, malzeme_kutu, malzeme_izolasyon, malzeme_tapa, malzeme_poset,
          notlar, olusturma_tarihi, son_guncelleme)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          siparis.tarih,
          siparis.operator,
          siparis.siparisNo,
          siparis.urunKodu,
          siparis.siparisAdet,
          siparis.gonderilenAdet || 0,
          siparis.durum,
          siparis.malzemeChecklist?.koli || false,
          siparis.malzemeChecklist?.kutu || false,
          siparis.malzemeChecklist?.izolasyon || false,
          siparis.malzemeChecklist?.tapa || false,
          siparis.malzemeChecklist?.poset || false,
          siparis.notlar,
          olusturmaTarihi,
          sonGuncelleme
        ]
      );
    }

    // 8. KALİTE KONTROL - ÜRÜN SİPARİŞLERİ
    console.log('🛒 Ürün sipariş verileri aktarılıyor...');
    for (const urun of kaliteKontrolData.urunSiparisler) {
      const olusturmaTarihi = urun.olusturmaTarihi ? new Date(urun.olusturmaTarihi) : new Date();
      const gelisTarihi = urun.gelisTarihi ? new Date(urun.gelisTarihi) : null;

      if (isNaN(olusturmaTarihi.getTime())) olusturmaTarihi = new Date();
      if (gelisTarihi && isNaN(gelisTarihi.getTime())) gelisTarihi = null;

      await client.query(
        `INSERT INTO urun_siparisler
         (urun_adi, adet_miktar, olcu, talep_eden, aciklama, durum, gelen_adet, gelen_notlar, olusturma_tarihi, gelis_tarihi)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          urun.urunAdi,
          urun.adetMiktar,
          urun.olcu,
          urun.talepEden,
          urun.aciklama,
          urun.durum,
          urun.gelenAdet,
          urun.gelenNotlar,
          olusturmaTarihi,
          gelisTarihi
        ]
      );
    }

    // 9. KALİTE KONTROL - SİMÜLASYON STOK
    console.log('📊 Simülasyon stok verileri aktarılıyor...');
    for (const stok of kaliteKontrolData.stok) {
      const sonGuncelleme = stok.sonGuncelleme ? new Date(stok.sonGuncelleme) : new Date();
      if (isNaN(sonGuncelleme.getTime())) sonGuncelleme = new Date();

      await client.query(
        `INSERT INTO simulasyon_stok (malzeme_turu, urun_adi, olculeri, mevcut_adet, ekleyen, son_guncelleme)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          stok.malzemeTuru,
          stok.urunAdi,
          stok.olculeri,
          stok.mevcutAdet,
          stok.ekleyen,
          sonGuncelleme
        ]
      );
    }

    // FQ Serisi ürünleri ekle (izolasyon bilgisi olmayan)
    console.log('➕ Yeni ürünler ekleniyor (FQ serisi)...');
    const fqUrunler = [
      { kod: 'FQ01A/AA-ISL', kutu: 'K4', koli: 'B3' },
      { kod: 'FQ01B/AA-ISL', kutu: 'K4', koli: 'B3' },
      { kod: 'FQ02/AA-ISL', kutu: 'K5', koli: 'B4' }
    ];

    for (const urun of fqUrunler) {
      // İzolasyon olarak ekle (stok 0 ve izolasyon bilgisi boş)
      await client.query(
        'INSERT INTO mamul_izolasyon (name, kullanilan_urunler, stock) VALUES ($1, $2, $3)',
        [urun.kod, [urun.kod], 0]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Tüm veriler başarıyla aktarıldı!');

    // İstatistikler
    const izolasyonCount = await client.query('SELECT COUNT(*) FROM mamul_izolasyon');
    const koliCount = await client.query('SELECT COUNT(*) FROM mamul_koli');
    const kutuCount = await client.query('SELECT COUNT(*) FROM mamul_kutu');
    const tapaCount = await client.query('SELECT COUNT(*) FROM mamul_tapa');
    const gorevCount = await client.query('SELECT COUNT(*) FROM gorevler');
    const siparisCount = await client.query('SELECT COUNT(*) FROM siparis_hazirlik');

    console.log('\n📊 ÖZET:');
    console.log(`   - İzolasyon: ${izolasyonCount.rows[0].count} adet`);
    console.log(`   - Koli: ${koliCount.rows[0].count} adet`);
    console.log(`   - Kutu: ${kutuCount.rows[0].count} adet`);
    console.log(`   - Tapa: ${tapaCount.rows[0].count} adet`);
    console.log(`   - Görevler: ${gorevCount.rows[0].count} adet`);
    console.log(`   - Sipariş Hazırlık: ${siparisCount.rows[0].count} adet`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Veri taşıma hatası:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateData().catch(console.error);
