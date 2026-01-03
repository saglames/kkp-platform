const pool = require('./db');

async function migrate() {
  try {
    console.log('Hatalı ürünler tabloları oluşturuluyor...');

    // Aktif parti tablosu - şu an girilen veriler
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hatali_urunler (
        id SERIAL PRIMARY KEY,
        parti_no VARCHAR(100) NOT NULL,
        urun_kodu VARCHAR(100) NOT NULL,
        temizleme_problemi INTEGER DEFAULT 0,
        vuruk_problem INTEGER DEFAULT 0,
        capagi_alinmayan INTEGER DEFAULT 0,
        polisaj INTEGER DEFAULT 0,
        kaynak_az INTEGER DEFAULT 0,
        kaynak_akintisi INTEGER DEFAULT 0,
        ici_capakli INTEGER DEFAULT 0,
        pim_girmeyen INTEGER DEFAULT 0,
        boncuklu INTEGER DEFAULT 0,
        yamuk INTEGER DEFAULT 0,
        gramaji_dusuk INTEGER DEFAULT 0,
        hurda INTEGER DEFAULT 0,
        guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(parti_no, urun_kodu)
      )
    `);

    // Geçmiş log tablosu - kaydedilen partiler
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hatali_urunler_log (
        id SERIAL PRIMARY KEY,
        parti_no VARCHAR(100) NOT NULL,
        kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        kayit_yapan VARCHAR(100),
        veriler JSONB NOT NULL,
        toplam_hata INTEGER DEFAULT 0,
        notlar TEXT
      )
    `);

    // İndeksler
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_hatali_parti_no
      ON hatali_urunler(parti_no)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_hatali_log_parti
      ON hatali_urunler_log(parti_no)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_hatali_log_tarih
      ON hatali_urunler_log(kayit_tarihi DESC)
    `);

    console.log('✅ hatali_urunler tablosu oluşturuldu');
    console.log('✅ hatali_urunler_log tablosu oluşturuldu');
    console.log('✅ İndeksler oluşturuldu');

    console.log('\n✅ Migration başarıyla tamamlandı!');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    await pool.end();
    process.exit(1);
  }
}

migrate();
