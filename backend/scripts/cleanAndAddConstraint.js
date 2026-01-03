const pool = require('../db');

async function cleanAndAddConstraint() {
  try {
    // Tabloyu temizle
    await pool.query('DELETE FROM kesim_olculeri');
    console.log('✅ kesim_olculeri tablosu temizlendi');

    // UNIQUE constraint ekle
    await pool.query(`
      ALTER TABLE kesim_olculeri
      ADD CONSTRAINT kesim_olculeri_unique
      UNIQUE (model, alt_grup, parca)
    `);
    console.log('✅ UNIQUE constraint başarıyla eklendi!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

cleanAndAddConstraint();
