require('dotenv').config();
const { Pool } = require('pg');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkAnasayfaView() {
  try {
    console.log('Checking if surec_anasayfa view exists on Render...\n');

    // Check if view exists
    const viewCheck = await renderPool.query(`
      SELECT table_type
      FROM information_schema.tables
      WHERE table_name = 'surec_anasayfa'
    `);

    if (viewCheck.rows.length === 0) {
      console.log('❌ surec_anasayfa view does NOT exist on Render');
    } else {
      console.log(`✅ surec_anasayfa exists as: ${viewCheck.rows[0].table_type}`);

      // Try to get sample data
      const dataCheck = await renderPool.query('SELECT COUNT(*) FROM surec_anasayfa');
      console.log(`   Records in view: ${dataCheck.rows[0].count}`);

      // Get first few rows
      const sample = await renderPool.query('SELECT * FROM surec_anasayfa LIMIT 3');
      console.log('\n   Sample data:');
      sample.rows.forEach((row, i) => {
        console.log(`   ${i+1}. ${row.urun_kodu} - Temizlemeye: ${row.temizlemeye_gidecek}, Olan: ${row.temizlemede_olan}`);
      });
    }

  } catch (error) {
    console.error('Error checking view:', error.message);
  } finally {
    await renderPool.end();
  }
}

checkAnasayfaView();
