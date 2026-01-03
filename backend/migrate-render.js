// Migration script for Render database
require('dotenv').config();
const { Pool } = require('pg');

// Render database connection
const connectionString = process.env.RENDER_DATABASE_URL;
const isProduction = connectionString && connectionString.includes('render.com');

const renderPool = new Pool({
  connectionString: connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : undefined
});

async function migrateSiparisHesaplama() {
  try {
    console.log('🔍 Connecting to Render database...');

    // Test connection
    await renderPool.query('SELECT NOW()');
    console.log('✅ Connected to Render database');

    console.log('\n📋 Creating siparis_hesaplama_kayitlari table...');

    await renderPool.query(`
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

    console.log('\n🔧 Creating indexes...');

    await renderPool.query(`
      CREATE INDEX IF NOT EXISTS idx_urun_kodu
      ON siparis_hesaplama_kayitlari(urun_kodu)
    `);

    await renderPool.query(`
      CREATE INDEX IF NOT EXISTS idx_hesaplama_tarihi
      ON siparis_hesaplama_kayitlari(hesaplama_tarihi DESC)
    `);

    await renderPool.query(`
      CREATE INDEX IF NOT EXISTS idx_stok_dusumleri
      ON siparis_hesaplama_kayitlari(stok_dusumleri_yapildi)
    `);

    console.log('✅ Indexes created successfully');

    // Check if table exists and get count
    const result = await renderPool.query(`
      SELECT COUNT(*) FROM siparis_hesaplama_kayitlari
    `);

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`📊 Table has ${result.rows[0].count} records`);

    await renderPool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration error:', error.message);
    console.error('Details:', error);
    await renderPool.end();
    process.exit(1);
  }
}

migrateSiparisHesaplama();
