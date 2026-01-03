const pool = require('./db');

async function migrate() {
  try {
    console.log('Ürün Reçetesi tabloları oluşturuluyor...');

    // Ana ürün reçetesi tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS urun_recetesi (
        id SERIAL PRIMARY KEY,
        urun_kodu VARCHAR(100) NOT NULL UNIQUE,
        urun_adi VARCHAR(255) NOT NULL,
        aciklama TEXT,
        koli_tipi VARCHAR(50),
        koli_kapasitesi INTEGER DEFAULT 1,
        olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ urun_recetesi tablosu oluşturuldu');

    // Reçete malzemeler tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recete_malzemeler (
        id SERIAL PRIMARY KEY,
        urun_id INTEGER REFERENCES urun_recetesi(id) ON DELETE CASCADE,
        malzeme_tipi VARCHAR(50) NOT NULL,
        malzeme_kodu VARCHAR(100) NOT NULL,
        malzeme_adi VARCHAR(255),
        adet INTEGER NOT NULL DEFAULT 1,
        birim VARCHAR(20) DEFAULT 'adet',
        kategori VARCHAR(50),
        notlar TEXT,
        olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ recete_malzemeler tablosu oluşturuldu');

    console.log('\n✅ Tüm tablolar başarıyla oluşturuldu!');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    await pool.end();
    process.exit(1);
  }
}

migrate();
