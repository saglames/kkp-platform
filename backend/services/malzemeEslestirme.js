const pool = require('../db');

/**
 * Tek bir malzemeyi simülasyon stok ile eşleştirir
 * @param {Object} malzeme - Eşleştirilecek malzeme
 * @returns {Promise<Object>} Eşleştirme sonucu
 */
async function eslestirTekMalzeme(malzeme) {
  try {
    let stokSorgusu;
    let parametreler;

    // Kutu eşleştirme
    if (malzeme.malzeme_tipi === 'Kutu' && malzeme.kategori === 'Paketleme') {
      stokSorgusu = `
        SELECT * FROM simulasyon_stok
        WHERE malzeme_turu = 'kutu' AND urun_adi = $1
      `;
      parametreler = [malzeme.malzeme_kodu];
    }
    // Koli eşleştirme
    else if (malzeme.malzeme_tipi === 'Koli' && malzeme.kategori === 'Paketleme') {
      stokSorgusu = `
        SELECT * FROM simulasyon_stok
        WHERE malzeme_turu = 'koli' AND urun_adi = $1
      `;
      parametreler = [malzeme.malzeme_kodu];
    }
    // Tapa eşleştirme
    else if (malzeme.malzeme_tipi === 'Tapa' && malzeme.kategori === 'Paketleme') {
      stokSorgusu = `
        SELECT * FROM simulasyon_stok
        WHERE malzeme_turu = 'tapa' AND urun_adi = $1
      `;
      parametreler = [malzeme.malzeme_kodu];
    }
    // İzolasyon eşleştirme
    else if (malzeme.malzeme_tipi === 'İzolasyon' && malzeme.kategori === 'Paketleme') {
      stokSorgusu = `
        SELECT * FROM simulasyon_stok
        WHERE malzeme_turu = 'izolasyon' AND urun_adi = $1
      `;
      parametreler = [malzeme.malzeme_kodu];
    }
    // Diğer malzemeler (tam eşleşme)
    else {
      stokSorgusu = `
        SELECT * FROM simulasyon_stok
        WHERE urun_adi = $1
      `;
      parametreler = [malzeme.malzeme_kodu];
    }

    const result = await pool.query(stokSorgusu, parametreler);

    if (result.rows.length === 0) {
      return {
        basarili: false,
        malzeme_kodu: malzeme.malzeme_kodu,
        malzeme_adi: malzeme.malzeme_adi,
        malzeme_tipi: malzeme.malzeme_tipi,
        gerekli_miktar: malzeme.miktar,
        sebep: 'Stokta eşleşen kayıt bulunamadı'
      };
    }

    const stokKaydi = result.rows[0];
    const mevcutMiktar = stokKaydi.mevcut_adet;
    const gerekliMiktar = malzeme.miktar;
    const yeterli = mevcutMiktar >= gerekliMiktar;

    return {
      basarili: true,
      yeterli: yeterli,
      malzeme_kodu: malzeme.malzeme_kodu,
      malzeme_adi: malzeme.malzeme_adi,
      malzeme_tipi: malzeme.malzeme_tipi,
      stok_id: stokKaydi.id,
      stok_adi: stokKaydi.urun_adi,
      mevcut_miktar: mevcutMiktar,
      gerekli_miktar: gerekliMiktar,
      eksik_miktar: yeterli ? 0 : (gerekliMiktar - mevcutMiktar)
    };

  } catch (error) {
    console.error('Malzeme eşleştirme hatası:', error);
    return {
      basarili: false,
      malzeme_kodu: malzeme.malzeme_kodu,
      malzeme_adi: malzeme.malzeme_adi,
      sebep: `Eşleştirme hatası: ${error.message}`
    };
  }
}

/**
 * Tüm malzemeleri simülasyon stok ile eşleştirir
 * @param {Array} malzemeListesi - Eşleştirilecek malzemeler listesi
 * @returns {Promise<Object>} Eşleştirme raporu
 */
async function eslestirMalzemeler(malzemeListesi) {
  const basarililar = [];
  const basarisizlar = [];
  const yetersizler = [];

  // Her malzeme için eşleştirme yap
  for (const malzeme of malzemeListesi) {
    const sonuc = await eslestirTekMalzeme(malzeme);

    if (!sonuc.basarili) {
      basarisizlar.push({
        malzeme_kodu: sonuc.malzeme_kodu,
        malzeme_adi: sonuc.malzeme_adi,
        malzeme_tipi: sonuc.malzeme_tipi,
        gerekli_miktar: sonuc.gerekli_miktar,
        sebep: sonuc.sebep
      });
    } else if (!sonuc.yeterli) {
      yetersizler.push({
        malzeme_kodu: sonuc.malzeme_kodu,
        malzeme_adi: sonuc.malzeme_adi,
        malzeme_tipi: sonuc.malzeme_tipi,
        stok_id: sonuc.stok_id,
        stok_adi: sonuc.stok_adi,
        mevcut_miktar: sonuc.mevcut_miktar,
        gerekli_miktar: sonuc.gerekli_miktar,
        eksik_miktar: sonuc.eksik_miktar
      });
    } else {
      basarililar.push({
        malzeme_kodu: sonuc.malzeme_kodu,
        malzeme_adi: sonuc.malzeme_adi,
        malzeme_tipi: sonuc.malzeme_tipi,
        stok_id: sonuc.stok_id,
        stok_adi: sonuc.stok_adi,
        mevcut_miktar: sonuc.mevcut_miktar,
        gerekli_miktar: sonuc.gerekli_miktar
      });
    }
  }

  const rapor = hazirlaRapor({
    basarililar,
    basarisizlar,
    yetersizler
  });

  return rapor;
}

/**
 * Eşleştirme raporunu hazırlar
 * @param {Object} eslesmeListesi - Eşleştirme sonuçları
 * @returns {Object} Hazırlanmış rapor
 */
function hazirlaRapor(eslesmeListesi) {
  const { basarililar, basarisizlar, yetersizler } = eslesmeListesi;

  const toplamMalzeme = basarililar.length + basarisizlar.length + yetersizler.length;
  const tumMalzemelerMevcut = basarisizlar.length === 0;
  const tumStokYeterli = basarisizlar.length === 0 && yetersizler.length === 0;

  return {
    basarili: basarililar,
    basarisiz: basarisizlar,
    yetersiz: yetersizler,
    toplamDurum: {
      toplam: toplamMalzeme,
      basarili: basarililar.length,
      basarisiz: basarisizlar.length,
      yetersiz: yetersizler.length,
      tumMalzemelerMevcut: tumMalzemelerMevcut,
      tumStokYeterli: tumStokYeterli
    }
  };
}

module.exports = {
  eslestirTekMalzeme,
  eslestirMalzemeler,
  hazirlaRapor
};
