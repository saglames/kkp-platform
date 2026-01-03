require('dotenv').config();
const { Pool } = require('pg');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrateHataliUrunler() {
  try {
    console.log('🔍 Connecting to Render database...');
    await renderPool.query('SELECT NOW()');
    console.log('✅ Connected to Render database\n');

    console.log('📋 Creating hatali_urunler table...');
    await renderPool.query(`
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
    console.log('✅ hatali_urunler created\n');

    console.log('📋 Creating hatali_urunler_log table...');
    await renderPool.query(`
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
    console.log('✅ hatali_urunler_log created\n');

    console.log('🔧 Creating indexes...');
    await renderPool.query(`
      CREATE INDEX IF NOT EXISTS idx_hatali_urunler_parti
      ON hatali_urunler(parti_no)
    `);
    await renderPool.query(`
      CREATE INDEX IF NOT EXISTS idx_hatali_log_parti
      ON hatali_urunler_log(parti_no)
    `);
    await renderPool.query(`
      CREATE INDEX IF NOT EXISTS idx_hatali_log_tarih
      ON hatali_urunler_log(kayit_tarihi DESC)
    `);
    console.log('✅ Indexes created\n');

    const count1 = await renderPool.query('SELECT COUNT(*) FROM hatali_urunler');
    const count2 = await renderPool.query('SELECT COUNT(*) FROM hatali_urunler_log');

    console.log('✅ Migration completed successfully!');
    console.log(`📊 hatali_urunler: ${count1.rows[0].count} records`);
    console.log(`📊 hatali_urunler_log: ${count2.rows[0].count} records`);

    await renderPool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration error:', error.message);
    console.error('Details:', error);
    await renderPool.end();
    process.exit(1);
  }
}

migrateHataliUrunler();
