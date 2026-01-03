// Sync recete data from local to Render
require('dotenv').config();
const { Pool } = require('pg');

// Local database connection
const localPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Render database connection
const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function syncReceteData() {
  try {
    console.log('🔍 Connecting to databases...');

    await localPool.query('SELECT NOW()');
    console.log('✅ Connected to local database');

    await renderPool.query('SELECT NOW()');
    console.log('✅ Connected to Render database');

    // 1. Sync urun_recetesi
    console.log('\n📋 Fetching urun_recetesi from local...');
    const receteResult = await localPool.query('SELECT * FROM urun_recetesi ORDER BY id');
    console.log(`Found ${receteResult.rows.length} recipes`);

    console.log('🗑️  Clearing existing data in Render...');
    await renderPool.query('DELETE FROM recete_malzemeler');
    await renderPool.query('DELETE FROM urun_recetesi');

    // Reset sequences
    await renderPool.query('ALTER SEQUENCE urun_recetesi_id_seq RESTART WITH 1');
    await renderPool.query('ALTER SEQUENCE recete_malzemeler_id_seq RESTART WITH 1');

    console.log('📤 Uploading urun_recetesi to Render...');
    for (const recete of receteResult.rows) {
      await renderPool.query(
        `INSERT INTO urun_recetesi
         (id, urun_kodu, urun_adi, aciklama, koli_tipi, koli_kapasitesi, kutu_tipi, olusturma_tarihi, guncelleme_tarihi)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          recete.id,
          recete.urun_kodu,
          recete.urun_adi,
          recete.aciklama,
          recete.koli_tipi,
          recete.koli_kapasitesi,
          recete.kutu_tipi,
          recete.olusturma_tarihi,
          recete.guncelleme_tarihi
        ]
      );
    }
    console.log(`✅ Uploaded ${receteResult.rows.length} recipes`);

    // 2. Sync recete_malzemeler
    console.log('\n📋 Fetching recete_malzemeler from local...');
    const malzemelerResult = await localPool.query('SELECT * FROM recete_malzemeler ORDER BY id');
    console.log(`Found ${malzemelerResult.rows.length} materials`);

    console.log('📤 Uploading recete_malzemeler to Render...');
    for (const malzeme of malzemelerResult.rows) {
      await renderPool.query(
        `INSERT INTO recete_malzemeler
         (id, urun_id, malzeme_tipi, malzeme_kodu, malzeme_adi, adet, birim, kategori, notlar, olusturma_tarihi)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          malzeme.id,
          malzeme.urun_id,
          malzeme.malzeme_tipi,
          malzeme.malzeme_kodu,
          malzeme.malzeme_adi,
          malzeme.adet,
          malzeme.birim,
          malzeme.kategori,
          malzeme.notlar,
          malzeme.olusturma_tarihi
        ]
      );
    }
    console.log(`✅ Uploaded ${malzemelerResult.rows.length} materials`);

    // Fix sequences to continue from max id
    const maxReceteId = await renderPool.query('SELECT MAX(id) FROM urun_recetesi');
    const maxMalzemeId = await renderPool.query('SELECT MAX(id) FROM recete_malzemeler');

    if (maxReceteId.rows[0].max) {
      await renderPool.query(`ALTER SEQUENCE urun_recetesi_id_seq RESTART WITH ${maxReceteId.rows[0].max + 1}`);
    }
    if (maxMalzemeId.rows[0].max) {
      await renderPool.query(`ALTER SEQUENCE recete_malzemeler_id_seq RESTART WITH ${maxMalzemeId.rows[0].max + 1}`);
    }

    // Verify
    console.log('\n🔍 Verifying data...');
    const renderReceteCount = await renderPool.query('SELECT COUNT(*) FROM urun_recetesi');
    const renderMalzemeCount = await renderPool.query('SELECT COUNT(*) FROM recete_malzemeler');

    console.log(`\n✅ Sync completed successfully!`);
    console.log(`📊 Render urun_recetesi: ${renderReceteCount.rows[0].count} records`);
    console.log(`📊 Render recete_malzemeler: ${renderMalzemeCount.rows[0].count} records`);

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

syncReceteData();
