const pool = require('./db');

async function checkTable() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'siparis_gonderimler'
      ORDER BY ordinal_position
    `);

    console.log('\nSiparis Gonderimler Tablosu Sütunları:');
    console.log('==========================================');
    result.rows.forEach(r => {
      console.log(`${r.column_name.padEnd(20)} | ${r.data_type.padEnd(20)} | Nullable: ${r.is_nullable} | Default: ${r.column_default || 'none'}`);
    });

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkTable();
