const pool = require('./db');

async function migrate() {
  try {
    console.log('Ürün reçetesine tapa_adedi kolonu ekleniyor...');

    // Add tapa_adedi column with default value 1
    await pool.query(`
      ALTER TABLE urun_recetesi
      ADD COLUMN IF NOT EXISTS tapa_adedi INTEGER DEFAULT 1
    `);

    console.log('✅ tapa_adedi sütunu eklendi (varsayılan: 1)');

    console.log('\n✅ Migration başarıyla tamamlandı!');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    await pool.end();
    process.exit(1);
  }
}

migrate();
