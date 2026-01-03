require('dotenv').config();
const { Pool } = require('pg');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  try {
    console.log('Checking surec tables on Render...\n');

    const tables = [
      'surec_urunler',
      'surec_temizlemeye_gidecek',
      'surec_temizlemede_olan',
      'surec_temizlemeden_gelen',
      'surec_sevke_hazir',
      'surec_sevk_edilen',
      'surec_kalan',
      'surec_hareket_log'
    ];

    for (const table of tables) {
      const result = await renderPool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = $1
        )
      `, [table]);

      const exists = result.rows[0].exists;
      if (exists) {
        const count = await renderPool.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`✅ ${table.padEnd(30)} - ${count.rows[0].count} records`);
      } else {
        console.log(`❌ ${table.padEnd(30)} - MISSING`);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await renderPool.end();
  }
}

checkTables();
