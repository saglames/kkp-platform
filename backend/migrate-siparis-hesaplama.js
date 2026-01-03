const pool = require('./db');

async function migrateSiparisHesaplama() {
  try {
    console.log('Creating siparis_hesaplama_kayitlari table...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS siparis_hesaplama_kayitlari (
        id SERIAL PRIMARY KEY,
        urun_kodu VARCHAR(100) NOT NULL,
        siparis_adet INTEGER NOT NULL,
        hesaplayan VARCHAR(100) NOT NULL,
        hesaplama_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        hesaplama_sonucu JSONB NOT NULL,

        stok_dusumleri_yapildi BOOLEAN DEFAULT FALSE,
        stok_dusum_tarihi TIMESTAMP,
        stok_dusumleri_yapan VARCHAR(100),

        eslestirme_sonuclari JSONB,
        notlar TEXT
      )
    `);

    console.log('✅ Table created successfully');

    console.log('Creating indexes...');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_urun_kodu
      ON siparis_hesaplama_kayitlari(urun_kodu)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_hesaplama_tarihi
      ON siparis_hesaplama_kayitlari(hesaplama_tarihi DESC)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_stok_dusumleri
      ON siparis_hesaplama_kayitlari(stok_dusumleri_yapildi)
    `);

    console.log('✅ Indexes created successfully');
    console.log('✅ Migration completed successfully!');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.error('Details:', error);
    await pool.end();
    process.exit(1);
  }
}

migrateSiparisHesaplama();
