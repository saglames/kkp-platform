require('dotenv').config();
const { Pool } = require('pg');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrateSurecSchema() {
  const client = await renderPool.connect();

  try {
    console.log('Migrating surec table schemas on Render...\n');

    await client.query('BEGIN');

    // 1. Fix surec_temizlemede_olan - add adet column if missing
    console.log('1. Fixing surec_temizlemede_olan...');

    // Check if adet column exists
    const hasAdet = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'surec_temizlemede_olan' AND column_name = 'adet'
    `);

    if (hasAdet.rows.length === 0) {
      console.log('   Adding adet column...');
      await client.query(`
        ALTER TABLE surec_temizlemede_olan
        ADD COLUMN adet INTEGER DEFAULT 0
      `);
      console.log('   ✅ adet column added');
    } else {
      console.log('   ✅ adet column already exists');
    }

    // 2. Now create the view
    console.log('\n2. Creating surec_anasayfa view...');
    await client.query(`
      CREATE OR REPLACE VIEW surec_anasayfa AS
      SELECT
          u.id,
          u.tip,
          u.urun_kodu,
          u.urun_kodu_base,
          COALESCE(tg.adet, 0) as temizlemeye_gidecek,
          COALESCE(to2.adet, 0) as temizlemede_olan,
          COALESCE(tgelen.adet, 0) as temizlemeden_gelen,
          COALESCE(sh.adet, 0) as sevke_hazir,
          COALESCE(k.adet, 0) as kalan,
          COALESCE(
              (SELECT SUM(se.adet)
               FROM surec_sevk_edilen se
               WHERE se.urun_kodu_base = u.urun_kodu_base),
              0
          ) as sevk_edilen_toplam,
          k.notlar,
          k.tapali_bekleyen_notlar,
          u.aktif
      FROM surec_urunler u
      LEFT JOIN surec_temizlemeye_gidecek tg ON u.id = tg.urun_id
      LEFT JOIN surec_temizlemede_olan to2 ON u.id = to2.urun_id
      LEFT JOIN surec_temizlemeden_gelen tgelen ON u.id = tgelen.urun_id
      LEFT JOIN surec_sevke_hazir sh ON u.urun_kodu_base = sh.urun_kodu_base
      LEFT JOIN surec_kalan k ON u.id = k.urun_id
      WHERE u.aktif = TRUE
      ORDER BY u.urun_kodu
    `);
    console.log('   ✅ surec_anasayfa view created');

    await client.query('COMMIT');

    // Test the view
    console.log('\n3. Testing view...');
    const testQuery = await client.query('SELECT COUNT(*) FROM surec_anasayfa');
    console.log(`   Records in view: ${testQuery.rows[0].count}`);

    // Get sample data
    const sampleQuery = await client.query(`
      SELECT urun_kodu, temizlemeye_gidecek, temizlemede_olan,
             temizlemeden_gelen, sevke_hazir, kalan
      FROM surec_anasayfa
      LIMIT 5
    `);

    if (sampleQuery.rows.length > 0) {
      console.log('\n   Sample data:');
      sampleQuery.rows.forEach((row, i) => {
        const total = row.temizlemeye_gidecek + row.temizlemede_olan +
                      row.temizlemeden_gelen + row.sevke_hazir + row.kalan;
        console.log(`   ${i+1}. ${row.urun_kodu} - Total: ${total}`);
      });
    }

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error during migration:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await renderPool.end();
  }
}

migrateSurecSchema();
