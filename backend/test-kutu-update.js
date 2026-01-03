const pool = require('./db');

async function testUpdate() {
  try {
    const result = await pool.query(
      'UPDATE urun_recetesi SET kutu_tipi = $1 WHERE id = $2 RETURNING *',
      ['K8', 3]
    );
    console.log('Updated:', result.rows[0]);
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

testUpdate();
