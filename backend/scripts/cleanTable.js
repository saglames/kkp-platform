const pool = require('../db');

async function cleanTable() {
  try {
    await pool.query('DELETE FROM kesim_olculeri');
    console.log('✅ kesim_olculeri tablosu temizlendi');
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

cleanTable();
