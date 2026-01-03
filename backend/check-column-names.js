require('dotenv').config();
const { Pool } = require('pg');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkColumns() {
  try {
    console.log('Checking column names for surec tables on Render...\n');

    const tables = [
      'surec_temizlemeye_gidecek',
      'surec_temizlemede_olan',
      'surec_temizlemeden_gelen',
      'surec_sevke_hazir',
      'surec_kalan'
    ];

    for (const table of tables) {
      const result = await renderPool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);

      console.log(`${table}:`);
      result.rows.forEach(row => {
        console.log(`  - ${row.column_name.padEnd(20)} ${row.data_type}`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await renderPool.end();
  }
}

checkColumns();
