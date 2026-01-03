require('dotenv').config();
const { Pool } = require('pg');

const localPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function syncTeknikResimler() {
  try {
    console.log('🔍 Connecting to databases...');
    await localPool.query('SELECT NOW()');
    console.log('✅ Connected to local database');
    await renderPool.query('SELECT NOW()');
    console.log('✅ Connected to Render database\n');

    // 1. Sync kategoriler
    console.log('📋 Fetching kategoriler from local...');
    const kategorilerResult = await localPool.query('SELECT * FROM teknik_resimler_kategoriler ORDER BY id');
    console.log(`Found ${kategorilerResult.rows.length} categories\n`);

    console.log('🗑️  Clearing existing data in Render...');
    await renderPool.query('DELETE FROM teknik_resimler_dosyalar');
    await renderPool.query('DELETE FROM teknik_resimler_kategoriler');

    console.log('📤 Uploading kategoriler to Render...');
    for (const kategori of kategorilerResult.rows) {
      await renderPool.query(
        `INSERT INTO teknik_resimler_kategoriler (id, kategori_adi, created_at)
         VALUES ($1, $2, $3)`,
        [kategori.id, kategori.kategori_adi, kategori.created_at]
      );
    }
    console.log(`✅ Uploaded ${kategorilerResult.rows.length} categories\n`);

    // 2. Sync dosyalar
    console.log('📋 Fetching dosyalar from local...');
    const dosyalarResult = await localPool.query('SELECT * FROM teknik_resimler_dosyalar ORDER BY id');
    console.log(`Found ${dosyalarResult.rows.length} files\n`);

    console.log('📤 Uploading dosyalar to Render...');
    for (const dosya of dosyalarResult.rows) {
      await renderPool.query(
        `INSERT INTO teknik_resimler_dosyalar
         (id, kategori_id, dosya_adi, dosya_yolu, dosya_boyutu, yukleyen, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          dosya.id,
          dosya.kategori_id,
          dosya.dosya_adi,
          dosya.dosya_yolu,
          dosya.dosya_boyutu,
          dosya.yukleyen,
          dosya.created_at
        ]
      );
    }
    console.log(`✅ Uploaded ${dosyalarResult.rows.length} files\n`);

    // Fix sequences
    const maxKategoriId = await renderPool.query('SELECT MAX(id) FROM teknik_resimler_kategoriler');
    const maxDosyaId = await renderPool.query('SELECT MAX(id) FROM teknik_resimler_dosyalar');

    if (maxKategoriId.rows[0].max) {
      await renderPool.query(`ALTER SEQUENCE teknik_resimler_kategoriler_id_seq RESTART WITH ${maxKategoriId.rows[0].max + 1}`);
    }
    if (maxDosyaId.rows[0].max) {
      await renderPool.query(`ALTER SEQUENCE teknik_resimler_dosyalar_id_seq RESTART WITH ${maxDosyaId.rows[0].max + 1}`);
    }

    // Verify
    const renderKategorilerCount = await renderPool.query('SELECT COUNT(*) FROM teknik_resimler_kategoriler');
    const renderDosyalarCount = await renderPool.query('SELECT COUNT(*) FROM teknik_resimler_dosyalar');

    console.log('✅ Sync completed successfully!');
    console.log(`📊 Render teknik_resimler_kategoriler: ${renderKategorilerCount.rows[0].count} records`);
    console.log(`📊 Render teknik_resimler_dosyalar: ${renderDosyalarCount.rows[0].count} records`);

    await localPool.end();
    await renderPool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Sync error:', error.message);
    console.error('Details:', error);
    await localPool.end();
    await renderPool.end();
    process.exit(1);
  }
}

syncTeknikResimler();
