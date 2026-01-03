const pool = require('./db');

async function migrate() {
  try {
    console.log('Ürün reçetesine paketleme alanları ekleniyor...');

    // Add kutu_tipi, tapa_tipi, izolasyon_tipi columns
    await pool.query(`
      ALTER TABLE urun_recetesi
      ADD COLUMN IF NOT EXISTS kutu_tipi VARCHAR(100),
      ADD COLUMN IF NOT EXISTS tapa_tipi VARCHAR(100),
      ADD COLUMN IF NOT EXISTS izolasyon_tipi VARCHAR(100)
    `);

    console.log('✅ kutu_tipi, tapa_tipi, izolasyon_tipi sütunları eklendi');

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
