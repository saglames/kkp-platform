require('dotenv').config();
const { Pool } = require('pg');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkEnum() {
  try {
    const result = await renderPool.query(`
      SELECT enumlabel
      FROM pg_enum
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
      WHERE pg_type.typname = 'category_type'
      ORDER BY enumlabel
    `);

    console.log('Render category_type enum values:');
    result.rows.forEach(row => console.log(`  - ${row.enumlabel}`));

    await renderPool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await renderPool.end();
  }
}

checkEnum();
