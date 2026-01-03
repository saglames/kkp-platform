require('dotenv').config();
const { Pool } = require('pg');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTable() {
  try {
    console.log('🔍 Checking teknik_resimler_login_log table on Render...');

    const result = await renderPool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'teknik_resimler_login_log'
      );
    `);

    if (result.rows[0].exists) {
      console.log('✅ Table exists');
      const count = await renderPool.query('SELECT COUNT(*) FROM teknik_resimler_login_log');
      console.log(`📊 Records: ${count.rows[0].count}`);
    } else {
      console.log('❌ Table does NOT exist - needs migration!');
    }

    await renderPool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await renderPool.end();
  }
}

checkTable();
