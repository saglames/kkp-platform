const pool = require('./db');

async function migrate() {
  try {
    console.log('Ürün reçetesinden tapa ve izolasyon kolonları kaldırılıyor...');

    // Remove tapa_tipi, tapa_adedi, and izolasyon_tipi columns
    await pool.query(`
      ALTER TABLE urun_recetesi
      DROP COLUMN IF EXISTS tapa_tipi,
      DROP COLUMN IF EXISTS tapa_adedi,
      DROP COLUMN IF EXISTS izolasyon_tipi
    `);

    console.log('✅ tapa_tipi, tapa_adedi ve izolasyon_tipi sütunları kaldırıldı');
    console.log('✅ Artık tapa ve izolasyon recete_malzemeler tablosundan yönetilecek');

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
