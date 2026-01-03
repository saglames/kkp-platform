const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'kkp_db',
  password: 'postgres',
  port: 5432,
});

async function runSQL() {
  const client = await pool.connect();
  try {
    const sqlFile = path.join(__dirname, 'update_product_names.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('Executing SQL update...');
    await client.query(sql);
    console.log('✓ Database updated successfully with corrected product names!');

    // Verify
    const products = await client.query('SELECT COUNT(*) FROM urun_agirliklari_master');
    const fittings = await client.query('SELECT COUNT(*) FROM urun_agirliklari_fittinglar');

    console.log(`\n✓ Joints loaded: ${products.rows[0].count}`);
    console.log(`✓ Fittings loaded: ${fittings.rows[0].count}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runSQL();
