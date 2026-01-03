require('dotenv').config();
const { Pool } = require('pg');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrateSimulasyonStokLog() {
  try {
    console.log('🔍 Connecting to Render database...');
    await renderPool.query('SELECT NOW()');
    console.log('✅ Connected to Render database\n');

    console.log('📋 Creating simulasyon_stok_hareket_log table...');
    await renderPool.query(`
      CREATE TABLE IF NOT EXISTS simulasyon_stok_hareket_log (
        id SERIAL PRIMARY KEY,
        stok_id INTEGER,
        islem_turu VARCHAR(20) NOT NULL,
        miktar INTEGER NOT NULL,
        onceki_stok INTEGER NOT NULL,
        yeni_stok INTEGER NOT NULL,
        yapan VARCHAR(100) NOT NULL,
        sebep TEXT,
        tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table created\n');

    console.log('🔧 Creating indexes...');
    await renderPool.query(`
      CREATE INDEX IF NOT EXISTS idx_stok_hareket_stok_id
      ON simulasyon_stok_hareket_log(stok_id)
    `);
    await renderPool.query(`
      CREATE INDEX IF NOT EXISTS idx_stok_hareket_tarih
      ON simulasyon_stok_hareket_log(tarih DESC)
    `);
    console.log('✅ Indexes created\n');

    const count = await renderPool.query('SELECT COUNT(*) FROM simulasyon_stok_hareket_log');
    console.log('✅ Migration completed successfully!');
    console.log(`📊 Table has ${count.rows[0].count} records`);

    await renderPool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration error:', error.message);
    console.error('Details:', error);
    await renderPool.end();
    process.exit(1);
  }
}

migrateSimulasyonStokLog();
