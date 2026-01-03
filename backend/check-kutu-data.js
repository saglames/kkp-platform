const pool = require('./db');

async function checkData() {
  try {
    const result = await pool.query('SELECT * FROM urun_recetesi WHERE id = 3');
    console.log('Current data for ID=3:');
    console.log(JSON.stringify(result.rows[0], null, 2));
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

checkData();
