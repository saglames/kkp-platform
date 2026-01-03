require('dotenv').config();
const { Pool } = require('pg');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrateTeknikResimler() {
  try {
    console.log('🔍 Connecting to Render database...');
    await renderPool.query('SELECT NOW()');
    console.log('✅ Connected to Render database\n');

    console.log('📋 Creating teknik_resimler_kategoriler table...');
    await renderPool.query(`
      CREATE TABLE IF NOT EXISTS teknik_resimler_kategoriler (
        id SERIAL PRIMARY KEY,
        kategori_adi VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ teknik_resimler_kategoriler created\n');

    console.log('📋 Creating teknik_resimler_dosyalar table...');
    await renderPool.query(`
      CREATE TABLE IF NOT EXISTS teknik_resimler_dosyalar (
        id SERIAL PRIMARY KEY,
        kategori_id INTEGER,
        dosya_adi VARCHAR(255) NOT NULL,
        dosya_yolu VARCHAR(500) NOT NULL,
        dosya_boyutu INTEGER,
        yukleyen VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kategori_id) REFERENCES teknik_resimler_kategoriler(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ teknik_resimler_dosyalar created\n');

    console.log('📋 Creating teknik_resimler_login_log table...');
    await renderPool.query(`
      CREATE TABLE IF NOT EXISTS teknik_resimler_login_log (
        id SERIAL PRIMARY KEY,
        kullanici_adi VARCHAR(100),
        basarili BOOLEAN,
        ip_adresi VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ teknik_resimler_login_log created\n');

    console.log('🔧 Creating indexes...');
    await renderPool.query(`
      CREATE INDEX IF NOT EXISTS idx_teknik_resimler_kategori
      ON teknik_resimler_dosyalar(kategori_id)
    `);
    await renderPool.query(`
      CREATE INDEX IF NOT EXISTS idx_login_log_tarih
      ON teknik_resimler_login_log(created_at DESC)
    `);
    console.log('✅ Indexes created\n');

    // Verify
    const kategorilerCount = await renderPool.query('SELECT COUNT(*) FROM teknik_resimler_kategoriler');
    const dosyalarCount = await renderPool.query('SELECT COUNT(*) FROM teknik_resimler_dosyalar');
    const loginLogCount = await renderPool.query('SELECT COUNT(*) FROM teknik_resimler_login_log');

    console.log('✅ Migration completed successfully!');
    console.log(`📊 teknik_resimler_kategoriler: ${kategorilerCount.rows[0].count} records`);
    console.log(`📊 teknik_resimler_dosyalar: ${dosyalarCount.rows[0].count} records`);
    console.log(`📊 teknik_resimler_login_log: ${loginLogCount.rows[0].count} records`);

    await renderPool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration error:', error.message);
    console.error('Details:', error);
    await renderPool.end();
    process.exit(1);
  }
}

migrateTeknikResimler();
