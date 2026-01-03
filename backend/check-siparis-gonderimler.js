require('dotenv').config();
const { Pool } = require('pg');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTable() {
  try {
    console.log('🔍 Checking siparis_gonderimler table on Render...');

    const result = await renderPool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'siparis_gonderimler'
      );
    `);

    if (result.rows[0].exists) {
      console.log('✅ Table exists');
      const count = await renderPool.query('SELECT COUNT(*) FROM siparis_gonderimler');
      console.log(`📊 Records: ${count.rows[0].count}`);
    } else {
      console.log('❌ Table does NOT exist - needs creation!');
    }

    await renderPool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await renderPool.end();
  }
}

checkTable();
