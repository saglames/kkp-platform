require('dotenv').config();
const { Pool } = require('pg');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createAnasayfaView() {
  try {
    console.log('Creating surec_anasayfa view on Render...\n');

    // Create the view
    await renderPool.query(`
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

    console.log('✅ surec_anasayfa view created successfully');

    // Test the view
    const testQuery = await renderPool.query('SELECT COUNT(*) FROM surec_anasayfa');
    console.log(`   Records in view: ${testQuery.rows[0].count}`);

    // Get sample data
    const sampleQuery = await renderPool.query(`
      SELECT urun_kodu, temizlemeye_gidecek, temizlemede_olan,
             temizlemeden_gelen, sevke_hazir, kalan
      FROM surec_anasayfa
      LIMIT 5
    `);

    if (sampleQuery.rows.length > 0) {
      console.log('\n   Sample data:');
      sampleQuery.rows.forEach((row, i) => {
        console.log(`   ${i+1}. ${row.urun_kodu}`);
        console.log(`      Temizlemeye Gidecek: ${row.temizlemeye_gidecek}`);
        console.log(`      Temizlemede Olan: ${row.temizlemede_olan}`);
        console.log(`      Temizlemeden Gelen: ${row.temizlemeden_gelen}`);
        console.log(`      Sevke Hazır: ${row.sevke_hazir}`);
        console.log(`      Kalan: ${row.kalan}`);
      });
    }

  } catch (error) {
    console.error('Error creating view:', error.message);
    process.exit(1);
  } finally {
    await renderPool.end();
  }
}

createAnasayfaView();
